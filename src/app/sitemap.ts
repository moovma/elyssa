import type { MetadataRoute } from 'next';

import { SITE_URL } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '', priority: 1 },
    { path: '/elyssa', priority: 0.9 },
    { path: '/shop', priority: 0.8 },
    { path: '/docs', priority: 0.7 },
    { path: '/preorder', priority: 0.8 },
  ];
  return pages.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: new Date(), priority: p.priority }));
}
