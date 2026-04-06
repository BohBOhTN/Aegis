import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export const transferStockHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const movement = await InventoryService.transferStock(req.body, (req as any).user.id);
        res.status(200).json({
            success: true,
            data: movement
        });
    } catch (error) {
        next(error);
    }
};

export const manualAdjustmentHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const movement = await InventoryService.manualAdjustment(req.body, (req as any).user.id);
        res.status(200).json({
            success: true,
            data: movement
        });
    } catch (error) {
        next(error);
    }
};

export const getMovementLogsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await InventoryService.getMovementLogs(req.query.productId as string);
        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        next(error);
    }
};
