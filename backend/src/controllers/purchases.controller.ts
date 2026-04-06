import { Request, Response, NextFunction } from 'express';
import { PurchasesService } from '../services/purchases.service';
import { AppError } from '../utils/AppError';
import { PurchaseDocumentType } from '@prisma/client';

export const createPurchaseDraftHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentNum, type, supplierId, receivedAtWarehouseId, receivedAtPosId, issueDate, dueDate, lines } = req.body;

        if (!documentNum || !type || !supplierId || !lines || lines.length === 0) {
            throw new AppError('Payload Validation: documentNum, type, supplierId, and lines are required.', 400);
        }

        const allowedTypes = Object.values(PurchaseDocumentType);
        if (!allowedTypes.includes(type)) {
            throw new AppError(`Invalid purchase type. Allowed: ${allowedTypes.join(', ')}`, 400);
        }

        // The req.user is guaranteed to be hydrated by the protect middleware
        const userId = (req as any).user.id;

        const document = await PurchasesService.createDraft({
            documentNum,
            type,
            supplierId,
            receivedAtWarehouseId,
            receivedAtPosId,
            issueDate: issueDate ? new Date(issueDate) : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            lines
        }, userId);

        res.status(201).json({ success: true, data: { document } });
    } catch (error) {
        next(error);
    }
};

export const validatePurchaseDocumentHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const userId = (req as any).user.id;

        const document = await PurchasesService.validateDocument(id, userId);

        res.status(200).json({
            success: true,
            message: 'Document successfully validated. Inventory and Price tracking have been autonomously processed.',
            data: { document }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllPurchasesHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const documents = await PurchasesService.getAll();
        res.status(200).json({ success: true, count: documents.length, data: { documents } });
    } catch (error) {
        next(error);
    }
};

export const getPurchaseByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const document = await PurchasesService.getById(id);
        res.status(200).json({ success: true, data: { document } });
    } catch (error) {
        next(error);
    }
};
