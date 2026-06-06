import { useState } from 'react';
import { api } from '@/lib/api';

interface VendorFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VendorForm({ initialData, onSuccess, onCancel }: VendorFormProps) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    contactPerson: initialData?.contactPerson || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    category: initialData?.category || 'IT_SOFTWARE',
    gstNumber: initialData?.gstNumber || '',
    panNumber: initialData?.panNumber || '',
    addressLine1: initialData?.addressLine1 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData?.id) {
        await api.updateVendor(initialData.id, formData);
      } else {
        await api.createVendor(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-surface-400 font-medium mb-1">Company Name</label>
          <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" placeholder="e.g. Acme Corp" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-surface-400 font-medium mb-1">Contact Person</label>
            <input required type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-surface-400 font-medium mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500">
              <option value="IT_SOFTWARE">IT Software</option>
              <option value="IT_HARDWARE">IT Hardware</option>
              <option value="SERVICES">Services</option>
              <option value="OFFICE_SUPPLIES">Office Supplies</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-surface-400 font-medium mb-1">Email Address</label>
            <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-surface-400 font-medium mb-1">Phone Number</label>
            <input required type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-surface-400 font-medium mb-1">GST Number</label>
            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-surface-400 font-medium mb-1">PAN Number</label>
            <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-surface-400 font-medium mb-1">Address</label>
          <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 mb-2" placeholder="Street Address" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" placeholder="City" />
            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-surface-800 border border-surface-700 text-surface-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500" placeholder="State" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-surface-800">
        <button type="button" onClick={onCancel} className="btn-secondary py-2 px-4">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 min-w-[120px]">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            initialData?.id ? 'Update Vendor' : 'Onboard Vendor'
          )}
        </button>
      </div>
    </form>
  );
}
