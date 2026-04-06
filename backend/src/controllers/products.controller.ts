import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../services/products.service';
import { AppError } from '../utils/AppError';

export const createProductHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, barcode, categoryId, unitId, purchasePrice, sellingPrice, minThreshold, taxRate } = req.body;

        if (!name || purchasePrice === undefined || sellingPrice === undefined) {
            throw new AppError('Payload Validation: name, purchasePrice, and sellingPrice are required fields.', 400);
        }

        const product = await ProductsService.create({ name, barcode, categoryId, unitId, purchasePrice, sellingPrice, minThreshold, taxRate });

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const fetchAllProductsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await ProductsService.getAll();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

export const fetchProductByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await ProductsService.getById(req.params.id as string);

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await ProductsService.update(req.params.id as string, req.body);

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await ProductsService.softDelete(req.params.id as string);

        res.status(200).json({
            success: true,
            message: 'Product has been soft-deleted from the active catalog.',
            data: product
        });
    } catch (error) {
        next(error);
    }
};
