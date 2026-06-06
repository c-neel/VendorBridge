'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PlusCircle, Search, Filter, Building2, Users } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';

export default function DepartmentsManagementPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  
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

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      setDepartments(res.departments || []);
    } catch (err) {
      console.error(err);
      // Dummy data fallback
      setDepartments([
        { id: '1', name: 'Information Technology', code: 'IT', head: { user: { firstName: 'Suresh', lastName: 'Menon' } }, budget: 15000000, employeeCount: 24 },
        { id: '2', name: 'Human Resources', code: 'HR', head: { user: { firstName: 'Anita', lastName: 'Desai' } }, budget: 5000000, employeeCount: 12 },
        { id: '3', name: 'Marketing', code: 'MKT', head: { user: { firstName: 'Priya', lastName: 'Sharma' } }, budget: 25000000, employeeCount: 18 },
        { id: '4', name: 'Administration', code: 'ADM', head: { user: { firstName: 'Rajesh', lastName: 'Kumar' } }, budget: 12000000, employeeCount: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Department',
      cell: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-surface-200">{d.name}</p>
            <p className="text-xs text-surface-500">Code: {d.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Department Head',
      cell: (d) => d.head ? `${d.head.user.firstName} ${d.head.user.lastName}` : <span className="text-surface-500 italic">Not Assigned</span>
    },
    {
      header: 'Headcount',
      cell: (d) => (
        <div className="flex items-center gap-2 text-surface-300">
          <Users className="w-4 h-4 text-surface-500" />
          {d.employeeCount || 0}
        </div>
      )
    },
    {
      header: 'Annual Budget',
      className: 'font-medium text-surface-200',
      cell: (d) => `₹${(d.budget || 0).toLocaleString('en-IN')}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-surface-400 text-sm">Manage organizational structure and budgets</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <button className="btn-secondary py-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <DataTable 
          data={departments} 
          columns={[
          ...columns,
          { header: 'Actions', className: 'text-right', cell: (d) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => openModal(d)} className="p-1.5 hover:bg-surface-700 text-surface-400 hover:text-white rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-rose-500/20 text-surface-400 hover:text-rose-400 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        ]} 
          loading={loading}
          emptyIcon={Building2}
          emptyTitle="No Departments Found"
          emptyDescription="There are no departments matching your criteria."
        />
      </div>

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
  );
}
