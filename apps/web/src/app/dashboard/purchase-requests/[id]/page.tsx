'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { User, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/lib/auth-context';

export default function PurchaseRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPr(params.id as string);
    }
  }, [params.id]);

  async function fetchPr(id: string) {
    try {
      const res = await api.getPurchaseRequest(id);
      setPr(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load purchase request details');
      router.push('/dashboard/purchase-requests');
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

  if (!pr) return null;

  return (
    <div className="space-y-6">
      <BackButton fallbackUrl="/dashboard/purchase-requests" />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{pr.title}</h1>
            <span className={getStatusColor(pr.status)}>{pr.status}</span>
          </div>
          <p className="text-surface-400 text-sm">PR: {pr.prNumber} • Requested on {formatDate(pr.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {pr.status === 'APPROVED' && user?.role === 'PROCUREMENT' && (
            <Link href={`/dashboard/rfqs/create?prId=${pr.id}`} className="btn-primary">
              Generate RFQ
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Request Details</h2>
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-surface-200">{pr.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="font-medium text-white">{pr.department}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-400 uppercase tracking-wider mb-1">Estimated Budget</p>
                  <p className="font-bold text-brand-400 text-lg">{formatCurrency(pr.estimatedBudget)}</p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-700/50 text-surface-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-right">Qty</th>
                    <th className="pb-3 font-medium text-right">Est. Price</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/50">
                  {pr.lineItems?.map((item: any) => (
                    <tr key={item.id} className="text-sm text-surface-300">
                      <td className="py-4 font-medium text-white">{item.description}</td>
                      <td className="py-4 text-right">{item.quantity} {item.unitOfMeasure}</td>
                      <td className="py-4 text-right">{formatCurrency(item.estimatedUnitPrice)}</td>
                      <td className="py-4 text-right font-medium text-white">{formatCurrency(item.estimatedTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Requester</h3>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-800 rounded-lg">
                <User className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-medium text-white">{pr.requester?.firstName} {pr.requester?.lastName}</p>
                <p className="text-sm text-surface-400">{pr.requester?.email}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">Approval Status</h3>
            <div className="space-y-4">
              {pr.approvals?.map((approval: any) => (
                <div key={approval.id} className="flex items-start gap-3">
                  {approval.status === 'APPROVED' ? (
                     <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : approval.status === 'REJECTED' ? (
                     <div className="w-5 h-5 rounded-full bg-rose-500 shrink-0" />
                  ) : (
                     <div className="w-5 h-5 rounded-full border-2 border-surface-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{approval.stage} Approval</p>
                    <p className="text-xs text-surface-400">{approval.approver?.firstName} {approval.approver?.lastName} - {approval.status}</p>
                    {approval.comments && (
                      <p className="text-xs text-surface-300 mt-1 italic">"{approval.comments}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
