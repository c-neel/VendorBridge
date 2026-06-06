'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Search, FileSpreadsheet, Building2, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function QuotationsPage() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchQuotations();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchQuotations() {
    try {
      const res = await api.getQuotations(search ? `search=${search}` : '');
      setQuotations(res.quotations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAccept = async (id: string) => {
    if (!confirm('Are you sure you want to accept this quotation?')) return;
    try {
      await api.acceptQuotation(id);
      setQuotations(quotations.map((q: any) => q.id === id ? { ...q, status: 'ACCEPTED' } : q));
    } catch (err) {
      alert('Failed to accept quotation');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this quotation?')) return;
    try {
      await api.rejectQuotation(id);
      setQuotations(quotations.map((q: any) => q.id === id ? { ...q, status: 'REJECTED' } : q));
    } catch (err) {
      alert('Failed to reject quotation');
    }
  };

  const handleRequestApproval = async (id: string, rfqId: string) => {
    try {
      await api.requestRfqApproval(rfqId);
      alert('Approval requested successfully!');
      setQuotations(quotations.map((q: any) => q.id === id ? { ...q, rfq: { ...q.rfq, status: 'UNDER_REVIEW' } } : q));
    } catch (err) {
      alert('Failed to request approval');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quotations</h1>
        <p className="text-surface-400 text-sm">Review vendor submissions and pricing</p>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-surface-800/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search quotations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800/50 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-sm text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        <div className="flex gap-6 px-6 pt-2 border-b border-surface-800/50">
          {['All', 'SUBMITTED', 'ACCEPTED', 'REJECTED'].map(tab => (
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
              {' '}({tab === 'All' ? quotations.length : quotations.filter((q: any) => q.status === tab).length})
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : quotations.length > 0 ? (
            <div className="divide-y divide-surface-800/50">
              {quotations.filter((q: any) => activeTab === 'All' || q.status === activeTab).map((quote: any) => (
                <div key={quote.id} className="p-6 hover:bg-surface-800/40 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{quote.quotationNumber}</span>
                      <span className="text-sm text-surface-400">{formatDate(quote.createdAt)}</span>
                      <span className={getStatusColor(quote.status)}>{quote.status}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">RFQ: {quote.rfq.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-surface-500" />
                        <span>Vendor: {quote.vendor.companyName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-surface-500" />
                        <span>Delivery: {quote.deliveryDays} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Grand Total</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(quote.grandTotal)}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => router.push(`/dashboard/quotations/${quote.id}`)} className="flex-1 md:flex-none btn-secondary py-2">
                        View Details
                      </button>
                      
                      {user?.role !== 'VENDOR' && quote.status === 'SUBMITTED' && (
                        <>
                          <button onClick={() => handleAccept(quote.id)} className="flex-1 md:flex-none btn-success py-2">
                            Accept Quote
                          </button>
                          <button onClick={() => handleReject(quote.id)} className="flex-1 md:flex-none btn-secondary hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 py-2">
                            Reject
                          </button>
                        </>
                      )}
                      
                      {user?.role !== 'VENDOR' && quote.status === 'ACCEPTED' && quote.rfq?.status !== 'UNDER_REVIEW' && quote.rfq?.status !== 'APPROVED' && (
                        <button onClick={() => handleRequestApproval(quote.id, quote.rfqId)} className="flex-1 md:flex-none btn-primary py-2">
                          Request Final Approval
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
              <h3 className="text-lg font-medium text-white mb-1">No Quotations Found</h3>
              <p>Quotations submitted by vendors will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
