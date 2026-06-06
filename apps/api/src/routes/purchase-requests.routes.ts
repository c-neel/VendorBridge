import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, internalOnly } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createPurchaseRequestSchema } from '../lib/schemas';

export const purchaseRequestsRouter = Router();
purchaseRequestsRouter.use(authenticate);

// GET /api/purchase-requests
purchaseRequestsRouter.get('/', async (req, res) => {
  try {
    const { status, priority, department, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: any = {};

    // Role-based filtering
    if (req.user!.role === 'EMPLOYEE') {
      const emp = await prisma.employee.findUnique({ where: { userId: req.user!.userId } });
      if (emp) where.requestedById = emp.id;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (department) where.departmentId = department;
    if (search) {
      where.OR = [
        { prNumber: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where, skip, take: parseInt(limit as string),
        include: {
          department: { select: { name: true, code: true } },
          requestedBy: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } } } },
          approvals: { include: { approver: { select: { firstName: true, lastName: true, role: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);

    res.json({ requests, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch purchase requests' });
  }
});

// GET /api/purchase-requests/:id
purchaseRequestsRouter.get('/:id', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        requestedBy: { include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } } },
        suggestedVendor: true,
        approvals: {
          include: { approver: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        rfqs: { select: { id: true, rfqNumber: true, status: true } },
        purchaseOrders: { select: { id: true, poNumber: true, status: true } },
      },
    });

    if (!pr) return res.status(404).json({ error: 'Purchase request not found' });
    res.json(pr);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch purchase request' });
  }
});

// POST /api/purchase-requests
purchaseRequestsRouter.post('/', internalOnly, validateRequest(createPurchaseRequestSchema), async (req, res) => {
  try {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user!.userId } });
    if (!emp) return res.status(400).json({ error: 'Employee profile not found' });

    const prCount = await prisma.purchaseRequest.count();
    const prNumber = `PR-${new Date().getFullYear()}-${String(prCount + 1).padStart(4, '0')}`;

    const pr = await prisma.purchaseRequest.create({
      data: {
        prNumber,
        title: req.body.title,
        description: req.body.description,
        departmentId: req.body.departmentId || emp.departmentId,
        requestedById: emp.id,
        category: req.body.category,
        quantity: parseInt(req.body.quantity),
        unitOfMeasure: req.body.unitOfMeasure || 'pcs',
        estimatedUnitPrice: req.body.estimatedUnitPrice,
        estimatedBudget: parseFloat(req.body.estimatedBudget),
        priority: req.body.priority || 'MEDIUM',
        requiredByDate: new Date(req.body.requiredByDate),
        justification: req.body.justification,
        specifications: req.body.specifications,
        status: req.body.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT',
      },
      include: { department: true, requestedBy: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId, action: 'CREATED', entityType: 'PurchaseRequest',
        entityId: pr.id, description: `Created purchase request ${prNumber}: ${req.body.title}`,
      },
    });

    // If submitted, create approval and notification
    if (pr.status === 'SUBMITTED') {
      const budget = parseFloat(req.body.estimatedBudget);
      let approverRole = 'MANAGER';
      let approvalLevel = 1;
      if (budget > 500000) { approverRole = 'ADMIN'; approvalLevel = 3; }
      else if (budget > 50000) { approverRole = 'SENIOR_MANAGER'; approvalLevel = 2; }

      const approvers = await prisma.user.findMany({ where: { role: approverRole as any, isActive: true } });

      for (const approver of approvers) {
        await prisma.approval.create({
          data: {
            purchaseRequestId: pr.id, approvalType: 'PR_APPROVAL',
            approverId: approver.id, approvalLevel, status: 'PENDING',
          },
        });

        await prisma.notification.create({
          data: {
            userId: approver.id, title: 'New Approval Required',
            message: `Purchase request ${prNumber} for "${req.body.title}" (₹${budget.toLocaleString()}) requires your approval.`,
            type: 'APPROVAL_REQUIRED', referenceType: 'PurchaseRequest',
            referenceId: pr.id, priority: 'HIGH',
          },
        });
      }

      await prisma.purchaseRequest.update({
        where: { id: pr.id },
        data: { currentApprovalLevel: approvalLevel },
      });
    }

    res.status(201).json(pr);
  } catch (error: any) {
    console.error('Create PR error:', error);
    res.status(500).json({ error: 'Failed to create purchase request' });
  }
});

// PUT /api/purchase-requests/:id
purchaseRequestsRouter.put('/:id', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.update({
      where: { id: req.params.id },
      data: req.body,
      include: { department: true },
    });
    res.json(pr);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update purchase request' });
  }
});

// PATCH /api/purchase-requests/:id/submit
purchaseRequestsRouter.patch('/:id/submit', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.update({
      where: { id: req.params.id },
      data: { status: 'SUBMITTED' },
    });
    res.json(pr);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit purchase request' });
  }
});

// PATCH /api/purchase-requests/:id/cancel
purchaseRequestsRouter.patch('/:id/cancel', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    res.json(pr);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to cancel purchase request' });
  }
});
