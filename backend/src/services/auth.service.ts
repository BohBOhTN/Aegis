import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class AuthService {
    static async login(email: string, passwordString: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            throw new AppError('Invalid credentials provided', 401);
        }

        if (!user.isActive) {
            throw new AppError('Access denied: Account has been administratively deactivated', 403);
        }

        const isMatch = await bcrypt.compare(passwordString, user.passwordHash);

        if (!isMatch) {
            throw new AppError('Invalid credentials provided', 401);
        }

        const token = this.generateToken(user.id, user.role.name);

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role.name,
                permissions: user.role.permissions
            },
            token
        };
    }

    static generateToken(userId: string, roleName: string): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new AppError('Internal Security Exception: JWT configuration missing', 500);

        return jwt.sign({ id: userId, role: roleName }, secret, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'],
        });
    }
}
