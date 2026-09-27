import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mjimage.onrender.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/image/download/', '/api/health'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
