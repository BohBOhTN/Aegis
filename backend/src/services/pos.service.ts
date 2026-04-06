import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class PointOfSaleService {
    static async create(data: { name: string; warehouseId: string }) {
        const warehouse = await prisma.warehouse.findFirst({ where: { id: data.warehouseId, deletedAt: null } });
        if (!warehouse) throw new AppError('No warehouse found matching the provided warehouseId.', 404);

        return prisma.pointOfSale.create({
            data: {
                name: data.name,
                warehouseId: data.warehouseId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                warehouse: { select: { id: true, name: true } }
            }
        });
    }

    static async getAll() {
        return prisma.pointOfSale.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                createdAt: true,
                warehouse: { select: { id: true, name: true, location: true } }
            }
        });
    }

    static async getById(id: string) {
        const pos = await prisma.pointOfSale.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                name: true,
                createdAt: true,
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    }
                }
            }
        });

        if (!pos) throw new AppError('No point of sale found matching the provided identifier.', 404);
        return pos;
    }

    static async update(id: string, data: { name?: string; warehouseId?: string }) {
        const existing = await prisma.pointOfSale.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new AppError('No point of sale found matching the provided identifier.', 404);

        if (data.warehouseId) {
            const warehouse = await prisma.warehouse.findFirst({ where: { id: data.warehouseId, deletedAt: null } });
            if (!warehouse) throw new AppError('No warehouse found matching the provided warehouseId.', 404);
        }

        return prisma.pointOfSale.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                updatedAt: true,
                warehouse: { select: { id: true, name: true } }
            }
        });
    }

    static async softDelete(id: string) {
        const existing = await prisma.pointOfSale.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new AppError('No point of sale found matching the provided identifier.', 404);

        return prisma.pointOfSale.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: { id: true, name: true, deletedAt: true }
        });
    }
}
