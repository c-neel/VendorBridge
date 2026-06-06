'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, FileText, Users, CheckSquare, Package,
  FileSpreadsheet, CreditCard, BarChart3, Settings, Bot, Activity,
  ShieldAlert, LineChart, Bell
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const navigationGroups: SidebarGroup[] = [
  {
    title: 'DASHBOARD',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE', 'VENDOR'] }
    ]
  },
  {
    title: 'PROCUREMENT',
    items: [
      { name: 'Purchase Requests', href: '/dashboard/purchase-requests', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE'] },
      { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'SENIOR_MANAGER'] },
      { name: 'RFQs', href: '/dashboard/rfqs', icon: FileText, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'] },
      { name: 'Quotations', href: '/dashboard/quotations', icon: FileSpreadsheet, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
      { name: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: Package, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR', 'MANAGER'] },
      { name: 'Goods Receipts', href: '/dashboard/goods-receipts', icon: Package, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'EMPLOYEE'] },
      { name: 'Invoices', href: '/dashboard/invoices', icon: FileSpreadsheet, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
    ]
  },
  {
    title: 'VENDOR MANAGEMENT',
    items: [
      { name: 'Vendors Directory', href: '/dashboard/vendors', icon: Users, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'] },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'AI Copilot', href: '/dashboard/ai', icon: Bot, roles: ['ADMIN', 'MANAGER', 'SENIOR_MANAGER', 'PROCUREMENT_OFFICER', 'EMPLOYEE'] },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'SENIOR_MANAGER'] },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Audit Logs', href: '/dashboard/activity', icon: Activity, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'] },
      { name: 'Settings', href: '/dashboard/admin', icon: Settings, roles: ['ADMIN'] },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="w-64 bg-surface-950 border-r border-surface-800 flex flex-col h-screen fixed left-0 top-0 z-20 overflow-hidden transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-surface-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/20">
            <ShieldIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">VendorBridge</span>
        </Link>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {navigationGroups.map((group) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(item => item.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          const isCollapsed = collapsedGroups[group.title];

          return (
            <div key={group.title} className="flex flex-col space-y-1">
              {/* Group Header */}
              <div 
                className="px-3 flex items-center justify-between cursor-pointer group mb-1"
                onClick={() => toggleGroup(group.title)}
              >
                <h3 className="text-[10px] font-bold text-surface-500 tracking-wider uppercase group-hover:text-surface-400 transition-colors">
                  {group.title}
                </h3>
                <svg 
                  className={cn("w-3.5 h-3.5 text-surface-600 transition-transform duration-200", isCollapsed ? "rotate-180" : "rotate-0")} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Group Items */}
              <div className={cn("flex flex-col space-y-0.5 overflow-hidden transition-all duration-300", isCollapsed ? "max-h-0 opacity-0" : "max-h-screen opacity-100")}>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        isActive 
                          ? "text-brand-400 bg-brand-500/10" 
                          : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      )}
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-brand-400" : "text-surface-500 group-hover:text-surface-300",
                        item.name === 'AI Copilot' && !isActive ? "text-violet-500/70" : ""
                      )} />
                      {item.name}
                      
                      {item.name === 'AI Copilot' && (
                        <span className="ml-auto flex h-4 items-center rounded bg-violet-500/10 px-1.5 text-[9px] font-bold text-violet-400 border border-violet-500/20 uppercase">
                          AI
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-surface-800 bg-surface-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-800 transition-colors cursor-pointer border border-transparent hover:border-surface-700">
          <div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-xs font-bold text-surface-200">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-surface-100 truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider truncate">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
