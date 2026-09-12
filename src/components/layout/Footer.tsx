import React from 'react';
import Link from 'next/link';
import { MJLogo } from '@/components/brand/MJLogo';
import { TOOL_LIST } from '@/lib/constants/tools';
import { ShieldCheck, Zap, Lock } from 'lucide-react';
import { GithubIcon, InstagramIcon, TikTokIcon } from '@/components/brand/SocialIcons';
import { EmailButton } from '@/components/brand/EmailButton';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 transition-colors">
      {/* Brand Trust Signals Bar */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Ultra-Fast Processing</h4>
                <p className="text-xs text-slate-500">Optimized Libvips/Sharp engine handles images in milliseconds.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Strict Data Privacy</h4>
                <p className="text-xs text-slate-500">Zero permanent storage. Files are auto-deleted after processing.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">No Account Required</h4>
                <p className="text-xs text-slate-500">100% free, anonymous online image tools with no signup hassle.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <MJLogo size="md" />
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              MJImage is a high-speed, privacy-conscious online image processing suite. Compress, resize, convert, and crop your graphics effortlessly without compromising quality or safety.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/glasiourwala-beep"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
                aria-label="MJImage on GitHub"
              >
                <GithubIcon size={18} />
              </a>

              <a
                href="https://www.instagram.com/mj_rafay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-pink-500 hover:bg-pink-50 hover:text-pink-600"
                aria-label="MJ on Instagram"
              >
                <InstagramIcon size={18} />
              </a>

              <a
                href="https://www.tiktok.com/@mjrafay?_r=1&_t=ZS-99VXHj6Lnxi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-100 hover:text-slate-900"
                aria-label="MJ on TikTok"
              >
                <TikTokIcon size={18} />
              </a>

              <EmailButton variant="icon" />
            </div>
          </div>

          {/* Tools Col 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Compression & Resize
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/image-compressor" className="hover:text-brand-600 transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/image-resizer" className="hover:text-brand-600 transition-colors">
                  Image Resizer
                </Link>
              </li>
              <li>
                <Link href="/image-cropper" className="hover:text-brand-600 transition-colors">
                  Image Cropper
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Format Converters
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/jpg-to-png" className="hover:text-brand-600 transition-colors">
                  JPG to PNG
                </Link>
              </li>
              <li>
                <Link href="/png-to-jpg" className="hover:text-brand-600 transition-colors">
                  PNG to JPG
                </Link>
              </li>
              <li>
                <Link href="/webp-to-jpg" className="hover:text-brand-600 transition-colors">
                  WebP to JPG
                </Link>
              </li>
              <li>
                <Link href="/image-converter" className="hover:text-brand-600 transition-colors">
                  Image Converter
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Company & Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MJImage. All rights reserved. Built for speed, privacy, and precision.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
