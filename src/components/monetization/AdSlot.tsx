'use client';

import React from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = 'default-slot',
  format = 'horizontal',
  className = '',
}) => {
  const formatClasses = {
    horizontal: 'min-h-[90px] w-full max-w-4xl py-3',
    rectangle: 'min-h-[250px] w-full max-w-[300px] p-4',
    vertical: 'min-h-[600px] w-full max-w-[160px] p-4',
  };

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 mx-auto flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 transition-colors ${formatClasses[format]} ${className}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
        Sponsored Advertisement
      </div>
      
      {/* Real AdSense container or clean neutral placeholder */}
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/80 p-4 text-center text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-400">
          Ad Slot ({format}) • {slotId}
        </span>
      </div>
    </aside>
  );
};
