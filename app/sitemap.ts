import { MetadataRoute } from 'next';
import { prisma } from '@/server/database/prisma';
import { MASTER_COURSES } from '@/lib/courses/courseRegistry';

// Force dynamic execution so Next.js does NOT query the database during Docker build pre-rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

import { getSiteUrl } from '@/lib/seo/siteUrl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

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

  // Check if database URL is a dummy placeholder or unavailable (e.g. during Docker container build)
  const isDummyDatabase =
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes('dummy') ||
    (process.env.DATABASE_URL.includes('localhost:5432') && !process.env.DATABASE_URL.includes('sslmode=require'));

  let blogRoutes: MetadataRoute.Sitemap = [];

  if (!isDummyDatabase) {
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
      console.warn('[Sitemap] Database unreachable for courses, using static registry fallback.');
    }

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
      console.warn('[Sitemap] Database unreachable for blogs, proceeding with static routes.');
    }
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}
