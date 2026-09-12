import React from 'react';
import Link from 'next/link';
import { MJLogo } from '@/components/brand/MJLogo';
import { TOOL_LIST } from '@/lib/constants/tools';
import { Home, ArrowRight, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center space-y-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-subtle">
        <FileQuestion size={40} />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">404 Error</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-base text-slate-500 max-w-md mx-auto">
          The page you are looking for might have been moved, removed, or does not exist.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-card hover:bg-brand-700 transition-all active:scale-[0.98]"
        >
          <Home size={16} />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Suggested Tools */}
      <div className="pt-10 border-t border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
          Popular Image Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {TOOL_LIST.slice(0, 3).map((tool) => (
            <Link
              key={tool.id}
              href={`/${tool.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-subtle hover:border-brand-400 hover:shadow-card transition-all"
            >
              <div className="text-sm font-bold text-slate-900">{tool.name}</div>
              <div className="text-xs text-brand-600 mt-2 flex items-center gap-1 font-semibold">
                <span>Use tool</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
