import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/utils/prisma.mock';

// Helper: Generates a valid SuperAdmin JWT and binds the user mock
const authenticateAs = (roleName: string) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'user-uuid', role: roleName }, process.env.JWT_SECRET, { expiresIn: '1d' });
    prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        email: 'operator@aegris.com',
        passwordHash: 'hash',
        isActive: true,
        role: { name: roleName, permissions: { all: true } }
    } as any);
    return token;
};

describe('Client Directory API: Business-Driven Integration Matrix', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'virtual_test_secret_key_1234567890';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    // =========================================================================
    // SECTION A: Authentication and Authorization Boundaries
    // =========================================================================

    it('A1: Should reject all client operations when JWT is entirely absent', async () => {
        const res = await request(app).post('/api/v1/clients').send({
            type: 'B2B', companyName: 'Unsecured Corp'
        });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('A2: Should reject client operations when role lacks RBAC clearance (Inventory_Clerk has no access)', async () => {
        const token = authenticateAs('Inventory_Clerk');
        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2B', companyName: 'Blocked Attempt' });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('A3: Should permit POS_User to create a client during checkout workflow', async () => {
        const token = authenticateAs('POS_User');
        prismaMock.client.findUnique.mockResolvedValue(null);
        prismaMock.client.create.mockResolvedValue({
            id: 'pos-client', type: 'B2C', companyName: 'Walk-In', balance: 0.0
        } as any);

        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2C', companyName: 'Walk-In' });

        expect(res.status).toBe(201);
    });

    it('A4: Should deny POS_User from deleting client profiles (restricted to SuperAdmin/Manager)', async () => {
        const token = authenticateAs('POS_User');

        const res = await request(app)
            .delete('/api/v1/clients/client-uuid')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    // =========================================================================
    // SECTION B: Payload Validation Enforcement
    // =========================================================================

    it('B1: Should reject creation when companyName is entirely absent', async () => {
        const token = authenticateAs('SuperAdmin');
        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2B' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('companyName');
    });

    it('B2: Should reject creation when client type is invalid or missing', async () => {
        const token = authenticateAs('SuperAdmin');
        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ companyName: 'Typeless Corp' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('client type');
    });

    it('B3: Should reject creation with an invalid type value not in the ClientType enum', async () => {
        const token = authenticateAs('SuperAdmin');
        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'GOVERNMENT', companyName: 'Invalid Type Corp' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('client type');
    });

    // =========================================================================
    // SECTION C: Email Uniqueness Constraint Enforcement
    // =========================================================================

    it('C1: Should successfully create a B2B client when email is globally unique', async () => {
        const token = authenticateAs('Manager');
        prismaMock.client.findUnique.mockResolvedValue(null);
        prismaMock.client.create.mockResolvedValue({
            id: 'new-b2b', type: 'B2B', companyName: 'Tech Solutions TN',
            email: 'unique@tech.tn', balance: 0.0
        } as any);

        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2B', companyName: 'Tech Solutions TN', email: 'unique@tech.tn', matriculeFiscal: '1234567X' });

        expect(res.status).toBe(201);
        expect(res.body.data.balance).toBe(0.0);
        expect(res.body.data.email).toBe('unique@tech.tn');
    });

    it('C2: Should reject creation when email already belongs to an existing profile', async () => {
        const token = authenticateAs('Manager');
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'existing', email: 'occupied@aegris.com'
        } as any);

        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2B', companyName: 'Duplicate Email Corp', email: 'occupied@aegris.com' });

        expect(res.status).toBe(409);
        expect(res.body.message).toContain('email already exists');
    });

    it('C3: Should allow creation without email (email is optional and permits unlimited null entries)', async () => {
        const token = authenticateAs('Manager');
        prismaMock.client.create.mockResolvedValue({
            id: 'no-email', type: 'B2C', companyName: 'Cash Client', email: null, balance: 0.0
        } as any);

        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2C', companyName: 'Cash Client' });

        expect(res.status).toBe(201);
        expect(res.body.data.email).toBeNull();
    });

    it('C4: Should reject update when reassigning an email already bound to a different profile', async () => {
        const token = authenticateAs('SuperAdmin');
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'target-client', companyName: 'Update Target', deletedAt: null
        } as any);
        prismaMock.client.findFirst.mockResolvedValue({
            id: 'other-client', email: 'taken@business.tn'
        } as any);

        const res = await request(app)
            .put('/api/v1/clients/target-client')
            .set('Authorization', `Bearer ${token}`)
            .send({ email: 'taken@business.tn' });

        expect(res.status).toBe(409);
        expect(res.body.message).toContain('bound to another');
    });

    // =========================================================================
    // SECTION D: Credit Balance and Deletion Business Logic
    // =========================================================================

    it('D1: Should initialize all new client profiles with a zero-balance guarantee', async () => {
        const token = authenticateAs('SuperAdmin');
        prismaMock.client.findUnique.mockResolvedValue(null);
        prismaMock.client.create.mockResolvedValue({
            id: 'zero-bal', type: 'B2B', companyName: 'New Corp', balance: 0.0
        } as any);

        const res = await request(app)
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'B2B', companyName: 'New Corp' });

        expect(res.status).toBe(201);
        expect(res.body.data.balance).toBe(0.0);
    });

    it('D2: Should strictly block deletion of a client carrying active outstanding credit debt', async () => {
        const token = authenticateAs('SuperAdmin');
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'indebted-client', companyName: 'Debt Corp',
            balance: 4750.500, deletedAt: null
        } as any);

        const res = await request(app)
            .delete('/api/v1/clients/indebted-client')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('positive balance due');
    });

    it('D3: Should permit soft deletion natively when client balance is exactly zero', async () => {
        const token = authenticateAs('SuperAdmin');
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'clean-client', companyName: 'Zero Balance Corp',
            balance: 0.0, deletedAt: null
        } as any);
        prismaMock.client.update.mockResolvedValue({ deletedAt: new Date() } as any);

        const res = await request(app)
            .delete('/api/v1/clients/clean-client')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(204);
    });

    it('D4: Should return 404 when attempting to retrieve a soft-deleted client profile', async () => {
        const token = authenticateAs('SuperAdmin');
        prismaMock.client.findUnique.mockResolvedValue({
            id: 'archived', deletedAt: new Date('2026-01-01')
        } as any);

        const res = await request(app)
            .get('/api/v1/clients/archived')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});
