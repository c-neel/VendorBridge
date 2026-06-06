'use client';

import { 
  Users, ShoppingCart, CheckSquare, XCircle, 
  TrendingUp, TrendingDown, Clock, ShieldCheck, ArrowRight, Activity, Calendar
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusColor, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

export function ManagerDashboard({ data }: { data: any }) {
  const router = useRouter();
  const { stats, pendingApprovals, recentApprovals, role } = data;

  const pieData = [
    { name: 'Approved', value: stats?.totalApproved || 0, color: '#10B981' },
    { name: 'Rejected', value: stats?.totalRejected || 0, color: '#F43F5E' },
    { name: 'Pending', value: stats?.pendingCount || 0, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manager Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">Review and manage your team's purchase requests</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 shadow-sm">
          <div className="flex flex-col justify-center text-right">
            <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider leading-none mb-1">Approval Rate</p>
            <p className="text-sm font-semibold text-white leading-none">{stats?.approvalRate || 0}%</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Approvals" value={stats?.pendingCount || 0} icon={Clock} color="#F59E0B" onClick={() => router.push('/dashboard/approvals')} />
        <StatCard title="Total Approved" value={stats?.totalApproved || 0} icon={CheckSquare} color="#10B981" onClick={() => router.push('/dashboard/approvals')} />
        <StatCard title="Total Rejected" value={stats?.totalRejected || 0} icon={XCircle} color="#F43F5E" onClick={() => router.push('/dashboard/approvals')} />
        <StatCard title="My PRs (Assigned)" value={(stats?.pendingCount || 0) + (stats?.totalApproved || 0) + (stats?.totalRejected || 0)} icon={ShoppingCart} color="#8B5CF6" onClick={() => router.push('/dashboard/approvals')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-1 glass-card p-6 border border-surface-700 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Decision Breakdown</h2>
            <p className="text-xs text-surface-400 mt-1">Distribution of your approval decisions</p>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals List */}
        <div className="lg:col-span-2 glass-card flex flex-col border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Action Required
            </h2>
            <button onClick={() => router.push('/dashboard/approvals')} className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {pendingApprovals?.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.map((app: any) => (
                  <div key={app.id} className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-800 transition-colors flex items-center justify-between gap-4 cursor-pointer" onClick={() => router.push(`/dashboard/approvals/${app.id}`)}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{app.purchaseRequest.prNumber}</span>
                        <span className="text-xs text-surface-400">{formatDateTime(app.createdAt)}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{app.purchaseRequest.title}</p>
                      <p className="text-xs text-surface-400 mt-1 flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> Req: {app.purchaseRequest.requestedBy?.user?.firstName} {app.purchaseRequest.requestedBy?.user?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-white mb-1">{formatCurrency(app.purchaseRequest.estimatedBudget)}</p>
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                         PENDING
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <ShieldCheck className="w-12 h-12 text-emerald-500/40 mb-3" />
                <p className="text-sm font-semibold text-surface-300">All Caught Up!</p>
                <p className="text-xs text-surface-500 mt-1">You have no pending approvals.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card border border-surface-700">
        <div className="p-5 border-b border-surface-800">
          <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-surface-400" />
            Your Recent Decisions
          </h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {recentApprovals?.length > 0 ? recentApprovals.map((activity: any, i: number) => (
              <div key={activity.id} className="flex gap-4 relative">
                {i !== recentApprovals.length - 1 && (
                  <div className="absolute left-[17px] top-9 bottom-[-20px] w-px bg-surface-800" />
                )}
                <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 z-10 shadow-sm",
                  activity.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                )}>
                  {activity.status === 'APPROVED' ? <CheckSquare className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 pt-1 pb-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-surface-200">
                        You <span className={activity.status === 'APPROVED' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>{activity.status.toLowerCase()}</span> the request: <span className="font-semibold text-white">{activity.purchaseRequest?.title}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-surface-700 bg-surface-800 text-[9px] font-semibold uppercase tracking-wider text-surface-400">
                          {activity.purchaseRequest?.prNumber}
                        </span>
                        <span className="text-[10px] text-surface-500 font-medium">{formatDateTime(activity.decidedAt || activity.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
               <div className="text-center py-6 text-surface-400 text-sm">No recent approval history found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color = '#3B82F6', onClick }: any) {
  return (
    <div className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg border border-surface-800 transition-colors" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
