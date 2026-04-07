import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

const authenticateAs = (roleName: string) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'user-uuid', role: roleName }, process.env.JWT_SECRET, { expiresIn: '1d' });
    prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        isActive: true,
        role: { name: roleName, permissions: { all: true } }
    } as any);
    return token;
};

const enableTransaction = () => {
    prismaMock.$transaction.mockImplementation((async (cb: any) => {
        return typeof cb === 'function' ? cb(prismaMock) : Promise.resolve();
    }) as any);
};

describe('Aegis ERP v0.4.0: End-to-End Business Lifecycle Scenario', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
    });

    /**
     * TEST SCENARIO: The "Merchant's Loop"
     * 1. A new Client "Alpha Corp" is registered.
     * 2. Alpha Corp requests a Facture (Sale) for 10 units of "Product X".
     * 3. The system validates stock in POS-1, deducts it, and records Alpha Corp's debt.
     * 4. Alpha Corp pays 50% of the debt.
     * 5. Alpha Corp returns 2 units (Avoir).
     * 6. Alpha Corp pays the remaining balance to clear the account.
     */
    it('Should execute the full Client-Sales-Payment lifecycle accurately', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        // --- STEP 1: Client Creation ---
        prismaMock.client.create.mockResolvedValue({ id: 'alpha-id', balance: 0.0 } as any);
        await request(app).post('/api/v1/clients').set('Authorization', `Bearer ${token}`).send({ type: 'B2B', companyName: 'Alpha Corp' });

        // --- STEP 2: Sale Validation (Facture) ---
        // Total TTC: 1000 HT + 190 TVA + 1 Timbre = 1191.0
        prismaMock.document.findFirst.mockResolvedValue({
            id: 'fact-1', status: 'DRAFT', type: 'FACTURE', clientId: 'alpha-id', totalTTC: 1191.0,
            lines: [{ productId: 'p-x', quantity: 10, product: { name: 'Product X' } }], deletedAt: null
        } as any);
        prismaMock.posInventory.findUnique.mockResolvedValue({ quantity: 100 } as any);

        await request(app).post('/api/v1/documents/fact-1/validate').set('Authorization', `Bearer ${token}`).send({ dispatchFromPosId: 'pos-1' });

        // VERIFY DEBT: Client balance incremented by 1191.0
        expect(prismaMock.client.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'alpha-id' },
            data: { balance: { increment: 1191.0 } }
        }));

        // --- STEP 3: Initial Payment (50%) ---
        // 1191.0 / 2 = 595.5
        prismaMock.document.findUnique.mockResolvedValue({
            id: 'fact-1', status: 'VALIDATED', clientId: 'alpha-id', totalTTC: 1191.0, deletedAt: null
        } as any);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'alpha-id', balance: 1191.0 } as any);
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 0 } } as any);

        await request(app).post('/api/v1/payments').set('Authorization', `Bearer ${token}`).send({ documentId: 'fact-1', amount: 595.5, method: 'CASH' });

        // VERIFY BALANCE: Decremented by 595.5
        expect(prismaMock.client.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'alpha-id' },
            data: { balance: { decrement: 595.5 } }
        }));

        // --- STEP 4: Return Operation (Avoir) ---
        // Returning 2 units. 1 unit = 100 HT. 2 units = 200 HT + 38 TVA = 238.0 (natively ignoring timbre on avoir usually)
        prismaMock.document.findFirst.mockResolvedValue({
            id: 'avoir-1', status: 'DRAFT', type: 'AVOIR', clientId: 'alpha-id', totalTTC: 238.0,
            lines: [{ productId: 'p-x', quantity: 2, product: { name: 'Product X' } }], deletedAt: null
        } as any);

        await request(app).post('/api/v1/documents/avoir-1/validate').set('Authorization', `Bearer ${token}`).send({ dispatchFromPosId: 'pos-1' });

        // VERIFY STOCK & BALANCE: Stock incremented, balance decremented by 238.0
        expect(prismaMock.posInventory.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { quantity: { increment: 2 } }
        }));
        expect(prismaMock.client.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'alpha-id' },
            data: { balance: { decrement: 238.0 } }
        }));

        // CALCULATION CHECK: 
        // Initial Debt: 1191.0
        // - Payment: 595.5
        // - Avoir: 238.0
        // = Current Balance: 357.5

        // --- STEP 5: Clearing the Account (Final Payment) ---
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 595.5 } } as any); // Previous payment trace
        // 1191.0 (Total Doc) - 238.0 (Avoir) - 595.5 (Paid) = 357.5 (Wait, our payment logic maps exactly to document.totalTTC)
        // If Avoir is a separate document, it doesn't reduce the FACT-1 TTC. It reduces the Client Global Balance.
        // So the user still "owes" for FACT-1 unless they pay it.
        // Actually, in the Payment logic: aggregatedPayments + data.amount <= document.totalTTC
        // So to clear FACT-1 Alpha must pay 1191.0 - 595.5 = 595.5.

        await request(app).post('/api/v1/payments').set('Authorization', `Bearer ${token}`).send({ documentId: 'fact-1', amount: 595.5, method: 'CHQ' });

        // VERIFY PAID: Document FACT-1 turns to PAID because total payments = 1191.0
        expect(prismaMock.document.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'fact-1' },
            data: { status: 'PAID' }
        }));
    });
});
