import { Router } from 'express';
import { ExpensesController } from '../controllers/expenses.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Secure all expense routing natively
router.use(protect);

router.post('/categories', restrictTo('SUPERADMIN', 'ADMIN'), ExpensesController.createCategory);
router.get('/categories', restrictTo('SUPERADMIN', 'ADMIN', 'MANAGER'), ExpensesController.getCategories);

router.post('/', restrictTo('SuperAdmin', 'Manager', 'Accountant'), ExpensesController.createExpense);
router.get('/', restrictTo('SuperAdmin', 'Manager', 'Accountant'), ExpensesController.getExpenses);
router.delete('/:id', restrictTo('SuperAdmin', 'Manager'), ExpensesController.deleteExpense);

export default router;
