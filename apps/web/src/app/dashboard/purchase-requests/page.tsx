'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import { PlusCircle, Search, Filter, FileText } from 'lucide-react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/DataTable';

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await api.getPurchaseRequests(search ? `search=${search}` : '');
      setRequests(res.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'PR Number',
      className: 'font-medium text-white',
      accessorKey: 'prNumber'
    },
    {
      header: 'Title & Dept',
      cell: (pr) => (
        <div>
          <p className="text-surface-200 font-medium truncate max-w-[200px]">{pr.title}</p>
          <p className="text-xs text-surface-500">{pr.department?.name}</p>
        </div>
      )
    },
    {
      header: 'Requester',
      cell: (pr) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold border border-surface-700">
            {pr.requestedBy?.user?.firstName?.[0]}{pr.requestedBy?.user?.lastName?.[0]}
          </div>
          <div>
            <span className="text-sm font-medium block">{pr.requestedBy?.user?.firstName} {pr.requestedBy?.user?.lastName}</span>
            <span className="text-[10px] text-surface-500 uppercase tracking-wider">{pr.requestedBy?.user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Estimated Budget',
      className: 'font-medium text-surface-200',
      cell: (pr) => formatCurrency(pr.estimatedBudget)
    },
    {
      header: 'Priority',
      cell: (pr) => <span className={getPriorityColor(pr.priority)}>{pr.priority}</span>
    },
    {
      header: 'Status',
      cell: (pr) => <span className={getStatusColor(pr.status)}>{pr.status}</span>
    },
    {
      header: 'Date',
      className: 'text-surface-400',
      cell: (pr) => formatDate(pr.createdAt)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Requests</h1>
          <p className="text-surface-400 text-sm">Manage and track all internal procurement requests</p>
        </div>
        <Link href="/dashboard/purchase-requests/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Create Request
        </Link>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search by PR number or title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <div className="flex gap-6 px-6 pt-2 border-b border-surface-800/50">
          {['All', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'border-brand-500 text-brand-400' 
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }`}
            >
              {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} 
              {' '}({tab === 'All' ? requests.length : requests.filter(r => r.status === tab).length})
            </button>
          ))}
        </div>

        <DataTable 
          data={activeTab === 'All' ? requests : requests.filter(r => r.status === activeTab)} 
          columns={columns} 
          loading={loading}
          onRowClick={(pr) => router.push(`/dashboard/purchase-requests/${pr.id}`)}
          emptyIcon={FileText}
          emptyTitle="No Purchase Requests Found"
          emptyDescription="There are no purchase requests matching your criteria."
        />
      </div>
    </div>
  );
}
