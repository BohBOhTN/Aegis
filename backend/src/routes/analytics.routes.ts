import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Analytics routing is extremely restricted
router.use(protect);
router.get('/overview', restrictTo('SuperAdmin', 'Manager'), AnalyticsController.getOverview);

export default router;
