import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class WarehousesService {
    static async create(data: { name: string; location?: string }) {
        return prisma.warehouse.create({
            data: {
                name: data.name,
                location: data.location,
            },
            select: {
                id: true,
                name: true,
                location: true,
                createdAt: true,
            }
        });
    }

    static async getAll() {
        return prisma.warehouse.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                location: true,
                createdAt: true,
            }
        });
    }

    static async getById(id: string) {
        const warehouse = await prisma.warehouse.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                name: true,
                location: true,
                createdAt: true,
                inventory: {
                    select: {
                        quantity: true,
                        product: { select: { id: true, name: true, barcode: true } }
                    }
                }
            }
        });

        if (!warehouse) throw new AppError('No warehouse found matching the provided identifier.', 404);
        return warehouse;
    }
}
