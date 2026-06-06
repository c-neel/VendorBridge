'use client';

import { 
  FileText, ShoppingCart, FileSpreadsheet, Package, 
  TrendingUp, Activity, ArrowRight, Clock, Building2, ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusColor, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function ProcurementDashboard({ data }: { data: any }) {
  const router = useRouter();
  const { stats, openRFQs, recentPOs, recentQuotations } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Procurement Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">Manage sourcing, quotations, and purchase orders</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 shadow-sm">
          <div className="flex flex-col justify-center text-right">
            <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider leading-none mb-1">Approved PRs Ready</p>
            <p className="text-sm font-semibold text-white leading-none">{stats?.approvedPRsReady || 0} Pending Actions</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Approved PRs" value={stats?.approvedPRsReady || 0} icon={FileText} color="#3B82F6" onClick={() => router.push('/dashboard/purchase-requests?status=APPROVED')} />
        <StatCard title="Active RFQs" value={stats?.openRFQs || 0} icon={Package} color="#F59E0B" onClick={() => router.push('/dashboard/rfqs')} />
        <StatCard title="New Quotations" value={stats?.newQuotations || 0} icon={FileSpreadsheet} color="#10B981" onClick={() => router.push('/dashboard/quotations')} />
        <StatCard title="Recent POs" value={stats?.recentPOsCount || 0} icon={ShoppingCart} color="#8B5CF6" onClick={() => router.push('/dashboard/purchase-orders')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <div className="lg:col-span-2 glass-card flex flex-col border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              New Quotations
            </h2>
            <button onClick={() => router.push('/dashboard/quotations')} className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {recentQuotations?.length > 0 ? (
              <div className="space-y-3">
                {recentQuotations.map((quote: any) => (
                  <div key={quote.id} className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-800 transition-colors flex items-center justify-between gap-4 cursor-pointer" onClick={() => router.push(`/dashboard/quotations/${quote.id}`)}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{quote.quotationNumber}</span>
                        <span className="text-xs text-surface-400">{formatDateTime(quote.submittedAt)}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">RFQ: {quote.rfq?.rfqNumber}</p>
                      <p className="text-xs text-surface-400 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> Vendor: {quote.vendor?.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-white mb-1">{formatCurrency(quote.grandTotal)}</p>
                       <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase", 
                         quote.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''
                       )}>
                         {quote.status}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <ShieldCheck className="w-12 h-12 text-emerald-500/40 mb-3" />
                <p className="text-sm font-semibold text-surface-300">No New Quotations</p>
                <p className="text-xs text-surface-500 mt-1">Vendors haven't submitted any quotes recently.</p>
              </div>
            )}
          </div>
        </div>

        {/* Open RFQs List */}
        <div className="lg:col-span-1 glass-card border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              Active RFQs
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {openRFQs?.length > 0 ? openRFQs.map((rfq: any) => (
                <div key={rfq.id} className="flex flex-col gap-1 pb-4 border-b border-surface-800 last:border-0 last:pb-0" onClick={() => router.push(`/dashboard/rfqs/${rfq.id}`)}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-surface-200">{rfq.rfqNumber}</span>
                    <span className="text-[10px] text-surface-500">{formatDateTime(rfq.createdAt)}</span>
                  </div>
                  <p className="text-sm text-white truncate">{rfq.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={getStatusColor(rfq.status)}>{rfq.status}</span>
                    <span className="text-xs font-medium text-brand-400">{rfq.quotations?.length || 0} Quotes</span>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-6 text-surface-400 text-sm">No active RFQs at the moment.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color = '#3B82F6', onClick }: any) {
  return (
    <div className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg border border-surface-800 transition-colors" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
