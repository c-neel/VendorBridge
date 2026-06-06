'use client';

import { 
  FileText, CheckSquare, Clock, PlusCircle, ArrowRight, XCircle, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function EmployeeDashboard({ data, role }: { data: any, role: string }) {
  const router = useRouter();
  const { stats, requests } = data;
  
  const draftCount = stats?.statusCounts?.DRAFT || 0;
  const pendingCount = (stats?.statusCounts?.SUBMITTED || 0) + (stats?.statusCounts?.UNDER_REVIEW || 0);
  const approvedCount = stats?.statusCounts?.APPROVED || 0;
  const rejectedCount = stats?.statusCounts?.REJECTED || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Requests Overview</h1>
          <p className="text-surface-400 text-sm mt-1">Track your purchase requests</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/purchase-requests/create" className="btn-primary">
            <PlusCircle className="w-4 h-4" /> New Purchase Request
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div onClick={() => router.push('/dashboard/purchase-requests?status=DRAFT')} className="glass-card p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:border-surface-600 transition-colors border border-surface-700">
          <p className="text-3xl font-bold text-white mb-1 tracking-tight">{draftCount}</p>
          <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Draft Requests</p>
        </div>
        
        <div onClick={() => router.push('/dashboard/purchase-requests?status=PENDING')} className="glass-card p-5 flex flex-col justify-center items-center text-center cursor-pointer border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-colors">
          <p className="text-3xl font-bold text-white mb-1 tracking-tight">{pendingCount}</p>
          <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-wider">Pending Approval</p>
        </div>

        <div onClick={() => router.push('/dashboard/purchase-requests?status=APPROVED')} className="glass-card p-5 flex flex-col justify-center items-center text-center cursor-pointer border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 transition-colors">
          <p className="text-3xl font-bold text-emerald-400 mb-1 tracking-tight">{approvedCount}</p>
          <p className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-wider">Approved Requests</p>
        </div>

        <div onClick={() => router.push('/dashboard/purchase-requests?status=REJECTED')} className="glass-card p-5 flex flex-col justify-center items-center text-center cursor-pointer border border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 transition-colors">
          <p className="text-3xl font-bold text-rose-400 mb-1 tracking-tight">{rejectedCount}</p>
          <p className="text-[11px] font-bold text-rose-500/80 uppercase tracking-wider">Rejected Requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Purchase Requests Table */}
        <div className="lg:col-span-3 glass-card flex flex-col border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider">My Recent Purchase Requests</h2>
            <Link href="/dashboard/purchase-requests" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 uppercase tracking-wider">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="table-premium w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4">PR Number</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4 text-right">Estimated Budget</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests && requests.length > 0 ? (
                  requests.slice(0, 10).map((req: any) => (
                    <tr key={req.id} className="border-b border-surface-800/50 hover:bg-surface-800/30 cursor-pointer" onClick={() => router.push(`/dashboard/purchase-requests/${req.id}`)}>
                      <td className="px-6 py-4 font-medium text-white">{req.prNumber}</td>
                      <td className="px-6 py-4 text-surface-300">{req.title}</td>
                      <td className="px-6 py-4 text-surface-400">{formatDate(req.createdAt)}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(req.estimatedBudget)}</td>
                      <td className="px-6 py-4"><span className={getStatusColor(req.status)}>{req.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-surface-500">
                      You haven't submitted any purchase requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

