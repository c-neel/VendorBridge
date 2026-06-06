'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function NewPurchaseRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT_HARDWARE',
    quantity: 1,
    unitOfMeasure: 'pcs',
    estimatedUnitPrice: 0,
    estimatedBudget: 0,
    priority: 'MEDIUM',
    requiredByDate: '',
    justification: '',
    specifications: '',
    status: 'DRAFT'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updates = { ...prev, [name]: value };
      
      // Auto-calculate budget if quantity or unit price changes
      if (name === 'quantity' || name === 'estimatedUnitPrice') {
        const q = name === 'quantity' ? Number(value) : prev.quantity;
        const p = name === 'estimatedUnitPrice' ? Number(value) : prev.estimatedUnitPrice;
        updates.estimatedBudget = q * p;
      }
      
      return updates;
    });
  };

  const handleSubmit = async (e: React.FormEvent, submitType: 'DRAFT' | 'SUBMITTED') => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submissionData = { ...formData, status: submitType };
      await api.createPurchaseRequest(submissionData);
      router.push('/dashboard/purchase-requests');
    } catch (err: any) {
      setError(err.message || 'Failed to create purchase request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton fallbackUrl="/dashboard/purchase-requests" />
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Purchase Request</h1>
          <p className="text-surface-400 text-sm">Submit a new request for procurement</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => handleSubmit(e, 'SUBMITTED')}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-surface-800 pb-2">Basic Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Request Title <span className="text-rose-500">*</span></label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" placeholder="e.g. MacBook Pro M3 for New Engineering Hire" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Description <span className="text-rose-500">*</span></label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" placeholder="Detailed description of what is needed..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Category <span className="text-rose-500">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500">
                  <option value="IT_SOFTWARE">IT Software</option>
                  <option value="IT_HARDWARE">IT Hardware</option>
                  <option value="OFFICE_SUPPLIES">Office Supplies</option>
                  <option value="SERVICES">Services</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Priority <span className="text-rose-500">*</span></label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-surface-800">
            <h3 className="text-lg font-medium text-white border-b border-surface-800 pb-2">Financials & Quantities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Quantity <span className="text-rose-500">*</span></label>
                <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Unit of Measure</label>
                <input type="text" name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" placeholder="e.g. pcs, licenses, months" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Est. Unit Price (₹) <span className="text-rose-500">*</span></label>
                <input required type="number" min="0" name="estimatedUnitPrice" value={formData.estimatedUnitPrice} onChange={handleChange} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
            
            <div className="bg-surface-800/50 p-4 rounded-lg flex items-center justify-between border border-surface-700">
              <span className="text-surface-300 font-medium">Total Estimated Budget:</span>
              <span className="text-xl font-bold text-white">₹{formData.estimatedBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-surface-800">
            <h3 className="text-lg font-medium text-white border-b border-surface-800 pb-2">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Required By Date <span className="text-rose-500">*</span></label>
              <input required type="date" name="requiredByDate" value={formData.requiredByDate} onChange={handleChange} className="w-full md:w-1/3 bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Business Justification <span className="text-rose-500">*</span></label>
              <textarea required name="justification" value={formData.justification} onChange={handleChange} rows={3} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" placeholder="Why is this purchase necessary for the business?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Technical Specifications (Optional)</label>
              <textarea name="specifications" value={formData.specifications} onChange={handleChange} rows={3} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500" placeholder="Any specific technical requirements, brands, or models preferred..." />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-surface-800">
            <button 
              type="button" 
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              className="btn-secondary px-6 py-2"
            >
              Save as Draft
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary px-8 py-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
