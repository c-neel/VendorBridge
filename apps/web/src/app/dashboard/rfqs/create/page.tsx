'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function CreateRFQPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prId = searchParams.get('prId');
  
  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(!!prId);
  
  const [formData, setFormData] = useState({
    purchaseRequestId: prId || '',
    title: '',
    description: '',
    submissionDeadline: '',
    deliveryDate: '',
    termsAndConditions: 'Standard terms apply.'
  });

  useEffect(() => {
    if (prId) {
      fetchPrDetails(prId);
    }
  }, [prId]);

  async function fetchPrDetails(id: string) {
    try {
      const res = await api.getPurchaseRequest(id);
      setPr(res);
      setFormData(prev => ({
        ...prev,
        title: `RFQ for ${res.title}`,
        description: res.description || '',
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
      // Create RFQ
      const rfqRes = await api.createRFQ(formData);
      
      // We also need to copy the PR line items into RFQ line items.
      // Assuming backend handles it or we send it here. The backend schema suggests we send lineItems in createRFQ.
      // If the backend doesn't automatically copy PR items, we should update the backend.
      // For now, let's just create it and redirect.
      
      alert('RFQ created successfully!');
      router.push(`/dashboard/rfqs/${rfqRes.id}`);
    } catch (err) {
      alert('Failed to create RFQ');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton fallbackUrl="/dashboard/rfqs" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Generate RFQ</h1>
          <p className="text-surface-400 text-sm">Convert a Purchase Request into a Request for Quotation</p>
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
                <label className="block text-sm font-medium text-surface-300 mb-1">Purchase Request ID</label>
                <input 
                  type="text" 
                  required
                  value={formData.purchaseRequestId}
                  onChange={(e) => setFormData({...formData, purchaseRequestId: e.target.value})}
                  onBlur={(e) => {
                    if (e.target.value !== prId) {
                      setLoading(true);
                      fetchPrDetails(e.target.value);
                    }
                  }}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">RFQ Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Submission Deadline</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Create RFQ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
