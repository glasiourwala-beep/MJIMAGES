'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MJLogo } from '@/components/brand/MJLogo';
import { TOOL_LIST } from '@/lib/constants/tools';
import {
  ChevronDown,
  Menu,
  X,
  Minimize2,
  Maximize2,
  FileImage,
  Image as ImageIcon,
  Sparkles,
  Crop,
  RefreshCw,
  ArrowRight,
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

export const Navbar: React.FC = () => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <MJLogo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {/* Tools Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1.5 py-2 transition-colors ${
                  toolsOpen || pathname.startsWith('/image-') || pathname.includes('-to-')
                    ? 'text-brand-600 font-semibold'
                    : 'text-slate-700 hover:text-brand-600'
                }`}
                aria-expanded={toolsOpen}
                aria-haspopup="true"
              >
                <span>Image Tools</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'}`}
                />
              </button>

              {/* Dropdown Panel */}
              {toolsOpen && (
                <div className="absolute left-0 top-full mt-2 w-[520px] rounded-2xl border border-slate-200 bg-white p-4 shadow-dropdown animate-slide-up grid grid-cols-2 gap-2">
                  <div className="col-span-2 pb-2 px-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      All 7 Free Image Tools
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">100% Free & Secure</span>
                  </div>

                  {TOOL_LIST.map((tool) => {
                    const IconComp = iconMap[tool.iconName] || ImageIcon;
                    const isActive = pathname === `/${tool.slug}`;

                    return (
                      <Link
                        key={tool.id}
                        href={`/${tool.slug}`}
                        className={`flex items-start gap-3 rounded-xl p-2.5 transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 font-medium'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`mt-0.5 rounded-lg p-2 ${
                            isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700'
                          }`}
                        >
                          <IconComp size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold leading-tight">{tool.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {tool.shortDescription}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`transition-colors ${
                pathname === '/about' ? 'text-brand-600 font-semibold' : 'text-slate-700 hover:text-brand-600'
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`transition-colors ${
                pathname === '/contact' ? 'text-brand-600 font-semibold' : 'text-slate-700 hover:text-brand-600'
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Desktop CTA Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/image-compressor"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98]"
          >
            <span>Compress Image</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-fade-in">
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Image Tools
            </div>
            {TOOL_LIST.map((tool) => {
              const IconComp = iconMap[tool.iconName] || ImageIcon;
              const isActive = pathname === `/${tool.slug}`;

              return (
                <Link
                  key={tool.id}
                  href={`/${tool.slug}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <IconComp size={18} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                  <span>{tool.name}</span>
                </Link>
              );
            })}

            <div className="my-3 border-t border-slate-100 pt-2">
              <Link
                href="/about"
                className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                  pathname === '/about' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                About MJImage
              </Link>
              <Link
                href="/contact"
                className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                  pathname === '/contact' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Contact & Support
              </Link>
              <Link
                href="/privacy"
                className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                  pathname === '/privacy' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                  pathname === '/terms' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
