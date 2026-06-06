import { z } from 'zod';

/**
 * Zod schemas for input validation across API endpoints.
 * Each schema validates the shape and constraints of incoming request bodies.
 */

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER', 'ADMIN', 'VENDOR']).optional(),
  // Vendor fields
  companyName: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  vendorCategory: z.string().optional(),
  contactPhone: z.string().optional(),
  vendorAddress: z.string().optional(),
  vendorCity: z.string().optional(),
  vendorState: z.string().optional(),
  vendorPincode: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ─── Purchase Request Schemas ────────────────────────────────────────────────

export const createPurchaseRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  category: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().int().positive('Quantity must be a positive integer')),
  unitOfMeasure: z.string().optional(),
  estimatedUnitPrice: z.union([z.string(), z.number()]).optional(),
  estimatedBudget: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive('Budget must be a positive number')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  requiredByDate: z.string().min(1, 'Required by date is required'),
  justification: z.string().optional(),
  specifications: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED']).optional(),
});

// ─── RFQ Schemas ─────────────────────────────────────────────────────────────

export const createRFQSchema = z.object({
  purchaseRequestId: z.string().uuid('Invalid purchase request ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().int().positive()),
  unitOfMeasure: z.string().optional(),
  estimatedBudget: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  termsAndConditions: z.string().optional(),
  deliveryAddress: z.string().optional(),
  evaluationCriteria: z.any().optional(),
  vendorIds: z.array(z.string().uuid()).optional(),
});

// ─── Vendor Schemas ──────────────────────────────────────────────────────────

export const createVendorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  category: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});
