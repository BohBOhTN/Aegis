import { Router } from 'express';
import {
    createPosHandler,
    fetchAllPosHandler,
    fetchPosByIdHandler,
    updatePosHandler,
    deletePosHandler
} from '../controllers/pos.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// ----------------------------------------------------
// All POS operations require authenticated access.
// ----------------------------------------------------
router.use(protect);

router.post('/', restrictTo('SuperAdmin', 'Admin'), createPosHandler);
router.get('/', restrictTo('SuperAdmin', 'Admin'), fetchAllPosHandler);
router.get('/:id', restrictTo('SuperAdmin', 'Admin'), fetchPosByIdHandler);
router.put('/:id', restrictTo('SuperAdmin', 'Admin'), updatePosHandler);
router.delete('/:id', restrictTo('SuperAdmin'), deletePosHandler);

export default router;
