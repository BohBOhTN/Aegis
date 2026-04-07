import prisma from '../utils/prisma';

export class AuditService {
    static async getLogs(page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;

        const [total, logs] = await Promise.all([
            prisma.auditLog.count(),
            prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: { user: { select: { email: true } } }
            })
        ]);

        return {
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: logs
        };
    }
}
