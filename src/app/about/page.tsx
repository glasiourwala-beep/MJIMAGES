import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Sparkles, Heart, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — High Performance & Privacy-First Image Tools',
  description:
    'Learn about MJImage: A high-speed, privacy-first online platform for image compression, resizing, cropping, and format conversion with zero permanent storage.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-4">
          <Sparkles size={14} />
          <span>Our Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About MJImage
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Building the fastest, cleanest, and most privacy-respecting image utility platform on the web.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-card space-y-6 text-slate-700 leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900">
          Why We Built MJImage
        </h2>
        <p>
          Most online image tools today are cluttered with intrusive pop-up ads, paywalls after 2 conversions, forced account creation, and slow server queues. We engineered <strong>MJImage</strong> to be the exact opposite: an unapologetically fast, clean, and free suite of image utilities that just works.
        </p>
        <p>
          Whether you are a developer optimizing assets for web performance, a photographer preparing social media posts, or a designer converting graphics, MJImage provides instant processing without friction.
        </p>

        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Zero Wait Time</h3>
            <p className="text-xs text-slate-500">
              Underpinned by native Libvips C-bindings, delivering image processing in milliseconds.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900">True Privacy</h3>
            <p className="text-xs text-slate-500">
              Uploaded files are stored in isolated memory/temp space and wiped immediately after download.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-slate-900">No Account Friction</h3>
            <p className="text-xs text-slate-500">
              No credit card, no sign-up forms, and no email spam. 100% free for all users.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 pt-4">
          Strict Security & Ephemeral Architecture
        </h2>
        <p>
          We do not own, inspect, catalog, or train AI models on user imagery. Image processing occurs within sandboxed server tasks, strips sensitive EXIF GPS location data by default, and purges all ephemeral file artifacts automatically upon job completion.
        </p>
      </div>

      {/* CTA Card */}
      <div className="rounded-3xl bg-brand-600 p-8 sm:p-10 text-center text-white shadow-elevated">
        <h2 className="text-2xl font-bold">Ready to process your images?</h2>
        <p className="mt-2 text-brand-100 text-sm max-w-md mx-auto">
          Choose from our 7 image tools and experience the speed of MJImage today.
        </p>
        <Link
          href="/image-compressor"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
        >
          <span>Start with Image Compressor</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
