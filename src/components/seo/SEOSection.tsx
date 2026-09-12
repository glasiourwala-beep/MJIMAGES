'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToolConfig, TOOLS } from '@/lib/constants/tools';
import {
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SEOSectionProps {
  tool: ToolConfig;
}

export const SEOSection: React.FC<SEOSectionProps> = ({ tool }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const relatedTools = tool.relatedToolSlugs
    .map((slug) => TOOLS[slug])
    .filter(Boolean);

  return (
    <div className="mt-16 space-y-16 border-t border-slate-200/80 pt-16">
      {/* 1. How It Works - Step by Step */}
      <section aria-labelledby="how-it-works-title">
        <div className="text-center max-w-2xl mx-auto">
          <h2 id="how-it-works-title" className="text-2xl font-bold text-slate-900 tracking-tight">
            How to use the {tool.name}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Process your images in 3 effortless steps right in your browser.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tool.howItWorks.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle transition-all hover:shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">
                {step.step}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Key Benefits */}
      <section aria-labelledby="key-benefits-title" className="rounded-3xl bg-slate-50/80 p-8 sm:p-10 border border-slate-200/70">
        <div className="max-w-2xl">
          <h2 id="key-benefits-title" className="text-2xl font-bold text-slate-900 tracking-tight">
            Engineered for speed, quality & security
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Why professional creators, developers, and designers choose MJImage.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tool.keyBenefits.map((benefit, i) => (
            <div key={i} className="flex gap-4">
              <div className="mt-1 flex-shrink-0 text-brand-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. In-depth Educational Guide */}
      {tool.contentSections.length > 0 && (
        <section aria-labelledby="educational-content-title" className="prose prose-slate max-w-none">
          <div className="space-y-8">
            {tool.contentSections.map((sec, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900">{sec.title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm sm:text-base">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Frequently Asked Questions (FAQ) */}
      <section aria-labelledby="faq-title" className="max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 mb-2">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 id="faq-title" className="text-2xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {tool.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Related Tools Internal Linking */}
      {relatedTools.length > 0 && (
        <section aria-labelledby="related-tools-title" className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 id="related-tools-title" className="text-xl font-bold text-slate-900">
              Related Image Tools
            </h2>
            <Link
              href="/"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all tools</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((relTool) => (
              <Link
                key={relTool.id}
                href={`/${relTool.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle transition-all hover:border-brand-300 hover:shadow-card"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {relTool.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    {relTool.shortDescription}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Open tool</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
