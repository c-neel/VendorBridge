'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, Clock, ShieldCheck, User, Building2, Calendar, FileText, AlertCircle, Package, Tag, X } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getApproval(resolvedParams.id);
        setApproval(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  const handleApprove = async () => {
    try {
      await api.approveRequest(resolvedParams.id, comment || 'Approved');
      alert('Approved successfully!');
      router.push('/dashboard/approvals');
    } catch(err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async () => {
    if(!comment) return alert('Please add a reason for rejection in comments.');
    try {
      await api.rejectRequest(resolvedParams.id, comment);
      alert('Rejected.');
      router.push('/dashboard/approvals');
    } catch(err) {
      alert('Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!approval) return <div className="text-center text-surface-400 py-10">Approval not found</div>;

  const pr = approval.purchaseRequest;
  const vendor = pr?.suggestedVendor;
  const requester = pr?.requestedBy?.user;
  const amount = pr?.estimatedBudget || 0;
  
  const chain = pr?.approvals?.map((app: any) => ({
    id: app.id,
    name: `${app.approver?.firstName} ${app.approver?.lastName}`,
    role: app.approver?.role?.replace(/_/g, ' '),
    status: app.status,
    date: app.decidedAt ? formatDate(app.decidedAt) : formatDate(app.createdAt),
    level: app.approvalLevel
  })) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <BackButton fallbackUrl="/dashboard/approvals" />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{pr?.title || 'Unknown Request'}</h1>
            <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full border ${
              pr?.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              pr?.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {pr?.priority || 'MEDIUM'} PRIORITY
            </span>
            <span className={getStatusColor(pr?.status || 'DRAFT')}>{pr?.status || 'DRAFT'}</span>
          </div>
          <p className="text-surface-400 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> PR: <span className="font-mono text-white">{pr?.prNumber}</span>
            <span className="text-surface-600">•</span>
            <span>Requested on {formatDate(pr?.createdAt)}</span>
          </p>
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-2 border-l-brand-500">
          <p className="text-sm font-medium text-surface-400 mb-1">Total Estimated Budget</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(amount)}</p>
          <p className="text-xs text-surface-500 mt-1">{pr?.quantity} {pr?.unitOfMeasure} @ {formatCurrency(pr?.estimatedUnitPrice)} /ea</p>
        </div>
        
        <div className="glass-card p-5">
          <p className="text-sm font-medium text-surface-400 mb-1">Department</p>
          <div className="flex items-center gap-2 mt-1">
            <Building2 className="w-5 h-5 text-brand-400" />
            <p className="font-semibold text-white">{pr?.department?.name || 'N/A'}</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm font-medium text-surface-400 mb-1">Category</p>
          <div className="flex items-center gap-2 mt-1">
            <Tag className="w-5 h-5 text-emerald-400" />
            <p className="font-semibold text-white">{pr?.category?.replace(/_/g, ' ') || 'General'}</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm font-medium text-surface-400 mb-1">Required By</p>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-5 h-5 text-amber-400" />
            <p className="font-semibold text-white">{pr?.requiredByDate ? formatDate(pr.requiredByDate) : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 mb-6 flex items-center gap-2 border-b border-surface-800 pb-4">
              <Package className="w-4 h-4" /> Request Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-surface-300 mb-2">Description</h3>
                <p className="text-surface-100 leading-relaxed bg-surface-900/50 p-4 rounded-lg border border-surface-800">{pr?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-surface-300 mb-2">Business Justification</h3>
                  <div className="text-surface-100 bg-brand-500/5 p-4 rounded-lg border border-brand-500/10 h-full">
                    {pr?.justification || 'No justification provided.'}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-surface-300 mb-2">Technical Specifications</h3>
                  <div className="text-surface-100 bg-surface-900/50 p-4 rounded-lg border border-surface-800 h-full">
                    {pr?.specifications || 'Standard specifications apply.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
             <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 mb-6 flex items-center gap-2 border-b border-surface-800 pb-4">
              <Building2 className="w-4 h-4" /> Suggested Vendor Profile
            </h2>
            
            {vendor ? (
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-16 h-16 rounded-xl bg-surface-800 flex items-center justify-center border border-surface-700 shrink-0">
                  <span className="text-2xl font-bold text-surface-400">{vendor.companyName.charAt(0)}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{vendor.companyName}</h3>
                      <p className="text-sm text-surface-400 flex items-center gap-2">
                        Code: <span className="font-mono text-white">{vendor.vendorCode}</span>
                        <span className="text-surface-700">•</span>
                        Category: {vendor.category?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    {vendor.score && (
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-sm font-bold">{vendor.score.trustScore}/5 Rating</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-surface-400 flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2 text-surface-600" />
                <p>No vendor suggested for this request.</p>
                <p className="text-sm text-surface-500 mt-1">Sourcing will be required during RFQ.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Workflow & Actions */}
        <div className="space-y-6">
          
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 mb-6 flex items-center gap-2 border-b border-surface-800 pb-4">
              <User className="w-4 h-4" /> Requester
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold border border-brand-500/30">
                {requester?.firstName?.charAt(0)}{requester?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-white">{requester?.firstName} {requester?.lastName}</p>
                <p className="text-xs text-surface-400">{requester?.email}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 mb-6 flex items-center gap-2 border-b border-surface-800 pb-4">
               Workflow Status
            </h2>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-500/50 before:via-surface-700 before:to-transparent">
              {chain.map((step: any, idx: number) => (
                <div key={idx} className="relative flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    step.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-surface-800 text-surface-400 border border-surface-700'
                  } z-10 shadow-sm transition-all`}>
                    {step.status === 'APPROVED' ? <CheckCircle2 className="w-5 h-5" /> : 
                     step.status === 'REJECTED' ? <X className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.name} <span className="text-surface-400 font-normal">({step.role})</span></p>
                    <p className="text-xs text-surface-400">
                      {step.status === 'APPROVED' ? `Approved on ${step.date}` : 
                       step.status === 'REJECTED' ? `Rejected on ${step.date}` :
                       `Awaiting Action`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {approval.status === 'PENDING' && (
            <div className="glass-card p-6 border-brand-500/30">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Your Decision</h2>
              <div className="space-y-4">
                <textarea 
                  rows={3} 
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-3 text-sm text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Add your comments, conditions, or rejection reason here..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleApprove} className="btn-primary flex justify-center py-2.5">
                    Approve
                  </button>
                  <button onClick={handleReject} className="btn-secondary flex justify-center py-2.5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/50">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {approval.status !== 'PENDING' && (
            <div className={`p-4 rounded-xl text-center font-medium border shadow-lg ${
              approval.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <p className="text-sm">You have {approval.status.toLowerCase()} this request.</p>
              {approval.remarks && (
                <p className="mt-2 text-xs opacity-80 italic">"{approval.remarks}"</p>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
