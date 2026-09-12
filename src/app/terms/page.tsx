import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MJImage Terms of Service. Guidelines and policies for using our free online image tools.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 mb-4">
          <FileText size={14} />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-card space-y-8 text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using <strong>MJImage</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">2. Permitted Use & Service Purpose</h2>
          <p>
            MJImage provides free web utilities for compressing, resizing, cropping, and converting image files. You agree to use the service only for lawful purposes in accordance with these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">3. User Responsibilities & Prohibitions</h2>
          <p>When using MJImage, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
            <li>Upload files containing malicious code, viruses, trojans, or decompression bombs designed to disrupt server operations.</li>
            <li>Use automated scripts, bots, or scrapers to flood endpoints or bypass rate limits.</li>
            <li>Upload imagery that infringes upon third-party intellectual property or violates applicable laws.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">4. Intellectual Property Rights</h2>
          <p>
            You retain 100% of all rights and ownership to the images you upload. MJImage claims zero ownership, license, or distribution rights to user content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">5. Disclaimer of Warranties</h2>
          <p>
            MJImage is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. While we strive for 99.9% uptime and high fidelity processing, we do not guarantee uninterrupted availability.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">6. Contact Information</h2>
          <p>
            For inquiries regarding our terms, please contact us at{' '}
            <a href="mailto:glasiourwala@gmail.com" className="text-brand-600 font-semibold underline">
              glasiourwala@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
