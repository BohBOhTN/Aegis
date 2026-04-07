import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export class AuditController {
    static async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const logs = await AuditService.getLogs(page, limit);
            res.status(200).json({ success: true, ...logs });
        } catch (error) {
            next(error);
        }
    }
}
