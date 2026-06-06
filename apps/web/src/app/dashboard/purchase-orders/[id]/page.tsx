'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Package, Calendar, Printer, Building2, Truck, Receipt } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/lib/auth-context';

export default function PurchaseOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPO(params.id as string);
    }
  }, [params.id]);

  async function fetchPO(id: string) {
    try {
      const res = await api.getPurchaseOrder(id);
      setPo(res);
    } catch (err) {
      console.error(err);
      alert('Failed to load purchase order details');
      router.push('/dashboard/purchase-orders');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (status: string) => {
    try {
      await api.updatePurchaseOrderStatus(po.id, status);
      fetchPO(po.id);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!po) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <BackButton fallbackUrl="/dashboard/purchase-orders" />
      <div className="flex items-center gap-4">
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Purchase Order & Invoice</h1>
          <p className="text-surface-400 text-sm">PO-auto-generated after approval</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn-secondary px-4 py-2">Download PDF</button>
          <button onClick={() => window.print()} className="btn-secondary px-4 py-2">Print</button>
          <button onClick={() => window.location.href = `mailto:?subject=Purchase Order ${po.poNumber}&body=Please find the attached PO.`} className="btn-secondary px-4 py-2">Email invoice</button>
        </div>
      </div>

      <div className="glass-card p-8">
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-surface-700/50">
          <div>
            <h3 className="text-sm font-semibold text-surface-400 mb-2">Bill to:</h3>
            <p className="text-white font-medium">Your Organization Name</p>
            <p className="text-surface-300 text-sm">123 Business Park, Ahmedabad</p>
            <p className="text-surface-300 text-sm">GSTIN: 25X8S9S8AF31</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-400 mb-2">Vendor</h3>
            <p className="text-white font-medium">{po.vendor?.companyName}</p>
            <p className="text-surface-300 text-sm">{po.deliveryAddress || '456, industrial estate, Surat'}</p>
            <p className="text-surface-300 text-sm">GSTIN: 34S4S4D34S23</p>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-surface-400">PO Number:</span>
              <span className="text-white font-medium">{po.poNumber}</span>
              <span className="text-surface-400">PO date:</span>
              <span className="text-white font-medium">{formatDate(po.issuedAt)}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-surface-400">Invoice date:</span>
              <span className="text-white font-medium">{formatDate(po.issuedAt)}</span>
              <span className="text-surface-400">Due date:</span>
              <span className="text-white font-medium">{formatDate(po.deliveryDate || new Date(Date.now() + 30*24*60*60*1000).toISOString())}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse border border-surface-700">
            <thead>
              <tr className="bg-surface-800 text-surface-300 text-sm">
                <th className="px-6 py-3 font-medium border border-surface-700">Item</th>
                <th className="px-6 py-3 font-medium text-center border border-surface-700">Qty</th>
                <th className="px-6 py-3 font-medium text-right border border-surface-700">Unit price</th>
                <th className="px-6 py-3 font-medium text-right border border-surface-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.lineItems?.map((item: any) => (
                <tr key={item.id} className="text-sm text-white">
                  <td className="px-6 py-4 border border-surface-700">{item.description}</td>
                  <td className="px-6 py-4 text-center border border-surface-700">{item.quantity}</td>
                  <td className="px-6 py-4 text-right border border-surface-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 text-right border border-surface-700">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} rowSpan={4} className="px-6 py-4 border border-surface-700 align-top">
                  <p className="text-sm text-surface-400">Status: <span className="badge badge-warning ml-2">Pending Payment</span> <button className="ml-4 text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors">Mark as Paid</button></p>
                </td>
                <td className="px-6 py-2 text-right text-surface-400 text-sm border border-surface-700">Subtotal</td>
                <td className="px-6 py-2 text-right font-medium text-white border border-surface-700">{formatCurrency(po.subtotal)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 text-right text-surface-400 text-sm border border-surface-700">CGST (9%)</td>
                <td className="px-6 py-2 text-right text-surface-400 text-sm border border-surface-700">{formatCurrency(po.taxAmount / 2)}</td>
              </tr>
              <tr>
                <td className="px-6 py-2 text-right text-surface-400 text-sm border border-surface-700">SGST (9%)</td>
                <td className="px-6 py-2 text-right text-surface-400 text-sm border border-surface-700">{formatCurrency(po.taxAmount / 2)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-right font-bold text-white border border-surface-700">Grand total</td>
                <td className="px-6 py-4 text-right font-bold text-white border border-surface-700">{formatCurrency(po.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  );
}
