import { Request, Response, NextFunction } from 'express';
import { ExpensesService } from '../services/expenses.service';

export class ExpensesController {
    static async createCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await ExpensesService.createCategory(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    static async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await ExpensesService.getCategories();
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    static async createExpense(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore : req.user is appended by auth middleware
            const expense = await ExpensesService.createExpense(req.body, req.user.id);
            res.status(201).json({ success: true, data: expense });
        } catch (error) {
            next(error);
        }
    }

    static async getExpenses(req: Request, res: Response, next: NextFunction) {
        try {
            const expenses = await ExpensesService.getExpenses();
            res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    static async deleteExpense(req: Request, res: Response, next: NextFunction) {
        try {
            const expense = await ExpensesService.deleteExpense(req.params.id as string);
            res.status(200).json({ success: true, data: expense });
        } catch (error) {
            next(error);
        }
    }
}
