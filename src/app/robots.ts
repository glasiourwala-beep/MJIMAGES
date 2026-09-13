import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mjimages-i68b.onrender.com').replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/image/download/', '/api/health'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}