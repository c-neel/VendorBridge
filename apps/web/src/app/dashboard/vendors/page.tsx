'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getTrustScoreColor } from '@/lib/utils';
import { Users, Search, Filter, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { VendorForm } from '@/components/dashboard/VendorForm';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchVendors() {
    setLoading(true);
    try {
      const res = await api.getVendors(search ? `search=${search}` : '');
      setVendors(res.vendors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = () => {
    setSelectedVendor(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (vendor: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVendor(vendor);
    setIsDrawerOpen(true);
  };

  const handleDeactivate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to deactivate this vendor?')) {
      try {
        await api.deactivateVendor(id);
        fetchVendors();
      } catch (err) {
        alert('Failed to deactivate vendor');
      }
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Vendor',
      cell: (vendor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center font-bold text-surface-300">
            {vendor.companyName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{vendor.companyName}</p>
            <p className="text-xs text-surface-400">{vendor.vendorCode} • {vendor.category.replace('_', ' ')}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      cell: (vendor) => (
        <div>
          <p className="text-sm text-surface-200">{vendor.contactPerson}</p>
          <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
            <Mail className="w-3 h-3" /> {vendor.contactEmail}
          </div>
        </div>
      )
    },
    {
      header: 'Location',
      cell: (vendor) => (
        <div className="flex items-center gap-1 text-sm text-surface-300">
          <MapPin className="w-3 h-3 text-surface-500" /> {vendor.city || 'N/A'}, {vendor.state || 'N/A'}
        </div>
      )
    },
    {
      header: 'Trust Score',
      cell: (vendor) => {
        const score = vendor.score ? Number(vendor.score.trustScore) : 0;
        const color = getTrustScoreColor(score);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: color, color }}>
              {score}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      cell: (vendor) => (
        <span className={vendor.isActive ? 'badge badge-success' : 'badge badge-danger'}>
          {vendor.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    {
      header: '',
      className: 'text-right',
      cell: (vendor) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => handleEdit(vendor, e)} className="p-1.5 bg-surface-800 hover:bg-brand-500/20 text-surface-400 hover:text-brand-400 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleDeactivate(vendor.id, e)} className="p-1.5 bg-surface-800 hover:bg-rose-500/20 text-surface-400 hover:text-rose-400 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-surface-400 text-sm">Manage supplier profiles and registrations</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Users className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      <div className="glass-card">
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-full w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search bar ..... search by name, gst number, category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        {/* Wireframe Tabs */}
        <div className="flex gap-6 px-6 pt-2 border-b border-surface-800/50">
          <button 
            onClick={() => setActiveTab('All')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'All' ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
          >
            All ({vendors.length})
          </button>
          <button 
            onClick={() => setActiveTab('Active')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Active' ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
          >
            Active ({vendors.filter(v => v.isActive && !v.isBlacklisted).length})
          </button>
          <button 
            onClick={() => setActiveTab('Pending')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Pending' ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
          >
            Pending ({vendors.filter(v => !v.isActive && !v.isBlacklisted).length})
          </button>
          <button 
            onClick={() => setActiveTab('Blocked')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Blocked' ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
          >
            Blocked ({vendors.filter(v => v.isBlacklisted).length})
          </button>
        </div>

        <DataTable 
          data={vendors.filter(v => {
            if (activeTab === 'Active') return v.isActive && !v.isBlacklisted;
            if (activeTab === 'Blocked') return v.isBlacklisted;
            if (activeTab === 'Pending') return !v.isActive && !v.isBlacklisted;
            return true;
          })} 
          columns={columns} 
          loading={loading}
          onRowClick={(vendor) => router.push(`/dashboard/vendors/${vendor.id}`)}
          emptyIcon={Users}
          emptyTitle="No Vendors Found"
          emptyDescription="Get started by onboarding your first vendor."
        />
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedVendor ? "Edit Vendor" : "Onboard Vendor"}
        description={selectedVendor ? "Update vendor details" : "Add a new vendor to your directory"}
        size="lg"
      >
        <VendorForm 
          initialData={selectedVendor} 
          onSuccess={() => {
            setIsDrawerOpen(false);
            fetchVendors();
          }} 
          onCancel={() => setIsDrawerOpen(false)} 
        />
      </Drawer>
    </div>
  );
}
