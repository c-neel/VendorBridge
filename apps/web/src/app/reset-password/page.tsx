'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">Password Reset!</h2>
        <p className="text-surface-400">
          Your password has been successfully reset. You can now use your new password to sign in.
        </p>
        <Link href="/login" className="btn-primary w-full justify-center">
          Continue to Login <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          Invalid or missing reset token. Please request a new password reset link.
        </div>
        <Link href="/forgot-password" className="btn-primary w-full justify-center">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Set New Password</h2>
        <p className="text-surface-400 mt-2">Please enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-slide-down">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type={showPassword ? 'text' : 'password'} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-premium pl-11 pr-11" placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type={showPassword ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-premium pl-11 pr-11" placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading || !newPassword || !confirmPassword} className="btn-primary w-full justify-center">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Reset Password <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950">
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 glass-card p-8 rounded-3xl border border-surface-800">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VendorBridge AI</h1>
          </div>
        </div>

        <Suspense fallback={<div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
