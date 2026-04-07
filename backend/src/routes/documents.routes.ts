import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
    createDraftDocumentHandler,
    validateDocumentHandler,
    getAllDocumentsHandler,
    getDocumentByIdHandler
} from '../controllers/documents.controller';

const router = Router();

router.use(protect);

router.route('/')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'POS_User'), getAllDocumentsHandler)
    .post(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'POS_User'), createDraftDocumentHandler);

router.route('/:id')
    .get(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'POS_User'), getDocumentByIdHandler);

// Strictly limit Validation capabilities to higher clearance naturally
router.post('/:id/validate', restrictTo('SuperAdmin', 'Manager', 'Accountant'), validateDocumentHandler);

export default router;
