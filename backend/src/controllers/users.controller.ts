import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { AppError } from '../utils/AppError';

export const setupGenesisHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Payload Validation: Email and strictly secure password strings are required natively.', 400);
        }

        const user = await UsersService.setupGenesisUser(email, password);

        res.status(201).json({
            success: true,
            message: 'Genesis SuperAdmin structurally initialized flawlessly.',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const fetchAllUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UsersService.getAllUsers();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};
