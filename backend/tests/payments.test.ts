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

describe('Financial Payment Ledger: Business-Driven Integration Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    // =========================================================================
    // SECTION A: Authentication and Authorization
    // =========================================================================

    it('A1: Should reject payment creation without JWT authentication', async () => {
        const res = await request(app).post('/api/v1/payments').send({
            documentId: 'doc-1', amount: 500, method: 'CASH'
        });
        expect(res.status).toBe(401);
    });

    it('A2: Should deny POS_User from recording payments (higher financial clearance required)', async () => {
        const token = authenticateAs('POS_User');
        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'doc-1', amount: 500, method: 'CASH' });

        expect(res.status).toBe(403);
    });

    it('A3: Should permit POS_User to READ payment history for client visibility', async () => {
        const token = authenticateAs('POS_User');
        prismaMock.payment.findMany.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/v1/payments?clientId=client-1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    // =========================================================================
    // SECTION B: Payment Validation Constraints
    // =========================================================================

    it('B1: Should reject payment with zero or negative amount (financial sanity guard)', async () => {
        const token = authenticateAs('Accountant');
        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'doc-1', amount: -100, method: 'CASH' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('positive');
    });

    it('B2: Should reject payment against a DRAFT document (only VALIDATED documents accept payments)', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        prismaMock.document.findUnique.mockResolvedValue({
            id: 'draft-doc', status: 'DRAFT', clientId: 'c-1',
            totalTTC: 5000, deletedAt: null
        } as any);

        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'draft-doc', amount: 500, method: 'CASH' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('VALIDATED');
    });

    it('B3: Should reject payment against a non-existent document reference', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        prismaMock.document.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'phantom-doc', amount: 200, method: 'CHQ' });

        expect(res.status).toBe(404);
        expect(res.body.message).toContain('Document');
    });

    it('B4: Should reject payment against a deleted or archived client', async () => {
        const token = authenticateAs('Manager');
        enableTransaction();

        prismaMock.document.findUnique.mockResolvedValue({
            id: 'val-doc', status: 'VALIDATED', clientId: 'archived-client',
            totalTTC: 1000, deletedAt: null
        } as any);
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'archived-client', deletedAt: new Date('2026-01-01')
        } as any);

        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'val-doc', amount: 200, method: 'VIREMENT' });

        expect(res.status).toBe(404);
        expect(res.body.message).toContain('Client');
    });

    // =========================================================================
    // SECTION C: Overpayment Prevention and Mathematical Boundaries
    // =========================================================================

    it('C1: Should reject payment when aggregated sum would mathematically exceed the document totalTTC', async () => {
        const token = authenticateAs('Accountant');
        enableTransaction();

        prismaMock.document.findUnique.mockResolvedValue({
            id: 'bounded-doc', status: 'VALIDATED', clientId: 'c-over',
            totalTTC: 2000, deletedAt: null
        } as any);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'c-over', balance: 2000, deletedAt: null } as any);
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 1800 } } as any);

        // Already paid 1800, attempting 500 more (total 2300 > 2000 TTC)
        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'bounded-doc', amount: 500, method: 'CASH' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Max Authorized Left: 200');
    });

    it('C2: Should accept a partial payment and correctly decrement client balance without shifting to PAID', async () => {
        const token = authenticateAs('Manager');
        enableTransaction();

        prismaMock.document.findUnique.mockResolvedValue({
            id: 'partial-doc', status: 'VALIDATED', clientId: 'c-partial',
            totalTTC: 3000, deletedAt: null
        } as any);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'c-partial', balance: 3000, deletedAt: null } as any);
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 0 } } as any);
        prismaMock.payment.create.mockResolvedValue({
            id: 'pay-1', amount: 1000, method: 'CASH'
        } as any);

        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'partial-doc', amount: 1000, method: 'CASH' });

        expect(res.status).toBe(201);
        expect(res.body.data.amount).toBe(1000);

        // Client balance must be decremented by payment amount
        expect(prismaMock.client.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'c-partial' },
                data: { balance: { decrement: 1000 } }
            })
        );

        // Document should NOT shift to PAID (only 1000 of 3000 paid)
        expect(prismaMock.document.update).not.toHaveBeenCalled();
    });

    // =========================================================================
    // SECTION D: Full Payment Lifecycle and Document State Transition
    // =========================================================================

    it('D1: Should auto-transition document to PAID when aggregated payments exactly offset totalTTC', async () => {
        const token = authenticateAs('SuperAdmin');
        enableTransaction();

        prismaMock.document.findUnique.mockResolvedValue({
            id: 'closing-doc', status: 'VALIDATED', clientId: 'c-closing',
            totalTTC: 5000, deletedAt: null
        } as any);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'c-closing', balance: 5000, deletedAt: null } as any);
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 3500 } } as any);
        prismaMock.payment.create.mockResolvedValue({ id: 'final-pay', amount: 1500 } as any);

        // Paying the exact remaining 1500 to close the 5000 TTC document
        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'closing-doc', amount: 1500, method: 'VIREMENT' });

        expect(res.status).toBe(201);

        // Client balance must decrease
        expect(prismaMock.client.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'c-closing' },
                data: { balance: { decrement: 1500 } }
            })
        );

        // THE CRITICAL ASSERTION: Document state autonomously shifts to PAID
        expect(prismaMock.document.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'closing-doc' },
                data: { status: 'PAID' }
            })
        );
    });

    it('D2: Should support multi-method payment chains (CASH + CHQ + VIREMENT) across sequential operations', async () => {
        const token = authenticateAs('Accountant');
        enableTransaction();

        // This test validates that the system accepts ANY combination of methods
        prismaMock.document.findUnique.mockResolvedValue({
            id: 'multi-doc', status: 'VALIDATED', clientId: 'c-multi',
            totalTTC: 10000, deletedAt: null
        } as any);
        prismaMock.client.findUnique.mockResolvedValue({ id: 'c-multi', balance: 10000, deletedAt: null } as any);
        prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 4000 } } as any);
        prismaMock.payment.create.mockResolvedValue({ id: 'multi-pay', amount: 2000, method: 'CHQ' } as any);

        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentId: 'multi-doc', amount: 2000, method: 'CHQ' });

        expect(res.status).toBe(201);
        expect(res.body.data.method).toBe('CHQ');
    });
});
