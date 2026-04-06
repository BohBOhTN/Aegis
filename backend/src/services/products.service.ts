import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class ProductsService {
    static async create(data: {
        name: string;
        barcode?: string;
        categoryId?: string;
        unitId?: string;
        purchasePrice: number;
        sellingPrice: number;
        minThreshold?: number;
        taxRate?: number;
        images?: string[];
    }) {
        if (data.barcode) {
            const existing = await prisma.product.findUnique({ where: { barcode: data.barcode } });
            if (existing) throw new AppError('A product with this barcode already exists in the catalog.', 409);
        }

        return prisma.product.create({
            data: {
                name: data.name,
                barcode: data.barcode,
                categoryId: data.categoryId,
                unitId: data.unitId,
                purchasePrice: data.purchasePrice,
                sellingPrice: data.sellingPrice,
                minThreshold: data.minThreshold ?? 0,
                taxRate: data.taxRate ?? 19.00,
                ...(data.images && data.images.length > 0 && {
                    images: {
                        create: data.images.map((url, index) => ({
                            url,
                            isPrimary: index === 0
                        }))
                    }
                })
            },
            select: {
                id: true,
                barcode: true,
                name: true,
                categoryId: true,
                unitId: true,
                purchasePrice: true,
                sellingPrice: true,
                minThreshold: true,
                taxRate: true,
                createdAt: true,
                images: { select: { id: true, url: true, isPrimary: true } }
            }
        });
    }

    static async getAll() {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                barcode: true,
                name: true,
                categoryId: true,
                unitId: true,
                purchasePrice: true,
                sellingPrice: true,
                minThreshold: true,
                taxRate: true,
                createdAt: true,
                images: { select: { id: true, url: true, isPrimary: true } },
                warehouseStock: { select: { quantity: true } },
                posStock: { select: { quantity: true } }
            }
        });

        return products.map(p => {
            const overallStock =
                p.warehouseStock.reduce((sum: number, s: any) => sum + Number(s.quantity), 0) +
                p.posStock.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);
            return {
                id: p.id,
                barcode: p.barcode,
                name: p.name,
                categoryId: p.categoryId,
                unitId: p.unitId,
                purchasePrice: p.purchasePrice,
                sellingPrice: p.sellingPrice,
                minThreshold: p.minThreshold,
                taxRate: p.taxRate,
                createdAt: p.createdAt,
                images: p.images,
                overallStock
            };
        });
    }

    static async getById(id: string) {
        const product = await prisma.product.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                barcode: true,
                name: true,
                categoryId: true,
                unitId: true,
                purchasePrice: true,
                sellingPrice: true,
                minThreshold: true,
                taxRate: true,
                createdAt: true,
                images: { select: { id: true, url: true, isPrimary: true } },
                warehouseStock: {
                    select: {
                        quantity: true,
                        minThreshold: true,
                        warehouse: { select: { id: true, name: true } }
                    }
                },
                posStock: {
                    select: {
                        quantity: true,
                        minThreshold: true,
                        pos: { select: { id: true, name: true } }
                    }
                }
            }
        });

        if (!product) throw new AppError('No product found matching the provided identifier.', 404);

        const overallStock =
            product.warehouseStock.reduce((sum: number, s: any) => sum + Number(s.quantity), 0) +
            product.posStock.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);

        return { ...product, overallStock };
    }

    static async update(id: string, data: {
        name?: string;
        barcode?: string;
        categoryId?: string;
        unitId?: string;
        purchasePrice?: number;
        sellingPrice?: number;
        minThreshold?: number;
        taxRate?: number;
    }, userId?: string) {
        const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new AppError('No product found matching the provided identifier.', 404);

        let priceLogs = undefined;
        if (
            (data.purchasePrice !== undefined && Number(data.purchasePrice) !== Number(existing.purchasePrice)) ||
            (data.sellingPrice !== undefined && Number(data.sellingPrice) !== Number(existing.sellingPrice))
        ) {
            priceLogs = {
                create: {
                    oldPurchasePrice: existing.purchasePrice,
                    newPurchasePrice: data.purchasePrice ?? Number(existing.purchasePrice),
                    oldSellingPrice: existing.sellingPrice,
                    newSellingPrice: data.sellingPrice ?? Number(existing.sellingPrice),
                    reason: "Manual Catalog Update",
                    changedByUserId: userId
                }
            };
        }

        return prisma.product.update({
            where: { id },
            data: {
                ...data,
                ...(priceLogs && { priceHistory: priceLogs })
            },
            select: {
                id: true,
                barcode: true,
                name: true,
                categoryId: true,
                unitId: true,
                purchasePrice: true,
                sellingPrice: true,
                minThreshold: true,
                taxRate: true,
                updatedAt: true,
            }
        });
    }

    static async softDelete(id: string) {
        const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new AppError('No product found matching the provided identifier.', 404);

        return prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: { id: true, name: true, deletedAt: true }
        });
    }
}
