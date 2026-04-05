import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';
import bcrypt from 'bcrypt';

describe('Authentication API Endpoint Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    it('should securely reject login attempts missing payload credentials natively', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'admin@aegris.com'
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Payload Error');
    });

    it('should authenticate user identically utilizing cryptographically matching payload parameters', async () => {
        const mockHash = await bcrypt.hash('secretPass123', 12);

        // Bypassing real database by injecting mathematical shadow response
        prismaMock.user.findUnique.mockResolvedValue({
            id: '123-uuid',
            email: 'admin@aegris.com',
            passwordHash: mockHash,
            isActive: true,
            role: {
                name: 'SuperAdmin',
                permissions: { all: true }
            }
        } as any);

        const res = await request(app).post('/api/auth/login').send({
            email: 'admin@aegris.com',
            password: 'secretPass123'
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user.email).toBe('admin@aegris.com');
        expect(res.body.data.user.role).toBe('SuperAdmin');
    });

});
