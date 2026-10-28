import { prisma } from '@/server/database/prisma';
import slugify from 'slugify';
import { createBlogDriveFolder } from '../integrations/google-drive/folders';
import { uploadFileToDrive } from '../integrations/google-drive/upload';
import { requestGoogleInstantIndexing } from '@/lib/gcp/indexingService';

const db = prisma as any;

export const INITIAL_BLOG_CATEGORIES = [
  { name: 'Cybersecurity', description: 'Threat intelligence, network security, red teaming, and SOC operations.' },
  { name: 'Artificial Intelligence', description: 'AI, LLMs, machine learning in security, and AI threat detection.' },
  { name: 'Career Guidance', description: 'Career pathways, certifications, interview prep, and industry guidance.' },
  { name: 'Cloud', description: 'AWS, GCP, Azure security, cloud-native architectures, and Kubernetes.' },
  { name: 'DevSecOps', description: 'CI/CD security, automation, infrastructure as code, and compliance.' },
  { name: 'Threat Intelligence', description: 'Malware analysis, threat hunting, and indicators of compromise.' },
  { name: 'Ethical Hacking', description: 'Penetration testing, bug bounty, vulnerability assessment, and exploits.' },
  { name: 'Programming', description: 'Python, Rust, Go, TypeScript, and security tool engineering.' },
  { name: 'Industry Insights', description: 'Cybersecurity market trends, regulatory shifts, and news.' },
  { name: 'Research', description: 'Original vulnerability research, whitepapers, and case studies.' },
  { name: 'Technology', description: 'General tech developments, hardware, and emerging trends.' },
];

let hasAttemptedCategorySeed = false;

export async function seedBlogCategoriesIfEmpty() {
  if (hasAttemptedCategorySeed) return;
  try {
    const count = await db.blogCategory.count();
    if (count === 0) {
      for (const cat of INITIAL_BLOG_CATEGORIES) {
        await db.blogCategory.create({
          data: {
            name: cat.name,
            slug: slugify(cat.name, { lower: true, strict: true }),
            description: cat.description,
          },
        });
      }
    }
    hasAttemptedCategorySeed = true;
  } catch (err: any) {
    console.warn('[blog.service] seedBlogCategoriesIfEmpty transient notice:', err?.message || err);
  }
}

