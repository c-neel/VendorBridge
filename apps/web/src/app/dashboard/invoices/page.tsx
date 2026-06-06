'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Search, FileText, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchInvoices() {
    try {
      const res = await api.getInvoices(search ? `search=${search}` : '');
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleMatch = async (id: string) => {
    if (!confirm('Are you sure you want to run 3-way matching on this invoice?')) return;
    try {
      await api.runThreeWayMatch(id);
      alert('3-Way Match executed successfully!');
      fetchInvoices();
    } catch (err) {
      alert('Match failed or discrepancies found');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendor Invoices</h1>
          <p className="text-surface-400 text-sm">Manage billing and 3-way matching</p>
        </div>
        {user?.role === 'VENDOR' && (
          <button onClick={() => router.push('/dashboard/invoices/create')} className="btn-primary">
            Submit Invoice
          </button>
        )}
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <div className="flex gap-6 px-6 pt-2 border-b border-surface-800/50">
          {['All', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'].map(tab => (
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
              {' '}({tab === 'All' ? invoices.length : invoices.filter((i: any) => i.status === tab).length})
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : invoices.length > 0 ? (
            <div className="divide-y divide-surface-800/50">
              {invoices.filter((i: any) => activeTab === 'All' || i.status === activeTab).map((inv: any) => (
                <div key={inv.id} className="p-6 hover:bg-surface-800/40 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{inv.invoiceNumber}</span>
                      <span className="text-sm text-surface-400">Due: {formatDate(inv.dueDate)}</span>
                      <span className={getStatusColor(inv.status)}>{inv.status}</span>
                      {inv.isMatched && (
                        <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                          <CheckCircle className="w-3 h-3" /> 3-Way Matched
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white">PO: {inv.purchaseOrder?.poNumber}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-300">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-surface-500" />
                        <span>Vendor: {inv.vendor?.companyName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Grand Total</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(inv.grandTotal)}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => router.push(`/dashboard/invoices/${inv.id}`)} className="flex-1 md:flex-none btn-secondary py-2">
                        View Details
                      </button>
                      
                      {user?.role !== 'VENDOR' && inv.status === 'SUBMITTED' && !inv.isMatched && (
                        <button onClick={() => handleMatch(inv.id)} className="flex-1 md:flex-none btn-primary py-2">
                          Run 3-Way Match
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-surface-400">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-surface-600 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-1">No Invoices Found</h3>
              <p>Submitted vendor invoices will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
