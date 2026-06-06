import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = '₹'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency}0`;
  return `${currency}${num.toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'badge-neutral', SUBMITTED: 'badge-info', UNDER_REVIEW: 'badge-warning',
    APPROVED: 'badge-success', REJECTED: 'badge-danger', COMPLETED: 'badge-success',
    CANCELLED: 'badge-neutral', PENDING: 'badge-warning', PROCESSING: 'badge-info',
    PAID: 'badge-success', PUBLISHED: 'badge-info', CLOSED: 'badge-neutral',
    ISSUED: 'badge-info', DELIVERED: 'badge-success', RECEIVED: 'badge-success',
    PARTIALLY_RECEIVED: 'badge-warning', ACTIVE: 'badge-danger',
    ACKNOWLEDGED: 'badge-info', MATCHED: 'badge-success',
    QUANTITY_MISMATCH: 'badge-danger', PRICE_MISMATCH: 'badge-danger',
    VENDOR_SELECTED: 'badge-violet', RFQ_CREATED: 'badge-info',
    PO_GENERATED: 'badge-violet', QUOTATION_RECEIVED: 'badge-info',
    CLARIFICATION_REQUESTED: 'badge-warning', OVERDUE: 'badge-danger',
    IN_TRANSIT: 'badge-info', PARTIALLY_DELIVERED: 'badge-warning',
  };
  return `badge ${map[status] || 'badge-neutral'}`;
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    LOW: 'badge-neutral', MEDIUM: 'badge-info',
    HIGH: 'badge-warning', URGENT: 'badge-danger',
  };
  return `badge ${map[priority] || 'badge-neutral'}`;
}

export function getTrustScoreColor(score: number): string {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#2e8fff';
  if (score >= 60) return '#f59e0b';
  return '#f43f5e';
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    SENIOR_MANAGER: 'Senior Manager',
    PROCUREMENT_OFFICER: 'Procurement Officer',
    EMPLOYEE: 'Employee',
    VENDOR: 'Vendor',
  };
  return map[role] || role;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
