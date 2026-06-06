import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, adminOnly } from '../middleware/auth';

export const departmentsRouter = Router();
departmentsRouter.use(authenticate);

// GET /api/departments
departmentsRouter.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { head: { include: { user: true } }, _count: { select: { employees: true } } }
    });
    
    const formatted = departments.map(d => ({
      ...d,
      employeeCount: d._count.employees
    }));
    res.json({ departments: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// POST /api/departments
departmentsRouter.post('/', adminOnly, async (req, res) => {
  try {
    const { name, code, budget, headId } = req.body;
    // Assuming organizationId is available, grab first for demo
    const org = await prisma.organization.findFirst();
    
    const dep = await prisma.department.create({
      data: {
        name, code, budget: budget ? Number(budget) : null,
        organizationId: org?.id || 'demo-org-id',
        headId: headId || null
      }
    });
    res.json(dep);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// PUT /api/departments/:id
departmentsRouter.put('/:id', adminOnly, async (req, res) => {
  try {
    const { name, code, budget, headId } = req.body;
    const dep = await prisma.department.update({
      where: { id: req.params.id },
      data: { name, code, budget: budget ? Number(budget) : null, headId: headId || null }
    });
    res.json(dep);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// DELETE /api/departments/:id
departmentsRouter.delete('/:id', adminOnly, async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});
