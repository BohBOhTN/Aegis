import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

describe('Logistics & Inventory Transfers Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    it('should cleanly reject transfer bounds missing active Origin and Destinations', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: 'test-uuid', role: 'SuperAdmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        prismaMock.user.findUnique.mockResolvedValue({
            id: 'test-uuid',
            email: 'admin@aegris.com',
            isActive: true,
            role: { name: 'SuperAdmin', permissions: { all: true } }
        } as any);

        const res = await request(app)
            .patch('/api/v1/inventory/transfer')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId: 'product-x',
                quantity: 15
                // Strictly missing required routing locations
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('valid originating location');
    });

    it('should validate zero-sum algorithm and execute physical DB shifts logically across components', async () => {
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

        // Mock product lookup natively
        prismaMock.product.findUnique.mockResolvedValue({ id: 'product-sync' } as any);

        // Mock ORIGIN Warehouse mathematically having exactly 50 units
        prismaMock.warehouseInventory.findUnique.mockResolvedValue({ quantity: 50.0 } as any);
        prismaMock.warehouseInventory.update.mockResolvedValue({} as any);

        // Mock DESTINATION UPSERT
        prismaMock.posInventory.upsert.mockResolvedValue({} as any);

        // Mock the Trace Log Drop
        prismaMock.inventoryMovement.create.mockResolvedValue({ id: 'trace-1', quantity: 20 } as any);

        const res = await request(app)
            .patch('/api/v1/inventory/transfer')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId: 'product-sync',
                fromWarehouseId: 'origin-wh',
                toPosId: 'dest-pos',
                quantity: 20,
                description: 'Mid-Day Restock Operation'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe('trace-1');

        // Validation A: Ensure Origin decremented mathematically by exactly 20!
        expect(prismaMock.warehouseInventory.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { quantity: { decrement: 20 } }
            })
        );

        // Validation B: Ensure POS increments simultaneously mathematically by 20!
        expect(prismaMock.posInventory.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: { quantity: { increment: 20 } }
            })
        );
    });
});
