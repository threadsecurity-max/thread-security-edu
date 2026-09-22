import { MetadataRoute } from 'next';
import { prisma } from '@/server/database/prisma';
import { MASTER_COURSES } from '@/lib/courses/courseRegistry';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://threadsecurity.in';

  const now = new Date();

  // 1. Core High-Priority Static Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/workshops`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/placements`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learning-paths`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/verify-certificate`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ];

  // 2. Dynamic Course Routes (Masterclasses)
  const courseRoutes: MetadataRoute.Sitemap = MASTER_COURSES.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. Dynamic Workshops Routes
  let workshopRoutes: MetadataRoute.Sitemap = [];
  try {
    const workshops = await (prisma as any).workshop.findMany({
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    });
    workshopRoutes = (workshops || []).map((w: any) => ({
      url: `${baseUrl}/workshops#workshop-${w.id}`,
      lastModified: w.updatedAt || w.createdAt || now,
      changeFrequency: 'daily',
      priority: 0.85,
    }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch workshops for sitemap:', error);
  }

  // 4. Dynamic Blog Post & Category Routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedBlogs = await (prisma as any).blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    blogRoutes = (publishedBlogs || []).map((b: any) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt || b.publishedAt || now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const blogCategories = await (prisma as any).blogCategory.findMany({
      select: { slug: true, updatedAt: true },
    });
    const categoryRoutes: MetadataRoute.Sitemap = (blogCategories || []).map((c: any) => ({
      url: `${baseUrl}/blog?category=${c.slug}`,
      lastModified: c.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    blogRoutes = [...blogRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blogs for sitemap:', error);
  }

  // 5. Dynamic Learning Paths Routes
  let pathRoutes: MetadataRoute.Sitemap = [];
  try {
    const paths = await (prisma as any).learningPath.findMany({
      select: { slug: true, updatedAt: true },
    });
    pathRoutes = (paths || []).map((p: any) => ({
      url: `${baseUrl}/learning-paths/${p.slug}`,
      lastModified: p.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch learning paths for sitemap:', error);
  }

  return [...staticRoutes, ...courseRoutes, ...workshopRoutes, ...blogRoutes, ...pathRoutes];
}
