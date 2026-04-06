import { Router } from 'express';
import {
    createProductHandler,
    fetchAllProductsHandler,
    fetchProductByIdHandler,
    updateProductHandler,
    deleteProductHandler
} from '../controllers/products.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// ----------------------------------------------------
// All product operations require authenticated access.
// ----------------------------------------------------
router.use(protect);

router.post('/', restrictTo('SuperAdmin', 'Admin'), createProductHandler);
router.get('/', restrictTo('SuperAdmin', 'Admin'), fetchAllProductsHandler);
router.get('/:id', restrictTo('SuperAdmin', 'Admin'), fetchProductByIdHandler);
router.put('/:id', restrictTo('SuperAdmin', 'Admin'), updateProductHandler);
router.delete('/:id', restrictTo('SuperAdmin'), deleteProductHandler);

export default router;
