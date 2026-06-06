import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, adminOnly } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.use(authenticate);

// GET /api/users
usersRouter.get('/', adminOnly, async (req, res) => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (role) where.role = role as string;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit as string),
        select: {
          id: true, firstName: true, lastName: true, username: true,
          email: true, phone: true, role: true, isActive: true,
          avatarUrl: true, lastLoginAt: true, loginCount: true, createdAt: true,
          employee: { select: { employeeId: true, designation: true, department: { select: { name: true } } } },
          vendor: { select: { vendorCode: true, companyName: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page as string), limit: parseInt(limit as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id
usersRouter.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        employee: { include: { department: true } },
        vendor: { include: { score: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash, refreshToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user;
    res.json(safeUser);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


// POST /api/users
usersRouter.post('/', adminOnly, async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, phone, role, isActive } = req.body;
    // VERY BASIC hash for demo
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password || 'Password@123', 10);
    
    const user = await prisma.user.create({
      data: {
        firstName, lastName, email, username, phone, role, isActive,
        passwordHash
      }
    });
    const { passwordHash: _ph, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id
usersRouter.put('/:id', adminOnly, async (req, res) => {
  try {
    const { firstName, lastName, phone, role, isActive, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { firstName, lastName, phone, role, isActive, bio },
    });

    const { passwordHash, refreshToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user;
    res.json(safeUser);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id (soft delete)
usersRouter.delete('/:id', adminOnly, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive: false },
    });
    res.json({ message: 'User deactivated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});
