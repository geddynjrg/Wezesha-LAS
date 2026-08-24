import { MAJUU_SITE_URL } from '@/lib/seo/site';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/apply/',
        '/login',
        '/signup',
        '/ecitizen/',
        '/ps/',
      ],
    },
    sitemap: `${MAJUU_SITE_URL}/sitemap.xml`,
    host: MAJUU_SITE_URL,
  };
}
