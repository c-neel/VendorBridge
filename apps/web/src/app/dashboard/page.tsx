'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { VendorDashboard } from '@/components/dashboard/VendorDashboard';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { ProcurementDashboard } from '@/components/dashboard/ProcurementDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    
    // Real-time polling every 60 seconds (optimized for performance)
    const interval = setInterval(async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl">
        <h3 className="text-rose-400 font-semibold">Error Loading Dashboard</h3>
        <p className="text-surface-400 text-sm mt-1">{error}</p>
        <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg text-sm hover:bg-rose-500/30">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Render role-specific dashboard
  if (user?.role === 'ADMIN') {
    return <AdminDashboard data={data} />;
  }

  if (user?.role === 'VENDOR') {
    return <VendorDashboard data={data} />;
  }

  if (user?.role === 'MANAGER' || user?.role === 'SENIOR_MANAGER') {
    return <ManagerDashboard data={data} />;
  }

  if (user?.role === 'PROCUREMENT_OFFICER') {
    return <ProcurementDashboard data={data} />;
  }

  // Fallback for Employee
  return <EmployeeDashboard data={data} role={user?.role || 'EMPLOYEE'} />;
}
