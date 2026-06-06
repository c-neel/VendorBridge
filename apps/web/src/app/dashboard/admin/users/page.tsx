'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PlusCircle, Search, Filter, Users as UsersIcon, Shield } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatDate, getRoleLabel } from '@/lib/utils';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  
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

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.getUsers(search ? `search=${search}` : '');
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
      // Fallback empty data if endpoint is not fully wired
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'User',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center font-bold text-xs">
            {u.firstName?.[0]}{u.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-surface-200">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-surface-500">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      cell: (u) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
          <Shield className="w-3 h-3" />
          {getRoleLabel(u.role)}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (u) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Joined',
      className: 'text-surface-400',
      cell: (u) => formatDate(u.createdAt)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-surface-400 text-sm">Manage system access, roles, and permissions</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search users by name, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <button className="btn-secondary py-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <DataTable 
          data={users} 
          columns={[
          ...columns,
          { header: 'Actions', className: 'text-right', cell: (u) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => openModal(u)} className="p-1.5 hover:bg-surface-700 text-surface-400 hover:text-white rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-rose-500/20 text-surface-400 hover:text-rose-400 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        ]} 
          loading={loading}
          emptyIcon={UsersIcon}
          emptyTitle="No Users Found"
          emptyDescription="There are no users matching your search criteria."
        />
      </div>

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
  );
}
