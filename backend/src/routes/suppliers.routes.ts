import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
    createSupplierHandler,
    getSuppliersHandler,
    getSupplierByIdHandler,
    updateSupplierHandler,
    deleteSupplierHandler
} from '../controllers/suppliers.controller';

const router = Router();

// Secure all Supplier paths globally
router.use(protect);
router.use(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Inventory_Clerk'));

// Root collection assignments
router.route('/')
    .post(createSupplierHandler)
    .get(getSuppliersHandler);

// Singleton entity mappings
router.route('/:id')
    .get(getSupplierByIdHandler)
    .put(updateSupplierHandler)
    .delete(deleteSupplierHandler);

export default router;
