'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { CheckCircle, AlertCircle, FileText, Package, Receipt, Printer, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

  async function fetchInvoice(id: string) {
    try {
      const res = await api.getInvoice(id);
      setInvoice(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load invoice details');
      router.push('/dashboard/invoices');
    } finally {
      setLoading(false);
    }
  }

  const handleMatch = async () => {
    try {
      await api.runThreeWayMatch(invoice.id);
      alert('3-Way Match executed successfully!');
      fetchInvoice(invoice.id);
    } catch (err) {
      alert('Match failed or discrepancies found');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=Invoice ${invoice.invoiceNumber}&body=Please find the attached invoice.`;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/invoices" />
      <div className="flex items-center gap-4">
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Invoice {invoice.invoiceNumber}</h1>
            <span className={getStatusColor(invoice.status)}>{invoice.status}</span>
            {invoice.isMatched && (
              <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                <CheckCircle className="w-3 h-3" /> 3-Way Matched
              </span>
            )}
          </div>
          <p className="text-surface-400 text-sm">Due on {formatDate(invoice.dueDate)}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={handlePrint} className="btn-ghost" title="Print Invoice">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} className="btn-ghost" title="Download PDF">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleEmail} disabled={emailSent} className="btn-ghost" title="Email Invoice">
            {emailSent ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4" />}
          </button>
          
          {!invoice.isMatched && invoice.status === 'SUBMITTED' && (
            <button onClick={handleMatch} className="btn-primary">
              Run 3-Way Match
            </button>
          )}
          {invoice.isMatched && invoice.status !== 'PAID' && (
             <button className="btn-success">
               Process Payment
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Invoice Totals</h2>
            <div className="bg-surface-800/50 rounded-xl border border-surface-700 p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-surface-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-surface-300">
                  <span>Tax Amount</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="pt-3 border-t border-surface-700 flex justify-between font-bold text-white text-lg">
                  <span>Grand Total</span>
                  <span className="text-brand-400">{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-6">
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-surface-300 p-4 bg-surface-800/30 rounded-lg">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">3-Way Match Reference</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-brand-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Invoice (Current)</p>
                  <p className="text-sm text-surface-400">{formatCurrency(invoice.grandTotal)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Purchase Order</p>
                  <Link href={`/dashboard/purchase-orders/${invoice.purchaseOrderId}`} className="text-sm text-brand-400 hover:underline">
                    {invoice.purchaseOrder?.poNumber}
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Receipt className="w-4 h-4 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Goods Receipt</p>
                  <p className="text-sm text-surface-400">{invoice.purchaseOrder?.goodsReceipts?.[0]?.grnNumber || 'Pending GRN'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {!invoice.isMatched && invoice.status !== 'DRAFT' && invoice.status !== 'PAID' && invoice.status !== 'APPROVED' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>This invoice has not been matched. Do not issue payment until a 3-Way Match confirms the PO, GRN, and Invoice align.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
