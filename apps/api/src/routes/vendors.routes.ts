import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, procurementOrAbove } from '../middleware/auth';

export const vendorsRouter = Router();
vendorsRouter.use(authenticate);

// GET /api/vendors
vendorsRouter.get('/', async (req, res) => {
  try {
    const { category, search, status, minScore, maxScore, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (category) where.category = category as string;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'blacklisted') where.isBlacklisted = true;
    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { vendorCode: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where, skip, take: parseInt(limit as string),
        include: { score: true, user: { select: { avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    res.json({ vendors, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET /api/vendors/categories
vendorsRouter.get('/categories/list', async (_req, res) => {
  try {
    const categories = await prisma.vendor.groupBy({ by: ['category'], _count: { id: true } });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/vendors/leaderboard
vendorsRouter.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      include: { score: true },
      orderBy: { score: { trustScore: 'desc' } },
      take: limit,
    });
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/vendors/:id
vendorsRouter.get('/:id', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: {
        score: true,
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        purchaseOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        quotations: { take: 10, orderBy: { createdAt: 'desc' }, include: { rfq: { select: { rfqNumber: true, title: true } } } },
        riskAlerts: { where: { status: 'ACTIVE' }, take: 5 },
      },
    });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// POST /api/vendors
vendorsRouter.post('/', procurementOrAbove, async (req, res) => {
  try {
    const data = req.body;
    const vndCount = await prisma.vendor.count();
    const vendor = await prisma.vendor.create({
      data: { ...data, vendorCode: `VND-${String(vndCount + 100).padStart(3, '0')}` },
      include: { score: true },
    });
    res.status(201).json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// PUT /api/vendors/:id
vendorsRouter.put('/:id', procurementOrAbove, async (req, res) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: { score: true },
    });
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// PATCH /api/vendors/:id/deactivate
vendorsRouter.patch('/:id/deactivate', procurementOrAbove, async (req, res) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    });
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to deactivate vendor' });
  }
});
