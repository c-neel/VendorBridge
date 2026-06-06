import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

// GET /api/dashboard — role-based dashboard data
dashboardRouter.get('/', async (req, res) => {
  try {
    const role = req.user!.role;

    if (role === 'ADMIN') {
      const [totalVendors, activeRFQs, pendingApprovals, totalPRs, totalPOs, recentLogs, riskAlerts, healthScore] = await Promise.all([
        prisma.vendor.count({ where: { isActive: true } }),
        prisma.rFQ.count({ where: { status: { in: ['PUBLISHED', 'QUOTATION_RECEIVED', 'UNDER_REVIEW'] } } }),
        prisma.approval.count({ where: { status: 'PENDING' } }),
        prisma.purchaseRequest.count(),
        prisma.purchaseOrder.count(),
        prisma.activityLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } }),
        prisma.riskAlert.findMany({ where: { status: 'ACTIVE' }, take: 5, include: { vendor: { select: { companyName: true } } } }),
        prisma.analyticsSnapshot.findFirst({ orderBy: { snapshotDate: 'desc' } }),
      ]);

      const totalSpend = await prisma.purchaseOrder.aggregate({ _sum: { grandTotal: true }, where: { status: { in: ['ISSUED', 'ACKNOWLEDGED', 'DELIVERED', 'COMPLETED'] } } });

      return res.json({
        role: 'ADMIN',
        stats: { totalVendors, activeRFQs, pendingApprovals, totalPRs, totalPOs, totalSpend: totalSpend._sum.grandTotal || 0 },
        recentActivity: recentLogs,
        riskAlerts,
        healthScore: healthScore ? { procurementHealthScore: healthScore.procurementHealthScore, avgCycleTimeDays: healthScore.avgCycleTimeDays, approvalSpeedHours: healthScore.approvalSpeedHours, vendorReliabilityScore: healthScore.vendorReliabilityScore } : null,
      });
    }

    if (['MANAGER', 'SENIOR_MANAGER'].includes(role)) {
      const [pendingApprovals, recentApprovals, totalApproved, totalRejected] = await Promise.all([
        prisma.approval.findMany({
          where: { approverId: req.user!.userId, status: 'PENDING' },
          include: { purchaseRequest: { include: { department: true, requestedBy: { include: { user: { select: { firstName: true, lastName: true } } } } } } },
          orderBy: { createdAt: 'desc' }, take: 10,
        }),
        prisma.approval.findMany({
          where: { approverId: req.user!.userId, status: { in: ['APPROVED', 'REJECTED'] } },
          include: { purchaseRequest: { select: { prNumber: true, title: true, estimatedBudget: true } } },
          orderBy: { decidedAt: 'desc' }, take: 10,
        }),
        prisma.approval.count({ where: { approverId: req.user!.userId, status: 'APPROVED' } }),
        prisma.approval.count({ where: { approverId: req.user!.userId, status: 'REJECTED' } }),
      ]);

      return res.json({
        role,
        stats: { pendingCount: pendingApprovals.length, totalApproved, totalRejected, approvalRate: totalApproved + totalRejected > 0 ? Math.round((totalApproved / (totalApproved + totalRejected)) * 100) : 0 },
        pendingApprovals,
        recentApprovals,
      });
    }

    if (role === 'PROCUREMENT_OFFICER') {
      const [openRFQs, recentPOs, recentQuotations, openPRs] = await Promise.all([
        prisma.rFQ.findMany({ where: { status: { in: ['PUBLISHED', 'QUOTATION_RECEIVED', 'UNDER_REVIEW'] } }, take: 10, orderBy: { createdAt: 'desc' }, include: { quotations: { select: { id: true } } } }),
        prisma.purchaseOrder.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { vendor: { select: { companyName: true } } } }),
        prisma.quotation.findMany({ where: { status: 'SUBMITTED' }, take: 10, orderBy: { submittedAt: 'desc' }, include: { vendor: { select: { companyName: true } }, rfq: { select: { rfqNumber: true } } } }),
        prisma.purchaseRequest.count({ where: { status: 'APPROVED' } }),
      ]);

      return res.json({
        role: 'PROCUREMENT_OFFICER',
        stats: { openRFQs: openRFQs.length, recentPOsCount: recentPOs.length, newQuotations: recentQuotations.length, approvedPRsReady: openPRs },
        openRFQs, recentPOs, recentQuotations,
      });
    }

    if (role === 'EMPLOYEE') {
      const emp = await prisma.employee.findUnique({ where: { userId: req.user!.userId } });
      if (!emp) return res.json({ role: 'EMPLOYEE', stats: {}, requests: [] });

      const [myRequests, statusCounts] = await Promise.all([
        prisma.purchaseRequest.findMany({
          where: { requestedById: emp.id },
          include: { department: { select: { name: true } }, approvals: { select: { status: true } } },
          orderBy: { createdAt: 'desc' }, take: 20,
        }),
        prisma.purchaseRequest.groupBy({ by: ['status'], where: { requestedById: emp.id }, _count: { id: true } }),
      ]);

      return res.json({
        role: 'EMPLOYEE',
        stats: { totalRequests: myRequests.length, statusCounts: Object.fromEntries(statusCounts.map(s => [s.status, s._count.id])) },
        requests: myRequests,
      });
    }

    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId }, include: { score: true } });
      if (!vendor) return res.json({ role: 'VENDOR', stats: {} });

      const [activeRFQs, myQuotations, myPOs, myPayments] = await Promise.all([
        prisma.rFQVendorMapping.findMany({
          where: { vendorId: vendor.id, status: { in: ['INVITED', 'VIEWED'] } },
          include: { rfq: true }, take: 10,
        }),
        prisma.quotation.findMany({ where: { vendorId: vendor.id }, take: 10, orderBy: { createdAt: 'desc' }, include: { rfq: { select: { rfqNumber: true, title: true } } } }),
        prisma.purchaseOrder.findMany({ where: { vendorId: vendor.id }, take: 10, orderBy: { createdAt: 'desc' } }),
        prisma.payment.findMany({ where: { vendorId: vendor.id }, take: 10, orderBy: { createdAt: 'desc' } }),
      ]);

      return res.json({
        role: 'VENDOR',
        vendor,
        stats: { activeRFQs: activeRFQs.length, totalQuotations: myQuotations.length, totalPOs: myPOs.length, pendingPayments: myPayments.filter(p => p.status === 'PENDING').length },
        activeRFQs, myQuotations, myPOs, myPayments,
      });
    }

    res.json({ role, stats: {} });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});
