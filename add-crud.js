const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'apps');

// 1. Backend: Update users.routes.ts to add POST
const usersRoutePath = path.join(baseDir, 'api/src/routes/users.routes.ts');
let usersRoute = fs.readFileSync(usersRoutePath, 'utf8');
if (!usersRoute.includes('usersRouter.post(')) {
  const postCode = `
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
`;
  usersRoute = usersRoute.replace('// PUT /api/users/:id', postCode + '\n// PUT /api/users/:id');
  fs.writeFileSync(usersRoutePath, usersRoute);
}

// 2. Backend: Create departments.routes.ts
const depsRoutePath = path.join(baseDir, 'api/src/routes/departments.routes.ts');
const depsCode = `import { Router } from 'express';
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
`;
fs.writeFileSync(depsRoutePath, depsCode);

// 3. Backend: Register in index.ts
const indexTsPath = path.join(baseDir, 'api/src/index.ts');
let indexTs = fs.readFileSync(indexTsPath, 'utf8');
if (!indexTs.includes('departmentsRouter')) {
  indexTs = indexTs.replace("import { usersRouter } from './routes/users.routes';", "import { usersRouter } from './routes/users.routes';\nimport { departmentsRouter } from './routes/departments.routes';");
  indexTs = indexTs.replace("app.use('/api/users', usersRouter);", "app.use('/api/users', usersRouter);\napp.use('/api/departments', departmentsRouter);");
  fs.writeFileSync(indexTsPath, indexTs);
}

// 4. Frontend: Add api methods to lib/api.ts
const apiPath = path.join(baseDir, 'web/src/lib/api.ts');
let apiFile = fs.readFileSync(apiPath, 'utf8');
if (!apiFile.includes('createUser(')) {
  const usersMethods = `
  async createUser(data: any) { return this.request('/api/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id: string, data: any) { return this.request(\`/api/users/\${id}\`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteUser(id: string) { return this.request(\`/api/users/\${id}\`, { method: 'DELETE' }); }
  
  async createDepartment(data: any) { return this.request('/api/departments', { method: 'POST', body: JSON.stringify(data) }); }
  async updateDepartment(id: string, data: any) { return this.request(\`/api/departments/\${id}\`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteDepartment(id: string) { return this.request(\`/api/departments/\${id}\`, { method: 'DELETE' }); }
`;
  apiFile = apiFile.replace('async getDepartments() {', usersMethods + '\n  async getDepartments() {');
  fs.writeFileSync(apiPath, apiFile);
}

// 5. Frontend: Update admin/users/page.tsx
const usersPagePath = path.join(baseDir, 'web/src/app/dashboard/admin/users/page.tsx');
let usersPage = fs.readFileSync(usersPagePath, 'utf8');
if (!usersPage.includes('isModalOpen')) {
  usersPage = usersPage.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { Dialog } from '@headlessui/react';\nimport { X, Edit, Trash2 } from 'lucide-react';");
  
  const modalCode = `
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'EMPLOYEE', isActive: true });

  const handleSave = async () => {
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
      } else {
        await api.createUser(formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch(err) {
      alert('Failed to deactivate user');
    }
  };

  const openModal = (user: any = null) => {
    setEditingUser(user);
    if(user) {
      setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, password: '', role: user.role, isActive: user.isActive });
    } else {
      setFormData({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'EMPLOYEE', isActive: true });
    }
    setIsModalOpen(true);
  };
`;
  usersPage = usersPage.replace("async function fetchUsers() {", modalCode + "\n  async function fetchUsers() {");
  
  usersPage = usersPage.replace(/<button className="btn-primary">[^<]*<PlusCircle className="w-4 h-4" \/> Add User[^<]*<\/button>/, `<button onClick={() => openModal()} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Add User
        </button>`);

  usersPage = usersPage.replace("columns={columns}", "columns={[\n          ...columns,\n          { header: 'Actions', className: 'text-right', cell: (u) => (\n            <div className=\"flex justify-end gap-2\">\n              <button onClick={() => openModal(u)} className=\"p-1.5 hover:bg-surface-700 text-surface-400 hover:text-white rounded-lg transition-colors\">\n                <Edit className=\"w-4 h-4\" />\n              </button>\n              <button onClick={() => handleDelete(u.id)} className=\"p-1.5 hover:bg-rose-500/20 text-surface-400 hover:text-rose-400 rounded-lg transition-colors\">\n                <Trash2 className=\"w-4 h-4\" />\n              </button>\n            </div>\n          )}\n        ]}");

  const dialogHtml = `
      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full glass-card p-6 border border-surface-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-white">{editingUser ? 'Edit User' : 'Add New User'}</Dialog.Title>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="input-field" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="input-field" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="input-field" placeholder="johndoe" />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">Password</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-field" placeholder="••••••••" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="input-field">
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">Status</label>
                  <select value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="input-field">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <button onClick={handleSave} className="btn-primary w-full py-2.5 mt-4">
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );`;

  usersPage = usersPage.replace("    </div>\n  );\n}", dialogHtml + "\n}");
  fs.writeFileSync(usersPagePath, usersPage);
}

