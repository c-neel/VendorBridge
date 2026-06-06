'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Search, FileText, Plus, Package } from 'lucide-react';
import Link from 'next/link';

export default function RFQsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRfqs();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchRfqs() {
    try {
      const res = await api.getRFQs(search ? `search=${search}` : '');
      setRfqs(res.rfqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await api.publishRfq(id);
      fetchRfqs();
    } catch (err) {
      alert('Failed to publish RFQ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Requests for Quotation (RFQs)</h1>
          <p className="text-surface-400 text-sm">Manage vendor sourcing and quotation requests</p>
        </div>
        <Link href="/dashboard/rfqs/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New RFQ
        </Link>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search RFQs by title or number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <div className="flex gap-6 px-6 pt-2 border-b border-surface-800/50">
          {['All', 'DRAFT', 'PUBLISHED', 'CLOSED'].map(tab => (
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
              {' '}({tab === 'All' ? rfqs.length : rfqs.filter((r: any) => r.status === tab).length})
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : rfqs.length > 0 ? (
            <div className="divide-y divide-surface-800/50">
              {rfqs.filter((r: any) => activeTab === 'All' || r.status === activeTab).map((rfq: any) => (
                <div key={rfq.id} className="p-6 hover:bg-surface-800/40 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{rfq.rfqNumber}</span>
                      <span className="text-sm text-surface-400">{formatDate(rfq.createdAt)}</span>
                      <span className={getStatusColor(rfq.status)}>{rfq.status}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{rfq.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-300">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-surface-500" />
                        <span>Qty: {rfq.quantity} {rfq.unitOfMeasure}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-surface-500" />
                        <span>Quotes: {rfq.quotations?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Est. Budget</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(rfq.estimatedBudget)}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {rfq.status === 'DRAFT' && (
                        <button onClick={() => handlePublish(rfq.id)} className="flex-1 md:flex-none btn-primary py-2">
                          Publish RFQ
                        </button>
                      )}
                      <Link href={`/dashboard/rfqs/${rfq.id}`} className="flex-1 md:flex-none btn-secondary py-2 text-center">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-surface-400">
              <FileText className="w-12 h-12 mx-auto text-surface-600 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-1">No RFQs Found</h3>
              <p>Create your first Request for Quotation to start sourcing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
