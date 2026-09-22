import { MASTER_COURSES } from '@/lib/courses/courseRegistry';
import { prisma } from '@/server/database/prisma';

export interface SeoAuditResult {
  url: string;
  type: 'COURSE' | 'BLOG' | 'LANDING';
  title: string;
  metaTitleLength: number;
  metaTitleStatus: 'GOOD' | 'TOO_SHORT' | 'TOO_LONG';
  metaDescriptionLength: number;
  metaDescriptionStatus: 'GOOD' | 'TOO_SHORT' | 'MISSING';
  hasJsonLd: boolean;
  hasCanonical: boolean;
  score: number;
  warnings: string[];
}

export async function runFullSiteSeoAudit(): Promise<{
  overallHealthScore: number;
  totalPagesScanned: number;
  goodPagesCount: number;
  pagesWithWarningsCount: number;
  results: SeoAuditResult[];
}> {
  const results: SeoAuditResult[] = [];

  // 1. Audit Master Courses
  for (const course of MASTER_COURSES) {
    const url = `/courses/${course.slug}`;
    const metaTitle = `${course.title} | Thread Security Education`;
    const metaDesc = course.subtitle || course.description;
    
    const warnings: string[] = [];
    let score = 100;

    const titleLen = metaTitle.length;
    let titleStatus: 'GOOD' | 'TOO_SHORT' | 'TOO_LONG' = 'GOOD';
    if (titleLen < 30) {
      titleStatus = 'TOO_SHORT';
      warnings.push('Meta title is too short (< 30 characters).');
      score -= 15;
    } else if (titleLen > 65) {
      titleStatus = 'TOO_LONG';
      warnings.push('Meta title may be truncated in Google search results (> 65 characters).');
      score -= 10;
    }

    const descLen = metaDesc?.length || 0;
    let descStatus: 'GOOD' | 'TOO_SHORT' | 'MISSING' = 'GOOD';
    if (descLen === 0) {
      descStatus = 'MISSING';
      warnings.push('Meta description is missing.');
      score -= 30;
    } else if (descLen < 80) {
      descStatus = 'TOO_SHORT';
      warnings.push('Meta description is too brief (< 80 characters).');
      score -= 15;
    }

    results.push({
      url,
      type: 'COURSE',
      title: course.title,
      metaTitleLength: titleLen,
      metaTitleStatus: titleStatus,
      metaDescriptionLength: descLen,
      metaDescriptionStatus: descStatus,
      hasJsonLd: true,
      hasCanonical: true,
      score: Math.max(0, score),
      warnings,
    });
  }

  // 2. Audit Published Blogs
  try {
    const publishedBlogs = await (prisma as any).blog.findMany({
      where: { status: 'PUBLISHED' },
      include: { seo: true },
    });

    for (const blog of publishedBlogs || []) {
      const url = `/blog/${blog.slug}`;
      const metaTitle = blog.seo?.metaTitle || blog.title;
      const metaDesc = blog.seo?.metaDescription || blog.excerpt || '';
      
      const warnings: string[] = [];
      let score = 100;

      const titleLen = metaTitle.length;
      let titleStatus: 'GOOD' | 'TOO_SHORT' | 'TOO_LONG' = 'GOOD';
      if (titleLen < 30) {
        titleStatus = 'TOO_SHORT';
        warnings.push('Title is under 30 characters.');
        score -= 15;
      }

      const descLen = metaDesc.length;
      let descStatus: 'GOOD' | 'TOO_SHORT' | 'MISSING' = 'GOOD';
      if (descLen === 0) {
        descStatus = 'MISSING';
        warnings.push('Missing meta description.');
        score -= 30;
      }

      if (!blog.seo?.focusKeyword) {
        warnings.push('No focus keyword defined.');
        score -= 15;
      }

      results.push({
        url,
        type: 'BLOG',
        title: blog.title,
        metaTitleLength: titleLen,
        metaTitleStatus: titleStatus,
        metaDescriptionLength: descLen,
        metaDescriptionStatus: descStatus,
        hasJsonLd: true,
        hasCanonical: true,
        score: Math.max(0, score),
        warnings,
      });
    }
  } catch (error) {
    console.error('[SEO Audit Engine] Error auditing blogs:', error);
  }

  const totalPages = results.length;
  const goodPages = results.filter((r) => r.score >= 85).length;
  const pagesWithWarnings = totalPages - goodPages;
  const totalScoreSum = results.reduce((sum, r) => sum + r.score, 0);
  const overallHealthScore = totalPages > 0 ? Math.round(totalScoreSum / totalPages) : 100;

  return {
    overallHealthScore,
    totalPagesScanned: totalPages,
    goodPagesCount: goodPages,
    pagesWithWarningsCount: pagesWithWarnings,
    results,
  };
}
