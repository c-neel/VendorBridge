'use client';

import { 
  Users, ShoppingCart, Package, AlertTriangle, 
  TrendingUp, TrendingDown, IndianRupee, ShieldCheck, ArrowRight, Activity
} from 'lucide-react';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { useRouter } from 'next/navigation';

export function AdminDashboard({ data }: { data: any }) {
  const router = useRouter();
  const { stats, recentActivity, riskAlerts, healthScore } = data;

  // Mock data for charts
  const spendData = [
    { name: 'Jan', spend: 400000 },
    { name: 'Feb', spend: 300000 },
    { name: 'Mar', spend: 550000 },
    { name: 'Apr', spend: 480000 },
    { name: 'May', spend: 620000 },
    { name: 'Jun', spend: stats?.totalSpend ? stats.totalSpend / 6 : 500000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">Command center for global procurement operations</p>
        </div>
        
        {healthScore && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 shadow-sm">
            <div className="trust-ring">
              <svg width="40" height="40" className="rotate-[-90deg]">
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="#10b981" strokeWidth="4" 
                  strokeDasharray={`${2 * Math.PI * 16}`} 
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - healthScore.procurementHealthScore / 100)}`} 
                  className="transition-all duration-1000" />
              </svg>
              <span className="absolute text-[10px] font-bold text-emerald-400">{healthScore.procurementHealthScore}</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider leading-none mb-1">Procurement Health</p>
              <p className="text-sm font-semibold text-white leading-none">Excellent</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Spend YTD" value={formatCurrency(stats?.totalSpend || 0)} icon={IndianRupee} trend="+12.5%" trendUp color="#3B82F6" onClick={() => router.push('/dashboard/analytics')} />
        <StatCard title="Cost Savings" value={formatCurrency((stats?.totalSpend || 0) * 0.15)} icon={TrendingDown} trend="+2.4% vs last Q" trendUp color="#10B981" onClick={() => router.push('/dashboard/analytics')} />
        <StatCard title="Active Vendors" value={stats?.totalVendors || 0} icon={Users} trend="98% trust score avg" trendUp color="#8B5CF6" onClick={() => router.push('/dashboard/vendors')} />
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals || 0} icon={ShieldCheck} trend="-2 since yesterday" trendUp={false} color="#F59E0B" onClick={() => router.push('/dashboard/approvals')} />
      </div>

      {/* Procurement Funnel Visualization */}
      <div className="glass-card p-6 border border-surface-700 bg-surface-900/50">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider">Procurement Funnel Pipeline</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FunnelStep label="Purchase Requests" count="124" color="brand" />
          <ArrowRight className="w-5 h-5 text-surface-600 hidden md:block" />
          <FunnelStep label="Approvals" count={stats?.pendingApprovals || "12"} color="amber" />
          <ArrowRight className="w-5 h-5 text-surface-600 hidden md:block" />
          <FunnelStep label="Active RFQs" count={stats?.activeRFQs || "8"} color="violet" />
          <ArrowRight className="w-5 h-5 text-surface-600 hidden md:block" />
          <FunnelStep label="Quotations" count="34" color="cyan" />
          <ArrowRight className="w-5 h-5 text-surface-600 hidden md:block" />
          <FunnelStep label="Purchase Orders" count="18" color="emerald" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6 border border-surface-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Spend Analytics</h2>
              <p className="text-xs text-surface-400 mt-1">Total procurement spend trajectory</p>
            </div>
            <select className="bg-surface-800 border border-surface-700 text-surface-200 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: any) => [formatCurrency(value), 'Spend']}
                />
                <Line type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Risk Alerts */}
        <div className="glass-card flex flex-col border border-surface-700">
          <div className="p-5 border-b border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-bold text-surface-200 uppercase tracking-wider">AI Risk Detection</h2>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {riskAlerts?.length || 0}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {riskAlerts?.length > 0 ? (
              <div className="space-y-2">
                {riskAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-800 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-surface-100">{alert.title}</p>
                        <p className="text-[10px] text-surface-400 mt-1 line-clamp-2">{alert.description}</p>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border", 
                        alert.riskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        alert.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      )}>
                        {alert.riskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500/40 mb-3" />
                <p className="text-sm font-semibold text-surface-300">No active risks detected</p>
                <p className="text-[10px] text-surface-500 mt-1 uppercase tracking-wider font-medium">AI monitoring is active</p>
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
            Live Audit Trail
          </h2>
        </div>
        <div className="p-5">
          <div className="space-y-5">
            {recentActivity?.map((activity: any, i: number) => (
              <div key={activity.id} className="flex gap-4 relative">
                {i !== recentActivity.length - 1 && (
                  <div className="absolute left-[17px] top-9 bottom-[-20px] w-px bg-surface-800" />
                )}
                <div className="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                  <span className="text-[10px] font-bold text-surface-300">
                    {activity.user?.firstName?.[0]}{activity.user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 pt-1 pb-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-surface-200">
                        <span className="font-semibold text-surface-100">{activity.user?.firstName} {activity.user?.lastName}</span>{' '}
                        {activity.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-surface-700 bg-surface-800 text-[9px] font-semibold uppercase tracking-wider text-surface-400">
                          {activity.entityType}
                        </span>
                        <span className="text-[10px] text-surface-500 font-medium">{formatDateTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color = '#3B82F6', onClick }: any) {
  return (
    <div className="glass-card p-5 cursor-pointer hover:border-surface-600 transition-all border border-surface-700 group" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg border border-surface-800 transition-colors" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn("flex items-center text-[10px] font-bold px-2 py-1 rounded border", 
            trendUp ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
          )}>
            {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function FunnelStep({ label, count, color }: { label: string, count: string | number, color: string }) {
  const colorMap: any = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  };

  return (
    <div className="flex flex-col items-center gap-3 w-[120px]">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl border", colorMap[color])}>
        {count}
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 text-center leading-tight">{label}</span>
    </div>
  );
}
