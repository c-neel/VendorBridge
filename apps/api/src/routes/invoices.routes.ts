import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const invoicesRouter = Router();
invoicesRouter.use(authenticate);

invoicesRouter.get('/', async (req, res) => {
  try {
    const { status, vendorId, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    if (req.user!.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
      if (vendor) where.vendorId = vendor.id;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          vendor: { select: { companyName: true, vendorCode: true } },
          purchaseOrder: { select: { poNumber: true } },
          threeWayMatch: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({ invoices, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

invoicesRouter.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: true,
        purchaseOrder: { include: { lineItems: true, purchaseRequest: true } },
        submittedBy: { select: { firstName: true, lastName: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
        threeWayMatch: true,
        payment: true,
      },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

invoicesRouter.post('/', async (req, res) => {
  try {
    const invCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        vendorInvoiceNumber: req.body.vendorInvoiceNumber,
        purchaseOrderId: req.body.purchaseOrderId,
        vendorId: req.body.vendorId,
        invoiceDate: new Date(req.body.invoiceDate || new Date()),
        dueDate: new Date(req.body.dueDate),
        subtotal: parseFloat(req.body.subtotal),
        cgstAmount: req.body.cgstAmount ? parseFloat(req.body.cgstAmount) : null,
        sgstAmount: req.body.sgstAmount ? parseFloat(req.body.sgstAmount) : null,
        igstAmount: req.body.igstAmount ? parseFloat(req.body.igstAmount) : null,
        totalTax: parseFloat(req.body.totalTax),
        grandTotal: parseFloat(req.body.grandTotal),
        status: 'SUBMITTED',
        submittedById: req.user!.userId,
        notes: req.body.notes,
      },
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});
