'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ShieldCheck, User, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApprovals();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchApprovals() {
    try {
      // Removing hardcoded ?status=PENDING so we can show all tabs, and adding search
      const res = await api.getApprovals(search ? `search=${search}` : '');
      setApprovals(res.approvals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await api.approveRequest(id, 'Approved via dashboard');
      else await api.rejectRequest(id, 'Rejected via dashboard');
      fetchApprovals();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
        <p className="text-surface-400 text-sm">Review and action purchase requests requiring your approval</p>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search approvals..." 
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
              {' '}({tab === 'All' ? approvals.length : approvals.filter((a: any) => a.status === tab).length})
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : approvals.length > 0 ? (
            <div className="divide-y divide-surface-800/50">
              {approvals.filter((a: any) => activeTab === 'All' || a.status === activeTab).map((app: any) => (
                <div key={app.id} className="p-6 hover:bg-surface-800/40 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{app.purchaseRequest.prNumber}</span>
                      <span className="text-sm text-surface-400">{formatDate(app.createdAt)}</span>
                      <span className={getStatusColor(app.status)}>{app.status}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{app.purchaseRequest.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-surface-500" />
                        <span>Req by: {app.purchaseRequest.requestedBy.user.firstName} {app.purchaseRequest.requestedBy.user.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-surface-500" />
                        <span>Level {app.approvalLevel}</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        app.approvalType === 'VENDOR_SELECTION' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      }`}>
                        {app.approvalType === 'VENDOR_SELECTION' ? 'FINAL VENDOR SELECTION' : 'INITIAL PR NEED'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Budget Request</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(app.purchaseRequest.estimatedBudget)}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => router.push(`/dashboard/approvals/${app.id}`)} className="flex-1 md:flex-none btn-secondary py-2">
                        View Details
                      </button>
                      {app.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleAction(app.id, 'reject')} className="flex-1 md:flex-none btn-secondary text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 py-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          <button onClick={() => handleAction(app.id, 'approve')} className="flex-1 md:flex-none btn-success py-2">
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-surface-400">
              <ShieldCheck className="w-12 h-12 mx-auto text-surface-600 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-1">No Pending Approvals</h3>
              <p>You have reviewed all purchase requests assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
