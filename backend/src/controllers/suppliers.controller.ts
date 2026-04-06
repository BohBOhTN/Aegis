import { Request, Response, NextFunction } from 'express';
import { suppliersService } from '../services/suppliers.service';

export const createSupplierHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const supplier = await suppliersService.createSupplier(req.body);
        res.status(201).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        next(error);
    }
};

export const getSuppliersHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const suppliers = await suppliersService.getSuppliers(req.query);
        res.status(200).json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        next(error);
    }
};

export const getSupplierByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const supplier = await suppliersService.getSupplierById(req.params.id as string);
        res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        next(error);
    }
};

export const updateSupplierHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const supplier = await suppliersService.updateSupplier(req.params.id as string, req.body);
        res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSupplierHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await suppliersService.deleteSupplier(req.params.id as string);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
