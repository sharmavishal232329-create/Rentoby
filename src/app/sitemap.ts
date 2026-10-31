import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [categories, listings, services] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
      take: 100,
    }),
    prisma.service.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
      take: 100,
    }),
  ]);

  const staticRoutes = [
    '',
    '/rentals',
    '/rentals/agriculture',
    '/rentals/agriculture/agricultural-machinery',
    '/rentals/agriculture/irrigation-equipment',
    '/rentals/agriculture/farm-tools',
    '/rentals/agriculture/agricultural-storage-equipment',
    '/services',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${baseUrl}/rentals/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const listingRoutes = listings.map((l) => ({
    url: `${baseUrl}/listing/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${baseUrl}/service/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes, ...serviceRoutes];
}
