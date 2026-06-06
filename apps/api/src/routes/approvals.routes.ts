import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, managerOrAbove } from '../middleware/auth';

export const approvalsRouter = Router();
approvalsRouter.use(authenticate);

// GET /api/approvals
approvalsRouter.get('/', async (req, res) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;
    const where: any = {};

    // Managers only see their own approvals
    if (['MANAGER', 'SENIOR_MANAGER'].includes(req.user!.role)) {
      where.approverId = req.user!.userId;
    }

    if (status) where.status = status as string;
    if (type) where.approvalType = type as string;

    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        include: {
          purchaseRequest: {
            include: {
              department: { select: { name: true } },
              requestedBy: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
            },
          },
          approver: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.approval.count({ where }),
    ]);

    res.json({ approvals, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

// GET /api/approvals/pending/count
approvalsRouter.get('/pending/count', async (req, res) => {
  try {
    const where: any = { status: 'PENDING' };
    if (['MANAGER', 'SENIOR_MANAGER'].includes(req.user!.role)) {
      where.approverId = req.user!.userId;
    }
    const count = await prisma.approval.count({ where });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pending count' });
  }
});

// GET /api/approvals/:id
approvalsRouter.get('/:id', async (req, res) => {
  try {
    const approval = await prisma.approval.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseRequest: {
          include: {
            department: { select: { name: true } },
            requestedBy: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } } } },
            suggestedVendor: { select: { companyName: true, score: true, vendorCode: true, category: true } },
            approvals: {
              include: {
                approver: { select: { firstName: true, lastName: true, role: true } }
              },
              orderBy: { approvalLevel: 'asc' }
            }
          },
        },
        approver: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    res.json(approval);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch approval details' });
  }
});

// PATCH /api/approvals/:id/approve
approvalsRouter.patch('/:id/approve', managerOrAbove, async (req, res) => {
  try {
    const approval = await prisma.approval.update({
      where: { id: req.params.id as string },
      data: {
        status: 'APPROVED',
        remarks: req.body.remarks,
        decidedAt: new Date(),
      },
      include: { purchaseRequest: true },
    });

    // Update PR status
    if (approval.purchaseRequestId) {
      await prisma.purchaseRequest.update({
        where: { id: approval.purchaseRequestId },
        data: { status: 'APPROVED' },
      });

      // Notify requester
      const pr = (approval as any).purchaseRequest;
      const emp = await prisma.employee.findUnique({ where: { id: pr.requestedById }, include: { user: true } });
      if (emp) {
        await prisma.notification.create({
          data: {
            userId: emp.userId, title: 'Request Approved',
            message: `Your purchase request ${pr.prNumber} has been approved.`,
            type: 'INFO', referenceType: 'PurchaseRequest', referenceId: pr.id, priority: 'MEDIUM',
          },
        });
      }
    } else if (approval.vendorSelectionRfqId) {
      // Update RFQ status
      const rfq = await prisma.rFQ.update({
        where: { id: approval.vendorSelectionRfqId },
        data: { status: 'APPROVED' },
      });

      // Notify Procurement
      await prisma.notification.create({
        data: {
          userId: rfq.createdById, title: 'Vendor Selection Approved',
          message: `Your vendor selection for RFQ ${rfq.rfqNumber} has been approved by the manager. You can now generate the PO.`,
          type: 'INFO', referenceType: 'RFQ', referenceId: rfq.id, priority: 'HIGH',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId, action: 'APPROVED', entityType: 'Approval',
        entityId: approval.id, description: `Approved ${approval.approvalType} for PR ${(approval as any).purchaseRequest?.prNumber}`,
      },
    });

    res.json(approval);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve' });
  }
});

// PATCH /api/approvals/:id/reject
approvalsRouter.patch('/:id/reject', managerOrAbove, async (req, res) => {
  try {
    const approval = await prisma.approval.update({
      where: { id: req.params.id as string },
      data: {
        status: 'REJECTED',
        remarks: req.body.remarks || 'Rejected',
        decidedAt: new Date(),
      },
      include: { purchaseRequest: true },
    });

    if (approval.purchaseRequestId) {
      await prisma.purchaseRequest.update({
        where: { id: approval.purchaseRequestId },
        data: { status: 'REJECTED', rejectionReason: req.body.remarks },
      });
    } else if (approval.vendorSelectionRfqId) {
      await prisma.rFQ.update({
        where: { id: approval.vendorSelectionRfqId },
        data: { status: 'REJECTED' },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId, action: 'REJECTED', entityType: 'Approval',
        entityId: approval.id, description: `Rejected ${approval.approvalType} for PR ${(approval as any).purchaseRequest?.prNumber}`,
      },
    });

    res.json(approval);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reject' });
  }
});
