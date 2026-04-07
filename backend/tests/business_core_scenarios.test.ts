import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

// Utility for token mock
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

// Utility for Prisma Mock Transactions
const enableTransaction = () => {
    prismaMock.$transaction.mockImplementation((async (cb: any) => {
        return typeof cb === 'function' ? cb(prismaMock) : Promise.resolve();
    }) as any);
};

describe('Aegis ERP: Comprehensive Business Logic & Edge-Case Operations', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
    });

    /**
     * =========================================================================
     * SCENARIO 1: The Wholesale B2B Logistics Loop
     * =========================================================================
     * Business Logic: 
     * When buying bulk goods from a Supplier (Purchase Document), the stock must natively 
     * route to a designated Warehouse. When immediately distributing parts of that stock 
     * out to a B2B Client via Bon de Livraison (BL), the stock must decrement exactly, 
     * and isolated financial ledgers must track the debt owed to the supplier vs the 
     * debt owed by the client simultaneously without memory collision.
     */
    it('Scenario 1: Wholesale B2B Matrix (Purchases resolving to Sales & Debts)', async () => {
        const token = authenticateAs('Manager');
        enableTransaction();

        // 1. Supplier Purchase: Validating Bon Reception for 1000 Server Units
        prismaMock.purchaseDocument.findFirst.mockResolvedValue({
            id: 'purchase-doc-1', status: 'DRAFT', supplierId: 'supplier-sys', receivedAtWarehouseId: 'warehouse-main', totalTTC: 50000, lines: [{ productId: 'server-p1', quantity: 1000, product: { name: 'Server Unit', purchasePrice: 50, sellingPrice: 60 } }], deletedAt: null
        } as any);
        
        await request(app).post('/api/v1/purchases/purchase-doc-1/validate').set('Authorization', `Bearer ${token}`);
        
        // Assert Stock injected into Warehouse successfully & Supplier debt escalated
        expect(prismaMock.warehouseInventory.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { productId_warehouseId: { productId: 'server-p1', warehouseId: 'warehouse-main' } },
            update: { quantity: { increment: 1000 } }
        }));
        expect(prismaMock.supplier.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'supplier-sys' },
            data: { balanceDue: { increment: 50000 } }
        }));

        // 2. Client Sale: Re-routing 200 Server Units to a B2B Client
        prismaMock.document.findFirst.mockResolvedValue({
            id: 'bl-1', status: 'DRAFT', type: 'BL', clientId: 'client-b2b', totalTTC: 15000, lines: [{ productId: 'server-p1', quantity: 200 }], deletedAt: null
        } as any);
        prismaMock.warehouseInventory.findUnique.mockResolvedValue({ quantity: 1000 } as any);

        await request(app).post('/api/v1/documents/bl-1/validate').set('Authorization', `Bearer ${token}`).send({ dispatchFromWarehouseId: 'warehouse-main' });

        // Assert Stock deducted safely & B2B Client debt escalated
        expect(prismaMock.warehouseInventory.update).toHaveBeenCalledWith(expect.objectContaining({
            data: { quantity: { decrement: 200 } }
        }));
        expect(prismaMock.client.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'client-b2b' },
            data: { balance: { increment: 15000 } }
        }));
    });

    /**
     * =========================================================================
     * SCENARIO 2: POS Retail Overrides (The Flexibility Doctrine)
     * =========================================================================
     * Business Logic: 
     * Retail branches often need to bend catalog prices during negotiation or sales. 
     * The system must never forcefully override the user's explicitly requested `unitPrice` 
     * on the invoice line with the backend catalog `sellingPrice`. The draft engine 
     * must calculate mathematical constraints exactly using the user's manual override.
     */
    it('Scenario 2: Retail POS Override Mathematical Integrity', async () => {
        const token = authenticateAs('POS_User');
        
        // Product default price is theoretically 400.
        // User manually entered "450" into the POS frontend.
        const manualOverridePayload = {
            documentNum: 'FACT-POS-002',
            type: 'FACTURE',
            clientId: 'client-b2c',
            dispatchFromPosId: 'pos-1',
            lines: [{ productId: 'p-1', quantity: 10, unitPrice: 450, totalPrice: 4500 }] 
        };

        // App Settings returns standard 19% TVA natively
        prismaMock.appSettings.findFirst.mockResolvedValue({ defaultTva: 19.00, timbreFiscalPrice: 1.00 } as any);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'client-b2c', deletedAt: null } as any);
        prismaMock.product.findUnique.mockResolvedValue({ id: 'p-1', name: 'Server Unit' } as any);
        
        prismaMock.document.create.mockResolvedValue({ id: 'fact-pos-002' } as any);

        const res = await request(app).post('/api/v1/documents').set('Authorization', `Bearer ${token}`).send(manualOverridePayload);    
        
        const capturedInvoice = (prismaMock.document.create as any).mock.calls[0][0].data;

        // Assert that the backend trusted the `totalPrice` override of 4500 natively.
        // 4500 * 19% = 855. TotalTTC -> 4500 + 855 + 1 = 5356. 
        expect(capturedInvoice.totalHT).toBe(4500);
        expect(capturedInvoice.tva).toBe(855);
        expect(capturedInvoice.totalTTC).toBe(5356);
    });

    /**
     * =========================================================================
     * SCENARIO 3: Financial Deletion Guardrail Limits
     * =========================================================================
     * Business Logic: 
     * It is a fatal error in accounting to delete records holding active financial capacity.
     * The backend MUST natively reject any attempt to soft-delete or hard-delete a Client
     * or Supplier if their `balance` or `balanceDue` is greater than 0.00.
     */
    it('Scenario 3: Financial Safety Guards Prevent Corrupt Deletions', async () => {
        const token = authenticateAs('SuperAdmin');
        
        // Mock a client who still owes us 500 TND
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'client-debt-1', balance: 500.00, deletedAt: null
        } as any);

        const res = await request(app).delete('/api/v1/clients/client-debt-1').set('Authorization', `Bearer ${token}`);

        // Assert the system violently rejects the query protecting the financial baseline
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('outstanding positive balance due');
        expect(prismaMock.client.update).not.toHaveBeenCalled();
    });

    /**
     * =========================================================================
     * SCENARIO 4: Mass Data Aggregation & Analytical Health Metrics
     * =========================================================================
     * Business Logic: 
     * Large ERPs process thousands of micro-transactions (expenses, collections, invoices).
     * The Analytics logic must successfully compute real-time edge offsets without pulling
     * raw arrays into NodeJS memory, utilizing strictly Database raw aggregation logic.
     */
    it('Scenario 4: Central Analytics computes massive variance matrix safely', async () => {
        const token = authenticateAs('SuperAdmin');
        
        // Mocking massive operational aggregates that occurred today:
        prismaMock.document.aggregate.mockResolvedValue({ _sum: { totalTTC: 154000 } } as any); // 154K Gross Sales
        prismaMock.document.groupBy.mockResolvedValue([{ dispatchFromPosId: 'pos-alpha', _sum: { totalTTC: 154000 } }] as any);
        
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 32000 } } as any); // We collected 32K cash natively
        prismaMock.supplierPayment.aggregate.mockResolvedValue({ _sum: { amount: 15000 } } as any); // We paid external suppliers 15K natively
        prismaMock.purchaseDocument.aggregate.mockResolvedValue({ _sum: { totalTTC: 8000 } } as any); // Bought 8K worth of goods
        
        (prismaMock as any).expense.aggregate.mockResolvedValue({ _sum: { amount: 2000 } } as any); // Operational leakage (electricity, fuel) 2K
        prismaMock.warehouseInventory.findMany.mockResolvedValue([] as any);
        prismaMock.posInventory.findMany.mockResolvedValue([] as any);

        const res = await request(app).get('/api/v1/analytics/overview').set('Authorization', `Bearer ${token}`);
        
        // Assert mapping resolves cleanly yielding exactly our expected bounds
        const limits = res.body.data.dailyPerformance;
        expect(limits.sales).toBe(154000);
        
        // Net Offset Algorithm check:
        // Cash In: 32,000 (Payments)
        // Cash Out: 15,000 (SupplierPay) + 2,000 (Operating Expenses)
        // Expected Net Vault Offset: 15,000 Edge Revenue Retained Today
        expect(limits.netBalanceOffset).toBe(15000);
    });
});
