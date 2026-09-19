import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mjimages-i68b.onrender.com';

  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/image-compressor',
    '/image-resizer',
    '/jpg-to-png',
    '/png-to-jpg',
    '/webp-to-jpg',
    '/image-cropper',
    '/image-converter',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.startsWith('/image') || route.includes('-to-') ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.startsWith('/image') || route.includes('-to-') ? 0.9 : 0.7,
  }));
}
