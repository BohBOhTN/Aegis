import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Settings are globally essential, however modification is strictly locked to management
router.get('/', protect, SettingsController.getSettings);
router.put('/', protect, restrictTo('SuperAdmin', 'Manager'), SettingsController.updateSettings);

export default router;
