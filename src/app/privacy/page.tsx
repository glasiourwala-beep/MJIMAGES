import type { Metadata } from 'next';
import { ShieldCheck, Lock, EyeOff, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Zero Data Retention Guarantee',
  description:
    'MJImage Privacy Policy. Learn how we handle your uploaded files ephemerally with zero permanent storage, automatic deletion, and EXIF metadata stripping.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 mb-4">
          <ShieldCheck size={14} />
          <span>Privacy-First Commitment</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-card space-y-8 text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lock size={18} className="text-brand-600" />
            1. Overview & Core Privacy Promise
          </h2>
          <p>
            At <strong>MJImage</strong>, privacy is not an afterthought—it is the foundation of our engineering architecture. We believe you should be able to optimize and convert your images without giving up personal data, uploading files to permanent servers, or creating accounts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trash2 size={18} className="text-brand-600" />
            2. How We Handle Your Uploaded Files
          </h2>
          <p>
            When you upload an image to MJImage:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
            <li>
              <strong>Temporary Processing:</strong> Your image is temporarily held in an isolated server directory identified only by a random UUID.
            </li>
            <li>
              <strong>Automatic Deletion:</strong> Ephemeral files are automatically deleted immediately after download or after a maximum safety TTL of 15 minutes.
            </li>
            <li>
              <strong>No Permanent Storage:</strong> We do not store your images in any permanent database, cloud bucket, or persistent media library.
            </li>
            <li>
              <strong>No AI Training:</strong> We never use, share, or train AI models or machine learning datasets on any user-uploaded files.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <EyeOff size={18} className="text-brand-600" />
            3. EXIF and Metadata Stripping
          </h2>
          <p>
            Digital photographs often contain embedded EXIF metadata, such as exact GPS location coordinates, camera models, capture timestamps, and photographer notes. MJImage automatically strips this metadata during processing to safeguard your privacy before you share or publish images on the web.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            4. Information We Collect
          </h2>
          <p>
            Because MJImage does not require user accounts, we do not collect names, passwords, credit card numbers, or physical addresses.
          </p>
          <p className="text-sm text-slate-600">
            We may collect standard, anonymized server access telemetry (such as timestamp, request status, and rate-limiting counters) solely for DDoS prevention, security diagnostics, and system stability.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            5. Cookies and Analytics
          </h2>
          <p>
            MJImage does not use invasive tracking cookies. We do not track you across third-party websites. Standard functional cookies or browser local storage may be used strictly for interface preferences (such as tool settings).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            6. Contact Regarding Privacy
          </h2>
          <p>
            If you have questions about our privacy policies or data handling, please contact us at{' '}
            <a href="mailto:glasiourwala@gmail.com" className="text-brand-600 font-semibold underline">
              glasiourwala@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
