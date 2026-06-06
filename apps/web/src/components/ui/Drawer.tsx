import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Drawer({ isOpen, onClose, title, description, children, size = 'md' }: DrawerProps) {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!render) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300", 
          isOpen ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose} 
      />
      
      <div 
        className={cn(
          "relative w-full h-full bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out", 
          sizeClasses[size], 
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onTransitionEnd={() => {
          if (!isOpen) setRender(false);
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {description && <p className="text-sm text-surface-400 mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
}
