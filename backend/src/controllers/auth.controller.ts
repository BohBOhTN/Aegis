import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/AppError';

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Payload Error: Email and password strings are mandatorily required', 400);
        }

        const authData = await AuthService.login(email, password);

        res.status(200).json({
            success: true,
            data: authData
        });
    } catch (error) {
        next(error);
    }
};
