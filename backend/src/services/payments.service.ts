import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { DocumentStatus } from '@prisma/client';

export class PaymentsService {
    /**
     * Secures a payment execution mathematically against a globally validated tracking document.
     * Decrements the active client debt strictly bounding the execution bounds.
     */
    static async createPayment(data: {
        documentId: string;
        amount: number;
        method: string;
        date?: Date;
    }) {
        if (data.amount <= 0) {
            throw new AppError('Constraint Validation: Payment execution vectors must trace positive logical value natively.', 400);
        }

        return prisma.$transaction(async (tx) => {
            // 1. Ascertain Document integrity and state
            const document = await tx.document.findUnique({
                where: { id: data.documentId, deletedAt: null }
            });

            if (!document) {
                throw new AppError('Integrity Fault: Root Document tracking reference unrecognized.', 404);
            }
            if (document.status !== DocumentStatus.VALIDATED) {
                // Drafts shouldn't be blindly paid natively, nor cancelled docs
                throw new AppError('Ledger Constraint: Intercepted. Only natively VALIDATED tracking blocks can accept distinct payment chains.', 400);
            }

            // 2. Audit Client bounds
            const client = await tx.client.findUnique({ where: { id: document.clientId } });
            if (!client || client.deletedAt) {
                throw new AppError('Integrity Fault: Root Client binding unrecognized.', 404);
            }

            // 3. Prevent mathematical over-payment against the distinct Document itself globally
            const existingPayments = await tx.payment.aggregate({
                where: { documentId: data.documentId },
                _sum: { amount: true }
            });
            const aggregatedPayments = Number(existingPayments._sum.amount || 0);

            if (aggregatedPayments + data.amount > Number(document.totalTTC)) {
                throw new AppError(`Financial Fault: Aggregated trace sum intercepts boundaries natively. (Max Authorized Left: ${Number(document.totalTTC) - aggregatedPayments})`, 400);
            }

            // 4. Trace identical sequence insertion inside ledger
            const payment = await tx.payment.create({
                data: {
                    documentId: data.documentId,
                    clientId: document.clientId,
                    amount: data.amount,
                    method: data.method,
                    date: data.date || new Date()
                }
            });

            // 5. Autonomously execute debt decrements across bound logical profiles
            await tx.client.update({
                where: { id: document.clientId },
                data: { balance: { decrement: data.amount } }
            });

            // 6. Native Document State transition mapping locally
            if (aggregatedPayments + data.amount === Number(document.totalTTC)) {
                await tx.document.update({
                    where: { id: data.documentId },
                    data: { status: DocumentStatus.PAID }
                });
            }

            return payment;
        });
    }

    /**
     * Reads trace logs across executed bounds securely based identically against clients.
     */
    static async getPayments(filters: { clientId?: string, documentId?: string }) {
        return prisma.payment.findMany({
            where: {
                ...(filters.clientId && { clientId: filters.clientId }),
                ...(filters.documentId && { documentId: filters.documentId }),
            },
            orderBy: { date: 'desc' },
            include: {
                client: { select: { companyName: true } },
                document: { select: { documentNum: true, type: true } }
            }
        });
    }
}
