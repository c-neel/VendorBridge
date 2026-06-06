import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, procurementOrAbove } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createRFQSchema } from '../lib/schemas';
import { RfqService } from '../services/rfq.service';

export const rfqsRouter = Router();
rfqsRouter.use(authenticate);

// GET /api/rfqs
rfqsRouter.get('/', async (req, res) => {
  try {
    const { status, priority, search, page = '1', limit = '20' } = req.query;
    const result = await RfqService.listRFQs({
      status: status as string | undefined,
      priority: priority as string | undefined,
      search: search as string | undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      userRole: req.user!.role,
      userId: req.user!.userId,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
});

// GET /api/rfqs/:id
rfqsRouter.get('/:id', async (req, res) => {
  try {
    const rfq = await RfqService.getRFQById(req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(rfq);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
});

// POST /api/rfqs
rfqsRouter.post('/', procurementOrAbove, validateRequest(createRFQSchema), async (req, res) => {
  try {
    const rfq = await RfqService.createRFQ(req.body, req.user!.userId);
    res.status(201).json(rfq);
  } catch (error: any) {
    console.error('Create RFQ error:', error);
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
});

// PATCH /api/rfqs/:id/publish
rfqsRouter.patch('/:id/publish', procurementOrAbove, async (req, res) => {
  try {
    const rfq = await RfqService.publishRFQ(req.params.id as string);
    res.json(rfq);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to publish RFQ' });
  }
});

// POST /api/rfqs/:id/request-approval
rfqsRouter.post('/:id/request-approval', procurementOrAbove, async (req, res) => {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: req.params.id as string },
      include: { purchaseRequest: { include: { approvals: true } } },
    });

    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.status !== 'VENDOR_SELECTED') return res.status(400).json({ error: 'Vendor must be selected first' });

    // Find the manager who approved the original PR (or any assigned approver)
    const prApproval = (rfq as any).purchaseRequest.approvals.find((a: any) => a.approvalType === 'PR_APPROVAL');
    if (!prApproval) return res.status(400).json({ error: 'Original PR approval not found' });

    const approval = await prisma.approval.create({
      data: {
        vendorSelectionRfqId: rfq.id,
        purchaseRequestId: rfq.purchaseRequestId,
        approvalType: 'VENDOR_SELECTION',
        approverId: prApproval.approverId,
        approvalLevel: 2,
        status: 'PENDING',
      },
      include: { approver: { select: { firstName: true, lastName: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: approval.approverId,
        title: 'Vendor Selection Approval Required',
        message: `Vendor selection for RFQ ${rfq.rfqNumber} requires your final approval.`,
        type: 'APPROVAL_REQUIRED',
        referenceType: 'RFQ',
        referenceId: rfq.id,
        priority: 'HIGH',
      },
    });

    await prisma.rFQ.update({
      where: { id: rfq.id },
      data: { status: 'UNDER_REVIEW' },
    });

    res.status(201).json(approval);
  } catch (error: any) {
    console.error('Request approval error:', error);
    res.status(500).json({ error: 'Failed to request approval' });
  }
});
