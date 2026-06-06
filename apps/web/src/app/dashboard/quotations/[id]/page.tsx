'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { CheckCircle, ShieldCheck, Building2, Package } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/lib/auth-context';

export default function QuotationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  async function fetchQuote(id: string) {
    try {
      const res = await api.getQuotation(id);
      setQuote(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load quotation details');
      router.push('/dashboard/quotations');
    } finally {
      setLoading(false);
    }
  }

  const handleRequestApproval = async () => {
    setIsRequesting(true);
    try {
      await api.requestRfqApproval(quote.rfqId);
      setSuccessMsg('Final approval requested successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
      setQuote({ ...quote, rfq: { ...quote.rfq, status: 'UNDER_REVIEW' } });
    } catch (err) {
      alert('Failed to request approval');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAcceptQuote = async () => {
    setIsRequesting(true);
    try {
      await api.acceptQuotation(quote.id);
      setSuccessMsg('Quotation accepted successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
      setQuote({ ...quote, status: 'ACCEPTED' });
    } catch (err) {
      alert('Failed to accept quotation');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!confirm('Are you sure you want to reject this quote?')) return;
    setIsRequesting(true);
    try {
      await api.rejectQuotation(quote.id);
      setSuccessMsg('Quotation rejected.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setQuote({ ...quote, status: 'REJECTED' });
    } catch (err) {
      alert('Failed to reject quotation');
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/quotations" />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Quotation Details</h1>
            <span className={getStatusColor(quote.status)}>{quote.status}</span>
          </div>
          <p className="text-surface-400 text-sm">Submitted on {formatDate(quote.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {successMsg && (
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               <CheckCircle className="w-4 h-4" /> {successMsg}
             </div>
          )}
          {quote.status === 'SUBMITTED' && user?.role === 'PROCUREMENT_OFFICER' && !successMsg && (
            <>
              <button onClick={handleAcceptQuote} disabled={isRequesting} className="btn-success flex items-center gap-2">
                {isRequesting ? 'Processing...' : 'Accept Quote'}
              </button>
              <button onClick={handleRejectQuote} disabled={isRequesting} className="btn-secondary hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 flex items-center gap-2">
                Reject Quote
              </button>
            </>
          )}
          {quote.status === 'ACCEPTED' && !['UNDER_REVIEW', 'APPROVED'].includes(quote.rfq?.status) && user?.role === 'PROCUREMENT_OFFICER' && !successMsg && (
            <button onClick={handleRequestApproval} disabled={isRequesting} className="btn-primary flex items-center gap-2">
              {isRequesting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />} 
              {isRequesting ? 'Requesting...' : 'Request Final Approval'}
            </button>
          )}
          {quote.status === 'ACCEPTED' && quote.rfq?.status === 'APPROVED' && user?.role === 'PROCUREMENT_OFFICER' && (
             <Link href={`/dashboard/purchase-orders/create?quoteId=${quote.id}`} className="btn-success flex items-center gap-2">
               <Package className="w-4 h-4" /> Generate PO
             </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pricing Breakdown</h2>
            
            <div className="bg-surface-800/50 rounded-xl border border-surface-700 p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between text-surface-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-surface-300">
                  <span>Tax Amount ({quote.taxPercentage}%)</span>
                  <span>{formatCurrency(quote.taxAmount)}</span>
                </div>
                <div className="pt-3 border-t border-surface-700 flex justify-between font-bold text-white text-lg">
                  <span>Grand Total</span>
                  <span className="text-brand-400">{formatCurrency(quote.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-2">Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-surface-400">Valid Until</p>
                  <p className="font-medium text-white">{formatDate(quote.validUntil)}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-400">Payment Terms</p>
                  <p className="font-medium text-white">{quote.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-400">Delivery Lead Time</p>
                  <p className="font-medium text-white">{quote.deliveryLeadTime}</p>
                </div>
              </div>
              
              {quote.notes && (
                <div className="mt-4">
                  <p className="text-sm text-surface-400">Notes</p>
                  <p className="text-surface-300 p-4 bg-surface-800/30 rounded-lg">{quote.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Vendor</h3>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-800 rounded-lg">
                <Building2 className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-medium text-white">{quote.vendor?.companyName}</p>
                <p className="text-sm text-surface-400">{quote.vendor?.vendorCode}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">RFQ Reference</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-surface-400">Title</p>
                <Link href={`/dashboard/rfqs/${quote.rfqId}`} className="text-sm text-brand-400 hover:underline">
                  {quote.rfq?.title}
                </Link>
              </div>
              <div>
                <p className="text-sm text-surface-400">Status</p>
                <p className="text-sm text-white">{quote.rfq?.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
