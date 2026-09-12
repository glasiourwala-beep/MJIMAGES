'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe error without exposing internals to client
    console.error('Handled application error:', error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 shadow-subtle">
        <AlertTriangle size={40} />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          An unexpected error occurred while rendering the page. No user files or data were compromised.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-brand-700 transition-all active:scale-[0.98]"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <Home size={16} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
