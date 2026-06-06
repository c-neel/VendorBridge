'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getTrustScoreColor, formatDate, formatCurrency } from '@/lib/utils';
import { Building, MapPin, Mail, Phone, FileText, Star, FileCheck, Package } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await api.getVendor(params.id as string);
        setVendor(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Vendor Not Found</h2>
        <div className="mt-4 inline-block">
          <BackButton fallbackUrl="/dashboard/vendors" label="Back to Directory" />
        </div>
      </div>
    );
  }

  const score = vendor.score ? Number(vendor.score.trustScore) : 0;
  const scoreColor = getTrustScoreColor(score);

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/vendors" />

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-2xl font-bold text-surface-200 shadow-sm">
            {vendor.companyName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">{vendor.companyName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-widest">{vendor.vendorCode}</span>
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{vendor.category.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card px-6 py-4 flex items-center gap-4 border border-surface-700 shadow-sm bg-surface-800">
          <div>
            <p className="text-[10px] text-surface-400 uppercase font-bold tracking-widest mb-1">Trust Score</p>
            <div className="flex items-end gap-1.5">
              <Star className="w-5 h-5 pb-0.5" style={{ color: scoreColor }} />
              <span className="text-2xl font-bold text-white leading-none">{score}</span>
              <span className="text-[10px] font-bold text-surface-500 mb-0.5 uppercase">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Contact Info */}
        <div className="glass-card p-6 space-y-6 border border-surface-700">
          <h2 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-400" /> Contact Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mb-1">Contact Person</p>
              <p className="text-sm font-semibold text-white">{vendor.contactPerson}</p>
            </div>
            <div className="flex items-center gap-3 text-sm group">
              <div className="w-8 h-8 rounded border border-surface-700 bg-surface-800 flex items-center justify-center group-hover:border-surface-600 transition-colors">
                <Mail className="w-3.5 h-3.5 text-surface-400" />
              </div>
              <span className="text-surface-200 font-medium">{vendor.contactEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-sm group">
              <div className="w-8 h-8 rounded border border-surface-700 bg-surface-800 flex items-center justify-center group-hover:border-surface-600 transition-colors">
                <Phone className="w-3.5 h-3.5 text-surface-400" />
              </div>
              <span className="text-surface-200 font-medium">{vendor.contactPhone || 'N/A'}</span>
            </div>
            <div className="flex items-start gap-3 text-sm group">
              <div className="w-8 h-8 rounded border border-surface-700 bg-surface-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-surface-600 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-surface-400" />
              </div>
              <span className="text-surface-200 font-medium leading-relaxed">
                {vendor.addressLine1}<br />
                {vendor.city && `${vendor.city}, `} {vendor.state} {vendor.pincode}
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Tax */}
        <div className="glass-card p-6 space-y-6 border border-surface-700">
          <h2 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-violet-400" /> Legal & Compliance
          </h2>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mb-1">GST Number</p>
              <p className="text-sm font-medium text-white font-mono bg-surface-800 border border-surface-700 px-3 py-1.5 rounded inline-block">{vendor.gstNumber || 'Pending'}</p>
            </div>
            <div>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mb-1">PAN Number</p>
              <p className="text-sm font-medium text-white font-mono bg-surface-800 border border-surface-700 px-3 py-1.5 rounded inline-block">{vendor.panNumber || 'Pending'}</p>
            </div>
            <div>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mb-1">Onboarding Date</p>
              <p className="text-sm font-semibold text-white">{formatDate(vendor.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mb-2">Status</p>
              <span className={vendor.isActive ? 'px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest' : 'px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest'}>
                {vendor.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-6 space-y-6 border border-surface-700">
          <h2 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" /> Vendor Activity
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-surface-800 border border-surface-700 rounded-xl hover:border-surface-600 transition-colors">
              <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider mb-1">Total Quotations</p>
              <p className="text-2xl font-bold text-white tracking-tight">{vendor.quotations?.length || 0}</p>
            </div>
            <div className="p-4 bg-surface-800 border border-surface-700 rounded-xl hover:border-surface-600 transition-colors">
              <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider mb-1">Purchase Orders</p>
              <p className="text-2xl font-bold text-white tracking-tight">{vendor.purchaseOrders?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
