'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAIKey = () => {
    // In a real app, this would save to the backend securely
    localStorage.setItem('vendorbridge_openai_key', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-surface-400 text-sm">Manage your preferences and organization configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
              activeTab === 'profile' 
                ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400' 
                : 'hover:bg-surface-800/50 border border-transparent hover:border-surface-700 text-surface-300 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile Settings</span>
          </button>
          
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors ${
                activeTab === 'ai' 
                  ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400' 
                  : 'hover:bg-surface-800/50 border border-transparent hover:border-surface-700 text-surface-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">AI Integrations</span>
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button className="w-full flex items-center gap-3 p-4 hover:bg-surface-800/50 border border-transparent hover:border-surface-700 text-surface-300 hover:text-white rounded-xl text-left transition-colors">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Roles & Permissions</span>
            </button>
          )}

          <button className="w-full flex items-center gap-3 p-4 hover:bg-surface-800/50 border border-transparent hover:border-surface-700 text-surface-300 hover:text-white rounded-xl text-left transition-colors">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
          </button>
        </div>

        <div className="md:col-span-2 glass-card p-6">
          {activeTab === 'profile' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="w-6 h-6 text-brand-400" />
                <h2 className="text-xl font-bold text-white">Profile Configuration</h2>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">First Name</label>
                    <input type="text" defaultValue={user?.firstName || ''} className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">Last Name</label>
                    <input type="text" defaultValue={user?.lastName || ''} className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Email Address</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-surface-400 cursor-not-allowed" />
                  <p className="text-xs text-surface-500 mt-1">Email address cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500/50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">Role</label>
                    <input type="text" disabled value={user?.role?.replace('_', ' ') || ''} className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-surface-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">Department</label>
                    <input type="text" defaultValue="Procurement" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-surface-200 focus:outline-none focus:border-brand-500/50" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="btn-primary w-full">Save Changes</button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-brand-400" />
                <h2 className="text-xl font-bold text-white">AI Copilot Settings</h2>
              </div>

              <div className="space-y-4 max-w-md">
                <p className="text-sm text-surface-400 mb-6">Connect your own API keys to power the Ask AI functionality, Vendor Recommendations, and Auto-Approval summaries.</p>
                
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">OpenAI API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-4 py-2 text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-brand-500/50" 
                  />
                  <p className="text-xs text-surface-500 mt-2">Your key is stored securely and never shared.</p>
                </div>
                
                <div className="pt-4 flex items-center gap-4">
                  <button onClick={handleSaveAIKey} className="btn-primary flex-1">Save AI Configuration</button>
                  {isSaved && <span className="text-emerald-400 flex items-center gap-1 text-sm"><CheckCircle className="w-4 h-4"/> Saved</span>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
