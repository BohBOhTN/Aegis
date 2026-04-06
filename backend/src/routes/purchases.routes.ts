import { Router } from 'express';
import { restrictTo, protect } from '../middlewares/auth.middleware';
import * as purchasesController from '../controllers/purchases.controller';

const router = Router();

router.use(protect);

router
    .route('/')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Inventory_Clerk'), purchasesController.getAllPurchasesHandler)
    .post(restrictTo('SuperAdmin', 'Manager', 'Accountant'), purchasesController.createPurchaseDraftHandler);

router
    .route('/:id')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'Inventory_Clerk'), purchasesController.getPurchaseByIdHandler);

router
    .route('/:id/validate')
    .post(restrictTo('SuperAdmin', 'Manager'), purchasesController.validatePurchaseDocumentHandler);

export default router;
