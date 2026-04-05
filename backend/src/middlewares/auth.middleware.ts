import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('Not authorized: Authentication Token Missing', 401);
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new AppError('Server Configuration Error', 500);

        const decoded = jwt.verify(token, secret) as any;

        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { role: true },
        });

        if (!currentUser) {
            throw new AppError('The user associated with this token no longer exists.', 401);
        }

        if (!currentUser.isActive) {
            throw new AppError('Account has been deactivated.', 403);
        }

        req.user = currentUser;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError('Invalid Token Signature', 401));
        } else {
            next(error);
        }
    }
};

export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role.name)) {
            return next(new AppError('Role Violation: You do not possess clearance for this action', 403));
        }
        next();
    };
};
