import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
    static async getOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const stockValuation = await AnalyticsService.getStockValuation();
            const dailyPerformance = await AnalyticsService.getTodayPerformance();

            res.status(200).json({
                success: true,
                data: {
                    stockValuation,
                    dailyPerformance
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
