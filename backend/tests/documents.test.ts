import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

const authenticateAs = (roleName: string) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'user-uuid', role: roleName }, process.env.JWT_SECRET, { expiresIn: '1d' });
    prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        email: 'operator@aegris.com',
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

describe('Sales Documents Core: Business Implementation Verification', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    it('Scenario 1: Should calculate TTC correctly and create a valid DRAFT', async () => {
        const token = authenticateAs('Manager');

        prismaMock.client.findUnique.mockResolvedValue({ id: 'c-1', deletedAt: null } as any);
        prismaMock.appSettings.findFirst.mockResolvedValue({ defaultTva: 19.00, timbreFiscalPrice: 1.00 } as any);

        // HT = 1000. TVA (19%) = 190. Timbre = 1.0. TTC = 1191.0
        prismaMock.document.create.mockResolvedValue({
            id: 'doc-1',
            documentNum: 'FACT-2026-001',
            status: 'DRAFT',
            totalHT: 1000.0,
            tva: 190.0,
            timbreFiscal: 1.0,
            totalTTC: 1191.0,
            lines: []
        } as any);

        const res = await request(app)
            .post('/api/v1/documents')
            .set('Authorization', `Bearer ${token}`)
            .send({
                documentNum: 'FACT-2026-001',
                type: 'FACTURE',
                clientId: 'c-1',
                dispatchFromPosId: 'pos-1',
                lines: [{ productId: 'p-1', quantity: 10, unitPrice: 100, totalPrice: 1000 }]
            });

        expect(res.status).toBe(201);
        expect(res.body.data.totalTTC).toBe(1191.0);
    });

    it('Scenario 2: Validation of FACTURE should trigger inventory and client debt updates', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        prismaMock.document.findFirst.mockResolvedValue({
            id: 'doc-valid',
            status: 'DRAFT',
            type: 'FACTURE',
            documentNum: 'FACT-100',
            clientId: 'client-1',
            totalTTC: 596.0, // 500 HT + 95 TVA + 1 Timbre
            lines: [{ productId: 'prod-1', quantity: 5, unitPrice: 100, totalPrice: 500, product: { name: 'Item 1' } }],
            deletedAt: null
        } as any);

        prismaMock.posInventory.findUnique.mockResolvedValue({ quantity: 10 } as any);
        prismaMock.document.update.mockResolvedValue({ id: 'doc-valid', status: 'VALIDATED' } as any);

        const res = await request(app)
            .post('/api/v1/documents/doc-valid/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({ dispatchFromPosId: 'pos-1' });

        expect(res.status).toBe(200);

        // Inventory check
        expect(prismaMock.posInventory.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { productId_posId: { productId: 'prod-1', posId: 'pos-1' } },
                data: { quantity: { decrement: 5 } }
            })
        );

        // Client debt check
        expect(prismaMock.client.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'client-1' },
                data: { balance: { increment: 596.0 } }
            })
        );
    });

    it('Scenario 3: Validation of AVOIR should reverse the business logic impact', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        prismaMock.document.findFirst.mockResolvedValue({
            id: 'avoir-doc',
            status: 'DRAFT',
            type: 'AVOIR',
            documentNum: 'AV-001',
            clientId: 'client-1',
            totalTTC: 120.0,
            lines: [{ productId: 'prod-1', quantity: 1, unitPrice: 100, totalPrice: 100, product: { name: 'Item 1' } }],
            deletedAt: null
        } as any);

        prismaMock.document.update.mockResolvedValue({ id: 'avoir-doc', status: 'VALIDATED' } as any);

        const res = await request(app)
            .post('/api/v1/documents/avoir-doc/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({ dispatchFromPosId: 'pos-1' });

        expect(res.status).toBe(200);

        // Stock goes UP (reinstated)
        expect(prismaMock.posInventory.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: { quantity: { increment: 1 } }
            })
        );

        // Client balance goes DOWN (debt reduced)
        expect(prismaMock.client.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'client-1' },
                data: { balance: { decrement: 120.0 } }
            })
        );
    });

    it('Scenario 4: Should block validation if stock levels are insufficient at origin', async () => {
        const token = authenticateAs('Manager');
        enableTransaction();

        prismaMock.document.findFirst.mockResolvedValue({
            id: 'deficit-doc',
            status: 'DRAFT',
            type: 'BL',
            lines: [{ productId: 'p-1', quantity: 100, product: { name: 'Rare Item' } }],
            deletedAt: null
        } as any);

        prismaMock.posInventory.findUnique.mockResolvedValue({ quantity: 10 } as any);

        const res = await request(app)
            .post('/api/v1/documents/deficit-doc/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({ dispatchFromPosId: 'pos-1' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Stock insufficient');
    });
});
