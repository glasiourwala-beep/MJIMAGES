'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, FileType } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  acceptExtensions: string[];
  maxSizeMB?: number;
  disabled?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  acceptExtensions,
  maxSizeMB = 25,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleValidateAndSelect = useCallback(
    (file: File) => {
      setErrorMsg(null);

      // 1. File size check
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setErrorMsg(`The selected file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum limit is ${maxSizeMB} MB.`);
        return;
      }

      // 2. Extension check
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptExtensions.some(
        (allowed) => allowed.toLowerCase() === ext || (allowed === '.jpg' && ext === '.jpeg') || (allowed === '.jpeg' && ext === '.jpg')
      );

      if (!isAccepted) {
        setErrorMsg(`File format '${ext}' is not supported for this tool. Supported formats: ${acceptExtensions.join(', ')}`);
        return;
      }

      onFileSelected(file);
    },
    [acceptExtensions, maxSizeMB, onFileSelected]
  );

  // Paste from clipboard support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleValidateAndSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, handleValidateAndSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
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
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSelect(e.target.files[0]);
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
        className={`group relative flex min-h-[300px] sm:min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[1.008]'
            : 'border-slate-300/80 bg-white hover:border-brand-400 hover:bg-slate-50/50 shadow-subtle hover:shadow-card'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptExtensions.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload Image File"
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
          Drop your image here, or <span className="text-brand-600 underline underline-offset-4 decoration-brand-300">browse</span>
        </h3>

        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Supports {acceptExtensions.map((e) => e.replace('.', '').toUpperCase()).join(', ')} files up to {maxSizeMB} MB. You can also paste directly with <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600">Ctrl+V</kbd>.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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

      {/* Error Message Box */}
      {errorMsg && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm animate-fade-in">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-rose-600" />
          <div>
            <span className="font-semibold">Unable to accept file:</span> {errorMsg}
          </div>
        </div>
      )}
    </div>
  );
};