export async function getBlogCategories() {
  try {
    await seedBlogCategoriesIfEmpty();
    const categories = await db.blogCategory.findMany({
      where: {
        NOT: [
          { slug: 'web-development' },
          { name: { contains: 'Web Development', mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });
    if (categories && categories.length > 0) return categories;
  } catch (err: any) {
    console.warn('[blog.service] getBlogCategories DB notice, serving initial categories:', err?.message || err);
  }

  // Resilient fallback preventing public page crash if database connection is limited
  return INITIAL_BLOG_CATEGORIES.map((cat, idx) => ({
    id: `fallback-cat-${idx + 1}`,
    name: cat.name,
    slug: slugify(cat.name, { lower: true, strict: true }),
    description: cat.description,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { blogs: 0 },
  }));
}

export async function getBlogTags() {
  try {
    return await db.blogTag.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (err: any) {
    console.warn('[blog.service] getBlogTags DB notice:', err?.message || err);
    return [];
  }
}

export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // Strip HTML/Markdown tags if any
  const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/[#*`_~-]/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function generateSlug(title: string): string {
  const baseSlug = slugify(title || 'untitled-blog', { lower: true, strict: true });
  return baseSlug || `blog-${Date.now()}`;
}

export async function ensureUniqueSlug(title: string, currentBlogId?: string): Promise<string> {
  let slug = generateSlug(title);
  let counter = 1;
  while (true) {
    const existing = await db.blog.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === currentBlogId) {
      return slug;
    }
    slug = `${generateSlug(title)}-${counter++}`;
  }
}

export function analyzeSEO(data: {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  coverImageId?: string | null;
}) {
  const checks: { label: string; passed: boolean; tip: string; severity?: 'warning' | 'error' | 'success' }[] = [];
  let score = 0;

  const keyword = (data.focusKeyword || '').trim().toLowerCase();

  // Check 1: Title contains focus keyword
  if (keyword) {
    const titleLower = (data.title || '').toLowerCase();
    const passed = titleLower.includes(keyword);
    checks.push({
      label: 'Focus keyword in title',
      passed,
      tip: passed ? 'Focus keyword appears in title.' : 'Include primary focus keyword in blog title.',
    });
    if (passed) score += 15;
  } else {
    checks.push({ label: 'Focus keyword set', passed: false, tip: 'Add a primary focus keyword.' });
  }

  // Check 2: Meta title length (30-60 chars)
  const metaTitleLen = (data.metaTitle || data.title || '').length;
  const metaTitleValid = metaTitleLen >= 30 && metaTitleLen <= 60;
  checks.push({
    label: 'Meta title length (30-60 chars)',
    passed: metaTitleValid,
    tip: `Current length: ${metaTitleLen} chars. Optimal is between 30 and 60 chars.`,
  });
  if (metaTitleValid) score += 15;

  // Check 3: Meta description length (120-160 chars)
  const metaDescLen = (data.metaDescription || data.subtitle || '').length;
  const metaDescValid = metaDescLen >= 100 && metaDescLen <= 160;
  checks.push({
    label: 'Meta description length (100-160 chars)',
    passed: metaDescValid,
    tip: `Current length: ${metaDescLen} chars. Optimal is between 100 and 160 chars.`,
  });
  if (metaDescValid) score += 15;

  // Check 4: Content length (> 300 words)
  const textContent = (data.content || '').replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
  const wordCountValid = wordCount >= 300;
  checks.push({
    label: 'Content length (>= 300 words)',
    passed: wordCountValid,
    tip: `Current word count: ${wordCount} words. Standard blog requires at least 300 words.`,
  });
  if (wordCountValid) score += 20;

  // Check 5: Cover Image set
  const hasCover = !!data.coverImageId;
  checks.push({
    label: 'Featured Cover Image set',
    passed: hasCover,
    tip: hasCover ? 'Featured image selected.' : 'Upload a 1080x711 px featured cover image.',
  });
  if (hasCover) score += 15;

  // Check 6: Focus keyword in first 100 words
  if (keyword && wordCount > 0) {
    const first100 = textContent.toLowerCase().split(/\s+/).slice(0, 100).join(' ');
    const passed = first100.includes(keyword);
    checks.push({
      label: 'Focus keyword in intro paragraph',
      passed,
      tip: passed ? 'Keyword found in initial paragraph.' : 'Mention focus keyword in the introduction.',
    });
    if (passed) score += 20;
  }

  return { score: Math.min(100, score), checks, wordCount, readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)) };
}

export async function createBlogDraft(authorUserId: string, title?: string) {
  // Find mentor profile for user
  let mentor = await db.mentorProfile.findUnique({
    where: { userId: authorUserId },
  });

  if (!mentor) {
    // Auto create mentor profile if needed for testing/admin
    const user = await db.user.findUnique({ where: { id: authorUserId } });
    if (!user) throw new Error('User not found');
    mentor = await db.mentorProfile.create({
      data: {
        userId: user.id,
        title: 'Security Mentor',
        company: 'Thread Security',
        bio: 'Cybersecurity Instructor & Content Author',
        expertise: 'Threat Intelligence, SOC & Web Security',
      },
    });
  }

  const blogTitle = title || 'Untitled Cybersecurity Blog';
  const slug = await ensureUniqueSlug(blogTitle);

  let driveFolderId: string | null = null;
  try {
    const folderName = `TSE_BLOG_${Date.now()}_${slug.slice(0, 20)}`;
    driveFolderId = (await createBlogDriveFolder(folderName)) || null;
  } catch (err) {
    console.warn('Google Drive folder creation skipped or failed:', err);
  }

  const blog = await db.blog.create({
    data: {
      title: blogTitle,
      slug,
      authorId: mentor.id,
      status: 'DRAFT',
      driveFolderId,
      seo: {
        create: {
          metaTitle: blogTitle,
          metaDescription: '',
          keywords: [],
        },
      },
    },
    include: {
      seo: true,
      category: true,
      tags: true,
      media: true,
      author: {
        include: {
          user: {
            select: { name: true, avatarUrl: true, email: true },
          },
        },
      },
    },
  });

  return blog;
}

export async function getMentorBlogs(
  authorUserId: string,
  options?: { search?: string; status?: string; page?: number; limit?: number }
) {
  let mentor = await db.mentorProfile.findUnique({
    where: { userId: authorUserId },
  });

  if (!mentor) {
    const user = await db.user.findUnique({ where: { id: authorUserId } });
    if (user && (user.role === 'MENTOR' || user.role === 'SUPER_ADMIN' || user.role === 'ACADEMIC_ADMIN')) {
      mentor = await db.mentorProfile.create({
        data: {
          userId: user.id,
          title: 'Security Mentor',
          company: 'Thread Security',
          bio: 'Cybersecurity Instructor & Content Author',
          expertise: 'Threat Intelligence, SOC & Web Security',
        },
      });
    }
  }

  if (!mentor) {
    return {
      blogs: [],
      total: 0,
      page: 1,
      totalPages: 0,
      metrics: { total: 0, published: 0, scheduled: 0, draft: 0, review: 0, totalViews: 0 },
    };
  }

  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, Math.min(100, options?.limit || 50));
  const skip = (page - 1) * limit;

  const now = new Date();
  const where: any = { authorId: mentor.id };

  if (options?.status && options.status !== 'ALL') {
    if (options.status === 'SCHEDULED') {
      where.status = 'PUBLISHED';
      where.publishedAt = { gt: now };
    } else if (options.status === 'PUBLISHED') {
      where.status = 'PUBLISHED';
      where.OR = [
        { publishedAt: { lte: now } },
        { publishedAt: null },
      ];
    } else {
      where.status = options.status;
    }
  }

  if (options?.search) {
    const q = options.search.trim();
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { subtitle: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
          { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
        ],
      },
    ];
  }

  const [
    blogs,
    totalFiltered,
    totalAll,
    publishedCount,
    scheduledCount,
    draftCount,
    reviewCount,
    viewsAggregation,
  ] = await Promise.all([
    db.blog.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        category: true,
        tags: true,
        seo: true,
        media: true,
        author: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, email: true } },
          },
        },
      },
    }),
    db.blog.count({ where }),
    db.blog.count({ where: { authorId: mentor.id } }),
    db.blog.count({
      where: {
        authorId: mentor.id,
        status: 'PUBLISHED',
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
    }),
    db.blog.count({
      where: {
        authorId: mentor.id,
        status: 'PUBLISHED',
        publishedAt: { gt: now },
      },
    }),
    db.blog.count({ where: { authorId: mentor.id, status: 'DRAFT' } }),
    db.blog.count({ where: { authorId: mentor.id, status: 'REVIEW' } }),
    db.blog.aggregate({
      where: { authorId: mentor.id },
      _sum: { viewCount: true },
    }),
  ]);

  return {
    blogs: blogs || [],
    total: totalFiltered || 0,
    page,
    totalPages: Math.ceil((totalFiltered || 0) / limit) || 1,
    metrics: {
      total: totalAll || 0,
      published: publishedCount || 0,
      scheduled: scheduledCount || 0,
      draft: draftCount || 0,
      review: reviewCount || 0,
      totalViews: viewsAggregation?._sum?.viewCount || 0,
    },
  };
}

