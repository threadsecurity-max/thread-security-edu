import { MetadataRoute } from 'next';
import { prisma } from '@/server/database/prisma';
import { MASTER_COURSES } from '@/lib/courses/courseRegistry';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.threadsecurity.in';

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

  // 2. Dynamic Course Routes (Master Registry + DB Courses)
  const courseSlugSet = new Set<string>();
  const courseRoutes: MetadataRoute.Sitemap = [];

  MASTER_COURSES.forEach((course) => {
    if (course.slug && !courseSlugSet.has(course.slug)) {
      courseSlugSet.add(course.slug);
      courseRoutes.push({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: course.slug === 'cyber-security-course' ? 1.0 : 0.9,
      });
    }
  });

  try {
    const dbCourses = await prisma.course.findMany({
      select: { slug: true, updatedAt: true, createdAt: true },
    });
    dbCourses.forEach((c) => {
      if (c.slug && !courseSlugSet.has(c.slug)) {
        courseSlugSet.add(c.slug);
        courseRoutes.push({
          url: `${baseUrl}/courses/${c.slug}`,
          lastModified: c.updatedAt || c.createdAt || now,
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch database courses for sitemap:', error);
  }

  // 3. Dynamic Blog Post & Category Routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedBlogs = await (prisma as any).blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    (publishedBlogs || []).forEach((b: any) => {
      if (b.slug) {
        blogRoutes.push({
          url: `${baseUrl}/blog/${b.slug}`,
          lastModified: b.updatedAt || b.publishedAt || now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });

    const blogCategories = await (prisma as any).blogCategory.findMany({
      select: { slug: true, updatedAt: true },
    });
    (blogCategories || []).forEach((c: any) => {
      if (c.slug) {
        blogRoutes.push({
          url: `${baseUrl}/blog?category=${c.slug}`,
          lastModified: c.updatedAt || now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blogs for sitemap:', error);
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}
