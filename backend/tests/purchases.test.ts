import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

describe('Purchases API Endpoint Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    it('should reject purchase draft creation when authentication token is missing', async () => {
        const res = await request(app).post('/api/v1/purchases').send({
            documentNum: 'BR-TEST-001',
            type: 'BON_RECEPTION',
            supplierId: 'supplier-uuid',
            receivedAtWarehouseId: 'wh-uuid',
            lines: [{ productId: 'prod-uuid', quantity: 10, unitPrice: 15.000, totalPrice: 150.000 }]
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject purchase creation missing critical payload attributes', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: 'test-uuid', role: 'SuperAdmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        prismaMock.user.findUnique.mockResolvedValue({
            id: 'test-uuid',
            email: 'admin@aegris.com',
            passwordHash: 'hash',
            isActive: true,
            role: { name: 'SuperAdmin', permissions: { all: true } }
        } as any);

        const res = await request(app)
            .post('/api/v1/purchases')
            .set('Authorization', `Bearer ${token}`)
            .send({ documentNum: 'BR-TEST-001' }); // Missing supplierId, type, lines

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Payload Validation');
    });

    it('should reject validation procedure on non-existent document', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: 'test-uuid', role: 'SuperAdmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        prismaMock.user.findUnique.mockResolvedValue({
            id: 'test-uuid',
            email: 'admin@aegris.com',
            passwordHash: 'hash',
            isActive: true,
            role: { name: 'SuperAdmin', permissions: { all: true } }
        } as any);

        // Mock DB returning null for doc lookup inside PurchaseService
        prismaMock.purchaseDocument.findFirst.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/v1/purchases/invalid-uuid/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('should autonomously parse mathematical inventory and trace variations correctly on validation', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: 'test-uuid', role: 'SuperAdmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        prismaMock.user.findUnique.mockResolvedValue({
            id: 'test-uuid',
            email: 'admin@aegris.com',
            isActive: true,
            role: { name: 'SuperAdmin', permissions: { all: true } }
        } as any);

        // Force callback interception
        prismaMock.$transaction.mockImplementation((async (cb: any) => {
            return typeof cb === 'function' ? cb(prismaMock) : Promise.resolve();
        }) as any);

        prismaMock.purchaseDocument.findFirst.mockResolvedValue({
            id: 'valid-doc',
            status: 'DRAFT',
            documentNum: 'BR-2026',
            receivedAtPosId: 'test-pos-location',
            lines: [
                {
                    productId: 'product-x',
                    quantity: 50,
                    unitPrice: 200.0,
                    product: { purchasePrice: 150.0 } // Discrepancy triggers Price Variation tracing!
                }
            ]
        } as any);

        prismaMock.purchaseDocument.update.mockResolvedValue({ id: 'valid-doc', status: 'VALIDATED' } as any);

        const res = await request(app)
            .post('/api/v1/purchases/valid-doc/validate')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Assertion 1: Inventory Trace Logic Captured
        expect(prismaMock.inventoryMovement.create).toHaveBeenCalled();

        // Assertion 2: POS Inventory Mathematically incremented
        expect(prismaMock.posInventory.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { productId_posId: { productId: 'product-x', posId: 'test-pos-location' } }
            })
        );

        // Assertion 3: Autonomic variance bounds dropped historically
        expect(prismaMock.priceHistory.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ oldPurchasePrice: 150.0, newPurchasePrice: 200.0 })
            })
        );
    });
});
