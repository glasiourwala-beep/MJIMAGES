import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/image/download/', '/api/health'],
      },
    ],
    sitemap: 'https://mjimage.com/sitemap.xml',
  };
}
