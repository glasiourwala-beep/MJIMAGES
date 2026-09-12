import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TopProgressBar } from '@/components/layout/TopProgressBar';
import { JsonLd, generateWebSiteJsonLd } from '@/components/seo/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://mjimage.com'),
  title: {
    default: 'MJImage — Free, Fast & Privacy-Conscious Online Image Tools',
    template: '%s | MJImage',
  },
  description:
    'Compress, resize, crop, and convert images online with zero privacy compromise. Ultra-fast processing powered by high-grade Libvips/Sharp engine.',
  keywords: [
    'image compressor',
    'image resizer',
    'jpg to png',
    'png to jpg',
    'webp to jpg',
    'image cropper',
    'image converter',
    'online photo editor',
    'free image tools',
    'fast image compression',
  ],
  authors: [{ name: 'MJImage' }],
  creator: 'MJImage',
  publisher: 'MJImage',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mjimage.com',
    siteName: 'MJImage',
    title: 'MJImage — Free, Fast & Privacy-Conscious Online Image Tools',
    description:
      'Compress, resize, crop, and convert your images directly in your browser. 100% free, high quality, and privacy-conscious.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MJImage — Fast Online Image Processing',
    description:
      'Compress, resize, crop, and convert your images with high speed and zero data retention.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLd data={generateWebSiteJsonLd()} />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col font-sans bg-surface-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white"
      >
        <TopProgressBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
