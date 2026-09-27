'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { ToolConfig } from '@/lib/constants/tools';
import { UploadDropzone } from '@/components/tools/UploadDropzone';
import { CropperCanvas, CropRect } from '@/components/tools/CropperCanvas';
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
  Download,
  Trash2,
  Plus,
  RotateCcw,
  Archive,
  CheckCircle2,
  FileImage,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ToolShellProps {
  tool: ToolConfig;
}

export interface ProcessResponseData {
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

export interface FileItem {
  id: string;
  file: File;
  originalPreviewUrl: string;
  naturalDimensions?: { width: number; height: number };
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMsg?: string;
  result?: ProcessResponseData;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const MAX_BULK_LIMIT = 25;

export const ToolShell: React.FC<ToolShellProps> = ({ tool }) => {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [activeCropperIndex, setActiveCropperIndex] = useState<number>(0);

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
  const [processingIndex, setProcessingIndex] = useState<number>(-1);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [downloadedZip, setDownloadedZip] = useState<boolean>(false);
  const addFilesInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      fileItems.forEach((item) => {
        if (item.originalPreviewUrl) {
          URL.revokeObjectURL(item.originalPreviewUrl);
        }
      });
    };
  }, [fileItems]);

  // Handle newly selected uploaded files (Bulk up to 25)
  const handleFilesSelected = (newFiles: File[]) => {
    const availableSlots = MAX_BULK_LIMIT - fileItems.length;
    if (availableSlots <= 0) return;

    const filesToAdd = newFiles.slice(0, availableSlots);
    const newItems: FileItem[] = filesToAdd.map((f) => {
      const objectUrl = URL.createObjectURL(f);
      const item: FileItem = {
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        file: f,
        originalPreviewUrl: objectUrl,
        status: 'idle',
      };

      // Read natural dimensions
      const img = new Image();
      img.onload = () => {
        setFileItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, naturalDimensions: { width: img.naturalWidth, height: img.naturalHeight } }
              : it
          )
        );
        // Set default resize inputs if first file
        if (fileItems.length === 0 && newItems[0]?.id === item.id) {
          setResizeWidth(img.naturalWidth);
          setResizeHeight(img.naturalHeight);
          setCropRect({ left: 0, top: 0, width: img.naturalWidth, height: img.naturalHeight });
        }
      };
      img.src = objectUrl;

      return item;
    });

    setFileItems((prev) => [...prev, ...newItems]);
  };

  // Remove individual file from list
  const handleRemoveItem = (id: string) => {
    setFileItems((prev) => {
      const itemToRemove = prev.find((it) => it.id === id);
      if (itemToRemove?.originalPreviewUrl) {
        URL.revokeObjectURL(itemToRemove.originalPreviewUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  // Clear all files
  const handleClearAll = () => {
    fileItems.forEach((item) => {
      if (item.originalPreviewUrl) {
        URL.revokeObjectURL(item.originalPreviewUrl);
      }
    });
    setFileItems([]);
    setProcessingIndex(-1);
    setIsProcessing(false);
  };

  // Aspect ratio handlers for Resizer
  const activeItemDimensions = fileItems[0]?.naturalDimensions;

  const handleWidthChange = (val: number | '') => {
    setResizeWidth(val);
    if (maintainAspectRatio && activeItemDimensions && typeof val === 'number' && activeItemDimensions.width > 0) {
      const ratio = activeItemDimensions.height / activeItemDimensions.width;
      setResizeHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number | '') => {
    setResizeHeight(val);
    if (maintainAspectRatio && activeItemDimensions && typeof val === 'number' && activeItemDimensions.height > 0) {
      const ratio = activeItemDimensions.width / activeItemDimensions.height;
      setResizeWidth(Math.round(val * ratio));
    }
  };

  const applyScalePercentage = (pct: number) => {
    if (!activeItemDimensions) return;
    const w = Math.round(activeItemDimensions.width * (pct / 100));
    const h = Math.round(activeItemDimensions.height * (pct / 100));
    setResizeWidth(w);
    setResizeHeight(h);
  };

  // ONE-BY-ONE Sequential Processing Queue (Engineered for Render 512MB RAM)
  const handleProcessAll = async () => {
    if (fileItems.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setDownloadedZip(false);

    const pendingItems = fileItems.filter((item) => item.status === 'idle' || item.status === 'error');
    if (pendingItems.length === 0) {
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < fileItems.length; i++) {
      const item = fileItems[i];
      if (item.status === 'done') continue; // Skip already completed items

      setProcessingIndex(i);

      // Set current item status to processing
      setFileItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'processing', errorMsg: undefined } : it))
      );

      const formData = new FormData();
      formData.append('file', item.file);

      // Append tool-specific parameters
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

        // Mark file item as completed with result
        setFileItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: 'done',
                  result: json.data,
                }
              : it
          )
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Processing failed.';
        setFileItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: 'error',
                  errorMsg: message,
                }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
    setProcessingIndex(-1);
  };

  // Single File Download Handler
  const handleSingleDownload = (item: FileItem) => {
    if (!item.result) return;
    const a = document.createElement('a');
    a.href = item.result.downloadUrl;
    a.download = item.result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download All as ZIP (Client-Side created via JSZip - Zero Server RAM Overhead)
  const handleDownloadAllZip = async () => {
    const completedItems = fileItems.filter((it) => it.status === 'done' && it.result);
    if (completedItems.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (const item of completedItems) {
        if (!item.result) continue;
        const res = await fetch(item.result.downloadUrl);
        const blob = await res.blob();
        zip.file(item.result.filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `mjimage-${tool.slug}-bulk-processed.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setDownloadedZip(true);
      setTimeout(() => setDownloadedZip(false), 3000);
    } catch (err) {
      console.error('ZIP compilation failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Stats calculation
  const totalCount = fileItems.length;
  const doneCount = fileItems.filter((it) => it.status === 'done').length;
  const pendingCount = fileItems.filter((it) => it.status === 'idle' || it.status === 'error').length;
  const totalSavedBytes = fileItems.reduce((acc, it) => {
    if (it.status === 'done' && it.result) {
      return acc + (it.file.size - it.result.newSize);
    }
    return acc;
  }, 0);

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
        {fileItems.length === 0 ? (
          /* Step 1: Upload Dropzone View */
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            acceptExtensions={tool.acceptExtensions}
            maxSizeMB={tool.maxSizeMB}
            maxFiles={MAX_BULK_LIMIT}
            currentCount={0}
          />
        ) : (
          /* Step 2: Queue Workbench View */
          <div className="space-y-8 animate-fade-in">
            {/* Top Toolbar / Summary Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-sm">
                  {doneCount}/{totalCount}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Uploaded Images Queue</span>
                    <span className="text-xs font-semibold font-mono bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                      {totalCount} / {MAX_BULK_LIMIT} max
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {doneCount === totalCount
                      ? 'All images processed successfully!'
                      : `${pendingCount} image(s) ready to process. Processed one by one for maximum speed & server stability.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileItems.length < MAX_BULK_LIMIT && (
                  <>
                    <input
                      ref={addFilesInputRef}
                      type="file"
                      multiple
                      accept={tool.acceptExtensions.join(',')}
                      onChange={(e) => {
                        if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addFilesInputRef.current?.click()}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 transition-all disabled:opacity-50"
                    >
                      <Plus size={15} />
                      <span>Add More</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-100 transition-all disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Special Cropper Area (shows active selected image) */}
            {tool.id === 'image-cropper' && fileItems[activeCropperIndex] && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Visual Cropper Preview — Selected Image: <b>{fileItems[activeCropperIndex].file.name}</b></span>
                  {fileItems.length > 1 && (
                    <span className="text-brand-600">
                      Select image below to change crop canvas
                    </span>
                  )}
                </div>
                <CropperCanvas
                  imageSrc={fileItems[activeCropperIndex].originalPreviewUrl}
                  onCropChange={setCropRect}
                  naturalWidth={fileItems[activeCropperIndex].naturalDimensions?.width || 800}
                  naturalHeight={fileItems[activeCropperIndex].naturalDimensions?.height || 600}
                />
              </div>
            )}

            {/* Tool Settings Controls Panel */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sliders size={18} className="text-brand-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Bulk Settings (Applies to all images)
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
                        placeholder="Auto / Keep Original"
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
                        placeholder="Auto / Keep Original"
                      />
                    </div>
                  </div>

                  {/* Aspect Ratio Mode */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Maintain Aspect Ratio
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg">
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
                          <span className="block">Off (Exact Dimensions)</span>
                          <span className="block text-[11px] font-normal text-slate-400">Set width & height independently</span>
                        </div>
                      </label>

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
                          onChange={() => setMaintainAspectRatio(true)}
                          className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                        />
                        <Lock size={14} className={maintainAspectRatio ? 'text-brand-600' : 'text-slate-400'} />
                        <div>
                          <span className="block">On (Locked Ratio)</span>
                          <span className="block text-[11px] font-normal text-slate-400">Preserve proportions</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Quick Scale Factor:</span>
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
                      Background Fill (for Transparent PNGs)
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
                    <span>JPEG Output Quality</span>
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
                      Target Output Format
                    </label>
                    <select
                      value={targetFormat}
                      onChange={(e) => setTargetFormat(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="jpeg">JPG / JPEG (Universal)</option>
                      <option value="png">PNG (Lossless)</option>
                      <option value="webp">WebP (Modern & Small)</option>
                      <option value="avif">AVIF (Next-Gen Efficiency)</option>
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

              {tool.id === 'jpg-to-png' && (
                <p className="text-xs text-slate-500">
                  All uploaded JPGs will be repacked losslessly into 24-bit PNG format with maximum Deflate compression.
                </p>
              )}
            </div>

            {/* Action Bar: Process All & Download All (.ZIP) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleProcessAll}
                disabled={isProcessing || pendingCount === 0}
                className="flex w-full sm:w-auto min-w-[240px] items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-card transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing ({processingIndex + 1}/{totalCount})...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>
                      {pendingCount === totalCount
                        ? `Process All (${totalCount} Images)`
                        : `Process ${pendingCount} Pending Image(s)`}
                    </span>
                  </>
                )}
              </button>

              {doneCount > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={isZipping || isProcessing}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-base font-bold text-white shadow-card transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-elevated active:scale-[0.98] disabled:opacity-50"
                >
                  {isZipping ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Creating ZIP Package...</span>
                    </>
                  ) : downloadedZip ? (
                    <>
                      <Check size={20} className="animate-bounce" />
                      <span>ZIP Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Archive size={20} />
                      <span>Download All ({doneCount} Images .ZIP)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Processing Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Processing images in queue...</span>
                  <span className="font-mono text-brand-600">
                    {Math.round(((doneCount + (processingIndex >= 0 ? 0.5 : 0)) / totalCount) * 100)}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.round(
                        ((doneCount + (processingIndex >= 0 ? 0.5 : 0)) / totalCount) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bulk File Queue List View */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Image Queue ({fileItems.length})</span>
                {totalSavedBytes > 0 && (
                  <span className="text-emerald-700 font-bold font-mono">
                    Total Saved: {formatBytes(totalSavedBytes)}
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
                {fileItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (tool.id === 'image-cropper') setActiveCropperIndex(idx);
                    }}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 transition-colors ${
                      tool.id === 'image-cropper' && activeCropperIndex === idx
                        ? 'bg-brand-50/40 ring-1 ring-brand-300'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Thumbnail & File Details */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 border border-slate-200 checkered-bg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.result?.previewUrl || item.originalPreviewUrl}
                          alt={item.file.name}
                          className="max-h-full max-w-full object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900" title={item.file.name}>
                            {item.file.name}
                          </span>
                          {tool.id === 'image-cropper' && activeCropperIndex === idx && (
                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">
                              Active Canvas
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-mono text-slate-600">{formatBytes(item.file.size)}</span>
                          {item.naturalDimensions && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{item.naturalDimensions.width} × {item.naturalDimensions.height} px</span>
                            </>
                          )}
                          {item.result && (
                            <>
                              <ArrowRight size={12} className="text-slate-400" />
                              <span className="font-mono font-bold text-emerald-700">
                                {formatBytes(item.result.newSize)}
                              </span>
                              {item.result.percentSaved !== undefined && item.result.percentSaved > 0 && (
                                <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                                  <Sparkles size={11} />
                                  -{item.result.percentSaved}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      {/* Status Badge */}
                      <div>
                        {item.status === 'idle' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Ready
                          </span>
                        )}
                        {item.status === 'processing' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 animate-pulse border border-brand-200">
                            <Loader2 size={13} className="animate-spin text-brand-600" />
                            Processing...
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={13} />
                            Completed
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 border border-rose-200" title={item.errorMsg}>
                            <AlertCircle size={13} />
                            Failed
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {item.status === 'done' && (
                          <button
                            type="button"
                            onClick={() => handleSingleDownload(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all"
                            title="Download processed file"
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          disabled={isProcessing}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                          title="Remove from queue"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
