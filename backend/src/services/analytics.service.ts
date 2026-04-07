import prisma from '../utils/prisma';
import { DocumentStatus, PurchaseStatus } from '@prisma/client';

export class AnalyticsService {
    /**
     * Extracts global inventory capacities segregating boundaries across Warehouses and Point Of Sale instances natively.
     */
    static async getStockValuation() {
        // Aggregate Warehouse Stock
        const warehouseRaw = await prisma.warehouseInventory.findMany({
            include: { product: { select: { purchasePrice: true, sellingPrice: true, name: true } } }
        });

        // Aggregate POS Stock
        const posRaw = await prisma.posInventory.findMany({
            include: { product: { select: { purchasePrice: true, sellingPrice: true, name: true } } }
        });

        let totalPurchaseValuation = 0;
        let totalSalesValuation = 0;

        const warehouseMap = warehouseRaw.map(item => {
            const valP = Number(item.quantity) * Number(item.product.purchasePrice);
            const valS = Number(item.quantity) * Number(item.product.sellingPrice);
            totalPurchaseValuation += valP;
            totalSalesValuation += valS;
            return {
                warehouseId: item.warehouseId,
                productId: item.productId,
                quantity: item.quantity,
                valuation: valP
            }
        });

        const posMap = posRaw.map(item => {
            const valP = Number(item.quantity) * Number(item.product.purchasePrice);
            const valS = Number(item.quantity) * Number(item.product.sellingPrice);
            totalPurchaseValuation += valP;
            totalSalesValuation += valS;
            return {
                posId: item.posId,
                productId: item.productId,
                quantity: item.quantity,
                valuation: valP
            }
        });

        return {
            totalPurchaseValuation,
            totalSalesValuation,
            warehouseBreakdown: warehouseMap.length,
            posBreakdown: posMap.length
        }
    }

    /**
     * Executes the Daily Velocity Matrix compiling real-time financial transitions synchronously.
     */
    static async getTodayPerformance() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateFilter = {
            gte: today,
            lt: tomorrow
        };

        // 1. Sales Velocity
        const sales = await prisma.document.aggregate({
            _sum: { totalTTC: true },
            where: { 
                status: { in: [DocumentStatus.VALIDATED, DocumentStatus.PAID] }, 
                issueDate: dateFilter,
                deletedAt: null
            }
        });

        // 1.5 POS Segregation Performance
        const posSales = await prisma.document.groupBy({
            by: ['dispatchFromPosId'],
            _sum: { totalTTC: true },
            where: {
                status: { in: [DocumentStatus.VALIDATED, DocumentStatus.PAID] },
                issueDate: dateFilter,
                dispatchFromPosId: { not: null },
                deletedAt: null
            }
        });

        // 2. Client Collections
        const collections = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { date: dateFilter }
        });

        // 3. Purchase Disbursals
        const purchases = await prisma.purchaseDocument.aggregate({
            _sum: { totalTTC: true },
            where: {
                status: { in: [PurchaseStatus.VALIDATED, PurchaseStatus.PARTIALLY_PAID, PurchaseStatus.PAID] },
                issueDate: dateFilter,
                deletedAt: null
            }
        });

        // 4. Supplier Disbursals
        const disbursed = await prisma.supplierPayment.aggregate({
            _sum: { amount: true },
            where: { date: dateFilter }
        });

        // 5. Operating Expenses (Treasury)
        const expenses = await prisma.expense.aggregate({
            _sum: { amount: true },
            where: { date: dateFilter, deletedAt: null }
        });

        return {
            sales: sales._sum.totalTTC || 0,
            posSalesBreakdown: posSales,
            collections: collections._sum.amount || 0,
            purchases: purchases._sum.totalTTC || 0,
            disbursed: disbursed._sum.amount || 0,
            expenses: expenses._sum.amount || 0,
            netBalanceOffset: (Number(collections._sum.amount || 0)) - (Number(disbursed._sum.amount || 0)) - (Number(expenses._sum.amount || 0))
        };
    }
}
