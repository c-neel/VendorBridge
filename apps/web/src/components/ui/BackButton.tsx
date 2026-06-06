'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
}

export function BackButton({ fallbackUrl, label = 'Back' }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else if (fallbackUrl) {
      router.push(fallbackUrl);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