// 6. Frontend: Update admin/departments/page.tsx
const depsPagePath = path.join(baseDir, 'web/src/app/dashboard/admin/departments/page.tsx');
let depsPage = fs.readFileSync(depsPagePath, 'utf8');
if (!depsPage.includes('isModalOpen')) {
  depsPage = depsPage.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { Dialog } from '@headlessui/react';\nimport { X, Edit, Trash2 } from 'lucide-react';");
  
  const modalCodeDeps = `
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', budget: '' });

  const handleSave = async () => {
    try {
      if (editingDep) {
        await api.updateDepartment(editingDep.id, formData);
      } else {
        await api.createDepartment(formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert('Failed to save department');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(id);
      fetchDepartments();
    } catch(err) {
      alert('Failed to delete department');
    }
  };

  const openModal = (dep: any = null) => {
    setEditingDep(dep);
    if(dep) {
      setFormData({ name: dep.name, code: dep.code, budget: dep.budget || '' });
    } else {
      setFormData({ name: '', code: '', budget: '' });
    }
    setIsModalOpen(true);
  };
`;
  depsPage = depsPage.replace("async function fetchDepartments() {", modalCodeDeps + "\n  async function fetchDepartments() {");

  depsPage = depsPage.replace(/<button className="btn-primary">[^<]*<PlusCircle className="w-4 h-4" \/> Add Department[^<]*<\/button>/, `<button onClick={() => openModal()} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Add Department
        </button>`);

  depsPage = depsPage.replace("columns={columns}", "columns={[\n          ...columns,\n          { header: 'Actions', className: 'text-right', cell: (d) => (\n            <div className=\"flex justify-end gap-2\">\n              <button onClick={() => openModal(d)} className=\"p-1.5 hover:bg-surface-700 text-surface-400 hover:text-white rounded-lg transition-colors\">\n                <Edit className=\"w-4 h-4\" />\n              </button>\n              <button onClick={() => handleDelete(d.id)} className=\"p-1.5 hover:bg-rose-500/20 text-surface-400 hover:text-rose-400 rounded-lg transition-colors\">\n                <Trash2 className=\"w-4 h-4\" />\n              </button>\n            </div>\n          )}\n        ]}");

  const dialogHtmlDeps = `
      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full glass-card p-6 border border-surface-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold text-white">{editingDep ? 'Edit Department' : 'Add Department'}</Dialog.Title>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Department Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g. Marketing" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Department Code</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="input-field" placeholder="e.g. MKT" />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Annual Budget (₹)</label>
                <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="input-field" placeholder="e.g. 5000000" />
              </div>

              <button onClick={handleSave} className="btn-primary w-full py-2.5 mt-4">
                {editingDep ? 'Save Changes' : 'Create Department'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );`;

  depsPage = depsPage.replace("    </div>\n  );\n}", dialogHtmlDeps + "\n}");
  fs.writeFileSync(depsPagePath, depsPage);
}

console.log('Successfully added CRUD logic to backend and frontend!');
