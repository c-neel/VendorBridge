import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, procurementOrAbove } from '../middleware/auth';

export const purchaseOrdersRouter = Router();
purchaseOrdersRouter.use(authenticate);

// GET /api/purchase-orders
purchaseOrdersRouter.get('/', async (req, res) => {
  try {
    const { status, vendorId, search, page = '1', limit = '20' } = req.query;
    const where: any = {};

    if (req.user!.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
      if (vendor) where.vendorId = vendor.id;
    }

    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (search) {
      where.OR = [
        { poNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          vendor: { select: { companyName: true, vendorCode: true } },
          purchaseRequest: { select: { prNumber: true, title: true } },
          issuedBy: { select: { firstName: true, lastName: true, role: true } },
          lineItems: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// GET /api/purchase-orders/:id
purchaseOrdersRouter.get('/:id', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: { include: { score: true } },
        purchaseRequest: true,
        rfq: true,
        quotation: true,
        issuedBy: { select: { firstName: true, lastName: true } },
        lineItems: { orderBy: { itemNumber: 'asc' } },
        goodsReceipts: true,
        invoices: true,
      },
    });
    if (!po) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(po);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// POST /api/purchase-orders
purchaseOrdersRouter.post('/', procurementOrAbove, async (req, res) => {
  try {
    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        purchaseRequestId: req.body.purchaseRequestId,
        rfqId: req.body.rfqId,
        quotationId: req.body.quotationId,
        vendorId: req.body.vendorId,
        subtotal: parseFloat(req.body.subtotal),
        taxPercentage: parseFloat(req.body.taxPercentage || '18'),
        taxAmount: parseFloat(req.body.taxAmount),
        grandTotal: parseFloat(req.body.grandTotal),
        deliveryDate: new Date(req.body.deliveryDate),
        deliveryAddress: req.body.deliveryAddress,
        paymentTerms: req.body.paymentTerms || 'Net 30',
        termsAndConditions: req.body.termsAndConditions,
        status: 'ISSUED',
        issuedById: req.user!.userId,
        issuedAt: new Date(),
      },
      include: { vendor: { select: { companyName: true } } },
    });

    // Create line items
    if (req.body.lineItems && Array.isArray(req.body.lineItems)) {
      for (let i = 0; i < req.body.lineItems.length; i++) {
        const item = req.body.lineItems[i];
        await prisma.pOLineItem.create({
          data: {
            purchaseOrderId: po.id,
            itemNumber: i + 1,
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            unitOfMeasure: item.unitOfMeasure || 'pcs',
            hsnCode: item.hsnCode,
          },
        });
      }
    }

    // Update PR status
    if (req.body.purchaseRequestId) {
      await prisma.purchaseRequest.update({
        where: { id: req.body.purchaseRequestId },
        data: { status: 'PO_GENERATED' },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId, action: 'GENERATED', entityType: 'PurchaseOrder',
        entityId: po.id, description: `Generated PO ${poNumber} for ${(po as any).vendor?.companyName}`,
      },
    });

    res.status(201).json(po);
  } catch (error: any) {
    console.error('Create PO error:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// PATCH /api/purchase-orders/:id/status
purchaseOrdersRouter.patch('/:id/status', async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status: req.body.status, acknowledgedAt: req.body.status === 'ACKNOWLEDGED' ? new Date() : undefined },
    });
    res.json(po);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update PO status' });
  }
});
