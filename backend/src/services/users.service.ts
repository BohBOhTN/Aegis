import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export class UsersService {
    /**
     * Enterprise Genesis Configuration.
     * This logic maps the very first super-administrative identity securely into the architecture.
     * CRITICAL SECURITY: It mathematically locks itself globally the instant 1 user exists.
     */
    static async setupGenesisUser(email: string, passwordString: string) {
        const userCount = await prisma.user.count();

        if (userCount > 0) {
            throw new AppError('Security Intrusion: Genesis setup is permanently locked system-wide. Users currently exist.', 403);
        }

        let genesisRole = await prisma.role.findUnique({ where: { name: 'SuperAdmin' } });

        if (!genesisRole) {
            genesisRole = await prisma.role.create({
                data: {
                    name: 'SuperAdmin',
                    permissions: { all: true }
                }
            });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(passwordString, salt);

        const genesisUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                roleId: genesisRole.id,
                isActive: true,
            },
            select: { id: true, email: true, isActive: true, role: { select: { name: true } } }
        });

        return genesisUser;
    }

    static async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true,
                role: { select: { name: true, permissions: true } }
            }
        });
    }
}
