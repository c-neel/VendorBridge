import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const paymentsRouter = Router();
paymentsRouter.use(authenticate);

paymentsRouter.get('/', async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          invoice: { select: { invoiceNumber: true } },
          vendor: { select: { companyName: true } },
          processedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ payments, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

paymentsRouter.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { invoice: true, vendor: true, processedBy: { select: { firstName: true, lastName: true } } },
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

paymentsRouter.post('/', async (req, res) => {
  try {
    const payCount = await prisma.payment.count();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, '0')}`;

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        invoiceId: req.body.invoiceId,
        vendorId: req.body.vendorId,
        amount: parseFloat(req.body.amount),
        paymentMethod: req.body.paymentMethod || 'BANK_TRANSFER',
        paymentDate: new Date(req.body.paymentDate || new Date()),
        referenceNumber: req.body.referenceNumber,
        status: req.body.status || 'PENDING',
        remarks: req.body.remarks,
        processedById: req.user!.userId,
      },
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: req.body.invoiceId },
      data: { status: 'PAID' },
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
});
