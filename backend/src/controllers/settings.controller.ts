import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
    static async getSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await SettingsService.getGlobalSettings();
            res.status(200).json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    static async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await SettingsService.updateGlobalSettings(req.body);
            res.status(200).json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }
}
