'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function CreateGoodsReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get('poId');
  
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(!!poId);
  
  const [formData, setFormData] = useState({
    purchaseOrderId: poId || '',
    vendorId: '',
    deliveryNoteNumber: '',
    quantityOrdered: 0,
    quantityReceived: 0,
    quantityAccepted: 0,
    quantityRejected: 0,
    condition: 'GOOD',
    inspectionNotes: ''
  });

  useEffect(() => {
    if (poId) {
      fetchPoDetails(poId);
    }
  }, [poId]);

  async function fetchPoDetails(id: string) {
    try {
      const res = await api.getPurchaseOrder(id);
      setPo(res);
      // Auto-calculate ordered qty based on line items
      const totalOrdered = res.lineItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      setFormData(prev => ({
        ...prev,
        vendorId: res.vendorId,
        quantityOrdered: totalOrdered,
        quantityReceived: totalOrdered,
        quantityAccepted: totalOrdered,
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
      await api.createGoodsReceipt(formData);
      alert('Goods Receipt logged successfully!');
      router.push('/dashboard/goods-receipts');
    } catch (err) {
      alert('Failed to log goods receipt');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <BackButton fallbackUrl="/dashboard/goods-receipts" />
      <div className="flex items-center gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-white">Log Goods Receipt (GRN)</h1>
          <p className="text-surface-400 text-sm">Inspect and receive incoming delivery</p>
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
                <label className="block text-sm font-medium text-surface-300 mb-1">Purchase Order ID</label>
                <input 
                  type="text" 
                  required
                  value={formData.purchaseOrderId}
                  onChange={(e) => setFormData({...formData, purchaseOrderId: e.target.value})}
                  onBlur={(e) => {
                    if (e.target.value !== poId) {
                      setLoading(true);
                      fetchPoDetails(e.target.value);
                    }
                  }}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Delivery Note Number (Optional)</label>
                <input 
                  type="text" 
                  value={formData.deliveryNoteNumber}
                  onChange={(e) => setFormData({...formData, deliveryNoteNumber: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Quantity Ordered</label>
                <input 
                  type="number" 
                  disabled
                  value={formData.quantityOrdered}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-surface-400 cursor-not-allowed" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Quantity Received</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.quantityReceived}
                  onChange={(e) => {
                    const received = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      quantityReceived: received,
                      quantityAccepted: received - formData.quantityRejected
                    })
                  }}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-400 mb-1">Quantity Rejected</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max={formData.quantityReceived}
                  value={formData.quantityRejected}
                  onChange={(e) => {
                    const rejected = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      quantityRejected: rejected,
                      quantityAccepted: formData.quantityReceived - rejected
                    })
                  }}
                  className="w-full bg-surface-800/50 border border-rose-500/50 rounded-lg px-4 py-2 text-rose-400 focus:border-rose-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1">Quantity Accepted</label>
                <input 
                  type="number" 
                  disabled
                  value={formData.quantityAccepted}
                  className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 text-emerald-400 cursor-not-allowed" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                >
                  <option value="GOOD">Good / Intact</option>
                  <option value="DAMAGED">Damaged / Defective</option>
                  <option value="PARTIAL_DAMAGE">Partial Damage</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-300 mb-1">Inspection Notes</label>
                <textarea 
                  rows={3}
                  value={formData.inspectionNotes}
                  onChange={(e) => setFormData({...formData, inspectionNotes: e.target.value})}
                  className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50"
                  placeholder="Enter details about condition, reason for rejection, etc."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={!po} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Goods Receipt
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
