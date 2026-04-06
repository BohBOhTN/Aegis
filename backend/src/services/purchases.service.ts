import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { PurchaseStatus, PurchaseDocumentType, MovementType } from '@prisma/client';

export class PurchasesService {
    static async createDraft(data: {
        documentNum: string;
        type: PurchaseDocumentType;
        supplierId: string;
        receivedAtWarehouseId?: string;
        receivedAtPosId?: string;
        issueDate?: Date;
        dueDate?: Date;
        lines: { productId: string; quantity: number; unitPrice: number; totalPrice: number }[];
    }, userId: string) {
        if (!data.receivedAtWarehouseId && !data.receivedAtPosId) {
            throw new AppError('A valid receiving destination (Warehouse or POS) must be selected.', 400);
        }
        if (data.receivedAtWarehouseId && data.receivedAtPosId) {
            throw new AppError('A single purchase document cannot designate both a Warehouse and a POS simultaneously.', 400);
        }

        const totalHT = data.lines.reduce((sum, line) => sum + line.totalPrice, 0);
        const tva = totalHT * 0.19; // Assumed default 19% TVA for entire document for now
        const totalTTC = totalHT + tva;

        return prisma.purchaseDocument.create({
            data: {
                documentNum: data.documentNum,
                type: data.type,
                status: PurchaseStatus.DRAFT,
                supplierId: data.supplierId,
                receivedAtWarehouseId: data.receivedAtWarehouseId,
                receivedAtPosId: data.receivedAtPosId,
                issueDate: data.issueDate ?? new Date(),
                dueDate: data.dueDate,
                totalHT,
                tva,
                totalTTC,
                amountPaid: 0,
                lines: {
                    create: data.lines.map(line => ({
                        productId: line.productId,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        totalPrice: line.totalPrice
                    }))
                }
            },
            include: { lines: true }
        });
    }

    static async validateDocument(id: string, userId: string) {
        const document = await prisma.purchaseDocument.findFirst({
            where: { id, deletedAt: null },
            include: { lines: { include: { product: true } } }
        });
        if (!document) throw new AppError('Purchase document not found.', 404);
        if (document.status !== PurchaseStatus.DRAFT) throw new AppError('Only DRAFT documents can be validated.', 400);

        return prisma.$transaction(async (tx) => {
            // 1. Mark as Validated
            const validatedDoc = await tx.purchaseDocument.update({
                where: { id },
                data: { status: PurchaseStatus.VALIDATED }
            });

            // 2. Iterate over document lines to increment inventory, log trace, and evaluate price variance
            for (const line of document.lines) {
                // A. Movement Trace (Audit)
                await tx.inventoryMovement.create({
                    data: {
                        productId: line.productId,
                        toWarehouseId: document.receivedAtWarehouseId || null,
                        toPosId: document.receivedAtPosId || null,
                        quantity: line.quantity,
                        type: MovementType.PURCHASE,
                        description: `Received via Validation of ${document.documentNum}`,
                        createdByUserId: userId
                    }
                });

                // B. Stock Increment Algorithms
                if (document.receivedAtWarehouseId) {
                    await tx.warehouseInventory.upsert({
                        where: {
                            productId_warehouseId: {
                                productId: line.productId,
                                warehouseId: document.receivedAtWarehouseId
                            }
                        },
                        create: {
                            productId: line.productId,
                            warehouseId: document.receivedAtWarehouseId,
                            quantity: line.quantity
                        },
                        update: {
                            quantity: { increment: line.quantity }
                        }
                    });
                } else if (document.receivedAtPosId) {
                    await tx.posInventory.upsert({
                        where: {
                            productId_posId: {
                                productId: line.productId,
                                posId: document.receivedAtPosId
                            }
                        },
                        create: {
                            productId: line.productId,
                            posId: document.receivedAtPosId,
                            quantity: line.quantity
                        },
                        update: {
                            quantity: { increment: line.quantity }
                        }
                    });
                }

                // C. Price History / Variance Detection. Update defaults.
                if (Number(line.unitPrice) !== Number(line.product.purchasePrice)) {
                    await tx.priceHistory.create({
                        data: {
                            productId: line.productId,
                            oldPurchasePrice: line.product.purchasePrice,
                            newPurchasePrice: line.unitPrice,
                            oldSellingPrice: line.product.sellingPrice,
                            newSellingPrice: line.product.sellingPrice,
                            reason: `Auto variance detect from Purchase ${document.documentNum}`,
                            changedByUserId: userId
                        }
                    });

                    await tx.product.update({
                        where: { id: line.productId },
                        data: { purchasePrice: line.unitPrice }
                    });
                }
            }

            return validatedDoc;
        });
    }

    static async getAll() {
        return prisma.purchaseDocument.findMany({
            where: { deletedAt: null },
            include: { supplier: { select: { id: true, name: true } } }
        });
    }

    static async getById(id: string) {
        const doc = await prisma.purchaseDocument.findFirst({
            where: { id, deletedAt: null },
            include: {
                supplier: { select: { id: true, name: true } },
                lines: { include: { product: { select: { name: true, barcode: true } } } },
                payments: true
            }
        });
        if (!doc) throw new AppError('Document not found.', 404);
        return doc;
    }
}
