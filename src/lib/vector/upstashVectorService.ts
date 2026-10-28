import { Index } from '@upstash/vector';
import { MASTER_COURSES } from '@/lib/courses/courseRegistry';
import { prisma } from '@/server/database/prisma';

const db = prisma as any;

let vectorClient: Index | null = null;

export function getUpstashVectorIndex(): Index | null {
  const url = process.env.UPSTASH_VECTOR_REST_URL || 'https://discrete-bunny-89281-us1-vector.upstash.io';
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN || 'ABgFMGRpc2NyZXRlLWJ1bm55LTg5MjgxLXVzMWFkbWluTkRBNFlXTm1OR1F0TURJd09DMDBOakV5TFdJeFpEQXRNREF6TXpSa04yTTVOekZo';

  if (!url || !token) {
    console.warn('[Upstash Vector] UPSTASH_VECTOR_REST_URL or TOKEN not configured.');
    return null;
  }

  if (!vectorClient) {
    vectorClient = new Index({ url, token });
  }

  return vectorClient;
}

export interface ContentVectorMetadata {
  id: string;
  url: string;
  title: string;
  type: 'COURSE' | 'BLOG' | 'LANDING';
  track?: string;
  category?: string;
  slug: string;
  description: string;
  [key: string]: any;
}

export interface SemanticMatchResult {
  id: string;
  score: number;
  metadata: ContentVectorMetadata;
}

/**
 * Upsert a single Master Course into Upstash Vector
 */
export async function indexCourseToVector(course: (typeof MASTER_COURSES)[0]): Promise<boolean> {
  const client = getUpstashVectorIndex();
  if (!client) return false;

  const topics = course.modules?.map((m) => m.title).join(', ') || '';
  const tools = course.toolsCovered?.join(', ') || '';
  const textToEmbed = `${course.title}. ${course.description} ${course.subtitle || ''}. Track: ${course.track}. Category: ${course.category}. Key Modules: ${topics}. Tools: ${tools}. Hands-on cybersecurity labs at Thread Security Education.`;

  try {
    await client.upsert({
      id: `course-${course.slug}`,
      data: textToEmbed,
      metadata: {
        id: `course-${course.slug}`,
        url: `https://www.threadsecurity.in/courses/${course.slug}`,
        title: course.title,
        type: 'COURSE',
        track: course.track,
        category: course.category,
        slug: course.slug,
        description: course.description,
      },
    });
    return true;
  } catch (err: any) {
    console.error(`[Upstash Vector] Failed to index course ${course.slug}:`, err?.message || err);
    return false;
  }
}

/**
 * Upsert a single Blog into Upstash Vector
 */
export async function indexBlogToVector(blog: any): Promise<boolean> {
  const client = getUpstashVectorIndex();
  if (!client) return false;

  const textToEmbed = `${blog.title}. ${blog.excerpt || ''} ${blog.subtitle || ''}. Category: ${blog.category?.name || 'Research'}. Technical research and practical guide at Thread Security Education.`;

  try {
    await client.upsert({
      id: `blog-${blog.slug}`,
      data: textToEmbed,
      metadata: {
        id: `blog-${blog.slug}`,
        url: `https://www.threadsecurity.in/blog/${blog.slug}`,
        title: blog.title,
        type: 'BLOG',
        category: blog.category?.name || 'Research',
        slug: blog.slug,
        description: blog.excerpt || blog.subtitle || blog.title,
      },
    });
    return true;
  } catch (err: any) {
    console.error(`[Upstash Vector] Failed to index blog ${blog.slug}:`, err?.message || err);
    return false;
  }
}

/**
 * Batch Index All 17 Master Courses and All Published Blogs into Upstash Vector
 */
export async function syncAllContentToVector(): Promise<{
  success: boolean;
  totalCourses: number;
  totalBlogs: number;
  indexedCount: number;
  errors: string[];
}> {
  const client = getUpstashVectorIndex();
  if (!client) {
    return {
      success: false,
      totalCourses: 0,
      totalBlogs: 0,
      indexedCount: 0,
      errors: ['Upstash Vector client not configured.'],
    };
  }

  const errors: string[] = [];
  let indexedCount = 0;

  // 1. Index All 17 Master Courses
  for (const course of MASTER_COURSES) {
    const ok = await indexCourseToVector(course);
    if (ok) indexedCount++;
    else errors.push(`Failed to index course: ${course.slug}`);
  }

  // 2. Index All Published Blogs from Database
  let blogs: any[] = [];
  try {
    blogs = await db.blog.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
    });
  } catch (err: any) {
    console.warn('[Upstash Vector] Could not query blogs from DB:', err?.message || err);
  }

  for (const blog of blogs) {
    const ok = await indexBlogToVector(blog);
    if (ok) indexedCount++;
    else errors.push(`Failed to index blog: ${blog.slug}`);
  }

  return {
    success: errors.length === 0,
    totalCourses: MASTER_COURSES.length,
    totalBlogs: blogs.length,
    indexedCount,
    errors,
  };
}

/**
 * Find Semantically Related Courses and Articles for Dynamic Internal Linking
 */
export async function getRelatedContent(params: {
  textOrQuery: string;
  excludeUrl?: string;
  limit?: number;
  filterType?: 'COURSE' | 'BLOG';
}): Promise<SemanticMatchResult[]> {
  const client = getUpstashVectorIndex();
  if (!client) return [];

  const { textOrQuery, excludeUrl, limit = 3, filterType } = params;

  try {
    const rawMatches = await client.query({
      data: textOrQuery,
      topK: limit + 3,
      includeMetadata: true,
    });

    const matches: SemanticMatchResult[] = [];
    for (const match of rawMatches) {
      const meta = match.metadata as ContentVectorMetadata | undefined;
      if (!meta) continue;

      if (excludeUrl && (meta.url === excludeUrl || meta.url.endsWith(excludeUrl))) {
        continue;
      }

      if (filterType && meta.type !== filterType) {
        continue;
      }

      matches.push({
        id: String(match.id),
        score: match.score || 0,
        metadata: meta,
      });

      if (matches.length >= limit) break;
    }

    return matches;
  } catch (err: any) {
    console.warn('[Upstash Vector] getRelatedContent query notice:', err?.message || err);
    return [];
  }
}
