'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, User, Briefcase, MapPin, Camera, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: 'EMPLOYEE',
    firstName: '', lastName: '', username: '', email: '', password: '', phone: '',
    dateOfBirth: '', gender: 'PREFER_NOT_TO_SAY',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
    bio: '', companyName: '', gstNumber: '', panNumber: '', vendorCategory: 'OTHER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && !formData.role) return setError('Please select a role');
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.username) {
        return setError('Please fill all required fields');
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-3xl glass-card relative z-10 animate-slide-up">
        <div className="flex border-b border-surface-800/50">
          <div className="p-8 w-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Join VendorBridge AI</h1>
                <p className="text-xs text-surface-400">Create your enterprise account</p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-800 rounded-full" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
              {[
                { num: 1, label: 'Role', icon: Briefcase },
                { num: 2, label: 'Basic Info', icon: User },
                { num: 3, label: 'Address', icon: MapPin },
                { num: 4, label: 'Profile', icon: Camera },
              ].map((s) => (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                    step >= s.num ? "bg-brand-500 border-brand-500 text-white" : "bg-surface-900 border-surface-700 text-surface-500",
                    step === s.num && "ring-4 ring-brand-500/20"
                  )}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium absolute -bottom-6 w-max",
                    step >= s.num ? "text-brand-400" : "text-surface-500"
                  )}>{s.label}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-12 space-y-6 min-h-[300px]">
              
              {/* STEP 1: ROLE SELECTION */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h2 className="text-xl font-bold text-white mb-4">How will you use VendorBridge?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button type="button" onClick={() => updateForm('role', 'EMPLOYEE')}
                      className={cn("p-4 rounded-xl border text-left transition-all", formData.role === 'EMPLOYEE' ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500" : "border-surface-700 bg-surface-800/50 hover:border-surface-600")}>
                      <User className={cn("w-6 h-6 mb-3", formData.role === 'EMPLOYEE' ? "text-brand-400" : "text-surface-400")} />
                      <h3 className="font-semibold text-white">Internal Employee</h3>
                      <p className="text-sm text-surface-400 mt-1">Raise purchase requests and track orders</p>
                    </button>
                    <button type="button" onClick={() => updateForm('role', 'VENDOR')}
                      className={cn("p-4 rounded-xl border text-left transition-all", formData.role === 'VENDOR' ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500" : "border-surface-700 bg-surface-800/50 hover:border-surface-600")}>
                      <Briefcase className={cn("w-6 h-6 mb-3", formData.role === 'VENDOR' ? "text-violet-400" : "text-surface-400")} />
                      <h3 className="font-semibold text-white">Vendor / Supplier</h3>
                      <p className="text-sm text-surface-400 mt-1">Submit quotations and manage invoices</p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: BASIC INFO */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">First Name *</label>
                      <input type="text" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} className="input-premium" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Last Name *</label>
                      <input type="text" value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} className="input-premium" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Username *</label>
                      <input type="text" value={formData.username} onChange={e => updateForm('username', e.target.value)} className="input-premium" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Email Address *</label>
                      <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="input-premium" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Password *</label>
                      <input type="password" value={formData.password} onChange={e => updateForm('password', e.target.value)} className="input-premium" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Phone Number *</label>
                      <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="input-premium" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth} onChange={e => updateForm('dateOfBirth', e.target.value)} className="input-premium" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Gender</label>
                      <div className="relative">
                        <select value={formData.gender} onChange={e => updateForm('gender', e.target.value)} className="input-premium appearance-none">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ADDRESS & VENDOR DETAILS */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  {formData.role === 'VENDOR' && (
                    <div className="mb-6 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-4">
                      <h3 className="font-semibold text-violet-400">Company Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-surface-300 block mb-1.5">Company Name *</label>
                          <input type="text" value={formData.companyName} onChange={e => updateForm('companyName', e.target.value)} className="input-premium" required={formData.role === 'VENDOR'} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-surface-300 block mb-1.5">Category</label>
                          <select value={formData.vendorCategory} onChange={e => updateForm('vendorCategory', e.target.value)} className="input-premium">
                            <option value="IT_SOFTWARE">IT Software</option>
                            <option value="IT_HARDWARE">IT Hardware</option>
                            <option value="OFFICE_SUPPLIES">Office Supplies</option>
                            <option value="SERVICES">Services</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-surface-300 block mb-1.5">GST Number</label>
                          <input type="text" value={formData.gstNumber} onChange={e => updateForm('gstNumber', e.target.value)} className="input-premium" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-surface-300 block mb-1.5">PAN Number</label>
                          <input type="text" value={formData.panNumber} onChange={e => updateForm('panNumber', e.target.value)} className="input-premium" />
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="font-semibold text-white">Address Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Address Line 1</label>
                      <input type="text" value={formData.addressLine1} onChange={e => updateForm('addressLine1', e.target.value)} className="input-premium" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Address Line 2 (Optional)</label>
                      <input type="text" value={formData.addressLine2} onChange={e => updateForm('addressLine2', e.target.value)} className="input-premium" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">City</label>
                      <input type="text" value={formData.city} onChange={e => updateForm('city', e.target.value)} className="input-premium" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">State</label>
                      <input type="text" value={formData.state} onChange={e => updateForm('state', e.target.value)} className="input-premium" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Pincode</label>
                      <input type="text" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} className="input-premium" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-surface-300 block mb-1.5">Country</label>
                      <input type="text" value={formData.country} onChange={e => updateForm('country', e.target.value)} className="input-premium" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PHOTO & BIO */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-surface-600 bg-surface-800 flex flex-col items-center justify-center text-surface-400 hover:text-brand-400 hover:border-brand-500 hover:bg-brand-500/5 transition-all cursor-pointer">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Upload Photo</span>
                  </div>
                  <p className="text-xs text-surface-500">Supported formats: JPG, PNG (Max 2MB)</p>

                  <div className="w-full mt-4">
                    <label className="text-sm font-medium text-surface-300 block mb-1.5">Additional Information / Bio</label>
                    <textarea 
                      value={formData.bio} 
                      onChange={e => updateForm('bio', e.target.value)} 
                      className="input-premium min-h-[100px] resize-none" 
                      placeholder="Tell us about yourself or your company..."
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 mt-8 border-t border-surface-800/50">
                <button type="button" onClick={prevStep} disabled={step === 1}
                  className="btn-ghost disabled:opacity-0">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                
                {step < 4 ? (
                  <button type="button" onClick={nextStep} className="btn-primary">
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="btn-success">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Complete Registration <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="p-4 text-center border-t border-surface-800/50 bg-surface-900/50">
          <p className="text-xs text-surface-500">
            Already have an account?{' '}
            <button type="button" onClick={() => router.push('/login')} className="text-brand-400 hover:text-brand-300 font-medium">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
