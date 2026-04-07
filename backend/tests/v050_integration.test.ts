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

describe('Aegis ERP v0.5.0: Treasury & Dynamic Legal Analytics Scenario', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
    });

    /**
     * TEST SCENARIO: The "Executive Treasury Loop"
     * 1. Legal Modification: The system dynamically pulls `AppSettings` (20% TVA instead of 19%, Timbre 1.50).
     * 2. Document Calculation: An invoice is created. The backend must ditch hardcoded multipliers and obey Step 1.
     * 3. Treasury Leakage: A manager logs an electricity expense of 300 TND.
     * 4. Central Analytics: The Analytics compiler aggregates the net velocity of Today natively computing:
     *    (1000 TND collected natively) - (300 TND Expenses) = 700 Net Balance Offset.
     */
    it('Should accurately enforce dynamic taxes and compute daily treasury offsets', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        // --- STEP 1: Global App Settings (Legal Injection) ---
        // Setting an experimental TVA rate to strictly verify the Document pipeline is decoupled from hardcoded logic
        prismaMock.appSettings.findFirst.mockResolvedValue({
            id: 'settings-1',
            companyName: 'Aegis NextGen',
            matriculeFiscal: 'MF-000123',
            defaultTva: 20.00, // Explicitly 20%
            timbreFiscalPrice: 1.50 // Explicitly 1.50
        } as any);

        await request(app).get('/api/v1/settings').set('Authorization', `Bearer ${token}`);

        // --- STEP 2: Sales Engine (Dynamic Tax Proof) ---
        prismaMock.document.findUnique.mockResolvedValue(null);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'client-1', deletedAt: null } as any);
        prismaMock.product.findUnique.mockResolvedValue({ id: 'p-1', name: 'Server Unit' } as any);
        
        // Simulating the creation process in DocumentsService.createDraft natively through the payload mapping
        prismaMock.document.create.mockResolvedValue({ id: 'fact-dynamic-1' } as any);

        const invoicePayload = {
            documentNum: 'FACT-2026-0001',
            type: 'FACTURE',
            clientId: 'client-1',
            dispatchFromPosId: 'pos-1',
            lines: [{ productId: 'p-1', quantity: 2, unitPrice: 500, totalPrice: 1000 }] // TotalHT = 1000
        };

        await request(app)
            .post('/api/v1/documents')
            .set('Authorization', `Bearer ${token}`)
            .send(invoicePayload);

        const capturedDocumentCreation = (prismaMock.document.create as any).mock.calls[0][0].data;

        // MATHEMATICAL PROOF OF DECOUPLING: 
        // 1000 HT * 20% TVA = 200. Timbre = 1.50. TotalTTC Must Be 1201.50.
        // If it was still hardcoded (19%), it would be 1191.00.
        expect(capturedDocumentCreation).toBeDefined();
        expect(Number(capturedDocumentCreation.tva)).toEqual(200);
        expect(Number(capturedDocumentCreation.timbreFiscal)).toEqual(1.50);
        expect(Number(capturedDocumentCreation.totalTTC)).toEqual(1201.50);


        // --- STEP 3: Treasury Leakage (Expense Configuration) ---
        (prismaMock as any).expenseCategory.findFirst.mockResolvedValue({ id: 'cat-electricity', name: 'Operational Energy' } as any);
        (prismaMock as any).expense.create.mockResolvedValue({ id: 'exp-1', amount: 300 } as any);

        await request(app)
            .post('/api/v1/expenses')
            .set('Authorization', `Bearer ${token}`)
            .send({
                categoryId: 'cat-electricity',
                amount: 300,
                description: 'Server Electricity Costs',
                receiptUrl: 'https://cdn.aegis.erp/receipts/0001.pdf'
            });

        // --- STEP 4: Executive Analytics Verification ---
        // Mocking the raw aggregates identically to the real physical state we orchestrated today
        prismaMock.document.aggregate.mockResolvedValue({ _sum: { totalTTC: 1201.50 } } as any);
        prismaMock.document.aggregate.mockResolvedValue({ _sum: { totalTTC: 1201.50 } } as any); // Dynamic Native Mock
        prismaMock.document.groupBy.mockResolvedValue([{ dispatchFromPosId: 'pos-1', _sum: { totalTTC: 1201.50 } }] as any);
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 1000 } } as any); // We collected 1000 TND natively upfront
        prismaMock.purchaseDocument.aggregate.mockResolvedValue({ _sum: { totalTTC: 0 } } as any);
        prismaMock.supplierPayment.aggregate.mockResolvedValue({ _sum: { amount: 0 } } as any);
        (prismaMock as any).expense.aggregate.mockResolvedValue({ _sum: { amount: 300 } } as any); // The 300 TND we leaked natively
        prismaMock.warehouseInventory.findMany.mockResolvedValue([] as any);
        prismaMock.posInventory.findMany.mockResolvedValue([] as any);

        // Execute Analytics calculation algorithm
        const analyticsRes = await request(app).get('/api/v1/analytics/overview').set('Authorization', `Bearer ${token}`);
        
        expect(analyticsRes.status).toBe(200);
        const { dailyPerformance } = analyticsRes.body.data;
        
        // PROOF OF AGGREGATION ALGORITHMS
        expect(dailyPerformance.sales).toEqual(1201.50);
        expect(dailyPerformance.expenses).toEqual(300);
        
        // NET OFFSET PROOF: 1000 (Collections) - 0 (SupplierDisbursements) - 300 (Expenses) = 700 Net Balance Edge
        expect(dailyPerformance.netBalanceOffset).toEqual(700);
    });

    it('Should strictly bounce unauthorized audit log requests natively', async () => {
        // Logging in as a base worker (Missing SUPERADMIN parameters)
        const workerToken = authenticateAs('SalesAgent');
        const res = await request(app).get('/api/v1/audit').set('Authorization', `Bearer ${workerToken}`);
        
        expect(res.status).toBe(403);
        expect(res.body.message).toContain('Role Violation');
    });
});
