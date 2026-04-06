import { Router } from 'express';
import { restrictTo, protect } from '../middlewares/auth.middleware';
import * as unitsController from '../controllers/units.controller';

const router = Router();

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Sales_Agent', 'Inventory_Clerk'), unitsController.getAllUnitsHandler)
    .post(restrictTo('SuperAdmin', 'Manager'), unitsController.createUnitHandler);

router
    .route('/:id')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Sales_Agent', 'Inventory_Clerk'), unitsController.getUnitByIdHandler)
    .put(restrictTo('SuperAdmin', 'Manager'), unitsController.updateUnitHandler)
    .delete(restrictTo('SuperAdmin'), unitsController.softDeleteUnitHandler);

export default router;
