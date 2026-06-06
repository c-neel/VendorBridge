'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Search, ClipboardCheck, Truck, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function GoodsReceiptsPage() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReceipts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchReceipts() {
    try {
      const res = await api.getGoodsReceipts(search ? `search=${search}` : '');
      setReceipts(res.receipts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Goods Receipts (GRN)</h1>
          <p className="text-surface-400 text-sm">Log and inspect incoming vendor deliveries</p>
        </div>
        {user?.role !== 'VENDOR' && (
          <button onClick={() => router.push('/dashboard/goods-receipts/create')} className="btn-primary">
            <Plus className="w-4 h-4" /> Log Delivery
          </button>
        )}
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search receipts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <div className="flex gap-6 px-6 pt-2 border-b border-surface-800/50">
          {['All', 'PENDING_INSPECTION', 'ACCEPTED', 'REJECTED'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'border-brand-500 text-brand-400' 
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }`}
            >
              {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase().replace('_', ' ')} 
              {' '}({tab === 'All' ? receipts.length : receipts.filter((r: any) => r.status === tab).length})
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : receipts.length > 0 ? (
            <div className="divide-y divide-surface-800/50">
              {receipts.filter((r: any) => activeTab === 'All' || r.status === activeTab).map((grn: any) => (
                <div key={grn.id} className="p-6 hover:bg-surface-800/40 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{grn.grnNumber}</span>
                      <span className="text-sm text-surface-400">{formatDate(grn.receivedDate)}</span>
                      <span className={getStatusColor(grn.status)}>{grn.status}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">PO: {grn.purchaseOrder?.poNumber}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-300">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-surface-500" />
                        <span>Delivery Note: {grn.deliveryNoteNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4 text-surface-500" />
                        <span>Accepted: {grn.acceptedQuantity || 0} / Rejected: {grn.rejectedQuantity || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Received By</p>
                      <p className="text-sm font-medium text-white">{grn.receivedBy?.firstName} {grn.receivedBy?.lastName}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => router.push(`/dashboard/goods-receipts/${grn.id}`)} className="flex-1 md:flex-none btn-secondary py-2">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-surface-400">
              <ClipboardCheck className="w-12 h-12 mx-auto text-surface-600 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-1">No Goods Receipts Found</h3>
              <p>Logged deliveries and inspections will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
