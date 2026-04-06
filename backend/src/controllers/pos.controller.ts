import { Request, Response, NextFunction } from 'express';
import { PointOfSaleService } from '../services/pos.service';
import { AppError } from '../utils/AppError';

export const createPosHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, warehouseId } = req.body;

        if (!name || !warehouseId) {
            throw new AppError('Payload Validation: name and warehouseId are required fields.', 400);
        }

        const pos = await PointOfSaleService.create({ name, warehouseId });

        res.status(201).json({
            success: true,
            data: pos
        });
    } catch (error) {
        next(error);
    }
};

export const fetchAllPosHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posList = await PointOfSaleService.getAll();

        res.status(200).json({
            success: true,
            count: posList.length,
            data: posList
        });
    } catch (error) {
        next(error);
    }
};

export const fetchPosByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pos = await PointOfSaleService.getById(req.params.id as string);

        res.status(200).json({
            success: true,
            data: pos
        });
    } catch (error) {
        next(error);
    }
};

export const updatePosHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pos = await PointOfSaleService.update(req.params.id as string, req.body);

        res.status(200).json({
            success: true,
            data: pos
        });
    } catch (error) {
        next(error);
    }
};

export const deletePosHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pos = await PointOfSaleService.softDelete(req.params.id as string);

        res.status(200).json({
            success: true,
            message: 'Point of sale has been soft-deleted from the active directory.',
            data: pos
        });
    } catch (error) {
        next(error);
    }
};
