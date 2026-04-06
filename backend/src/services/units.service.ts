import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class UnitsService {
    static async create(data: { name: string; symbol: string }) {
        const existing = await prisma.unit.findUnique({ where: { name: data.name } });
        if (existing) throw new AppError('A unit with this name already exists.', 409);

        return prisma.unit.create({
            data: {
                name: data.name,
                symbol: data.symbol,
            },
            select: { id: true, name: true, symbol: true, createdAt: true }
        });
    }

    static async getAll() {
        return prisma.unit.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                symbol: true,
                createdAt: true,
            }
        });
    }

    static async getById(id: string) {
        const unit = await prisma.unit.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                name: true,
                symbol: true,
                createdAt: true,
                products: { select: { id: true, name: true, barcode: true } }
            }
        });

        if (!unit) throw new AppError('No unit found matching the provided identifier.', 404);
        return unit;
    }

    static async update(id: string, data: { name?: string; symbol?: string }) {
        const existing = await prisma.unit.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new AppError('No unit found matching the provided identifier.', 404);

        if (data.name && data.name !== existing.name) {
            const duplicate = await prisma.unit.findUnique({ where: { name: data.name } });
            if (duplicate) throw new AppError('A unit with this new name already exists.', 409);
        }

        return prisma.unit.update({
            where: { id },
            data,
            select: { id: true, name: true, symbol: true, updatedAt: true }
        });
    }

    static async softDelete(id: string) {
        const existing = await prisma.unit.findFirst({
            where: { id, deletedAt: null },
            include: { products: true }
        });
        if (!existing) throw new AppError('No unit found matching the provided identifier.', 404);

        if (existing.products.length > 0) {
            throw new AppError('Cannot delete a unit that is actively tied to catalog products.', 400);
        }

        return prisma.unit.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: { id: true, name: true, deletedAt: true }
        });
    }
}
