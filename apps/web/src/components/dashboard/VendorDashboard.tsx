'use client';

import { 
  FileText, ShoppingCart, IndianRupee, Clock, ArrowRight, Package
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function VendorDashboard({ data }: { data: any }) {
  const router = useRouter();
  const { stats, activeRFQs, myQuotations, myPOs, vendor } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-6 relative overflow-hidden border border-surface-700 bg-surface-800">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Welcome back, {vendor?.companyName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <p className="text-surface-400 text-sm flex items-center gap-1">Vendor Code: <span className="font-mono text-brand-400 font-medium px-2 py-0.5 rounded bg-brand-500/10">{vendor?.vendorCode}</span></p>
              <p className="text-surface-400 text-sm flex items-center gap-1">Category: <span className="text-surface-200 font-medium">{vendor?.category?.replace('_', ' ') || 'General'}</span></p>
              <p className="text-surface-400 text-sm flex items-center gap-1">Contact: <span className="text-surface-200 font-medium">{vendor?.contactPerson || 'N/A'}</span></p>
              <p className="text-surface-400 text-sm flex items-center gap-1">Email: <span className="text-surface-200 font-medium">{vendor?.contactEmail || 'N/A'}</span></p>
            </div>
          </div>
          {vendor?.score && (
            <div className="flex items-center gap-6 bg-surface-900/80 p-4 rounded-xl border border-surface-700 shadow-sm">
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider mb-1">Trust Score</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold text-emerald-400 leading-none">{Number(vendor.score.trustScore).toFixed(1)}</span>
                  <span className="text-[10px] font-bold text-surface-500 mb-0.5 uppercase">/ 100</span>
                </div>
              </div>
              <div className="w-px h-10 bg-surface-700" />
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider mb-1">On-Time</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold text-brand-400 leading-none">{Number(vendor.score.onTimeDeliveryRate).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => router.push('/dashboard/rfqs')} className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400 transition-colors"><FileText className="w-4 h-4" /></div>
          </div>
          <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">New RFQs</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.activeRFQs}</p>
        </div>
        <div onClick={() => router.push('/dashboard/quotations')} className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-400 transition-colors"><ShoppingCart className="w-4 h-4" /></div>
          </div>
          <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">Quotations Submitted</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.totalQuotations}</p>
        </div>
        <div onClick={() => router.push('/dashboard/purchase-orders')} className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-colors"><Package className="w-4 h-4" /></div>
          </div>
          <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">Active POs</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.totalPOs}</p>
        </div>
        <div onClick={() => router.push('/dashboard/payments')} className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-colors"><Clock className="w-4 h-4" /></div>
          </div>
          <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">Pending Payments</p>
          <p className="text-3xl font-bold text-white tracking-tight">{stats.pendingPayments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active RFQs to bid on */}
        <div className="glass-card flex flex-col border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider">Opportunities (RFQs)</h2>
            <Link href="/dashboard/rfqs" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 uppercase tracking-wider">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 flex-1">
            {activeRFQs?.length > 0 ? (
              <div className="space-y-2">
                {activeRFQs.map((mapping: any) => (
                  <div key={mapping.id} className="p-3 rounded-xl hover:bg-surface-800 border border-transparent hover:border-surface-700 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-semibold text-surface-100">{mapping.rfq.title}</p>
                      <p className="text-[10px] font-medium text-surface-500 mt-1 uppercase tracking-wider">Deadline: {formatDate(mapping.rfq.deadline)}</p>
                    </div>
                    <Link href={`/dashboard/rfqs/${mapping.rfq.id}`} className="px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-xs font-bold text-surface-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500">
                      Submit Quote
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6">
                <FileText className="w-8 h-8 text-surface-600 mb-3" />
                <p className="text-sm font-semibold text-surface-400">No active RFQs at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="glass-card flex flex-col border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider">Recent Purchase Orders</h2>
            <Link href="/dashboard/purchase-orders" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 uppercase tracking-wider">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myPOs?.length > 0 ? myPOs.slice(0, 5).map((po: any) => (
                  <tr key={po.id}>
                    <td className="font-medium text-white">{po.poNumber}</td>
                    <td>{formatDate(po.createdAt)}</td>
                    <td className="font-medium">{formatCurrency(po.grandTotal)}</td>
                    <td><span className={getStatusColor(po.status)}>{po.status}</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-sm font-medium text-surface-500">No purchase orders found</td>
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
