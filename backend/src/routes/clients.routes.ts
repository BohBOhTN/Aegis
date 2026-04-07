import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
    createClientHandler,
    getClientsHandler,
    getClientByIdHandler,
    updateClientHandler,
    deleteClientHandler
} from '../controllers/clients.controller';

const router = Router();

// Global Protection Matrix
router.use(protect);
router.use(restrictTo('SuperAdmin', 'Manager', 'Accountant', 'POS_User'));

router.route('/')
    .post(createClientHandler)
    .get(getClientsHandler);

router.route('/:id')
    .get(getClientByIdHandler)
    .put(updateClientHandler)
    .delete(restrictTo('SuperAdmin', 'Manager'), deleteClientHandler);

export default router;
