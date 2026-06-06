'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const [res, vendorRes] = await Promise.all([
        api.getAnalytics(),
        api.getVendorPerformance()
      ]);
      
      // Map snapshots for recharts
      if (res && res.snapshots) {
        res.chartData = res.snapshots.map((s: any) => ({
          date: formatDate(s.snapshotDate).split(',')[0],
          spend: Number(s.totalSpend || 0)
        }));
      }

      // Map vendors for recharts
      const mappedVendors = (vendorRes || []).map((v: any) => ({
        name: v.companyName.substring(0, 15) + (v.companyName.length > 15 ? '...' : ''),
        score: Number(v.score?.trustScore || 0)
      }));

      setData(res);
      setVendors(mappedVendors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-800 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Analytics</h1>
          <p className="text-surface-400 text-sm mt-1">High-level overview of system metrics and spending</p>
        </div>
        <div className="hidden sm:block">
           <select className="bg-surface-800 border border-surface-700 text-surface-200 text-xs font-bold uppercase tracking-wider rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
              <option>Year to Date</option>
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-surface-700 hover:border-surface-600 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Total Spend</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(data?.totalSpend || 0)}</h3>
          </div>
        </div>
        
        <div className="glass-card p-5 border border-surface-700 hover:border-surface-600 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Total POs</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{data?.totalPOs || 0}</h3>
          </div>
        </div>

        <div className="glass-card p-5 border border-surface-700 hover:border-surface-600 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Pending Approvals</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{data?.pendingApprovals || 0}</h3>
          </div>
        </div>

        <div className="glass-card p-5 border border-surface-700 hover:border-surface-600 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Active Vendors</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{data?.activeVendors || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Spend Trend Chart */}
        <div className="glass-card p-6 border border-surface-700">
          <h2 className="text-[11px] font-bold text-surface-200 uppercase tracking-wider mb-6">Spend Trend Trajectory</h2>
          <div className="h-[300px] w-full">
            {data?.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3b82f6' }}
                    formatter={(value: any) => [formatCurrency(value), 'Spend']}
                  />
                  <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-500 text-xs font-bold uppercase tracking-wider">
                Not enough data to display trend
              </div>
            )}
          </div>
        </div>

        {/* Top Vendors Chart */}
        <div className="glass-card p-6 border border-surface-700">
          <h2 className="text-[11px] font-bold text-surface-200 uppercase tracking-wider mb-6">Top Vendors by Trust Score</h2>
          <div className="h-[300px] w-full">
            {vendors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendors.slice(0, 5)} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip 
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value: any) => [`${value} / 100`, 'Trust Score']}
                  />
                  <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-500 text-xs font-bold uppercase tracking-wider">
                No vendor data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
