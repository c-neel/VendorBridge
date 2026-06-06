'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, 
  BarChart3, Users, FileCheck, Zap, ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const quickLogin = async (testEmail: string) => {
    setEmail(testEmail);
    setPassword('VendorBridge@2024');
    setError('');
    setLoading(true);
    try {
      await login(testEmail, 'VendorBridge@2024');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand & Features */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-surface-950">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VendorBridge</h1>
              <p className="text-xs text-brand-400 font-medium">AI-Powered Procurement</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-8 max-w-lg">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-medium text-brand-400">Powered by Gemini AI</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Intelligent<br />
                <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Procurement
                </span>
                <br />Management
              </h2>
              <p className="mt-4 text-surface-400 text-lg leading-relaxed">
                Transform your procurement lifecycle with AI-powered vendor evaluation, 
                smart approvals, and real-time spend intelligence.
              </p>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BarChart3, label: 'Spend Analytics', color: 'from-brand-500/20 to-brand-500/5' },
                { icon: Users, label: 'Vendor Intelligence', color: 'from-violet-500/20 to-violet-500/5' },
                { icon: FileCheck, label: 'Smart Approvals', color: 'from-emerald-500/20 to-emerald-500/5' },
                { icon: Zap, label: 'Risk Detection', color: 'from-amber-500/20 to-amber-500/5' },
              ].map((feature) => (
                <div key={feature.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${feature.color} border border-white/5`}>
                  <feature.icon className="w-4 h-4 text-surface-300" />
                  <span className="text-sm font-medium text-surface-300">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8">
            {[
              { value: '10+', label: 'Vendors' },
              { value: '₹42L', label: 'Spend Tracked' },
              { value: '87.5', label: 'Health Score' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-900/50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VendorBridge AI</h1>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-surface-400 mt-1">Sign in to your procurement dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-slide-down">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-surface-300">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-11" placeholder="admin@vendorbridge.in"
                  required
                  suppressHydrationWarning={true}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-surface-300">Password</label>
                <button 
                  type="button" 
                  onClick={() => router.push('/forgot-password')} 
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-11 pr-11" placeholder="••••••••"
                  required
                  suppressHydrationWarning={true}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>



          <p className="text-center text-xs text-surface-600">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/register')} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
