'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToolConfig } from '@/lib/constants/tools';
import { UploadDropzone } from '@/components/tools/UploadDropzone';
import { ImagePreview } from '@/components/tools/ImagePreview';
import { CropperCanvas, CropRect } from '@/components/tools/CropperCanvas';
import { DownloadButton } from '@/components/tools/DownloadButton';
import { SEOSection } from '@/components/seo/SEOSection';
import { AdSlot } from '@/components/monetization/AdSlot';
import {
  ChevronRight,
  Sliders,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  Check,
  Zap,
} from 'lucide-react';

interface ToolShellProps {
  tool: ToolConfig;
}

interface ProcessResponseData {
  fileId: string;
  downloadUrl: string;
  filename: string;
  mime: string;
  format: string;
  originalSize: number;
  newSize: number;
  percentSaved?: number;
  width: number;
  height: number;
  previewUrl: string;
}

export const ToolShell: React.FC<ToolShellProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  // Tool-specific option states
  const [quality, setQuality] = useState<number>(85);
  const [lossless, setLossless] = useState<boolean>(false);
  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [targetFormat, setTargetFormat] = useState<string>('jpeg');
  const [cropRect, setCropRect] = useState<CropRect>({ left: 0, top: 0, width: 100, height: 100 });

  // Processing lifecycle states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResponseData | null>(null);

  // Handle uploaded file
  const handleFileSelected = (selectedFile: File) => {
    setErrorMsg(null);
    setResult(null);
    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    setOriginalPreviewUrl(objectUrl);

    // Read natural dimensions
    const img = new Image();
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setResizeWidth(img.naturalWidth);
      setResizeHeight(img.naturalHeight);
      setCropRect({ left: 0, top: 0, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  // Keep aspect ratio when editing width/height
  const handleWidthChange = (val: number | '') => {
    setResizeWidth(val);
    if (maintainAspectRatio && naturalDimensions && typeof val === 'number' && naturalDimensions.width > 0) {
      const ratio = naturalDimensions.height / naturalDimensions.width;
      setResizeHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number | '') => {
    setResizeHeight(val);
    if (maintainAspectRatio && naturalDimensions && typeof val === 'number' && naturalDimensions.height > 0) {
      const ratio = naturalDimensions.width / naturalDimensions.height;
      setResizeWidth(Math.round(val * ratio));
    }
  };

  const applyScalePercentage = (pct: number) => {
    if (!naturalDimensions) return;
    const w = Math.round(naturalDimensions.width * (pct / 100));
    const h = Math.round(naturalDimensions.height * (pct / 100));
    setResizeWidth(w);
    setResizeHeight(h);
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    // Append specific tool parameters
    if (tool.id === 'image-compressor') {
      formData.append('quality', quality.toString());
      formData.append('lossless', lossless.toString());
    } else if (tool.id === 'image-resizer') {
      if (resizeWidth) formData.append('width', resizeWidth.toString());
      if (resizeHeight) formData.append('height', resizeHeight.toString());
      formData.append('maintainAspect', maintainAspectRatio.toString());
    } else if (tool.id === 'png-to-jpg') {
      formData.append('quality', quality.toString());
      formData.append('backgroundColor', backgroundColor);
    } else if (tool.id === 'webp-to-jpg') {
      formData.append('quality', quality.toString());
    } else if (tool.id === 'image-cropper') {
      formData.append('left', cropRect.left.toString());
      formData.append('top', cropRect.top.toString());
      formData.append('width', cropRect.width.toString());
      formData.append('height', cropRect.height.toString());
    } else if (tool.id === 'image-converter') {
      formData.append('targetFormat', targetFormat);
      formData.append('quality', quality.toString());
      formData.append('backgroundColor', backgroundColor);
    }

    try {
      const res = await fetch(tool.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process image.');
      }

      setResult(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during processing.';
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setFile(null);
    setOriginalPreviewUrl(null);
    setNaturalDimensions(null);
    setResult(null);
    setErrorMsg(null);
    setMaintainAspectRatio(false);
  };

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }
    };
  }, [originalPreviewUrl]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-900 font-semibold">{tool.name}</span>
      </nav>

      {/* Tool Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {tool.name}
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          {tool.heroDescription}
        </p>
      </div>

      {/* Primary Tool Card / Workbench */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-card">
        {!file ? (
          /* Step 1: Upload View */
          <UploadDropzone
            onFileSelected={handleFileSelected}
            acceptExtensions={tool.acceptExtensions}
            maxSizeMB={tool.maxSizeMB}
          />
        ) : (
          /* Step 2: Configure & Process View */
          <div className="space-y-8 animate-fade-in">
            {/* Cropper interactive area or standard comparison previews */}
            {tool.id === 'image-cropper' && originalPreviewUrl && naturalDimensions ? (
              <div className="space-y-4">
                <CropperCanvas
                  imageSrc={originalPreviewUrl}
                  onCropChange={setCropRect}
                  naturalWidth={naturalDimensions.width}
                  naturalHeight={naturalDimensions.height}
                />
              </div>
            ) : (
              <ImagePreview
                originalSrc={originalPreviewUrl || ''}
                originalName={file.name}
                originalSize={file.size}
                originalWidth={naturalDimensions?.width}
                originalHeight={naturalDimensions?.height}
                resultSrc={result?.previewUrl}
                resultSize={result?.newSize}
                resultWidth={result?.width}
                resultHeight={result?.height}
                percentSaved={result?.percentSaved}
              />
            )}

            {/* Tool-Specific Controls Panel */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sliders size={18} className="text-brand-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Tool Settings
                </h3>
              </div>

              {/* 1. Image Compressor Controls */}
              {tool.id === 'image-compressor' && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                      <span>Compression Quality</span>
                      <span className="font-bold text-brand-600 font-mono">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                      className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Smaller File (10%)</span>
                      <span>Balanced (80%)</span>
                      <span>Best Quality (95%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Image Resizer Controls */}
              {tool.id === 'image-resizer' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8000}
                        value={resizeWidth}
                        onChange={(e) => handleWidthChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8000}
                        value={resizeHeight}
                        onChange={(e) => handleHeightChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  {/* Aspect Ratio Mode (Radio Buttons - Default Off) */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Maintain Aspect Ratio
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg">
                      {/* Radio Option 1: Off (Default) */}
                      <label
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          !maintainAspectRatio
                            ? 'bg-white border-brand-500 ring-2 ring-brand-500/15 shadow-xs font-semibold text-slate-900'
                            : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 font-medium'
                        }`}
                      >
                        <input
                          type="radio"
                          name="maintainAspectRatio"
                          value="off"
                          checked={!maintainAspectRatio}
                          onChange={() => setMaintainAspectRatio(false)}
                          className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                        />
                        <Unlock size={14} className={!maintainAspectRatio ? 'text-brand-600' : 'text-slate-400'} />
                        <div>
                          <span className="block">Off (Freeform)</span>
                          <span className="block text-[11px] font-normal text-slate-400">Scale width & height freely</span>
                        </div>
                      </label>

                      {/* Radio Option 2: On */}
                      <label
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          maintainAspectRatio
                            ? 'bg-white border-brand-500 ring-2 ring-brand-500/15 shadow-xs font-semibold text-slate-900'
                            : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 font-medium'
                        }`}
                      >
                        <input
                          type="radio"
                          name="maintainAspectRatio"
                          value="on"
                          checked={maintainAspectRatio}
                          onChange={() => {
                            setMaintainAspectRatio(true);
                            if (naturalDimensions && typeof resizeWidth === 'number' && naturalDimensions.width > 0) {
                              const ratio = naturalDimensions.height / naturalDimensions.width;
                              setResizeHeight(Math.round(resizeWidth * ratio));
                            }
                          }}
                          className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                        />
                        <Lock size={14} className={maintainAspectRatio ? 'text-brand-600' : 'text-slate-400'} />
                        <div>
                          <span className="block">On (Locked)</span>
                          <span className="block text-[11px] font-normal text-slate-400">Preserve image proportions</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Quick Scale:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[25, 50, 75, 100, 150].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => applyScalePercentage(pct)}
                          className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PNG to JPG Controls */}
              {tool.id === 'png-to-jpg' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>JPG Quality</span>
                      <span className="font-bold text-brand-600 font-mono">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                      className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Background Fill (for Transparent Areas)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 p-0.5 bg-white"
                      />
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {backgroundColor.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBackgroundColor('#FFFFFF')}
                        className="ml-auto rounded bg-white px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-100"
                      >
                        White
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackgroundColor('#000000')}
                        className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-100"
                      >
                        Black
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. WebP to JPG Controls */}
              {tool.id === 'webp-to-jpg' && (
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>JPEG Quality</span>
                    <span className="font-bold text-brand-600 font-mono">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>
              )}

              {/* 5. Image Converter Controls */}
              {tool.id === 'image-converter' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Format
                    </label>
                    <select
                      value={targetFormat}
                      onChange={(e) => setTargetFormat(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="jpeg">JPG / JPEG (Universal)</option>
                      <option value="png">PNG (Lossless)</option>
                      <option value="webp">WebP (Modern & Small)</option>
                      <option value="avif">AVIF (Next-Gen High Efficiency)</option>
                      <option value="tiff">TIFF (Archival)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span>Quality</span>
                      <span className="font-bold text-brand-600 font-mono">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                      className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* JPG to PNG & Cropper descriptions */}
              {tool.id === 'jpg-to-png' && (
                <p className="text-xs text-slate-500">
                  JPG will be losslessly repacked into standard 24-bit PNG format with maximum Deflate compression.
                </p>
              )}
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm animate-fade-in">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-rose-600" />
                <div>
                  <span className="font-semibold">Error:</span> {errorMsg}
                </div>
              </div>
            )}

            {/* Processing / Download CTA Action Buttons */}
            {!result ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="flex w-full sm:w-auto min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-card transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing Image...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      <span>Process {tool.name}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <DownloadButton
                downloadUrl={result.downloadUrl}
                filename={result.filename}
                onReset={handleReset}
                fileSizeBytes={result.newSize}
              />
            )}
          </div>
        )}
      </div>

      {/* AdSense Placement */}
      <AdSlot slotId={`tool-${tool.id}-bottom`} />

      {/* SEO Educational Content, FAQ & Related Tools */}
      <SEOSection tool={tool} />
    </div>
  );
};
