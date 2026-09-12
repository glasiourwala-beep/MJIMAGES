'use client';

import React from 'react';
import Link from 'next/link';

export interface MJLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  isLink?: boolean;
}

export function MJLogoIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      aria-label="MJImage Brand Logo"
    >
      <defs>
        <linearGradient id="mjBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="mjLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="mjAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <filter id="mjGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#4F46E5" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base App Squircle with Deep Radiant Gradient */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#mjBgGrad)" filter="url(#mjGlow)" />
      <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" stroke="white" strokeOpacity="0.25" strokeWidth="1" />

      {/* Outer Viewfinder / Precision Corner Crop Brackets */}
      <path
        d="M 16 26 L 16 18 C 16 16.9 16.9 16 18 16 L 26 16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48 26 L 48 18 C 48 16.9 47.1 16 46 16 L 38 16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 16 38 L 16 46 C 16 47.1 16.9 48 18 48 L 26 48"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48 38 L 48 46 C 48 47.1 47.1 48 46 48 L 38 48"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Camera Iris & Image Core */}
      <circle cx="32" cy="32" r="11" fill="white" fillOpacity="0.15" />
      <circle cx="32" cy="32" r="8" fill="white" />
      <circle cx="32" cy="32" r="4.5" fill="url(#mjBgGrad)" />

      {/* Dynamic Cyber Glow Aperture Blades */}
      <path d="M 32 18 L 35 24 L 32 23 Z" fill="url(#mjLensGrad)" />
      <path d="M 46 32 L 40 35 L 41 32 Z" fill="url(#mjLensGrad)" />
      <path d="M 32 46 L 29 40 L 32 41 Z" fill="url(#mjLensGrad)" />
      <path d="M 18 32 L 24 29 L 23 32 Z" fill="url(#mjLensGrad)" />

      {/* Signature Top-Right Pulse Badge Dot */}
      <circle cx="47" cy="17" r="3" fill="url(#mjAccentGrad)" />
      <circle cx="47" cy="17" r="1.5" fill="white" />
    </svg>
  );
}

export const MJLogo: React.FC<MJLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  isLink = true,
}) => {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl tracking-tight',
    xl: 'text-3xl tracking-tight',
  };

  const content = (
    <div className={`group inline-flex items-center gap-2.5 font-bold select-none cursor-pointer ${className}`}>
      <MJLogoIcon size={pixelSizes[size]} />
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className={`flex items-center font-sans ${textSizes[size]}`}>
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-extrabold tracking-tight">
              MJ
            </span>
            <span className="text-slate-900 font-extrabold tracking-tight ml-0.5">
              Image
            </span>
            <span className="ml-1.5 hidden rounded-md bg-gradient-to-r from-brand-500/15 to-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 sm:inline-block border border-brand-500/20">
              PRO
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link
        href="/"
        className="inline-block transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
};
