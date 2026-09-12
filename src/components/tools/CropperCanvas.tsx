'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  Move,
  RotateCcw,
  Maximize,
  Sliders,
  Check,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
} from 'lucide-react';

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CropperCanvasProps {
  imageSrc: string;
  onCropChange: (rect: CropRect) => void;
  naturalWidth: number;
  naturalHeight: number;
}

export type AspectRatioMode = 'free' | '1:1' | '16:9' | '4:3' | '3:2' | '9:16';

export const CropperCanvas: React.FC<CropperCanvasProps> = ({
  imageSrc,
  onCropChange,
  naturalWidth,
  naturalHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop rectangle in natural pixel coordinates
  const [pixelCrop, setPixelCrop] = useState<CropRect>({
    left: Math.round(naturalWidth * 0.1),
    top: Math.round(naturalHeight * 0.1),
    width: Math.round(naturalWidth * 0.8),
    height: Math.round(naturalHeight * 0.8),
  });

  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('free');
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{
    clientX: number;
    clientY: number;
    initialCrop: CropRect;
    renderedImgRect: DOMRect;
  } | null>(null);

  // Helper to get aspect ratio numeric value
  const getAspectRatioNumeric = (mode: AspectRatioMode): number | null => {
    switch (mode) {
      case '1:1':
        return 1;
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      case '3:2':
        return 3 / 2;
      case '9:16':
        return 9 / 16;
      default:
        return null;
    }
  };

  // Keep parent updated whenever pixelCrop changes
  useEffect(() => {
    onCropChange(pixelCrop);
  }, [pixelCrop, onCropChange]);

  // Apply Aspect Ratio preset
  const applyAspectRatio = useCallback(
    (mode: AspectRatioMode) => {
      setAspectMode(mode);
      const ratio = getAspectRatioNumeric(mode);

      if (!ratio) return;

      let newWidth = naturalWidth * 0.8;
      let newHeight = newWidth / ratio;

      if (newHeight > naturalHeight * 0.9) {
        newHeight = naturalHeight * 0.8;
        newWidth = newHeight * ratio;
      }

      newWidth = Math.round(Math.min(naturalWidth, Math.max(10, newWidth)));
      newHeight = Math.round(Math.min(naturalHeight, Math.max(10, newHeight)));

      const newLeft = Math.round((naturalWidth - newWidth) / 2);
      const newTop = Math.round((naturalHeight - newHeight) / 2);

      const nextCrop = {
        left: Math.max(0, newLeft),
        top: Math.max(0, newTop),
        width: newWidth,
        height: newHeight,
      };

      setPixelCrop(nextCrop);
    },
    [naturalWidth, naturalHeight]
  );

  // Quick Action Helpers
  const handleSelectAll = () => {
    setAspectMode('free');
    setPixelCrop({
      left: 0,
      top: 0,
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  const handleResetCenter = () => {
    setAspectMode('free');
    const w = Math.round(naturalWidth * 0.8);
    const h = Math.round(naturalHeight * 0.8);
    setPixelCrop({
      left: Math.round((naturalWidth - w) / 2),
      top: Math.round((naturalHeight - h) / 2),
      width: w,
      height: h,
    });
  };

  // Drag start (Mouse & Touch)
  const startDrag = (clientX: number, clientY: number, handle: string) => {
    if (!imgRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();

    setIsDragging(true);
    setActiveHandle(handle);
    setDragOrigin({
      clientX,
      clientY,
      initialCrop: { ...pixelCrop },
      renderedImgRect: imgRect,
    });
  };

  const onMouseDownHandle = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY, handle);
  };

  const onTouchStartHandle = (e: React.TouchEvent, handle: string) => {
    if (e.touches.length > 0) {
      e.stopPropagation();
      startDrag(e.touches[0].clientX, e.touches[0].clientY, handle);
    }
  };

  // Dragging movement listener
  useEffect(() => {
    if (!isDragging || !dragOrigin) return;

    const scaleX = naturalWidth / dragOrigin.renderedImgRect.width;
    const scaleY = naturalHeight / dragOrigin.renderedImgRect.height;
    const ratio = getAspectRatioNumeric(aspectMode);

    const handleMove = (clientX: number, clientY: number) => {
      const deltaX = (clientX - dragOrigin.clientX) * scaleX;
      const deltaY = (clientY - dragOrigin.clientY) * scaleY;
      const init = dragOrigin.initialCrop;

      let nextLeft = init.left;
      let nextTop = init.top;
      let nextWidth = init.width;
      let nextHeight = init.height;

      if (activeHandle === 'move') {
        nextLeft = Math.max(0, Math.min(naturalWidth - init.width, Math.round(init.left + deltaX)));
        nextTop = Math.max(0, Math.min(naturalHeight - init.height, Math.round(init.top + deltaY)));
      } else {
        // Handle resizing with bounds and aspect ratio lock
        if (activeHandle?.includes('e')) {
          nextWidth = Math.max(20, Math.min(naturalWidth - init.left, Math.round(init.width + deltaX)));
        }
        if (activeHandle?.includes('s')) {
          nextHeight = Math.max(20, Math.min(naturalHeight - init.top, Math.round(init.height + deltaY)));
        }
        if (activeHandle?.includes('w')) {
          const maxExpandLeft = init.left + init.width - 20;
          const targetLeft = Math.max(0, Math.min(maxExpandLeft, Math.round(init.left + deltaX)));
          nextWidth = init.width + (init.left - targetLeft);
          nextLeft = targetLeft;
        }
        if (activeHandle?.includes('n')) {
          const maxExpandTop = init.top + init.height - 20;
          const targetTop = Math.max(0, Math.min(maxExpandTop, Math.round(init.top + deltaY)));
          nextHeight = init.height + (init.top - targetTop);
          nextTop = targetTop;
        }

        // Apply aspect ratio constraints if active
        if (ratio) {
          if (activeHandle === 'e' || activeHandle === 'w' || activeHandle === 'se' || activeHandle === 'sw') {
            nextHeight = Math.round(nextWidth / ratio);
            if (nextTop + nextHeight > naturalHeight) {
              nextHeight = naturalHeight - nextTop;
              nextWidth = Math.round(nextHeight * ratio);
            }
          } else if (activeHandle === 'n' || activeHandle === 's' || activeHandle === 'ne' || activeHandle === 'nw') {
            nextWidth = Math.round(nextHeight * ratio);
            if (nextLeft + nextWidth > naturalWidth) {
              nextWidth = naturalWidth - nextLeft;
              nextHeight = Math.round(nextWidth / ratio);
            }
          }
        }
      }

      setPixelCrop({
        left: Math.max(0, Math.min(naturalWidth - 10, nextLeft)),
        top: Math.max(0, Math.min(naturalHeight - 10, nextTop)),
        width: Math.max(10, Math.min(naturalWidth - nextLeft, nextWidth)),
        height: Math.max(10, Math.min(naturalHeight - nextTop, nextHeight)),
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const endDrag = () => {
      setIsDragging(false);
      setActiveHandle(null);
      setDragOrigin(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchcancel', endDrag);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', endDrag);
      window.removeEventListener('touchcancel', endDrag);
    };
  }, [isDragging, activeHandle, dragOrigin, naturalWidth, naturalHeight, aspectMode]);

  // Convert pixel crop to CSS percentage values relative to the displayed image
  const cropPercent = {
    left: (pixelCrop.left / naturalWidth) * 100,
    top: (pixelCrop.top / naturalHeight) * 100,
    width: (pixelCrop.width / naturalWidth) * 100,
    height: (pixelCrop.height / naturalHeight) * 100,
  };

  return (
    <div className="space-y-5 select-none">
      {/* 1. Aspect Ratio Presets Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1.5 flex items-center gap-1">
            <Crop size={13} className="text-brand-600" />
            Aspect:
          </span>

          {(
            [
              { id: 'free', label: 'Free', icon: Maximize },
              { id: '1:1', label: '1:1 Square', icon: Square },
              { id: '16:9', label: '16:9 Landscape', icon: Monitor },
              { id: '4:3', label: '4:3 Classic', icon: Monitor },
              { id: '3:2', label: '3:2 Photo', icon: Monitor },
              { id: '9:16', label: '9:16 Story', icon: Smartphone },
            ] as { id: AspectRatioMode; label: string; icon: React.ComponentType<{ size: number }> }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyAspectRatio(item.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                aspectMode === item.id
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <item.icon size={12} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Action Helpers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Maximize size={13} />
            <span>Select All</span>
          </button>

          <button
            type="button"
            onClick={handleResetCenter}
            className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Center Box</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Cropper Canvas Workspace */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-slate-950 checkered-bg border border-slate-800 p-2 sm:p-4 min-h-[360px] max-h-[550px]"
      >
        {/* Relative wrapper hugging the natural image bounds */}
        <div className="relative inline-block max-h-[500px] max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop area"
            className="block max-h-[500px] w-auto max-w-full object-contain rounded-lg pointer-events-none"
            draggable={false}
          />

          {/* Dimmed backdrop outside active crop box */}
          <div className="absolute inset-0 bg-black/60 pointer-events-none rounded-lg" />

          {/* Active Highlighted Crop Box */}
          <div
            style={{
              left: `${cropPercent.left}%`,
              top: `${cropPercent.top}%`,
              width: `${cropPercent.width}%`,
              height: `${cropPercent.height}%`,
            }}
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move transition-shadow"
            onMouseDown={(e) => onMouseDownHandle(e, 'move')}
            onTouchStart={(e) => onTouchStartHandle(e, 'move')}
          >
            {/* Rule of Thirds Grid Lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div />
            </div>

            {/* Center Drag Glyph */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
              <div className="rounded-full bg-slate-900/60 p-2 text-white backdrop-blur-sm shadow-md">
                <Move size={18} />
              </div>
            </div>

            {/* Corner Resize Handles */}
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'nw')}
              onTouchStart={(e) => onTouchStartHandle(e, 'nw')}
              className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full border-2 border-brand-500 bg-white shadow-lg cursor-nwse-resize hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'ne')}
              onTouchStart={(e) => onTouchStartHandle(e, 'ne')}
              className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full border-2 border-brand-500 bg-white shadow-lg cursor-nesw-resize hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'sw')}
              onTouchStart={(e) => onTouchStartHandle(e, 'sw')}
              className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full border-2 border-brand-500 bg-white shadow-lg cursor-nesw-resize hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'se')}
              onTouchStart={(e) => onTouchStartHandle(e, 'se')}
              className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-full border-2 border-brand-500 bg-white shadow-lg cursor-nwse-resize hover:scale-125 transition-transform"
            />

            {/* Edge Midpoint Resize Handles */}
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'n')}
              onTouchStart={(e) => onTouchStartHandle(e, 'n')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-8 rounded-full border border-brand-500 bg-white shadow cursor-ns-resize"
            />
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 's')}
              onTouchStart={(e) => onTouchStartHandle(e, 's')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-8 rounded-full border border-brand-500 bg-white shadow cursor-ns-resize"
            />
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'w')}
              onTouchStart={(e) => onTouchStartHandle(e, 'w')}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-8 w-3 rounded-full border border-brand-500 bg-white shadow cursor-ew-resize"
            />
            <div
              onMouseDown={(e) => onMouseDownHandle(e, 'e')}
              onTouchStart={(e) => onTouchStartHandle(e, 'e')}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-8 w-3 rounded-full border border-brand-500 bg-white shadow cursor-ew-resize"
            />
          </div>
        </div>
      </div>

      {/* 3. Real-Time Dimension Status & Precision Numeric Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        {/* Live Selection Summary */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles size={14} className="text-brand-600" />
            <span>Active Crop Dimensions</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900">
              {pixelCrop.width} <span className="text-slate-400 font-normal">×</span> {pixelCrop.height}
            </span>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
              Pixels
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Original image size: {naturalWidth} × {naturalHeight} px
          </p>
        </div>

        {/* Precision Numeric Coordinates Inputs */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">X (Left)</label>
            <input
              type="number"
              min={0}
              max={naturalWidth - 10}
              value={pixelCrop.left}
              onChange={(e) => {
                const val = Math.max(0, Math.min(naturalWidth - 10, parseInt(e.target.value, 10) || 0));
                setPixelCrop((prev) => ({
                  ...prev,
                  left: val,
                  width: Math.min(prev.width, naturalWidth - val),
                }));
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Y (Top)</label>
            <input
              type="number"
              min={0}
              max={naturalHeight - 10}
              value={pixelCrop.top}
              onChange={(e) => {
                const val = Math.max(0, Math.min(naturalHeight - 10, parseInt(e.target.value, 10) || 0));
                setPixelCrop((prev) => ({
                  ...prev,
                  top: val,
                  height: Math.min(prev.height, naturalHeight - val),
                }));
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Width</label>
            <input
              type="number"
              min={10}
              max={naturalWidth - pixelCrop.left}
              value={pixelCrop.width}
              onChange={(e) => {
                const val = Math.max(10, Math.min(naturalWidth - pixelCrop.left, parseInt(e.target.value, 10) || 10));
                setPixelCrop((prev) => ({ ...prev, width: val }));
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Height</label>
            <input
              type="number"
              min={10}
              max={naturalHeight - pixelCrop.top}
              value={pixelCrop.height}
              onChange={(e) => {
                const val = Math.max(10, Math.min(naturalHeight - pixelCrop.top, parseInt(e.target.value, 10) || 10));
                setPixelCrop((prev) => ({ ...prev, height: val }));
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
