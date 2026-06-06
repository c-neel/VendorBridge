'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { CreditCard, Building2, Receipt } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPayment(params.id as string);
    }
  }, [params.id]);

  async function fetchPayment(id: string) {
    try {
      const res = await api.getPayment(id);
      setPayment(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load payment details');
      router.push('/dashboard/payments');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/payments" />
      <div className="flex items-center gap-4">
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Payment Receipt</h1>
            <span className={getStatusColor(payment.status)}>{payment.status}</span>
          </div>
          <p className="text-surface-400 text-sm">Ref: {payment.transactionRef || 'Pending'}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={() => window.print()} className="btn-secondary px-4 py-2 flex items-center gap-2">
            Download PDF
          </button>
          <button onClick={() => window.print()} className="btn-secondary px-4 py-2 flex items-center gap-2">
            Print
          </button>
          <button onClick={() => window.location.href = `mailto:?subject=Payment Receipt ${payment.transactionRef || ''}&body=Please find the attached payment receipt.`} className="btn-secondary px-4 py-2 flex items-center gap-2">
            Email Receipt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-surface-700/50">
              <div>
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Amount Paid</p>
                <p className="text-4xl font-bold text-brand-400">{formatCurrency(payment.amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-xl font-medium text-white">{formatDate(payment.paymentDate || payment.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-2">Paid To</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-800 rounded-lg">
                    <Building2 className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{payment.vendor?.companyName}</p>
                    <p className="text-sm text-surface-400">{payment.vendor?.vendorCode}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-2">Method</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-800 rounded-lg">
                    <CreditCard className="w-5 h-5 text-surface-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{payment.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {payment.notes && (
              <div className="mt-8 pt-6 border-t border-surface-700/50">
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-surface-300">{payment.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Invoice Reference</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Receipt className="w-4 h-4 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Invoice Number</p>
                  <Link href={`/dashboard/invoices/${payment.invoiceId}`} className="text-sm text-brand-400 hover:underline">
                    {payment.invoice?.invoiceNumber}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
