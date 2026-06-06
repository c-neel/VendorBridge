'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/lib/auth-context';

export default function RFQDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchRfq(params.id as string);
    }
  }, [params.id]);

  async function fetchRfq(id: string) {
    try {
      const res = await api.getRFQ(id);
      setRfq(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load RFQ details');
      router.push('/dashboard/rfqs');
    } finally {
      setLoading(false);
    }
  }

  const handlePublish = async () => {
    try {
      await api.updateRFQStatus(rfq.id, 'PUBLISHED');
      alert('RFQ Published to vendors!');
      fetchRfq(rfq.id);
    } catch (err) {
      alert('Failed to publish RFQ');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!rfq) return null;

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/rfqs" />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{rfq.title}</h1>
            <span className={getStatusColor(rfq.status)}>{rfq.status}</span>
          </div>
          <p className="text-surface-400 text-sm">RFQ: {rfq.rfqNumber} • Created on {formatDate(rfq.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm">
            Download PDF
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm">
            Print
          </button>
          <button onClick={() => window.location.href = `mailto:?subject=RFQ ${rfq.rfqNumber}&body=Please review the attached RFQ details.`} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm">
            Email
          </button>
          {rfq.status === 'DRAFT' && user?.role === 'PROCUREMENT' && (
            <button onClick={handlePublish} className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> Publish RFQ
            </button>
          )}
          {rfq.status === 'PUBLISHED' && user?.role === 'VENDOR' && (
            <Link href={`/dashboard/quotations/create?rfqId=${rfq.id}`} className="btn-success">
              Submit Quotation
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">RFQ Details</h2>
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-surface-200">{rfq.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Submission Deadline</p>
                  <p className="font-medium text-white">{formatDate(rfq.submissionDeadline)}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Expected Delivery</p>
                  <p className="font-medium text-white">{formatDate(rfq.deliveryDate)}</p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Required Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-700/50 text-surface-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/50">
                  {rfq.purchaseRequest?.lineItems?.map((item: any) => (
                    <tr key={item.id} className="text-sm text-surface-300">
                      <td className="py-4 font-medium text-white">{item.description}</td>
                      <td className="py-4 text-right">{item.quantity} {item.unitOfMeasure}</td>
                    </tr>
                  ))}
                  {(!rfq.purchaseRequest?.lineItems || rfq.purchaseRequest?.lineItems.length === 0) && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-surface-500">Items will be imported from Purchase Request</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500">Quotations Received</h3>
              {rfq.quotations?.length > 1 && (
                <Link href={`/dashboard/rfqs/${rfq.id}/compare`} className="text-xs font-medium text-brand-400 hover:text-brand-300 hover:underline bg-brand-500/10 px-2 py-1 rounded-md">
                  Compare
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {rfq.quotations?.length > 0 ? (
                rfq.quotations.map((quote: any) => (
                  <div key={quote.id} className="flex flex-col gap-2 p-3 bg-surface-800/50 rounded-lg border border-surface-700">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-white">{quote.vendor?.companyName}</p>
                      <span className={getStatusColor(quote.status)}>{quote.status}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-brand-400 font-bold">{formatCurrency(quote.grandTotal)}</p>
                      <Link href={`/dashboard/quotations/${quote.id}`} className="text-xs text-surface-400 hover:text-white underline">
                        View Quote
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-surface-400">No quotations received yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
