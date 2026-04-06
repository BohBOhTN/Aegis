import { Router } from 'express';
import { restrictTo, protect } from '../middlewares/auth.middleware';
import * as categoriesController from '../controllers/categories.controller';

const router = Router();

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Sales_Agent', 'Inventory_Clerk'), categoriesController.getAllCategoriesHandler)
    .post(restrictTo('SuperAdmin', 'Manager'), categoriesController.createCategoryHandler);

router
    .route('/:id')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Sales_Agent', 'Inventory_Clerk'), categoriesController.getCategoryByIdHandler)
    .put(restrictTo('SuperAdmin', 'Manager'), categoriesController.updateCategoryHandler)
    .delete(restrictTo('SuperAdmin'), categoriesController.softDeleteCategoryHandler);

export default router;
