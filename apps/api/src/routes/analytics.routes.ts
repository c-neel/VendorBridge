import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { cache } from '../lib/cache';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

analyticsRouter.get('/overview', async (_req, res) => {
  try {
    const cacheKey = 'analytics:overview';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const [totalVendors, activeRFQs, pendingApprovals, totalPRs, totalPOs, recentSnapshots] = await Promise.all([
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.rFQ.count({ where: { status: { in: ['PUBLISHED', 'QUOTATION_RECEIVED', 'UNDER_REVIEW'] } } }),
      prisma.approval.count({ where: { status: 'PENDING' } }),
      prisma.purchaseRequest.count(),
      prisma.purchaseOrder.count(),
      prisma.analyticsSnapshot.findMany({ orderBy: { snapshotDate: 'desc' }, take: 30 }),
    ]);

    // Calculate total spend
    const spendResult = await prisma.purchaseOrder.aggregate({
      _sum: { grandTotal: true },
      where: { status: { in: ['ISSUED', 'ACKNOWLEDGED', 'DELIVERED', 'COMPLETED'] } },
    });

    // Get risk alerts
    const activeRisks = await prisma.riskAlert.count({ where: { status: 'ACTIVE' } });

    const data = {
      totalVendors, activeRFQs, pendingApprovals, totalPRs, totalPOs,
      totalSpend: spendResult._sum.grandTotal || 0,
      activeRisks,
      snapshots: recentSnapshots.reverse(),
    };

    cache.set(cacheKey, data, 60); // Cache for 60 seconds
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

analyticsRouter.get('/spend', async (req, res) => {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      orderBy: { snapshotDate: 'asc' },
      take: 30,
    });

    const departmentSpend = snapshots.length > 0 ? snapshots[snapshots.length - 1].departmentSpendJson : {};
    const categorySpend = snapshots.length > 0 ? snapshots[snapshots.length - 1].categorySpendJson : {};

    res.json({ snapshots, departmentSpend, categorySpend });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch spend analytics' });
  }
});

analyticsRouter.get('/vendor-performance', async (_req, res) => {
  try {
    const cacheKey = 'analytics:vendor-performance';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      include: { score: true },
      orderBy: { score: { trustScore: 'desc' } },
      take: 15,
    });
    
    cache.set(cacheKey, vendors, 120); // Cache for 2 mins
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch vendor performance' });
  }
});

analyticsRouter.get('/risk-alerts', async (_req, res) => {
  try {
    const alerts = await prisma.riskAlert.findMany({
      include: { vendor: { select: { companyName: true, vendorCode: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch risk alerts' });
  }
});

analyticsRouter.get('/health-score', async (_req, res) => {
  try {
    const latest = await prisma.analyticsSnapshot.findFirst({ orderBy: { snapshotDate: 'desc' } });
    const org = await prisma.organization.findFirst();

    res.json({
      procurementHealthScore: latest?.procurementHealthScore || org?.procurementHealthScore || 85,
      avgCycleTimeDays: latest?.avgCycleTimeDays || 7,
      approvalSpeedHours: latest?.approvalSpeedHours || 8,
      vendorReliabilityScore: latest?.vendorReliabilityScore || 85,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch health score' });
  }
});
