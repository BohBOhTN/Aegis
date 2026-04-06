import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from '../services/categories.service';
import { AppError } from '../utils/AppError';

export const createCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, parentId } = req.body;
        if (!name || typeof name !== 'string') {
            throw new AppError('Payload Validation: name is a required string field.', 400);
        }

        const category = await CategoriesService.create({ name, description, parentId });
        res.status(201).json({ success: true, data: { category } });
    } catch (error) {
        next(error);
    }
};

export const getAllCategoriesHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await CategoriesService.getAll();
        res.status(200).json({ success: true, count: categories.length, data: { categories } });
    } catch (error) {
        next(error);
    }
};

export const getCategoryByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const category = await CategoriesService.getById(id);
        res.status(200).json({ success: true, data: { category } });
    } catch (error) {
        next(error);
    }
};

export const updateCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const { name, description, parentId } = req.body;
        const category = await CategoriesService.update(id, { name, description, parentId });
        res.status(200).json({ success: true, data: { category } });
    } catch (error) {
        next(error);
    }
};

export const softDeleteCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const category = await CategoriesService.softDelete(id);
        res.status(200).json({ success: true, message: 'Category softly deleted successfully.', data: { category } });
    } catch (error) {
        next(error);
    }
};
