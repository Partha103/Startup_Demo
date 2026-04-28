'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';

// ── React Class Error Boundary ────────────────────────────────────────────────

interface ErrorBoundaryProps  { children: ReactNode; fallback?: ReactNode; }
interface ErrorBoundaryState  { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// ── Error display components ──────────────────────────────────────────────────

export function ErrorFallback({ error }: { error?: Error | null }) {
  return (
    <div
      className="min-h-[40vh] flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-ivory)' }}
    >
      <div className="w-12 h-12 border border-[#e5e0d8] flex items-center justify-center mb-5">
        <span className="font-display text-lg text-[#c9a96e]">!</span>
      </div>
      <h2 className="font-display text-2xl font-light mb-3">Something went wrong</h2>
      <p className="font-body text-sm text-[#6b7280] max-w-sm mb-6 leading-relaxed">
        {error?.message ?? 'An unexpected error occurred. Please try refreshing the page.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors"
        >
          REFRESH
        </button>
        <Link
          href="/"
          className="px-8 py-3 border border-[#e5e0d8] font-body text-xs tracking-[0.2em] hover:border-[#0a0a0a] transition-colors"
        >
          HOME
        </Link>
      </div>
    </div>
  );
}

export function ApiErrorMessage({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="px-5 py-4 bg-red-50 border border-red-200 flex items-start justify-between gap-4">
      <p className="font-body text-sm text-red-700">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 font-body text-xs text-red-600 hover:text-red-800 underline transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, body, action }: {
  title: string;
  body?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-1 h-10 bg-[#c9a96e] mb-6 mx-auto" />
      <h3 className="font-display text-2xl font-light mb-3">{title}</h3>
      {body && <p className="font-body text-sm text-[#6b7280] max-w-sm mb-7 leading-relaxed">{body}</p>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-8 py-3 bg-[#0a0a0a] text-white font-body text-xs tracking-[0.2em] hover:bg-[#1a1a1a] transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
