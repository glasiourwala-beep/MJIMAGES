'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, startTransition] = useTransition();

  // Complete progress on route change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept client-side link clicks for immediate YouTube-style bar animation
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');
      const downloadAttr = target.getAttribute('download');

      // Check if it's an internal route navigation
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/api') &&
        !href.startsWith('#') &&
        targetAttr !== '_blank' &&
        downloadAttr === null &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // If navigating to the same URL, ignore
        const currentUrl = window.location.pathname + window.location.search;
        if (href === currentUrl) return;

        setLoading(true);
        setProgress(30);

        startTransition(() => {
          setTimeout(() => {
            setProgress((prev) => (prev > 0 && prev < 85 ? prev + 40 : prev));
          }, 180);
        });
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3.5px] overflow-hidden"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Background track glow */}
      <div
        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all ease-out shadow-[0_0_14px_rgba(239,68,68,0.9)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.35s ease 0.1s' : 'width 0.28s ease-out',
        }}
      >
        {/* Leading bright glow light head */}
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-r from-transparent to-white/90 blur-[1.5px]" />
      </div>
    </div>
  );
}

export const TopProgressBar: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
};