export async function getBlogById(blogId: string) {
  return db.blog.findUnique({
    where: { id: blogId },
    include: {
      seo: true,
      category: true,
      tags: true,
      media: true,
      author: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, email: true } },
        },
      },
    },
  });
}

export async function updateBlog(blogId: string, authorUserId: string, data: {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string | null;
  tagNames?: string[];
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  coverImageId?: string | null;
  publishedAt?: Date | string | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
}) {
  const blog = await db.blog.findUnique({
    where: { id: blogId },
    include: { author: true },
  });

  if (!blog) throw new Error('Blog not found');

  // Verify mentor ownership or admin
  const user = await db.user.findUnique({ where: { id: authorUserId } });
  const isSuperOrAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ACADEMIC_ADMIN';
  const isAuthor =
    blog.author?.userId === authorUserId ||
    blog.authorId === authorUserId ||
    (blog.author && blog.author.id === authorUserId);

  if (!isSuperOrAdmin && !isAuthor) {
    throw new Error('Unauthorized to update this blog');
  }

  let slug = blog.slug;
  if (data.title && data.title !== blog.title && blog.status === 'DRAFT') {
    slug = await ensureUniqueSlug(data.title, blogId);
  }

  const readingTime = data.content ? calculateReadingTime(data.content) : blog.readingTime;

  // Handle Tags safely
  let tagsConnect: { id: string }[] = [];
  if (data.tagNames && Array.isArray(data.tagNames)) {
    tagsConnect = await Promise.all(
      data.tagNames
        .filter((name) => typeof name === 'string' && name.trim())
        .map(async (name) => {
          const cleanName = name.trim();
          const tagSlug = slugify(cleanName, { lower: true, strict: true }) || `tag-${Date.now()}`;
          const tag = await db.blogTag.upsert({
            where: { slug: tagSlug },
            update: { name: cleanName },
            create: { name: cleanName, slug: tagSlug },
          });
          return { id: tag.id };
        })
    );
  }

  // Precise Publication and Scheduling Date/Time
  let targetPublishedAt = blog.publishedAt;
  if (data.publishedAt !== undefined) {
    targetPublishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  } else if (data.status === 'PUBLISHED' && !blog.publishedAt) {
    targetPublishedAt = new Date();
  }

  // Update Blog record
  const updatedBlog = await db.blog.update({
    where: { id: blogId },
    data: {
      title: data.title !== undefined ? data.title : blog.title,
      subtitle: data.subtitle !== undefined ? data.subtitle : blog.subtitle,
      slug,
      excerpt: data.excerpt !== undefined ? data.excerpt : blog.excerpt,
      content: data.content !== undefined ? data.content : blog.content,
      readingTime,
      status: data.status || blog.status,
      featured: data.featured !== undefined ? data.featured : blog.featured,
      coverImageId: data.coverImageId !== undefined ? data.coverImageId : blog.coverImageId,
      categoryId: data.categoryId !== undefined ? data.categoryId : blog.categoryId,
      publishedAt: targetPublishedAt,
      tags: data.tagNames ? { set: tagsConnect } : undefined,
      seo: data.seo ? {
        upsert: {
          create: {
            metaTitle: data.seo.metaTitle || data.title || blog.title,
            metaDescription: data.seo.metaDescription || data.subtitle || '',
            focusKeyword: data.seo.focusKeyword || '',
            keywords: data.seo.keywords || [],
            canonicalUrl: data.seo.canonicalUrl || '',
            ogTitle: data.seo.ogTitle || data.title || blog.title,
            ogDescription: data.seo.ogDescription || data.subtitle || '',
          },
          update: {
            metaTitle: data.seo.metaTitle,
            metaDescription: data.seo.metaDescription,
            focusKeyword: data.seo.focusKeyword,
            keywords: data.seo.keywords,
            canonicalUrl: data.seo.canonicalUrl,
            ogTitle: data.seo.ogTitle,
            ogDescription: data.seo.ogDescription,
          },
        },
      } : undefined,
    },
    include: {
      seo: true,
      category: true,
      tags: true,
      media: true,
      author: {
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });

  // Log Revision safely without crashing update if user/revision fails
  if (data.content && data.content !== blog.content) {
    try {
      const revisionCount = await db.blogRevision.count({ where: { blogId } });
      const changeUserId = user ? user.id : blog.author?.userId;
      if (changeUserId) {
        await db.blogRevision.create({
          data: {
            blogId,
            content: data.content,
            changedById: changeUserId,
            version: revisionCount + 1,
          },
        });
      }
    } catch (revError) {
      console.warn('Could not record blog revision history (non-critical):', revError);
    }
  }

  // Automatically submit to Google Indexing API when article is published
  if (updatedBlog.status === 'PUBLISHED') {
    const blogUrl = `https://www.threadsecurity.in/blog/${updatedBlog.slug}`;
    requestGoogleInstantIndexing(blogUrl, 'URL_UPDATED', 'AUTO_BLOG_PUBLISH').catch((err) => {
      console.warn('[blog.service] Auto Google indexing notice:', err?.message || err);
    });
  }

  return updatedBlog;
}

export async function deleteBlog(blogId: string, authorUserId: string) {
  const blog = await db.blog.findUnique({
    where: { id: blogId },
    include: { author: true },
  });

  if (!blog) throw new Error('Blog not found');

  const user = await db.user.findUnique({ where: { id: authorUserId } });
  if (blog.author.userId !== authorUserId && user?.role !== 'SUPER_ADMIN' && user?.role !== 'ACADEMIC_ADMIN') {
    throw new Error('Unauthorized to delete this blog');
  }

  const deleted = await db.blog.delete({ where: { id: blogId } });

  // Notify Googlebot of URL deletion
  const blogUrl = `https://www.threadsecurity.in/blog/${blog.slug}`;
  requestGoogleInstantIndexing(blogUrl, 'URL_DELETED', 'AUTO_BLOG_DELETE').catch(() => {});

  return deleted;
}

export async function getPublicBlogs(params?: {
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  featuredOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 9;
  const skip = (page - 1) * limit;

  try {
    await seedBlogCategoriesIfEmpty();

    const now = new Date();
    const where: any = {
      status: 'PUBLISHED',
      AND: [
        {
          OR: [
            { publishedAt: { lte: now } },
            { publishedAt: null },
          ],
        },
      ],
    };

    if (params?.featuredOnly) {
      where.featured = true;
    }

    if (params?.categorySlug) {
      if (params.categorySlug === 'career' || params.categorySlug === 'career-guidance') {
        where.category = { slug: { in: ['career', 'career-guidance'] } };
      } else {
        where.category = { slug: params.categorySlug };
      }
    }

    if (params?.tagSlug) {
      where.tags = { some: { slug: params.tagSlug } };
    }

    const isAiQuery = (q: string) => {
      const lower = q.toLowerCase().trim();
      return (
        lower === 'ai' ||
        lower === 'a.i.' ||
        lower === 'artificial intelligence' ||
        lower === 'artificial' ||
        lower === 'llm' ||
        lower === 'llms' ||
        lower === 'genai' ||
        lower === 'generative ai' ||
        lower === 'deepfake' ||
        lower === 'gpt'
      );
    };

    if (params?.search) {
      const q = params.search.trim();
      if (isAiQuery(q)) {
        where.OR = [
          // 1. Category matches
          { category: { slug: { in: ['artificial-intelligence', 'ai'] } } },
          { category: { name: { contains: 'Artificial Intelligence', mode: 'insensitive' } } },
          // 2. Tag matches
          { tags: { some: { name: { contains: 'AI', mode: 'insensitive' } } } },
          { tags: { some: { slug: { in: ['ai', 'artificial-intelligence', 'llm', 'machine-learning'] } } } },
          // 3. Title keyword matches
          { title: { contains: ' AI ', mode: 'insensitive' } },
          { title: { startsWith: 'AI ', mode: 'insensitive' } },
          { title: { endsWith: ' AI', mode: 'insensitive' } },
          { title: { contains: 'AI:', mode: 'insensitive' } },
          { title: { contains: 'AI-', mode: 'insensitive' } },
          { title: { contains: 'Artificial Intelligence', mode: 'insensitive' } },
          { title: { contains: 'LLM', mode: 'insensitive' } },
          { title: { contains: 'GPT', mode: 'insensitive' } },
          { title: { contains: 'DeepFake', mode: 'insensitive' } },
          { title: { contains: 'Prompt', mode: 'insensitive' } },
          { title: { contains: 'Agent', mode: 'insensitive' } },
          { title: { contains: 'Neural', mode: 'insensitive' } },
          // 4. Subtitle & Excerpt matches
          { subtitle: { contains: 'Artificial Intelligence', mode: 'insensitive' } },
          { subtitle: { contains: ' AI ', mode: 'insensitive' } },
          { subtitle: { contains: 'LLM', mode: 'insensitive' } },
          { excerpt: { contains: 'Artificial Intelligence', mode: 'insensitive' } },
          { excerpt: { contains: ' AI ', mode: 'insensitive' } },
          // 5. Content (Whole-phrase / safe matching to prevent matching 'fail', 'train', 'remain', 'domain')
          { content: { contains: 'Artificial Intelligence', mode: 'insensitive' } },
          { content: { contains: 'Large Language Model', mode: 'insensitive' } },
          { content: { contains: ' LLM ', mode: 'insensitive' } },
          { content: { contains: ' AI ', mode: 'insensitive' } },
        ];
      } else {
        const isShortTerm = q.length <= 3;
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { subtitle: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
          { category: { slug: { contains: q, mode: 'insensitive' } } },
          { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
          { tags: { some: { slug: { contains: q, mode: 'insensitive' } } } },
          { seo: { focusKeyword: { contains: q, mode: 'insensitive' } } },
          ...(!isShortTerm
            ? [{ content: { contains: q, mode: 'insensitive' } }]
            : [{ content: { contains: ` ${q} `, mode: 'insensitive' } }]),
        ];
      }
    }

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          category: true,
          tags: true,
          seo: true,
          media: true,
          author: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      }),
      db.blog.count({ where }),
    ]);

    // Re-rank results if search query is active to guarantee core topic articles rank on top
    if (params?.search && isAiQuery(params.search) && Array.isArray(blogs)) {
      blogs.sort((a: any, b: any) => {
        const aIsAiCat = a.category?.slug === 'artificial-intelligence' ? 3 : 0;
        const bIsAiCat = b.category?.slug === 'artificial-intelligence' ? 3 : 0;
        const aTitleAi = /\b(ai|artificial intelligence|llm|gpt|machine learning)\b/i.test(a.title || '') ? 2 : 0;
        const bTitleAi = /\b(ai|artificial intelligence|llm|gpt|machine learning)\b/i.test(b.title || '') ? 2 : 0;
        const aScore = aIsAiCat + aTitleAi;
        const bScore = bIsAiCat + bTitleAi;
        if (bScore !== aScore) return bScore - aScore;
        const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bDate - aDate;
      });
    }

    return {
      blogs: blogs || [],
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  } catch (error: any) {
    console.warn('[blog.service] getPublicBlogs DB notice, serving safe fallback:', error?.message || error);
    return {
      blogs: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }
}

export async function getPublicBlogBySlug(slug: string) {
  try {
    const blog = await db.blog.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        seo: true,
        media: true,
        author: {
          include: {
            user: { select: { name: true, avatarUrl: true, email: true } },
          },
        },
      },
    });

    if (!blog || blog.status !== 'PUBLISHED') {
      return null;
    }

    // If blog is scheduled for future release, keep hidden from public
    if (blog.publishedAt && new Date(blog.publishedAt) > new Date()) {
      return null;
    }

    // Increment view count asynchronously
    db.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return blog;
  } catch (error: any) {
    console.warn('[blog.service] getPublicBlogBySlug DB notice:', error?.message || error);
    return null;
  }
}

