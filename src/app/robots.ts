import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sitemap.xml'],
        disallow: ['/api/image/download/', '/api/health'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/sitemap.xml'],
        disallow: ['/api/image/download/', '/api/health'],
      },
    ],
    sitemap: 'https://mjimages-i68b.onrender.com/sitemap.xml',
  };
}