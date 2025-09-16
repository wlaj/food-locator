import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://food-locator.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/_next/',
        '/admin/',
        '/login',
        '/signup',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}