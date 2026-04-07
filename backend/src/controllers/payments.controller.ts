import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from '../services/payments.service';

export const createPaymentHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payment = await PaymentsService.createPayment(req.body);
        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = {
            clientId: req.query.clientId as string | undefined,
            documentId: req.query.documentId as string | undefined,
        };
        const payments = await PaymentsService.getPayments(filters);
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};
