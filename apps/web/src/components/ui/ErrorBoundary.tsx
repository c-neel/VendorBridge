'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary for graceful degradation.
 * Catches rendering errors in child components and displays
 * a professional fallback UI instead of crashing the page.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '48px',
            textAlign: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#e2e8f0',
              margin: '0 0 8px 0',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: '0 0 24px 0',
              maxWidth: '400px',
            }}
          >
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
