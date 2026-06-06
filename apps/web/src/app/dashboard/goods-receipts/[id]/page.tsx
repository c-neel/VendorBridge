'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { ClipboardCheck, Truck, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function GoodsReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [grn, setGrn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchGrn(params.id as string);
    }
  }, [params.id]);

  async function fetchGrn(id: string) {
    try {
      const res = await api.getGoodsReceipt(id);
      setGrn(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load goods receipt details');
      router.push('/dashboard/goods-receipts');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!grn) return null;

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/goods-receipts" />
      <div className="flex items-center gap-4">
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">GRN {grn.grnNumber}</h1>
            <span className={getStatusColor(grn.status)}>{grn.status}</span>
          </div>
          <p className="text-surface-400 text-sm">Logged on {formatDate(grn.receivedDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Inspection Details</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-surface-800/50 rounded-xl border border-surface-700">
                <p className="text-sm text-surface-400 mb-1">Ordered</p>
                <p className="text-2xl font-bold text-white">{grn.quantityOrdered}</p>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <p className="text-sm text-emerald-400 mb-1">Accepted</p>
                <p className="text-2xl font-bold text-emerald-400">{grn.quantityAccepted}</p>
              </div>
              <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <p className="text-sm text-rose-400 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-rose-400">{grn.quantityRejected}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Condition</p>
                <p className="font-medium text-white">{grn.condition}</p>
              </div>
              
              {grn.inspectionNotes && (
                <div>
                  <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Inspection Notes</p>
                  <p className="text-surface-300 p-4 bg-surface-800/50 rounded-lg">{grn.inspectionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Reference</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="w-4 h-4 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Purchase Order</p>
                  <Link href={`/dashboard/purchase-orders/${grn.purchaseOrderId}`} className="text-sm text-brand-400 hover:underline">
                    {grn.purchaseOrder?.poNumber}
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Delivery Note</p>
                  <p className="text-sm text-surface-400">{grn.deliveryNoteNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Personnel</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-surface-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Received By</p>
                  <p className="text-sm text-surface-400">{grn.receivedBy?.firstName} {grn.receivedBy?.lastName}</p>
                </div>
              </div>
            </div>
          </div>
          
          {grn.quantityRejected > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>Items were rejected during inspection. Procurement will handle the return/refund process with the vendor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
