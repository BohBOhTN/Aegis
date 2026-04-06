import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { MovementType } from '@prisma/client';

export class InventoryService {
    /**
     * Executes a strict transactional transfer of internal stock between any two verified locations.
     */
    static async transferStock(data: {
        productId: string;
        fromWarehouseId?: string;
        fromPosId?: string;
        toWarehouseId?: string;
        toPosId?: string;
        quantity: number;
        description?: string;
    }, userId: string) {
        if (data.quantity <= 0) throw new AppError('Transfer quantity must be strictly positive.', 400);

        const isSourceWarehouse = !!data.fromWarehouseId;
        const isSourcePos = !!data.fromPosId;
        const isDestWarehouse = !!data.toWarehouseId;
        const isDestPos = !!data.toPosId;

        if (isSourceWarehouse && isSourcePos) throw new AppError('Cannot allocate multiple distinct sources concurrently.', 400);
        if (isDestWarehouse && isDestPos) throw new AppError('Cannot allocate multiple distinct destinations concurrently.', 400);
        if (!isSourceWarehouse && !isSourcePos) throw new AppError('A valid originating location must be mapped.', 400);
        if (!isDestWarehouse && !isDestPos) throw new AppError('A valid destination location must be mapped.', 400);

        return prisma.$transaction(async (tx) => {
            // 1. Validate Product
            const product = await tx.product.findUnique({ where: { id: data.productId } });
            if (!product) throw new AppError('Unrecognized Product Identifier.', 404);

            // 2. Validate Source Stock Availability natively and deduct
            let currentSourceQty = 0;

            if (isSourceWarehouse) {
                const sourceInv = await tx.warehouseInventory.findUnique({
                    where: { productId_warehouseId: { productId: data.productId, warehouseId: data.fromWarehouseId! } }
                });
                if (!sourceInv || Number(sourceInv.quantity) < data.quantity) {
                    throw new AppError(`Insufficient algorithmic stock at Originating Warehouse (Available: ${sourceInv ? Number(sourceInv.quantity) : 0}).`, 400);
                }
                await tx.warehouseInventory.update({
                    where: { productId_warehouseId: { productId: data.productId, warehouseId: data.fromWarehouseId! } },
                    data: { quantity: { decrement: data.quantity } }
                });
            } else if (isSourcePos) {
                const sourceInv = await tx.posInventory.findUnique({
                    where: { productId_posId: { productId: data.productId, posId: data.fromPosId! } }
                });
                if (!sourceInv || Number(sourceInv.quantity) < data.quantity) {
                    throw new AppError(`Insufficient algorithmic stock at Originating POS (Available: ${sourceInv ? Number(sourceInv.quantity) : 0}).`, 400);
                }
                await tx.posInventory.update({
                    where: { productId_posId: { productId: data.productId, posId: data.fromPosId! } },
                    data: { quantity: { decrement: data.quantity } }
                });
            }

            // 3. Inject into Destination Stock
            if (isDestWarehouse) {
                await tx.warehouseInventory.upsert({
                    where: { productId_warehouseId: { productId: data.productId, warehouseId: data.toWarehouseId! } },
                    create: { productId: data.productId, warehouseId: data.toWarehouseId!, quantity: data.quantity },
                    update: { quantity: { increment: data.quantity } }
                });
            } else if (isDestPos) {
                await tx.posInventory.upsert({
                    where: { productId_posId: { productId: data.productId, posId: data.toPosId! } },
                    create: { productId: data.productId, posId: data.toPosId!, quantity: data.quantity },
                    update: { quantity: { increment: data.quantity } }
                });
            }

            // 4. Trace the immutable movement log
            return tx.inventoryMovement.create({
                data: {
                    productId: data.productId,
                    fromWarehouseId: data.fromWarehouseId,
                    fromPosId: data.fromPosId,
                    toWarehouseId: data.toWarehouseId,
                    toPosId: data.toPosId,
                    quantity: data.quantity,
                    type: MovementType.TRANSFER,
                    description: data.description || 'Internal Location Transfer',
                    createdByUserId: userId
                }
            });
        });
    }

    /**
     * Executes manual stock adjustments (shrinkage, count audits).
     */
    static async manualAdjustment(data: {
        productId: string;
        warehouseId?: string;
        posId?: string;
        difference: number; // Negative for shrinkage, positive for surplus
        reason: string;
    }, userId: string) {
        if (!data.warehouseId && !data.posId) throw new AppError('Adjustment requires a specific location binding.', 400);
        if (data.warehouseId && data.posId) throw new AppError('Cannot adjust dual origins simultaneously.', 400);
        if (data.difference === 0) throw new AppError('Mathematical zero variance ignored.', 400);

        return prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: data.productId } });
            if (!product) throw new AppError('Unrecognized Product Identifier.', 404);

            if (data.warehouseId) {
                const inv = await tx.warehouseInventory.findUnique({
                    where: { productId_warehouseId: { productId: data.productId, warehouseId: data.warehouseId } }
                });
                const currentQty = inv ? Number(inv.quantity) : 0;
                if (currentQty + data.difference < 0) throw new AppError('Adjustments strictly cannot yield negative mathematical capacities natively.', 400);

                await tx.warehouseInventory.upsert({
                    where: { productId_warehouseId: { productId: data.productId, warehouseId: data.warehouseId } },
                    create: { productId: data.productId, warehouseId: data.warehouseId, quantity: data.difference > 0 ? data.difference : 0 },
                    update: { quantity: { increment: data.difference } }
                });
            } else if (data.posId) {
                const inv = await tx.posInventory.findUnique({
                    where: { productId_posId: { productId: data.productId, posId: data.posId } }
                });
                const currentQty = inv ? Number(inv.quantity) : 0;
                if (currentQty + data.difference < 0) throw new AppError('Adjustments strictly cannot yield negative mathematical capacities natively.', 400);

                await tx.posInventory.upsert({
                    where: { productId_posId: { productId: data.productId, posId: data.posId } },
                    create: { productId: data.productId, posId: data.posId, quantity: data.difference > 0 ? data.difference : 0 },
                    update: { quantity: { increment: data.difference } }
                });
            }

            return tx.inventoryMovement.create({
                data: {
                    productId: data.productId,
                    fromWarehouseId: data.difference < 0 ? data.warehouseId : null,
                    fromPosId: data.difference < 0 ? data.posId : null,
                    toWarehouseId: data.difference > 0 ? data.warehouseId : null,
                    toPosId: data.difference > 0 ? data.posId : null,
                    quantity: Math.abs(data.difference),
                    type: MovementType.ADJUSTMENT,
                    description: data.reason,
                    createdByUserId: userId
                }
            });
        });
    }

    /**
     * Reads trace logs across all inventory events mathematically securely.
     */
    static async getMovementLogs(productId?: string) {
        return prisma.inventoryMovement.findMany({
            where: productId ? { productId } : undefined,
            orderBy: { timestamp: 'desc' },
            include: {
                product: { select: { name: true, barcode: true } },
                user: { select: { email: true } }
            }
        });
    }
}
