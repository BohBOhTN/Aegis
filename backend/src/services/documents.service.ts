import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { DocumentStatus, DocumentType, MovementType } from '@prisma/client';

export class DocumentsService {
    /**
     * Initializes a native sales ledger draft. No stock or financial alterations occur.
     */
    static async createDraft(data: {
        documentNum: string;
        type: DocumentType;
        clientId: string;
        issueDate?: Date;
        dueDate?: Date;
        dispatchFromWarehouseId?: string;
        dispatchFromPosId?: string;
        lines: { productId: string; quantity: number; unitPrice: number; totalPrice: number }[];
    }, userId: string) {
        if (!data.dispatchFromWarehouseId && !data.dispatchFromPosId) {
            throw new AppError('Location Error: A distinct dispatch location (Warehouse/POS) must be mapped natively.', 400);
        }
        if (data.dispatchFromWarehouseId && data.dispatchFromPosId) {
            throw new AppError('Location Error: Dual dispatch origins are architecturally prohibited.', 400);
        }

        const totalHT = data.lines.reduce((sum, line) => sum + line.totalPrice, 0);
        const tva = totalHT * 0.19; // Natively fixed 19%
        const timbreFiscal = 1.00; // Fixed Timbre as per Schema Defaults
        const totalTTC = totalHT + tva + timbreFiscal;

        // Custom validation: Client Must Exist natively
        const client = await prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client || client.deletedAt) {
            throw new AppError('Client Identification Pipeline Failed: Entity unrecognized or archived.', 404);
        }

        return prisma.document.create({
            data: {
                documentNum: data.documentNum,
                type: data.type,
                status: DocumentStatus.DRAFT,
                clientId: data.clientId,
                totalHT,
                tva,
                timbreFiscal,
                totalTTC,
                issueDate: data.issueDate ?? new Date(),
                dueDate: data.dueDate,
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

    /**
     * Validates the tracked document. Actuates financial appending and physical inventory tracing exclusively.
     */
    static async validateDocument(id: string, dispatchParams: { dispatchFromWarehouseId?: string, dispatchFromPosId?: string }, userId: string) {
        const document = await prisma.document.findFirst({
            where: { id, deletedAt: null },
            include: { lines: { include: { product: true } }, client: true }
        });

        if (!document) throw new AppError('Integrity Fault: Monolithic record does not exist natively.', 404);
        if (document.status !== DocumentStatus.DRAFT) throw new AppError('State Machine constraints violated: Only DRAFT documents can be validated.', 400);

        if (!dispatchParams.dispatchFromWarehouseId && !dispatchParams.dispatchFromPosId) {
            throw new AppError('Stock Deduction Error: Cannot validate physical tracking without a designated Point Of Dispatch.', 400);
        }

        return prisma.$transaction(async (tx) => {
            // 1. Shift Document Engine State
            const validatedDoc = await tx.document.update({
                where: { id },
                data: { status: DocumentStatus.VALIDATED }
            });

            const isPhysicalTransfer = document.type === DocumentType.BL || document.type === DocumentType.FACTURE;
            const isReturn = document.type === DocumentType.AVOIR;
            const appliesLedgerDebt = document.type !== DocumentType.DEVIS && document.type !== DocumentType.BC;

            // 2. Loop over lines to implement atomic stock operations if physical transfer
            if (isPhysicalTransfer && !isReturn) {
                for (const line of document.lines) {
                    await tx.inventoryMovement.create({
                        data: {
                            productId: line.productId,
                            fromWarehouseId: dispatchParams.dispatchFromWarehouseId || null,
                            fromPosId: dispatchParams.dispatchFromPosId || null,
                            quantity: line.quantity,
                            type: MovementType.SALE,
                            description: `Dispatched via Validated ${document.type} #${document.documentNum}`,
                            createdByUserId: userId
                        }
                    });

                    if (dispatchParams.dispatchFromWarehouseId) {
                        const sourceInv = await tx.warehouseInventory.findUnique({
                            where: { productId_warehouseId: { productId: line.productId, warehouseId: dispatchParams.dispatchFromWarehouseId } }
                        });
                        if (!sourceInv || Number(sourceInv.quantity) < Number(line.quantity)) {
                            throw new AppError(`Operational Deficit: Stock insufficient natively at requested Warehouse origin for Product ${line.product.name}.`, 400);
                        }
                        await tx.warehouseInventory.update({
                            where: { productId_warehouseId: { productId: line.productId, warehouseId: dispatchParams.dispatchFromWarehouseId } },
                            data: { quantity: { decrement: line.quantity } }
                        });
                    } else if (dispatchParams.dispatchFromPosId) {
                        const sourceInv = await tx.posInventory.findUnique({
                            where: { productId_posId: { productId: line.productId, posId: dispatchParams.dispatchFromPosId } }
                        });
                        if (!sourceInv || Number(sourceInv.quantity) < Number(line.quantity)) {
                            throw new AppError(`Operational Deficit: Stock insufficient natively at requested POS origin for Product ${line.product.name}.`, 400);
                        }
                        await tx.posInventory.update({
                            where: { productId_posId: { productId: line.productId, posId: dispatchParams.dispatchFromPosId } },
                            data: { quantity: { decrement: line.quantity } }
                        });
                    }
                }
            } else if (isReturn) {
                // AVOIR acts natively as a reverse inclusion logic
                for (const line of document.lines) {
                    await tx.inventoryMovement.create({
                        data: {
                            productId: line.productId,
                            toWarehouseId: dispatchParams.dispatchFromWarehouseId || null,
                            toPosId: dispatchParams.dispatchFromPosId || null,
                            quantity: line.quantity,
                            type: MovementType.ADJUSTMENT,
                            description: `Reinstated via AVOIR #${document.documentNum}`,
                            createdByUserId: userId
                        }
                    });

                    if (dispatchParams.dispatchFromWarehouseId) {
                        await tx.warehouseInventory.upsert({
                            where: { productId_warehouseId: { productId: line.productId, warehouseId: dispatchParams.dispatchFromWarehouseId } },
                            create: { productId: line.productId, warehouseId: dispatchParams.dispatchFromWarehouseId, quantity: line.quantity },
                            update: { quantity: { increment: line.quantity } }
                        });
                    } else if (dispatchParams.dispatchFromPosId) {
                        await tx.posInventory.upsert({
                            where: { productId_posId: { productId: line.productId, posId: dispatchParams.dispatchFromPosId } },
                            create: { productId: line.productId, posId: dispatchParams.dispatchFromPosId, quantity: line.quantity },
                            update: { quantity: { increment: line.quantity } }
                        });
                    }
                }
            }

            // 3. Mathematical Client Credit Balance Mapping natively
            if (appliesLedgerDebt) {
                if (isReturn) {
                    await tx.client.update({
                        where: { id: document.clientId },
                        data: { balance: { decrement: document.totalTTC } }
                    });
                } else {
                    await tx.client.update({
                        where: { id: document.clientId },
                        data: { balance: { increment: document.totalTTC } }
                    });
                }
            }

            return validatedDoc;
        });
    }

    static async getAll() {
        return prisma.document.findMany({
            where: { deletedAt: null },
            include: { client: { select: { id: true, companyName: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getById(id: string) {
        const doc = await prisma.document.findFirst({
            where: { id, deletedAt: null },
            include: {
                client: { select: { id: true, companyName: true, phone: true } },
                lines: { include: { product: { select: { name: true, barcode: true } } } },
                payments: true
            }
        });
        if (!doc) throw new AppError('Integrity Fault: Global target unmapped natively.', 404);
        return doc;
    }
}
