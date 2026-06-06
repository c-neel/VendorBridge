import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'VendorBridge AI | Intelligent Procurement & Vendor Management',
  description: 'AI-powered procurement platform for modern enterprises. Streamline vendor management, automate approvals, and gain procurement intelligence.',
  keywords: ['procurement', 'vendor management', 'ERP', 'AI', 'purchase orders'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
