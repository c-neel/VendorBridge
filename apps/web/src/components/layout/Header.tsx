'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { 
  Bell, Search, Menu, LogOut, User, Settings, Sparkles, Building, ChevronDown, Activity, HeartPulse, HelpCircle
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getNotifications('?unreadOnly=true&limit=1')
        .then(res => setUnreadCount(res.unreadCount))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-surface-800 bg-surface-950 sticky top-0 z-10 flex items-center justify-between px-6">
      
      {/* Left side: Mobile Menu & Global Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-surface-400 hover:text-surface-100">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* AI Command Bar (Search) */}
        <div className="hidden md:flex relative max-w-xl w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search PRs, POs, Vendors or ask AI..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                router.push(`/dashboard/purchase-requests?search=${encodeURIComponent(e.currentTarget.value)}`);
              }
            }}
            className="w-full bg-surface-900 border border-surface-800 rounded-lg pl-10 pr-12 py-2 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-[10px] font-medium text-surface-500 border border-surface-700 rounded px-1.5 py-0.5 bg-surface-800">⌘K</span>
          </div>
        </div>
      </div>

      {/* Right side: Tools, Organization, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Health Score */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-800 bg-surface-900">
          <HeartPulse className="w-4 h-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-surface-500 uppercase leading-none mb-0.5">Health</span>
            <span className="text-xs font-bold text-emerald-400 leading-none">98/100</span>
          </div>
        </div>

        {/* Organization Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-800 hover:bg-surface-800 cursor-pointer transition-colors">
          <Building className="w-4 h-4 text-surface-400" />
          <span className="text-sm font-medium text-surface-200">VendorBridge HQ</span>
          <ChevronDown className="w-4 h-4 text-surface-500" />
        </div>

        <div className="h-5 w-px bg-surface-800 hidden sm:block" />

        {/* Action Icons */}
        <div className="flex items-center gap-1.5">
          <Link 
            href="/dashboard/ai"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-800 text-surface-400 hover:text-violet-400 transition-colors"
            title="AI Copilot"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
          <Link 
            href="/dashboard/activity"
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 border border-surface-950" />
            )}
          </Link>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors hidden sm:flex">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 hover:border-surface-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 ml-2">
              <span className="text-xs font-bold text-surface-200">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[240px] bg-surface-900 border border-surface-800 rounded-xl p-1 shadow-glass-lg animate-slide-down" 
              sideOffset={8}
              align="end"
            >
              <div className="px-3 py-3 border-b border-surface-800 mb-1">
                <p className="text-sm font-medium text-surface-100">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-surface-400 truncate mt-0.5">{user.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-800 text-surface-300 uppercase tracking-wider border border-surface-700">
                  {user.role.replace('_', ' ')}
                </div>
              </div>

              <DropdownMenu.Item asChild className="outline-none">
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 cursor-pointer w-full">
                  <User className="w-4 h-4" /> Your Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild className="outline-none">
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 cursor-pointer w-full mt-1">
                  <Settings className="w-4 h-4" /> Account Settings
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-surface-800 my-1" />
              
              <DropdownMenu.Item 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 outline-none cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
