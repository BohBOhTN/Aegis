import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

describe('Products API Endpoint Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    it('should reject product creation when authentication token is missing', async () => {
        const res = await request(app).post('/api/v1/products').send({
            name: 'Test Product',
            purchasePrice: 10.000,
            sellingPrice: 20.000
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject product creation when required fields are absent', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: 'test-uuid', role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        prismaMock.user.findUnique.mockResolvedValue({
            id: 'test-uuid',
            email: 'admin@aegris.com',
            passwordHash: 'hash',
            isActive: true,
            role: { name: 'Admin', permissions: { all: true } }
        } as any);

        const res = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Incomplete Product' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Payload Validation');
    });
});
