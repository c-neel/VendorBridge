'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSuccess(true);
      if (data._demoToken) {
        setDemoToken(data._demoToken);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950">
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
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

        {success ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-surface-400">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            
            {demoToken && (
              <div className="mt-8 p-4 bg-brand-500/10 border border-brand-500/30 rounded-xl text-left">
                <p className="text-xs text-brand-400 font-bold uppercase mb-2">Development Notice</p>
                <p className="text-sm text-surface-300 mb-4">Since there is no live email server configured, use this demo button to proceed with the reset flow.</p>
                <Link href={\`/reset-password?token=\${demoToken}\`} className="btn-primary w-full justify-center">
                  Reset Password (Demo) <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}

            <button onClick={() => router.push('/login')} className="text-brand-400 hover:text-brand-300 text-sm font-medium pt-4 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
              <p className="text-surface-400 mt-2">Enter your email address to receive a password reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-slide-down">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-premium pl-11" placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || !email} className="btn-primary w-full justify-center">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </button>

              <div className="text-center">
                <button type="button" onClick={() => router.push('/login')} className="text-surface-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
