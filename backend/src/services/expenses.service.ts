import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class ExpensesService {
    // -------------------------------------------------------------------------
    // CATEGORY MANAGEMENT
    // -------------------------------------------------------------------------
    static async createCategory(data: { name: string; description?: string }) {
        return prisma.expenseCategory.create({ data });
    }

    static async getCategories() {
        return prisma.expenseCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' }
        });
    }

    // -------------------------------------------------------------------------
    // EXPENSE MANAGEMENT
    // -------------------------------------------------------------------------
    static async createExpense(data: {
        categoryId: string;
        amount: number;
        description: string;
        receiptUrl?: string;
        date?: Date;
    }, userId: string) {
        // Ensure category exists natively
        const category = await prisma.expenseCategory.findFirst({
            where: { id: data.categoryId, deletedAt: null }
        });
        if (!category) throw new AppError('Integrity Fault: Specified category unmapped natively.', 404);

        return prisma.expense.create({
            data: {
                categoryId: data.categoryId,
                amount: data.amount,
                description: data.description,
                receiptUrl: data.receiptUrl,
                date: data.date ?? new Date(),
                recordedByUserId: userId
            },
            include: { category: true }
        });
    }

    static async getExpenses() {
        return prisma.expense.findMany({
            where: { deletedAt: null },
            include: { 
                category: { select: { id: true, name: true } },
                user: { select: { id: true, email: true } }
            },
            orderBy: { date: 'desc' }
        });
    }

    static async deleteExpense(id: string) {
        const expense = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
        if (!expense) throw new AppError('Integrity Fault: Target expense unrecognized natively.', 404);

        return prisma.expense.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
