import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { ZodError } from 'zod';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { departmentsRouter } from './routes/departments.routes';
import { vendorsRouter } from './routes/vendors.routes';
import { purchaseRequestsRouter } from './routes/purchase-requests.routes';
import { approvalsRouter } from './routes/approvals.routes';
import { rfqsRouter } from './routes/rfqs.routes';
import { quotationsRouter } from './routes/quotations.routes';
import { purchaseOrdersRouter } from './routes/purchase-orders.routes';
import { goodsReceiptsRouter } from './routes/goods-receipts.routes';
import { invoicesRouter } from './routes/invoices.routes';
import { paymentsRouter } from './routes/payments.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { activityLogsRouter } from './routes/activity-logs.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { aiRouter } from './routes/ai.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.API_PORT || 5000;

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use(logger.requestLogger());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/purchase-requests', purchaseRequestsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/goods-receipts', goodsReceiptsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/activity-logs', activityLogsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Handle Zod validation errors gracefully
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  logger.error('Unhandled error', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  logger.info(`VendorBridge AI API running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
