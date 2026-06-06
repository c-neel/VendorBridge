import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const activityLogsRouter = Router();
activityLogsRouter.use(authenticate);

activityLogsRouter.get('/', async (req, res) => {
  try {
    const { entityType, action, userId, page = '1', limit = '30' } = req.query;
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: { user: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({ logs, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});
