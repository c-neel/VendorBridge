'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(!!quoteId);
  
  const [formData, setFormData] = useState({
    purchaseRequestId: '',
    rfqId: '',
    quotationId: quoteId || '',
    vendorId: '',
    subtotal: '',
    taxPercentage: '18',
    taxAmount: '',
    grandTotal: '',
    deliveryDate: '',
    deliveryAddress: 'Main Warehouse',
    paymentTerms: '',
    termsAndConditions: 'Standard Terms & Conditions'
  });

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetails(quoteId);
    }
  }, [quoteId]);

  async function fetchQuoteDetails(id: string) {
    try {
      const res = await api.getQuotation(id);
      setQuote(res);
      setFormData(prev => ({
        ...prev,
        vendorId: res.vendorId,
        rfqId: res.rfqId,
        purchaseRequestId: res.rfq?.purchaseRequestId || '',
        subtotal: res.subtotal,
        taxPercentage: res.taxPercentage,
        taxAmount: res.taxAmount,
        grandTotal: res.grandTotal,
        paymentTerms: res.paymentTerms,
        deliveryDate: res.rfq?.deliveryDate?.split('T')[0] || ''
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
      const res = await api.createPurchaseOrder(formData);
      alert('Purchase Order generated successfully!');
      router.push(`/dashboard/purchase-orders/${res.id}`);
    } catch (err) {
      alert('Failed to generate Purchase Order');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <BackButton fallbackUrl="/dashboard/purchase-orders" />
      <div className="flex items-center gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Purchase Order</h1>
          <p className="text-surface-400 text-sm">Convert an approved Quotation into an official PO</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Quotation ID</label>
                <input 
                  type="text" 
                  required
                  readOnly
                  value={formData.quotationId}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-surface-400 cursor-not-allowed" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Delivery Address</label>
                <input 
                  type="text" 
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Expected Delivery Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-400 mb-1">Grand Total</label>
                <input 
                  type="number" 
                  required
                  readOnly
                  value={formData.grandTotal}
                  className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg px-4 py-2 text-brand-400 font-bold cursor-not-allowed" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Terms and Conditions</label>
                <textarea 
                  rows={3}
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({...formData, termsAndConditions: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Issue Purchase Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
