import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Convenience guards
export const adminOnly = requireRole('ADMIN');
export const managerOrAbove = requireRole('ADMIN', 'MANAGER', 'SENIOR_MANAGER');
export const procurementOrAbove = requireRole('ADMIN', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER');
export const internalOnly = requireRole('ADMIN', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE');
export const vendorOnly = requireRole('VENDOR');
