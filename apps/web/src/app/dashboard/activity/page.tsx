'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Clock, FileText, Users, LogIn, Activity, AlertCircle, Trash, RefreshCw } from 'lucide-react';

export default function ActivityLogsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = '';
      if (activeTab !== 'All') {
        if (activeTab === 'Approvals') query = '?action=APPROVED';
        if (activeTab === 'RFQ') query = '?entityType=RFQ';
        if (activeTab === 'Vendors') query = '?entityType=Vendor';
        if (activeTab === 'Invoices') query = '?entityType=Invoice';
      }
      const res = await api.getActivityLogs(query.replace('?', ''));
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getLogIconAndColor = (action: string, entityType: string) => {
    switch (action) {
      case 'APPROVED':
        return { icon: <CheckCircle2 className="w-5 h-5" />, colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'REJECTED':
        return { icon: <AlertCircle className="w-5 h-5" />, colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'CREATED':
      case 'PUBLISHED':
        return { icon: <FileText className="w-5 h-5" />, colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'LOGIN':
        return { icon: <LogIn className="w-5 h-5" />, colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'DELETED':
        return { icon: <Trash className="w-5 h-5" />, colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'UPDATED':
        return { icon: <RefreshCw className="w-5 h-5" />, colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      default:
        return { icon: <Activity className="w-5 h-5" />, colorClass: 'text-brand-400 bg-brand-500/10 border-brand-500/20' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
          <p className="text-surface-400 text-sm">Procurement audit trail</p>
        </div>
      </div>

      <div className="glass-card">
        {/* Tabs */}
        <div className="flex gap-4 p-6 border-b border-surface-800/50 overflow-x-auto">
          {['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                  : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="p-8">
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
             </div>
          ) : logs.length === 0 ? (
             <div className="text-center py-10 text-surface-400">
               No activity logs found for this filter.
             </div>
          ) : (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-700 before:to-transparent">
              {logs.map((log) => {
                const { icon, colorClass } = getLogIconAndColor(log.action, log.entityType);
                return (
                  <div key={log.id} className="relative flex items-start gap-6 md:justify-center">
                    
                    {/* Desktop Left side */}
                    <div className="md:w-1/2 flex md:justify-end hidden md:block">
                      <div className="text-right pr-8 mt-1">
                        <span className="text-xs font-medium text-surface-400">{formatDate(log.createdAt)}</span>
                        <p className="text-xs text-surface-500 mt-1">{log.user?.firstName} {log.user?.lastName}</p>
                      </div>
                    </div>

                    {/* Center Icon */}
                    <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center border z-10 shadow-sm ${colorClass}`}>
                      {icon}
                    </div>

                    {/* Right side content */}
                    <div className="pl-12 md:pl-8 md:w-1/2">
                      <div className="bg-surface-800/30 border border-surface-700/50 p-4 rounded-xl">
                        <h3 className="font-semibold text-white">{log.action} {log.entityType}</h3>
                        <p className="text-sm text-surface-300 mt-1">{log.description}</p>
                        <div className="md:hidden mt-2 flex justify-between items-center text-xs text-surface-500">
                           <span>{formatDate(log.createdAt)}</span>
                           <span>{log.user?.firstName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
