import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
    transferStockHandler,
    manualAdjustmentHandler,
    getMovementLogsHandler
} from '../controllers/inventory.controller';

const router = Router();

router.use(protect);

// Only managers and upward should approve transfers/adjustments.
router.patch('/transfer', restrictTo('SuperAdmin', 'Manager', 'Accountant'), transferStockHandler);
router.patch('/adjust', restrictTo('SuperAdmin', 'Manager', 'Accountant'), manualAdjustmentHandler);

// Read-only logs available to clerks
router.get('/logs', restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Inventory_Clerk'), getMovementLogsHandler);

export default router;
