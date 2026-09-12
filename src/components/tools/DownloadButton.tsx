'use client';

import React, { useState } from 'react';
import { Download, Check, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface DownloadButtonProps {
  downloadUrl: string;
  filename: string;
  onReset: () => void;
  onAdjust?: () => void;
  fileSizeBytes?: number;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return ` (${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]})`;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  downloadUrl,
  filename,
  onReset,
  onAdjust,
  fileSizeBytes,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={handleDownload}
        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-base font-bold text-white shadow-card transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-elevated active:scale-[0.98]"
      >
        {downloaded ? (
          <>
            <Check size={20} className="text-white animate-bounce" />
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Download Image{formatBytes(fileSizeBytes)}</span>
          </>
        )}
      </button>

      {onAdjust && (
        <button
          type="button"
          onClick={onAdjust}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-6 py-3.5 text-sm font-semibold text-brand-700 shadow-subtle transition-all hover:bg-brand-100/80 active:scale-[0.98]"
        >
          <SlidersHorizontal size={16} />
          <span>Adjust & Re-Process</span>
        </button>
      )}

      <button
        type="button"
        onClick={onReset}
        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-subtle transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
      >
        <RefreshCw size={16} />
        <span>New Image</span>
      </button>
    </div>
  );
};
