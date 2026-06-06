'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-brand-500 animate-ping" />
        </div>
        <p className="text-surface-400 text-sm">Loading VendorBridge AI...</p>
      </div>
    </div>
  );
}
