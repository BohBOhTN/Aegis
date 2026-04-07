import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Audit logs are highly classified. Only SUPERADMIN natively has rights.
router.get('/', protect, restrictTo('SuperAdmin'), AuditController.getLogs);

export default router;
