import React from 'react';
import Link from 'next/link';
import { TOOL_LIST } from '@/lib/constants/tools';
import { AdSlot } from '@/components/monetization/AdSlot';
import {
  Minimize2,
  Maximize2,
  FileImage,
  Image as ImageIcon,
  Sparkles,
  Crop,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
} from 'lucide-react';

const iconMap = {
  Minimize2,
  Maximize2,
  FileImage,
  Image: ImageIcon,
  Sparkles,
  Crop,
  RefreshCw,
};

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-8 sm:pb-12 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Subtle Feature Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm mb-6">
            <Sparkles size={14} className="text-brand-600" />
            <span>Fast, Private & Free Online Image Utility</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            MJImage — <span className="text-brand-600">Simple, Fast</span> Image Tools
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Compress, resize, crop and convert your images online. No registration required, high quality results, and complete privacy.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/image-compressor"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-brand-600 px-7 py-3.5 text-base font-bold text-white shadow-card transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]"
            >
              <span>Compress Images Free</span>
              <ArrowRight size={18} />
            </Link>

            <a
              href="#tools-grid"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-subtle transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              <span>Explore All 7 Tools</span>
            </a>
          </div>

          {/* Key Trust Signals */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" /> No Account Needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" /> Auto-Deletes in 15 Mins
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" /> Strips Sensitive EXIF
            </span>
          </div>
        </div>
      </section>

      {/* 2. Exactly the 7 Tools Grid */}
      <section id="tools-grid" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Image Tool Suite
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Select an image tool below to process your photos instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_LIST.map((tool) => {
            const IconComp = iconMap[tool.iconName] || ImageIcon;

            return (
              <Link
                key={tool.id}
                href={`/${tool.slug}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-elevated"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <IconComp size={24} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {tool.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-sm font-bold text-brand-600 group-hover:gap-2.5 transition-all">
                  <span>Use Tool</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AdSense Slot */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slotId="home-mid-banner" />
      </div>

      {/* 3. How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simple 3-Step Workflow
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              No technical expertise needed. Fast, straightforward, and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-extrabold text-lg shadow-md">
                1
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Choose & Upload</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                Select your tool and drag & drop your image file or paste directly from your clipboard.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-extrabold text-lg shadow-md">
                2
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Configure & Process</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                Adjust compression quality, set dimensions, crop bounds, or select target formats.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-extrabold text-lg shadow-md">
                3
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Instant Download</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                Preview your processed output and save it instantly to your device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features / Why MJImage */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Creators & Developers
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Professional image processing infrastructure with zero overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-5">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Libvips Accelerated</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Powered by Libvips and Sharp, executing transformations up to 8x faster than traditional image suites with minimal RAM consumption.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Zero Retention Policy</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              We never save or train on your photos. Uploaded files are isolated, processed, and purged automatically.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-subtle">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-5">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">EXIF Stripping</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Sensitive GPS location coordinates, camera serials, and personal EXIF metadata are stripped from output files for maximum privacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
