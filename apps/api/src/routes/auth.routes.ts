import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { generateTokens, verifyRefreshToken, TokenPayload } from '../lib/jwt';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/schemas';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
        isActive: true,
      },
      include: {
        employee: { include: { department: true } },
        vendor: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Username and password do not match' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Username and password do not match' });
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const tokens = generateTokens(payload);

    // Update user login info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        refreshToken: tokens.refreshToken,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        description: `${user.firstName} ${user.lastName} logged in`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    const { passwordHash, refreshToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user;

    res.json({
      user: safeUser,
      ...tokens,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register
authRouter.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const {
      firstName, lastName, username, email, password, phone,
      dateOfBirth, gender, addressLine1, addressLine2, city,
      state, pincode, country, bio, role,
      // Vendor fields
      companyName, gstNumber, panNumber, vendorCategory,
      contactPhone, vendorAddress, vendorCity, vendorState, vendorPincode,
    } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: 'Required fields: firstName, lastName, username, email, password' });
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (existing) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role || 'EMPLOYEE';

    const user = await prisma.user.create({
      data: {
        firstName, lastName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash, phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender, addressLine1, addressLine2,
        city, state, pincode,
        country: country || 'India',
        bio, role: userRole,
        isActive: true,
        isEmailVerified: false,
      },
    });

    // Create employee profile for internal roles
    if (['EMPLOYEE', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER', 'ADMIN'].includes(userRole)) {
      const empCount = await prisma.employee.count();
      const defaultDept = await prisma.department.findFirst();
      if (defaultDept) {
        await prisma.employee.create({
          data: {
            userId: user.id,
            employeeId: `EMP-${String(empCount + 100).padStart(3, '0')}`,
            departmentId: defaultDept.id,
            designation: userRole === 'MANAGER' ? 'Manager' : 'Staff',
          },
        });
      }
    }

    // Create vendor profile
    if (userRole === 'VENDOR' && companyName) {
      const vndCount = await prisma.vendor.count();
      await prisma.vendor.create({
        data: {
          userId: user.id,
          vendorCode: `VND-${String(vndCount + 100).padStart(3, '0')}`,
          companyName,
          gstNumber, panNumber,
          category: vendorCategory || 'OTHER',
          contactPerson: `${firstName} ${lastName}`,
          contactEmail: email,
          contactPhone: contactPhone || phone || '',
          addressLine1: vendorAddress || addressLine1 || '',
          city: vendorCity || city || '',
          state: vendorState || state || '',
          pincode: vendorPincode || pincode || '',
        },
      });
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const tokens = generateTokens(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const { passwordHash: _, refreshToken: __, passwordResetToken, passwordResetExpiry, ...safeUser } = user;

    res.status(201).json({ user: safeUser, ...tokens });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const tokens = generateTokens(payload);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.json(tokens);
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        employee: { include: { department: true } },
        vendor: { include: { score: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, refreshToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user;
    res.json(safeUser);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { refreshToken: null },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: req.user!.userId,
        description: `${req.user!.username} logged out`,
      },
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }]
      }
    });

    if (!user) {
      // For security reasons, don't indicate if the user exists or not
      return res.json({ message: 'If that email exists, a reset link has been generated.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry
      }
    });

    // In a real app, send an email here.
    // Since we don't have an SMTP server hooked up, we'll return the token in the response just for the demo.
    res.json({ 
      message: 'If that email exists, a reset link has been generated.',
      _demoToken: resetToken // Exposing for demo UI purposes
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date() // Must not be expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});
