import { Router } from 'express';
import { setupGenesisHandler, fetchAllUsersHandler } from '../controllers/users.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// ----------------------------------------------------
// Public Exposure Endpoints
// ----------------------------------------------------
// Structurally isolated. Eradicates itself organically if users > 0.
router.post('/setup', setupGenesisHandler);

// ----------------------------------------------------
// High Clearance Routes
// ----------------------------------------------------
// Everything operating beneath this vector demands strong JWT mapping.
router.use(protect);

router.get('/', restrictTo('SuperAdmin', 'Admin'), fetchAllUsersHandler);

export default router;
