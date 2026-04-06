import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class CategoriesService {
    static async create(data: { name: string; description?: string; parentId?: string }) {
        const existing = await prisma.category.findUnique({ where: { name: data.name } });
        if (existing) throw new AppError('A category with this name already exists.', 409);

        if (data.parentId) {
            const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
            if (!parent) throw new AppError('The specified parent category does not exist.', 404);
        }

        return prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                parentId: data.parentId,
            },
            select: { id: true, name: true, description: true, parentId: true, createdAt: true }
        });
    }

    static async getAll() {
        return prisma.category.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                description: true,
                parentId: true,
                createdAt: true,
                children: { select: { id: true, name: true } }
            }
        });
    }

    static async getById(id: string) {
        const category = await prisma.category.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                name: true,
                description: true,
                parentId: true,
                parent: { select: { id: true, name: true } },
                children: { select: { id: true, name: true } },
                products: { select: { id: true, name: true, barcode: true } }
            }
        });

        if (!category) throw new AppError('No category found matching the provided identifier.', 404);
        return category;
    }

    static async update(id: string, data: { name?: string; description?: string; parentId?: string }) {
        const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new AppError('No category found matching the provided identifier.', 404);

        if (data.name && data.name !== existing.name) {
            const duplicate = await prisma.category.findUnique({ where: { name: data.name } });
            if (duplicate) throw new AppError('A category with this new name already exists.', 409);
        }

        if (data.parentId && data.parentId !== existing.parentId) {
            const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
            if (!parent) throw new AppError('The specified parent category does not exist.', 404);
        }

        return prisma.category.update({
            where: { id },
            data,
            select: { id: true, name: true, description: true, parentId: true, updatedAt: true }
        });
    }

    static async softDelete(id: string) {
        const existing = await prisma.category.findFirst({
            where: { id, deletedAt: null },
            include: { children: true, products: true }
        });
        if (!existing) throw new AppError('No category found matching the provided identifier.', 404);

        if (existing.children.length > 0) {
            throw new AppError('Cannot delete a category that has child categories. Reassign or delete the children first.', 400);
        }
        if (existing.products.length > 0) {
            throw new AppError('Cannot delete a category that is actively associated with products.', 400);
        }

        return prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: { id: true, name: true, deletedAt: true }
        });
    }
}
