'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, FileType, AlertCircle, Layers } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptExtensions: string[];
  maxSizeMB?: number;
  maxFiles?: number;
  disabled?: boolean;
  currentCount?: number;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  acceptExtensions,
  maxSizeMB = 25,
  maxFiles = 25,
  disabled = false,
  currentCount = 0,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = Math.max(0, maxFiles - currentCount);

  const processAndValidateFiles = useCallback(
    (fileList: FileList | File[]) => {
      setWarningMsg(null);
      const filesArray = Array.from(fileList);

      if (filesArray.length === 0) return;

      if (remainingSlots <= 0) {
        setWarningMsg(`Maximum limit of ${maxFiles} images has already been reached.`);
        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of filesArray) {
        if (validFiles.length >= remainingSlots) {
          errors.push(`Maximum batch limit is ${maxFiles} images. Only the first ${validFiles.length} images were added.`);
          break;
        }

        // 1. Check size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          errors.push(`'${file.name}' is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB > ${maxSizeMB} MB limit).`);
          continue;
        }

        // 2. Check extension
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptExtensions.some(
          (allowed) =>
            allowed.toLowerCase() === ext ||
            (allowed === '.jpg' && ext === '.jpeg') ||
            (allowed === '.jpeg' && ext === '.jpg')
        );

        if (!isAccepted) {
          errors.push(`'${file.name}' format ('${ext}') is not supported.`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        setWarningMsg(errors.join(' '));
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [acceptExtensions, maxSizeMB, maxFiles, remainingSlots, onFilesSelected]
  );

  // Paste from clipboard support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || remainingSlots <= 0) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        processAndValidateFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, remainingSlots, processAndValidateFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && remainingSlots > 0) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || remainingSlots <= 0) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndValidateFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled && remainingSlots > 0 && inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndValidateFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex min-h-[280px] sm:min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[1.008]'
            : 'border-slate-300/80 bg-white hover:border-brand-400 hover:bg-slate-50/50 shadow-subtle hover:shadow-card'
        } ${disabled || remainingSlots <= 0 ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptExtensions.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload Image Files"
        />

        {/* Dynamic Icon */}
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            isDragOver ? 'bg-brand-600 text-white scale-110' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <UploadCloud size={38} strokeWidth={1.8} />
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">
          Drop your images here, or <span className="text-brand-600 underline underline-offset-4 decoration-brand-300">browse</span>
        </h3>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          <Layers size={14} />
          <span>Bulk Upload Supported: Select up to {maxFiles} images at once</span>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md">
          Supports {acceptExtensions.map((e) => e.replace('.', '').toUpperCase()).join(', ')} files up to {maxSizeMB} MB each. You can also paste directly with <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600">Ctrl+V</kbd>.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {acceptExtensions.map((ext) => (
            <span
              key={ext}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 font-mono uppercase"
            >
              <FileType size={12} className="text-slate-400" />
              {ext.replace('.', '')}
            </span>
          ))}
        </div>
      </div>

      {/* Warning/Error Message Box */}
      {warningMsg && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm animate-fade-in">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Notice:</span> {warningMsg}
          </div>
        </div>
      )}
    </div>
  );
};
