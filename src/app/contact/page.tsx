'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, MessageSquare, Copy, Check, ExternalLink, ChevronDown } from 'lucide-react';
import { GithubIcon, InstagramIcon, TikTokIcon } from '@/components/brand/SocialIcons';

// ─── Email constants ─────────────────────────────────────────────────────────
const EMAIL = 'glasiourwala@gmail.com';
const SUBJECT = 'Hi MJImage 👋';
const BODY = `Hi MJImage team,\n\nI found your platform and wanted to reach out.\n\n[Write your message here]\n\nThank you!`;
const GMAIL_URL = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
const MAILTO_URL = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

// ─── Email Dropdown Menu ─────────────────────────────────────────────────────
function EmailDropdown({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
      <div className="px-3 py-2 mb-1 border-b border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact via Email</p>
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 flex-shrink-0">
          <Mail size={15} />
        </div>
        <div>
          <div>Open in Gmail</div>
          <div className="text-[11px] font-normal text-slate-500">Opens in your browser</div>
        </div>
        <ExternalLink size={13} className="ml-auto text-slate-400 flex-shrink-0" />
      </a>

      {/* Mail App */}
      <a
        href={MAILTO_URL}
        onClick={onClose}
        className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 flex-shrink-0">
          <Mail size={15} />
        </div>
        <div>
          <div>Mail App</div>
          <div className="text-[11px] font-normal text-slate-500">Outlook, Apple Mail, etc.</div>
        </div>
      </a>

      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 flex-shrink-0">
          {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
        </div>
        <div className="text-left">
          <div>{copied ? 'Copied!' : 'Copy Address'}</div>
          <div className="text-[11px] font-normal text-slate-500 truncate">{EMAIL}</div>
        </div>
      </button>
    </div>
  );
}

// ─── Email Card ──────────────────────────────────────────────────────────────
function EmailCard() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
          <EmailDropdown onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Inline Email Link ───────────────────────────────────────────────────────
function EmailInlineLink() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 transition-colors"
      >
        send us an email
      </button>
      {open && (
        <span className="absolute left-0 top-full mt-1 block">
          <EmailDropdown onClose={() => setOpen(false)} />
        </span>
      )}
    </span>
  );
}

// ─── Contact Page ────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-4">
          <MessageSquare size={14} />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contact & Official Channels
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Have feedback, feature requests, or technical questions? Reach out directly through any of our official channels.
        </p>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Email — interactive dropdown */}
        <EmailCard />

        {/* GitHub */}
        <a
          href="https://github.com/glasiourwala-beep"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-card"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <GithubIcon size={24} />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">GitHub Profile</div>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate">glasiourwala-beep</div>
            <div className="text-xs text-slate-500 mt-1">Open source projects & code</div>
          </div>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/mj_rafay"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:border-pink-400 hover:shadow-card"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
            <InstagramIcon size={24} />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Instagram</div>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate">@mj_rafay</div>
            <div className="text-xs text-slate-500 mt-1">Updates & creative visuals</div>
          </div>
        </a>

        {/* TikTok */}
        <a
          href="https://www.tiktok.com/@mjrafay?_r=1&_t=ZS-99VXHj6Lnxi"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:border-slate-800 hover:shadow-card"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-black group-hover:text-white transition-colors">
            <TikTokIcon size={24} />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">TikTok</div>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate">@mjrafay</div>
            <div className="text-xs text-slate-500 mt-1">Short clips & tutorials</div>
          </div>
        </a>
      </div>

      {/* Direct Inquiries Note */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center max-w-xl mx-auto space-y-3">
        <h3 className="text-base font-bold text-slate-900">Need Immediate Assistance?</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          For technical issues, bug reports, or partnership opportunities,{' '}
          <EmailInlineLink />{' '}
          — we reply within 24–48 hours.
        </p>
      </div>
    </div>
  );
}
