import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { createPaymentHandler, getPaymentsHandler } from '../controllers/payments.controller';

const router = Router();

router.use(protect);

// Global reading accessible to all internal clearance levels
router.get('/', restrictTo('SuperAdmin', 'Manager', 'Accountant', 'POS_User'), getPaymentsHandler);

// Strictly secure financial insertion
router.post('/', restrictTo('SuperAdmin', 'Manager', 'Accountant'), createPaymentHandler);

export default router;
