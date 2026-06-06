import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get('/', async (req, res) => {
  try {
    const { unreadOnly, page = '1', limit = '20' } = req.query;
    const where: any = { userId: req.user!.userId };
    if (unreadOnly === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
    ]);

    res.json({ notifications, total, unreadCount, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

notificationsRouter.patch('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

notificationsRouter.patch('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});
