import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const suppliersService = {
    async createSupplier(data: {
        companyName: string;
        contactName?: string;
        phone?: string;
        email?: string;
        address?: string;
    }) {
        if (!data.companyName) {
            throw new AppError('Payload Validation: companyName is strictly required.', 400);
        }

        if (data.email) {
            const existing = await prisma.supplier.findUnique({ where: { email: data.email } });
            if (existing) {
                throw new AppError('Conflict: A Supplier with this email already exists natively.', 409);
            }
        }

        return prisma.supplier.create({
            data: {
                companyName: data.companyName,
                contactName: data.contactName,
                phone: data.phone,
                email: data.email,
                address: data.address
            }
        });
    },

    async getSuppliers(query: any = {}) {
        return prisma.supplier.findMany({
            where: {
                deletedAt: null,
                ...(query.search && {
                    companyName: { contains: query.search, mode: 'insensitive' }
                })
            },
            orderBy: { companyName: 'asc' }
        });
    },

    async getSupplierById(id: string) {
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                purchaseDocuments: {
                    select: {
                        id: true,
                        documentNum: true,
                        status: true,
                        totalTTC: true,
                        amountPaid: true,
                        issueDate: true
                    },
                    orderBy: { issueDate: 'desc' },
                    take: 5
                }
            }
        });

        if (!supplier || supplier.deletedAt) {
            throw new AppError('Lookup Failure: Unrecognized Supplier ID.', 404);
        }

        return supplier;
    },

    async updateSupplier(id: string, data: Partial<{
        companyName: string;
        contactName: string;
        phone: string;
        email: string;
        address: string;
    }>) {
        await this.getSupplierById(id); // Validates existence

        if (data.email) {
            const existing = await prisma.supplier.findFirst({
                where: { email: data.email, NOT: { id } }
            });
            if (existing) {
                throw new AppError('Conflict: Email natively bound to another Profile.', 409);
            }
        }

        return prisma.supplier.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    },

    async deleteSupplier(id: string) {
        await this.getSupplierById(id);

        return prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
};
