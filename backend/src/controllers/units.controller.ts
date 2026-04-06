import { Request, Response, NextFunction } from 'express';
import { UnitsService } from '../services/units.service';
import { AppError } from '../utils/AppError';

export const createUnitHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, symbol } = req.body;
        if (!name || !symbol) {
            throw new AppError('Payload Validation: both name and symbol are required.', 400);
        }

        const unit = await UnitsService.create({ name, symbol });
        res.status(201).json({ success: true, data: { unit } });
    } catch (error) {
        next(error);
    }
};

export const getAllUnitsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const units = await UnitsService.getAll();
        res.status(200).json({ success: true, count: units.length, data: { units } });
    } catch (error) {
        next(error);
    }
};

export const getUnitByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const unit = await UnitsService.getById(id);
        res.status(200).json({ success: true, data: { unit } });
    } catch (error) {
        next(error);
    }
};

export const updateUnitHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const { name, symbol } = req.body;
        const unit = await UnitsService.update(id, { name, symbol });
        res.status(200).json({ success: true, data: { unit } });
    } catch (error) {
        next(error);
    }
};

export const softDeleteUnitHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const unit = await UnitsService.softDelete(id);
        res.status(200).json({ success: true, message: 'Unit softly deleted successfully.', data: { unit } });
    } catch (error) {
        next(error);
    }
};
