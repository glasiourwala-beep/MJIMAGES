'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Copy, Check, ExternalLink, ChevronDown } from 'lucide-react';

const EMAIL = 'glasiourwala@gmail.com';
const SUBJECT = 'Hi MJImage 👋';
const BODY = `Hi MJImage team,

I found your platform and wanted to reach out.

[Write your message here]

Thank you!`;

const GMAIL_URL = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
const MAILTO_URL = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

// ─── Module-level Dropdown (NOT nested inside EmailButton) ────────────────────
interface DropdownMenuProps {
  onClose: () => void;
}

function DropdownMenu({ onClose }: DropdownMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-fade-in">
      {/* Header */}
      <div className="px-3 py-2 mb-1 border-b border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Us</p>
        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{EMAIL}</p>
      </div>

      {/* Open in Gmail */}
      <a
        href={GMAIL_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-red-50 hover:text-red-700 transition-colors group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors flex-shrink-0">
          <Mail size={16} />
        </div>
        <div>
          <div>Open in Gmail</div>
          <div className="text-[11px] font-normal text-slate-500">Opens in your browser tab</div>
        </div>
        <ExternalLink size={13} className="ml-auto text-slate-400 flex-shrink-0" />
      </a>

      {/* Open in default mail app */}
      <a
        href={MAILTO_URL}
        onClick={onClose}
        className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors flex-shrink-0">
          <Mail size={16} />
        </div>
        <div>
          <div>Mail App</div>
          <div className="text-[11px] font-normal text-slate-500">Default mail client (Outlook, etc.)</div>
        </div>
      </a>

      {/* Copy email address */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors flex-shrink-0">
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </div>
        <div className="text-left">
          <div>{copied ? 'Copied!' : 'Copy Email Address'}</div>
          <div className="text-[11px] font-normal text-slate-500 truncate">{EMAIL}</div>
        </div>
      </button>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailButtonProps {
  /** 'icon' = small square icon button (footer), 'card' = full card (contact page), 'inline' = text link */
  variant?: 'icon' | 'card' | 'inline';
  className?: string;
}

export function EmailButton({ variant = 'inline', className = '' }: EmailButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // ── ICON VARIANT (footer social icon) ──────────────────────────────────────
  if (variant === 'icon') {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={toggle}
          aria-label="Email MJImage Support"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
        >
          <Mail size={18} />
        </button>
        {open && (
          <div className="absolute left-0 bottom-full mb-2">
            <DropdownMenu onClose={close} />
          </div>
        )}
      </div>
    );
  }

  // ── CARD VARIANT (contact page card) ───────────────────────────────────────
  if (variant === 'card') {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="group flex w-full items-start gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card text-left"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
            <Mail size={24} />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Email</div>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate">{EMAIL}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Click to contact us</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>
        {open && (
          <div className="absolute left-0 top-full">
            <DropdownMenu onClose={close} />
          </div>
        )}
      </div>
    );
  }

  // ── INLINE VARIANT (text link inside paragraph) ────────────────────────────
  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 transition-colors"
      >
        send us an email
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1">
          <DropdownMenu onClose={close} />
        </div>
      )}
    </span>
  );
}
