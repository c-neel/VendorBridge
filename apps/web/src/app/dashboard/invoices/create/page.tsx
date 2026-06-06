'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    subtotal: '',
    taxAmount: '',
    grandTotal: '',
    dueDate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInvoice(formData);
      alert('Invoice submitted successfully!');
      router.push('/dashboard/invoices');
    } catch (err) {
      alert('Failed to submit invoice');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <BackButton fallbackUrl="/dashboard/invoices" />
      <div className="flex items-center gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-white">Submit Invoice</h1>
          <p className="text-surface-400 text-sm">Create a billing invoice against a Purchase Order</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-1">Purchase Order ID</label>
              <input 
                type="text" 
                required
                value={formData.purchaseOrderId}
                onChange={(e) => setFormData({...formData, purchaseOrderId: e.target.value})}
                className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Subtotal</label>
              <input 
                type="number" 
                required
                value={formData.subtotal}
                onChange={(e) => setFormData({...formData, subtotal: e.target.value})}
                className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Tax Amount</label>
              <input 
                type="number" 
                required
                value={formData.taxAmount}
                onChange={(e) => setFormData({...formData, taxAmount: e.target.value})}
                className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Grand Total</label>
              <input 
                type="number" 
                required
                value={formData.grandTotal}
                onChange={(e) => setFormData({...formData, grandTotal: e.target.value})}
                className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg px-4 py-2 text-brand-400 focus:border-brand-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Due Date</label>
              <input 
                type="date" 
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-brand-500/50" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-1">Notes</label>
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
              <Save className="w-4 h-4" /> Submit Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
