import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

describe('Categories API Endpoint Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    it('should reject category creation when authentication token is missing', async () => {
        const res = await request(app).post('/api/v1/categories').send({
            name: 'Test Category'
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject category creation when required fields are absent', async () => {
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
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Payload Validation');
    });
});
