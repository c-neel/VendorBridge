'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Save, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function ProcessPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(!!invoiceId);
  
  const [formData, setFormData] = useState({
    invoiceId: invoiceId || '',
    vendorId: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    transactionRef: '',
    notes: ''
  });

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails(invoiceId);
    }
  }, [invoiceId]);

  async function fetchInvoiceDetails(id: string) {
    try {
      const res = await api.getInvoice(id);
      setInvoice(res);
      setFormData(prev => ({
        ...prev,
        vendorId: res.vendorId,
        amount: res.grandTotal
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createPayment(formData);
      alert('Payment processed successfully!');
      router.push(`/dashboard/payments/${res.id}`);
    } catch (err) {
      alert('Failed to process payment');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <BackButton fallbackUrl="/dashboard/payments" />
      <div className="flex items-center gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-white">Process Payment</h1>
          <p className="text-surface-400 text-sm">Issue payment for a matched vendor invoice</p>
        </div>
      </div>

      {invoice && !invoice.isMatched && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm mb-6">
          <strong>Warning:</strong> This invoice has not passed the 3-Way Match process. Payment is not recommended until matched.
        </div>
      )}

      {invoice && invoice.isMatched && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm mb-6">
          <ShieldCheck className="w-5 h-5" />
          <span>3-Way Match Verified. Invoice is cleared for payment.</span>
        </div>
      )}

      <div className="glass-card p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Invoice ID</label>
                <input 
                  type="text" 
                  required
                  readOnly={!!invoiceId}
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({...formData, invoiceId: e.target.value})}
                  className={`w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50 ${invoiceId ? 'opacity-50 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-400 mb-1">Payment Amount</label>
                <input 
                  type="number" 
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg px-4 py-2 text-brand-400 font-bold focus:border-brand-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Payment Method</label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                >
                  <option value="Bank Transfer">Bank Transfer (ACH/Wire)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Transaction Reference (TxID/Check #)</label>
                <input 
                  type="text" 
                  required
                  value={formData.transactionRef}
                  onChange={(e) => setFormData({...formData, transactionRef: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Internal Notes</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Issue Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
