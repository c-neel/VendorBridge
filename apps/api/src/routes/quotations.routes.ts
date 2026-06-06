import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const quotationsRouter = Router();
quotationsRouter.use(authenticate);

// GET /api/quotations
quotationsRouter.get('/', async (req, res) => {
  try {
    const { rfqId, vendorId, status, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (rfqId) where.rfqId = rfqId;
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;

    if (req.user!.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
      if (vendor) where.vendorId = vendor.id;
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where, skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          vendor: { select: { companyName: true, vendorCode: true } },
          rfq: { select: { rfqNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quotation.count({ where }),
    ]);

    res.json({ quotations, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

// GET /api/quotations/compare/:rfqId
quotationsRouter.get('/compare/:rfqId', async (req, res) => {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { rfqId: req.params.rfqId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED'] } },
      include: {
        vendor: { include: { score: true } },
      },
      orderBy: { grandTotal: 'asc' },
    });

    const rfq = await prisma.rFQ.findUnique({ where: { id: req.params.rfqId } });

    res.json({ rfq, quotations });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to compare quotations' });
  }
});

// GET /api/quotations/:id
quotationsRouter.get('/:id', async (req, res) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: { select: { companyName: true, vendorCode: true } },
        rfq: { select: { rfqNumber: true, title: true, status: true } },
      },
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch quotation details' });
  }
});

// POST /api/quotations
quotationsRouter.post('/', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor && req.user!.role === 'VENDOR') return res.status(400).json({ error: 'Vendor profile not found' });

    const vendorId = vendor?.id || req.body.vendorId;
    const qtCount = await prisma.quotation.count();
    const quotationNumber = `QT-${new Date().getFullYear()}-${String(qtCount + 1).padStart(4, '0')}`;

    const mapping = await prisma.rFQVendorMapping.findFirst({
      where: { rfqId: req.body.rfqId, vendorId },
    });
    if (!mapping) return res.status(400).json({ error: 'Vendor not assigned to this RFQ' });

    const totalPrice = parseFloat(req.body.unitPrice) * parseInt(req.body.quantity || '1');
    const taxAmount = totalPrice * (parseFloat(req.body.taxPercentage || '18') / 100);

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        rfqVendorMappingId: mapping.id,
        rfqId: req.body.rfqId,
        vendorId,
        unitPrice: parseFloat(req.body.unitPrice),
        totalPrice,
        taxPercentage: parseFloat(req.body.taxPercentage || '18'),
        taxAmount,
        grandTotal: totalPrice + taxAmount,
        deliveryDays: parseInt(req.body.deliveryDays),
        warrantyMonths: req.body.warrantyMonths ? parseInt(req.body.warrantyMonths) : null,
        warrantyDetails: req.body.warrantyDetails,
        supportDetails: req.body.supportDetails,
        paymentTerms: req.body.paymentTerms,
        validityDays: parseInt(req.body.validityDays || '30'),
        notes: req.body.notes,
        technicalCompliance: req.body.technicalCompliance,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: { vendor: { select: { companyName: true } }, rfq: { select: { rfqNumber: true } } },
    });

    // Update mapping status
    await prisma.rFQVendorMapping.update({
      where: { id: mapping.id },
      data: { status: 'QUOTED' },
    });

    // Update RFQ status
    await prisma.rFQ.update({
      where: { id: req.body.rfqId },
      data: { status: 'QUOTATION_RECEIVED' },
    });

    res.status(201).json(quotation);
  } catch (error: any) {
    console.error('Create quotation error:', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
});

// PATCH /api/quotations/:id/accept
quotationsRouter.patch('/:id/accept', async (req, res) => {
  try {
    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
    });

    // Update mapping
    await prisma.rFQVendorMapping.update({
      where: { id: quotation.rfqVendorMappingId },
      data: { isSelected: true, status: 'SELECTED' },
    });

    // Update RFQ
    await prisma.rFQ.update({
      where: { id: quotation.rfqId },
      data: { status: 'VENDOR_SELECTED' },
    });

    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to accept quotation' });
  }
});

// PATCH /api/quotations/:id/reject
quotationsRouter.patch('/:id/reject', async (req, res) => {
  try {
    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });

    // Update mapping
    await prisma.rFQVendorMapping.update({
      where: { id: quotation.rfqVendorMappingId },
      data: { status: 'REJECTED' },
    });

    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reject quotation' });
  }
});
