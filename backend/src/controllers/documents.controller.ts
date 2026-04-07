import { Request, Response, NextFunction } from 'express';
import { DocumentsService } from '../services/documents.service';

export const createDraftDocumentHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await DocumentsService.createDraft(req.body, (req as any).user.id);
        res.status(201).json({
            success: true,
            data: doc
        });
    } catch (error) {
        next(error);
    }
};

export const validateDocumentHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await DocumentsService.validateDocument(
            req.params.id as string,
            {
                dispatchFromWarehouseId: req.body.dispatchFromWarehouseId,
                dispatchFromPosId: req.body.dispatchFromPosId
            },
            (req as any).user.id
        );
        res.status(200).json({
            success: true,
            data: doc
        });
    } catch (error) {
        next(error);
    }
};

export const getAllDocumentsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const docs = await DocumentsService.getAll();
        res.status(200).json({
            success: true,
            data: docs
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await DocumentsService.getById(req.params.id as string);
        res.status(200).json({
            success: true,
            data: doc
        });
    } catch (error) {
        next(error);
    }
};
