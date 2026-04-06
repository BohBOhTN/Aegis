import { ClientType } from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const clientsService = {
    async createClient(data: {
        type: ClientType;
        companyName: string;
        matriculeFiscal?: string;
        address?: string;
        phone?: string;
        email?: string;
    }) {
        if (!data.companyName) {
            throw new AppError('Payload Validation: companyName is strictly required.', 400);
        }
        if (!data.type || !Object.values(ClientType).includes(data.type)) {
            throw new AppError('Payload Validation: valid client type (B2B or B2C) is required.', 400);
        }

        if (data.email) {
            const existing = await prisma.client.findUnique({ where: { email: data.email } });
            if (existing) {
                throw new AppError('Conflict: A Client with this email already exists natively.', 409);
            }
        }

        return prisma.client.create({
            data: {
                type: data.type,
                companyName: data.companyName,
                matriculeFiscal: data.matriculeFiscal,
                address: data.address,
                phone: data.phone,
                email: data.email,
                balance: 0.00 // Default state securely initialized
            }
        });
    },

    async getClients(query: any = {}) {
        return prisma.client.findMany({
            where: {
                deletedAt: null,
                ...(query.search && {
                    companyName: { contains: query.search, mode: 'insensitive' }
                }),
                ...(query.type && {
                    type: query.type
                })
            },
            orderBy: { companyName: 'asc' }
        });
    },

    async getClientById(id: string) {
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                documents: {
                    select: {
                        id: true,
                        documentNum: true,
                        type: true,
                        status: true,
                        totalTTC: true,
                        issueDate: true
                    },
                    orderBy: { issueDate: 'desc' },
                    take: 5
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        date: true
                    },
                    orderBy: { date: 'desc' },
                    take: 5
                }
            }
        });

        if (!client || client.deletedAt) {
            throw new AppError('Lookup Failure: Unrecognized Client ID.', 404);
        }

        return client;
    },

    async updateClient(id: string, data: Partial<{
        type: ClientType;
        companyName: string;
        matriculeFiscal: string;
        address: string;
        phone: string;
        email: string;
    }>) {
        await this.getClientById(id); // Validates existence natively

        if (data.email) {
            const existing = await prisma.client.findFirst({
                where: { email: data.email, NOT: { id } }
            });
            if (existing) {
                throw new AppError('Conflict: Email natively bound to another Profile.', 409);
            }
        }

        return prisma.client.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    },

    async deleteClient(id: string) {
        const client = await this.getClientById(id);

        if (Number(client.balance) > 0) {
            throw new AppError('Operation Prohibited: Cannot delete a client with an outstanding positive balance due.', 400);
        }

        return prisma.client.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
};
