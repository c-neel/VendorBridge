'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/lib/auth-context';

export default function CreateQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfqId = searchParams.get('rfqId');
  const { user } = useAuth();
  
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(!!rfqId);
  const [vendorId, setVendorId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    rfqId: rfqId || '',
    vendorId: '',
    subtotal: '',
    taxPercentage: '18',
    taxAmount: '',
    grandTotal: '',
    validUntil: '',
    paymentTerms: 'Net 30',
    deliveryLeadTime: '',
    notes: ''
  });

  useEffect(() => {
    // Get vendor profile of logged in user
    api.getVendors().then(res => {
      const myVendor = res.vendors.find((v: any) => v.userId === user?.id);
      if (myVendor) {
        setVendorId(myVendor.id);
        setFormData(prev => ({...prev, vendorId: myVendor.id}));
      }
    });

    if (rfqId) {
      fetchRfqDetails(rfqId);
    }
  }, [rfqId, user]);

  async function fetchRfqDetails(id: string) {
    try {
      const res = await api.getRFQ(id);
      setRfq(res);
      
      // Calculate a default validUntil date (e.g. 30 days from now)
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 30);
      
      setFormData(prev => ({
        ...prev,
        validUntil: validDate.toISOString().split('T')[0],
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
      const res = await api.createQuotation(formData);
      alert('Quotation submitted successfully!');
      router.push(`/dashboard/quotations`);
    } catch (err) {
      alert('Failed to submit quotation');
    }
  };

  const handleCalcTotal = () => {
    const sub = parseFloat(formData.subtotal) || 0;
    const taxP = parseFloat(formData.taxPercentage) || 0;
    const taxA = sub * (taxP / 100);
    const grand = sub + taxA;
    
    setFormData(prev => ({
      ...prev,
      taxAmount: taxA.toFixed(2),
      grandTotal: grand.toFixed(2)
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <BackButton fallbackUrl="/dashboard/rfqs" />
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Submit Quotation</h1>
          <p className="text-surface-400 text-sm">Provide your pricing for {rfq?.title || 'this RFQ'}</p>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">RFQ ID</label>
                <input 
                  type="text" 
                  required
                  readOnly={!!rfqId}
                  value={formData.rfqId}
                  onChange={(e) => setFormData({...formData, rfqId: e.target.value})}
                  className={`w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50 ${rfqId ? 'opacity-50 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Subtotal Value</label>
                <input 
                  type="number" 
                  required
                  value={formData.subtotal}
                  onChange={(e) => setFormData({...formData, subtotal: e.target.value})}
                  onBlur={handleCalcTotal}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Tax %</label>
                <input 
                  type="number" 
                  required
                  value={formData.taxPercentage}
                  onChange={(e) => setFormData({...formData, taxPercentage: e.target.value})}
                  onBlur={handleCalcTotal}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Tax Amount</label>
                <input 
                  type="number" 
                  required
                  readOnly
                  value={formData.taxAmount}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-surface-400 cursor-not-allowed" 
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

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Valid Until</label>
                <input 
                  type="date" 
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Delivery Lead Time</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 14 Days from PO"
                  value={formData.deliveryLeadTime}
                  onChange={(e) => setFormData({...formData, deliveryLeadTime: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Notes / Terms</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                  placeholder="Any conditions or remarks..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={!vendorId} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Submit Quotation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