export async function getRelatedBlogs(blogId: string, categoryId?: string | null, limit = 3) {
  if (!categoryId) return [];
  try {
    const now = new Date();
    return await db.blog.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId,
        id: { not: blogId },
        OR: [
          { publishedAt: { lte: now } },
          { publishedAt: null },
        ],
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        media: true,
        author: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });
  } catch (error: any) {
    console.warn('[blog.service] getRelatedBlogs DB notice:', error?.message || error);
    return [];
  }
}

// ============================================================================
// ADMIN EDITORIAL & MODERATION SERVICES
// ============================================================================

export async function getAdminBlogs(options?: {
  search?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  await seedBlogCategoriesIfEmpty();
  const page = options?.page || 1;
  const limit = options?.limit || 15;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options?.status && options.status !== 'ALL') {
    if (options.status === 'SCHEDULED') {
      where.status = 'PUBLISHED';
      where.publishedAt = { gt: new Date() };
    } else {
      where.status = options.status;
    }
  }

  if (options?.categoryId && options.categoryId !== 'ALL') {
    where.categoryId = options.categoryId;
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: 'insensitive' } },
      { subtitle: { contains: options.search, mode: 'insensitive' } },
      { excerpt: { contains: options.search, mode: 'insensitive' } },
      { author: { user: { name: { contains: options.search, mode: 'insensitive' } } } },
    ];
  }

  const now = new Date();
  const [blogs, total, pendingReviewCount, publishedCount, draftCount, scheduledCount, allBlogsForViews] = await Promise.all([
    db.blog.findMany({
      where,
      orderBy: [
        // Prioritize pending reviews first, then most recently updated
        { updatedAt: 'desc' },
      ],
      skip,
      take: limit,
      include: {
        category: true,
        tags: true,
        seo: true,
        media: true,
        author: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    }),
    db.blog.count({ where }),
    db.blog.count({ where: { status: 'REVIEW' } }),
    db.blog.count({ where: { status: 'PUBLISHED' } }),
    db.blog.count({ where: { status: 'DRAFT' } }),
    db.blog.count({ where: { status: 'PUBLISHED', publishedAt: { gt: now } } }),
    db.blog.findMany({ select: { viewCount: true } }),
  ]);

  const totalViews = allBlogsForViews.reduce((acc: number, curr: any) => acc + (curr.viewCount || 0), 0);

  return {
    blogs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    metrics: {
      totalCount: allBlogsForViews.length,
      pendingReviewCount,
      publishedCount,
      draftCount,
      scheduledCount,
      totalViews,
    },
  };
}

