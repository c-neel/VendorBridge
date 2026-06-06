'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle2, AlertCircle, TrendingDown, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/lib/auth-context';

export default function CompareQuotationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchComparison(params.id as string);
    }
  }, [params.id]);

  async function fetchComparison(id: string) {
    try {
      const res = await api.compareQuotations(id);
      setData(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load quotation comparison');
      router.push(`/dashboard/rfqs/${id}`);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectVendor = async (quotationId: string) => {
    if (!confirm('Are you sure you want to select this vendor? This will request final manager approval.')) return;
    setProcessing(true);
    try {
      await api.updateQuotationStatus(quotationId, 'ACCEPTED');
      // Request approval for RFQ
      await api.requestRfqApproval(params.id as string);
      alert('Vendor selected! Sent to Manager for final approval.');
      router.push(`/dashboard/rfqs/${params.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to select vendor');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.quotations || data.quotations.length === 0) {
    return (
    <div className="space-y-6">
        <BackButton fallbackUrl={`/dashboard/rfqs/${params.id}`} label="Back to RFQ" />
        <div className="glass-card p-12 text-center border border-surface-700">
          <Shield className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">No Quotations to Compare</h2>
          <p className="text-sm font-medium text-surface-400">Waiting for vendors to submit their quotes for this RFQ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl={`/dashboard/rfqs/${params.id}`} label="Back to RFQ" />
      <div className="flex items-center gap-4 border-b border-surface-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Compare Quotations</h1>
          <p className="text-surface-400 text-sm mt-1">Evaluating {data.quotations.length} vendors for RFQ: <span className="text-brand-400 font-mono px-1.5 py-0.5 rounded bg-brand-500/10 ml-1">{data.rfq.rfqNumber}</span></p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-surface-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-700 bg-surface-800/50">
                <th className="p-5 text-[10px] font-bold text-surface-400 uppercase tracking-wider w-48 sticky left-0 bg-surface-800/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Comparison Criteria</th>
                {data.quotations.map((quote: any) => (
                  <th key={quote.id} className="p-5 text-center border-l border-surface-700/50 min-w-[280px] relative">
                    {quote.isAiRecommended && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500 border border-brand-400 text-white text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Sparkles className="w-3 h-3" /> AI Recommended
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-white tracking-tight mt-2">{quote.vendor.companyName}</h3>
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mt-1">Vendor Score: {quote.vendor.score?.trustScore || 'N/A'}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {/* Financials */}
              <tr className="hover:bg-surface-800/20 transition-colors">
                <td className="p-5 text-sm font-semibold text-surface-200 sticky left-0 bg-surface-900/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Grand Total</td>
                {data.quotations.map((quote: any) => (
                  <td key={quote.id} className={`p-5 text-center border-l border-surface-700/50 text-xl font-bold tracking-tight ${quote.grandTotal === Math.min(...data.quotations.map((q:any)=>q.grandTotal)) ? 'text-emerald-400' : 'text-white'}`}>
                    {formatCurrency(quote.grandTotal)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-surface-800/20 transition-colors">
                <td className="p-5 text-xs font-semibold text-surface-400 sticky left-0 bg-surface-900/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Tax Breakdown</td>
                {data.quotations.map((quote: any) => (
                  <td key={quote.id} className="p-5 text-center border-l border-surface-700/50 text-xs font-medium text-surface-400">
                    {quote.taxPercentage}% ({formatCurrency(quote.taxAmount)})
                  </td>
                ))}
              </tr>

              {/* Delivery & Warranty */}
              <tr className="hover:bg-surface-800/20 transition-colors">
                <td className="p-5 text-sm font-semibold text-surface-200 sticky left-0 bg-surface-900/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Delivery Schedule</td>
                {data.quotations.map((quote: any) => (
                  <td key={quote.id} className="p-5 text-center border-l border-surface-700/50">
                    <p className="text-sm font-bold text-white">{quote.deliveryDays} Days</p>
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mt-1">{formatDate(quote.deliveryDate)}</p>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-surface-800/20 transition-colors">
                <td className="p-5 text-sm font-semibold text-surface-200 sticky left-0 bg-surface-900/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Warranty Period</td>
                {data.quotations.map((quote: any) => (
                  <td key={quote.id} className="p-5 text-center border-l border-surface-700/50 text-sm font-medium text-surface-300">
                    {quote.warrantyMonths ? `${quote.warrantyMonths} Months` : 'None specified'}
                  </td>
                ))}
              </tr>

              {/* Compliance */}
              <tr className="hover:bg-surface-800/20 transition-colors">
                <td className="p-5 text-sm font-semibold text-surface-200 sticky left-0 bg-surface-900/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Compliance Status</td>
                {data.quotations.map((quote: any) => (
                  <td key={quote.id} className="p-5 text-center border-l border-surface-700/50">
                    {quote.technicalCompliance ? (
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider w-full max-w-[160px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider w-full max-w-[160px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Partial
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* AI Reasoning */}
              <tr className="hover:bg-surface-800/20 transition-colors">
                <td className="p-5 text-sm font-semibold text-surface-200 sticky left-0 bg-surface-900/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">AI Analysis</td>
                {data.quotations.map((quote: any) => (
                  <td key={quote.id} className="p-5 border-l border-surface-700/50">
                    <div className="text-xs font-medium text-surface-400 leading-relaxed max-w-[300px] mx-auto text-center">
                      {quote.aiReasoning || 'No AI analysis available for this quotation.'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              {user?.role === 'PROCUREMENT_OFFICER' && (
                <tr className="bg-surface-800/30">
                  <td className="p-5 font-semibold text-surface-200 sticky left-0 bg-surface-800/95 backdrop-blur z-10 shadow-[1px_0_0_0_#1e293b]">Final Decision</td>
                  {data.quotations.map((quote: any) => (
                    <td key={quote.id} className="p-5 text-center border-l border-surface-700/50">
                      <button 
                        onClick={() => handleSelectVendor(quote.id)}
                        disabled={processing}
                        className={quote.isAiRecommended ? "btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider" : "btn-secondary w-full py-2.5 text-xs font-bold uppercase tracking-wider"}
                      >
                        {processing ? 'Processing...' : 'Award Contract'}
                      </button>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
