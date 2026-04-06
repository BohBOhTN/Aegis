import { Request, Response, NextFunction } from 'express';
import { WarehousesService } from '../services/warehouses.service';
import { AppError } from '../utils/AppError';

export const createWarehouseHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, location } = req.body;

        if (!name) {
            throw new AppError('Payload Validation: name is a required field.', 400);
        }

        const warehouse = await WarehousesService.create({ name, location });

        res.status(201).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        next(error);
    }
};

export const fetchAllWarehousesHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const warehouses = await WarehousesService.getAll();

        res.status(200).json({
            success: true,
            count: warehouses.length,
            data: warehouses
        });
    } catch (error) {
        next(error);
    }
};

export const fetchWarehouseByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const warehouse = await WarehousesService.getById(req.params.id as string);

        res.status(200).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        next(error);
    }
};