export async function adminApproveAndPublishBlog(blogId: string, adminUserId: string, scheduledAt?: string | Date | null) {
  const blog = await db.blog.findUnique({
    where: { id: blogId },
    include: {
      author: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!blog) throw new Error('Blog article not found');

  const now = new Date();
  const targetPublishedAt = scheduledAt ? new Date(scheduledAt) : (blog.publishedAt || now);

  const updatedBlog = await db.blog.update({
    where: { id: blogId },
    data: {
      status: 'PUBLISHED',
      publishedAt: targetPublishedAt,
    },
    include: {
      author: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Notify the faculty mentor author
  try {
    const { createNotificationService } = await import('./notification.service');
    await createNotificationService({
      userId: blog.author.userId,
      title: 'Article Approved & Published! 🚀',
      message: `Your research guide "${blog.title}" has been reviewed and officially published to the public platform.`,
      type: 'SUCCESS',
      linkUrl: `/blog/${blog.slug}`,
    });
  } catch (err) {
    console.warn('Could not dispatch notification to author:', err);
  }

  // Revalidate public routes
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/blog');
    if (blog.slug) {
      revalidatePath(`/blog/${blog.slug}`);
    }
    revalidatePath('/');
  } catch (err) {
    console.warn('Cache revalidation notice:', err);
  }

  return updatedBlog;
}

export async function adminRequestBlogRevisions(blogId: string, adminUserId: string, feedbackNote?: string) {
  const blog = await db.blog.findUnique({
    where: { id: blogId },
    include: {
      author: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!blog) throw new Error('Blog article not found');

  const updatedBlog = await db.blog.update({
    where: { id: blogId },
    data: {
      status: 'DRAFT',
    },
    include: {
      author: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Send feedback notification to the mentor
  try {
    const { createNotificationService } = await import('./notification.service');
    const reasonText = feedbackNote?.trim() || 'Please review your article draft and resubmit once updated.';
    await createNotificationService({
      userId: blog.author.userId,
      title: 'Revisions Requested on Article 📝',
      message: `Editorial feedback on "${blog.title}": ${reasonText}`,
      type: 'WARNING',
      linkUrl: `/mentor/blogs/${blog.id}/edit`,
    });
  } catch (err) {
    console.warn('Could not dispatch notification to author:', err);
  }

  // Revalidate paths
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/blog');
    if (blog.slug) {
      revalidatePath(`/blog/${blog.slug}`);
    }
    revalidatePath('/');
  } catch (err) {
    console.warn('Cache revalidation notice:', err);
  }

  return updatedBlog;
}

export async function adminToggleFeaturedBlog(blogId: string, adminUserId: string) {
  const blog = await db.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) throw new Error('Blog article not found');

  const updatedBlog = await db.blog.update({
    where: { id: blogId },
    data: {
      featured: !blog.featured,
    },
  });

  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/blog');
    revalidatePath('/');
  } catch (err) {
    console.warn('Cache revalidation notice:', err);
  }

  return updatedBlog;
}

