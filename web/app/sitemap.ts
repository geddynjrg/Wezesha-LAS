import { MAJUU_PUBLIC_PATHS, MAJUU_SITE_URL } from '@/lib/seo/site';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return MAJUU_PUBLIC_PATHS.map((path) => ({
    url: new URL(path, MAJUU_SITE_URL).toString(),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }));
}
