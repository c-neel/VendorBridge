'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { 
  Bot, Send, User, Sparkles, Zap, Shield, FileText, 
  TrendingUp, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, id: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `## Welcome to VendorBridge AI, ${user?.firstName}!\n\nI am your intelligent procurement assistant powered by Google Gemini. How can I help you today? You can ask me to:\n\n*   Analyze vendor performance and recommend the best supplier\n*   Generate an RFQ based on your requirements\n*   Summarize your procurement spend\n*   Identify active supply chain risks`
      }
    ]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.aiChat(userMessage);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: res.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error while processing your request. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  const suggestions = [
    { icon: TrendingUp, text: "Summarize Q4 procurement spend" },
    { icon: Shield, text: "Show me risky vendors" },
    { icon: FileText, text: "Create an RFQ for 20 developer laptops" },
    { icon: Zap, text: "Which vendor is best for IT software?" },
  ];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col glass-card overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-surface-800/50 flex items-center justify-between bg-surface-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              VendorBridge AI
              <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-bold border border-brand-500/20">GEMINI POWERED</span>
            </h1>
            <p className="text-xs text-surface-400">Intelligent Procurement Assistant</p>
          </div>
        </div>
        <button onClick={() => setMessages(messages.slice(0, 1))} className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors" title="Clear Chat">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-4 max-w-4xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === 'assistant' 
                ? "bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20" 
                : "bg-surface-700"
            )}>
              {msg.role === 'assistant' ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-surface-300" />}
            </div>
            
            <div className={cn(
              "px-5 py-4 rounded-2xl",
              msg.role === 'user' 
                ? "bg-surface-800 border border-surface-700 text-surface-100 rounded-tr-sm" 
                : "bg-brand-500/5 border border-brand-500/10 text-surface-200 rounded-tl-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-700 max-w-none"
            )}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 rounded-tl-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (only show if few messages) */}
      {messages.length <= 2 && !loading && (
        <div className="px-6 pb-2">
          <p className="text-xs text-surface-500 font-medium mb-2 pl-1">SUGGESTED QUESTIONS</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSuggestionClick(s.text)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700 hover:border-brand-500/50 hover:bg-surface-800 transition-colors text-xs text-surface-300 hover:text-brand-300"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-surface-900/50 border-t border-surface-800/50">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask VendorBridge AI anything..."
            className="w-full bg-surface-950 border border-surface-700 focus:border-brand-500/50 rounded-xl pl-4 pr-12 py-4 text-surface-100 placeholder:text-surface-500 shadow-inner focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-brand-500 text-white disabled:opacity-50 disabled:bg-surface-700 hover:bg-brand-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
