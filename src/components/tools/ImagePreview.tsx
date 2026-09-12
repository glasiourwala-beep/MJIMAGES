'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, FileImage, Sparkles } from 'lucide-react';

interface ImagePreviewProps {
  originalSrc: string;
  originalName: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  resultSrc?: string | null;
  resultSize?: number;
  resultWidth?: number;
  resultHeight?: number;
  percentSaved?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalSrc,
  originalName,
  originalSize,
  originalWidth,
  originalHeight,
  resultSrc,
  resultSize,
  resultWidth,
  resultHeight,
  percentSaved,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Visual Previews Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Original Image Card */}
        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-subtle">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Original Image
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
              {formatBytes(originalSize)}
            </span>
          </div>

          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 checkered-bg border border-slate-200/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalSrc}
              alt={originalName || 'Original upload'}
              className="max-h-full max-w-full object-contain p-2"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="truncate max-w-[200px]" title={originalName}>
              {originalName}
            </span>
            {originalWidth && originalHeight && (
              <span className="font-mono text-slate-400">
                {originalWidth} × {originalHeight} px
              </span>
            )}
          </div>
        </div>

        {/* Processed Result Card */}
        {resultSrc ? (
          <div className="flex flex-col rounded-3xl border-2 border-brand-500/80 bg-white p-4 shadow-card animate-fade-in">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
                <CheckCircle2 size={14} className="text-brand-600" />
                <span>Processed Output</span>
              </span>

              {resultSize !== undefined && (
                <div className="flex items-center gap-2">
                  {percentSaved !== undefined && percentSaved > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <Sparkles size={12} />
                      -{percentSaved}%
                    </span>
                  )}
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 font-mono text-xs font-bold text-brand-700">
                    {formatBytes(resultSize)}
                  </span>
                </div>
              )}
            </div>

            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 checkered-bg border border-brand-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultSrc}
                alt="Processed output"
                className="max-h-full max-w-full object-contain p-2"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="text-emerald-700 font-medium">Ready for download</span>
              {resultWidth && resultHeight && (
                <span className="font-mono text-slate-600 font-semibold">
                  {resultWidth} × {resultHeight} px
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-400">
            <FileImage size={36} className="text-slate-300 mb-2" />
            <div className="text-sm font-medium text-slate-500">Output Preview</div>
            <div className="text-xs text-slate-400 mt-1">
              Configure parameters and click process to generate preview
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
