import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vendorbridge-super-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vendorbridge-refresh-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY as any });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY as any });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

export function generateTokens(payload: TokenPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
