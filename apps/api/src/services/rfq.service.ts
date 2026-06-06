import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';

/**
 * RFQ Service Layer
 * Encapsulates all business logic for Request for Quotation operations.
 * Separates domain logic from the Express transport layer (routes).
 */
export class RfqService {

  /**
   * Generates the next sequential RFQ number.
   */
  static async generateRfqNumber(): Promise<string> {
    const rfqCount = await prisma.rFQ.count();
    return `RFQ-${new Date().getFullYear()}-${String(rfqCount + 1).padStart(4, '0')}`;
  }

  /**
   * Creates a new RFQ and updates the parent Purchase Request status.
   * Optionally assigns vendors to the RFQ.
   */
  static async createRFQ(data: {
    purchaseRequestId: string;
    title: string;
    description?: string;
    quantity: number;
    unitOfMeasure?: string;
    estimatedBudget: number;
    priority?: string;
    deadline: string;
    termsAndConditions?: string;
    deliveryAddress?: string;
    evaluationCriteria?: any;
    vendorIds?: string[];
  }, userId: string) {
    const rfqNumber = await this.generateRfqNumber();

    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber,
        purchaseRequestId: data.purchaseRequestId,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        unitOfMeasure: data.unitOfMeasure || 'pcs',
        estimatedBudget: data.estimatedBudget,
        priority: (data.priority as any) || 'MEDIUM',
        deadline: new Date(data.deadline),
        termsAndConditions: data.termsAndConditions,
        deliveryAddress: data.deliveryAddress,
        evaluationCriteria: data.evaluationCriteria,
        createdById: userId,
        status: 'DRAFT',
      },
    });

    // Update parent Purchase Request status
    if (data.purchaseRequestId) {
      await prisma.purchaseRequest.update({
        where: { id: data.purchaseRequestId },
        data: { status: 'RFQ_CREATED' },
      });
    }

    // Assign vendors
    if (data.vendorIds && data.vendorIds.length > 0) {
      await prisma.rFQVendorMapping.createMany({
        data: data.vendorIds.map((vendorId) => ({
          rfqId: rfq.id,
          vendorId,
        })),
      });
    }

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATED',
        entityType: 'RFQ',
        entityId: rfq.id,
        description: `Created RFQ ${rfqNumber}: ${data.title}`,
      },
    });

    return rfq;
  }

  /**
   * Publishes an RFQ and notifies all assigned vendors.
   */
  static async publishRFQ(rfqId: string) {
    const rfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: { vendorMappings: { include: { vendor: true } } },
    });

    // Notify all assigned vendors
    const notifications = (rfq as any).vendorMappings.map((mapping: any) => ({
      userId: mapping.vendor.userId,
      title: 'New RFQ Published',
      message: `You have been invited to submit a quotation for RFQ ${rfq.rfqNumber}: "${rfq.title}". Deadline: ${rfq.deadline.toDateString()}.`,
      type: 'RFQ_PUBLISHED' as const,
      referenceType: 'RFQ',
      referenceId: rfq.id,
      priority: 'HIGH' as const,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return rfq;
  }

  /**
   * Fetches a paginated list of RFQs with role-based filtering.
   */
  static async listRFQs(params: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    userRole: string;
    userId: string;
  }) {
    const { status, priority, search, page = 1, limit = 20, userRole, userId } = params;
    const where: any = {};

    // Vendors see only their assigned RFQs
    if (userRole === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) {
        where.vendorMappings = { some: { vendorId: vendor.id } };
      }
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { rfqNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          purchaseRequest: { select: { prNumber: true, title: true } },
          createdBy: { select: { firstName: true, lastName: true } },
          vendorMappings: { include: { vendor: { select: { companyName: true, vendorCode: true } } } },
          quotations: { select: { id: true, status: true, vendorId: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return { rfqs, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Fetches a single RFQ with all related data.
   */
  static async getRFQById(id: string) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        purchaseRequest: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        vendorMappings: {
          include: {
            vendor: { include: { score: true } },
            quotation: true,
          },
        },
        quotations: {
          include: { vendor: { select: { companyName: true, vendorCode: true } } },
          orderBy: { grandTotal: 'asc' },
        },
        attachments: true,
        purchaseOrders: { select: { id: true, poNumber: true, status: true } },
      },
    });

    return rfq;
  }
}
