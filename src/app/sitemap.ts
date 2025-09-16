import { MetadataRoute } from 'next'
import { getRestaurants } from '@/lib/actions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const restaurants = await getRestaurants(1000);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://food-locator.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Dynamic restaurant pages
  const restaurantPages: MetadataRoute.Sitemap = restaurants?.map((restaurant) => ({
    url: `${baseUrl}/restaurant/${restaurant.id}`,
    lastModified: restaurant.updated_at ? new Date(restaurant.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  })) || [];

  return [...staticPages, ...restaurantPages];
}