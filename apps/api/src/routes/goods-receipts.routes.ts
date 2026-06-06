import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const goodsReceiptsRouter = Router();
goodsReceiptsRouter.use(authenticate);

goodsReceiptsRouter.get('/', async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const [receipts, total] = await Promise.all([
      prisma.goodsReceipt.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          purchaseOrder: { select: { poNumber: true } },
          vendor: { select: { companyName: true } },
          receivedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.goodsReceipt.count({ where }),
    ]);

    res.json({ receipts, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch goods receipts' });
  }
});

goodsReceiptsRouter.get('/:id', async (req, res) => {
  try {
    const receipt = await prisma.goodsReceipt.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrder: { include: { lineItems: true, vendor: true } },
        vendor: true,
        receivedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!receipt) return res.status(404).json({ error: 'Goods receipt not found' });
    res.json(receipt);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch goods receipt' });
  }
});

goodsReceiptsRouter.post('/', async (req, res) => {
  try {
    const grnCount = await prisma.goodsReceipt.count();
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(grnCount + 1).padStart(4, '0')}`;

    const receipt = await prisma.goodsReceipt.create({
      data: {
        grnNumber,
        purchaseOrderId: req.body.purchaseOrderId,
        vendorId: req.body.vendorId,
        receivedById: req.user!.userId,
        receivedDate: new Date(req.body.receivedDate || new Date()),
        quantityOrdered: parseInt(req.body.quantityOrdered),
        quantityReceived: parseInt(req.body.quantityReceived),
        quantityAccepted: parseInt(req.body.quantityAccepted),
        quantityRejected: parseInt(req.body.quantityRejected || '0'),
        condition: req.body.condition || 'GOOD',
        inspectionNotes: req.body.inspectionNotes,
        status: req.body.status || 'RECEIVED',
      },
    });

    // Update PO status
    const qReceived = parseInt(req.body.quantityReceived);
    const qOrdered = parseInt(req.body.quantityOrdered);
    const poStatus = qReceived >= qOrdered ? 'DELIVERED' : 'PARTIALLY_DELIVERED';
    await prisma.purchaseOrder.update({
      where: { id: req.body.purchaseOrderId },
      data: { status: poStatus },
    });

    res.status(201).json(receipt);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create goods receipt' });
  }
});
