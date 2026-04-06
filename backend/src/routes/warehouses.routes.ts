import { Router } from 'express';
import {
    createWarehouseHandler,
    fetchAllWarehousesHandler,
    fetchWarehouseByIdHandler
} from '../controllers/warehouses.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// ----------------------------------------------------
// All warehouse operations require authenticated access.
// ----------------------------------------------------
router.use(protect);

router.post('/', restrictTo('SuperAdmin', 'Admin'), createWarehouseHandler);
router.get('/', restrictTo('SuperAdmin', 'Admin'), fetchAllWarehousesHandler);
router.get('/:id', restrictTo('SuperAdmin', 'Admin'), fetchWarehouseByIdHandler);

export default router;
