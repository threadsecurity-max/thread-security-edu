import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';
import { savePageSeoOverride } from '@/lib/seo/pageSeoStore';
import { requestGoogleInstantIndexing } from '@/lib/gcp/indexingService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, metaTitle, metaDescription, focusKeyword, keywords, triggerIndexing = true } = body;

    if (!url || !metaTitle || !metaDescription) {
      return NextResponse.json(
        { error: 'URL, metaTitle, and metaDescription are required.' },
        { status: 400 }
      );
    }

    // 1. Always persist to Page SEO Override Store (live immediately on frontend)
    const savedOverride = savePageSeoOverride(url, {
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords,
    });

    let appliedTo = 'PAGE_SEO_STORE';
    let blogUpdated = false;

    // 2. Check if target is a blog post and sync with Database BlogSEO model
    const cleanUrl = url.trim();
    let blogSlug: string | null = null;
    if (cleanUrl.includes('/blog/')) {
      const parts = cleanUrl.split('/blog/');
      blogSlug = parts[1]?.split('?')[0]?.replace(/\/$/, '') || null;
    }

    if (blogSlug) {
      const blog = await (prisma as any).blog.findUnique({
        where: { slug: blogSlug },
      });

      if (blog) {
        await (prisma as any).blogSEO.upsert({
          where: { blogId: blog.id },
          create: {
            blogId: blog.id,
            metaTitle,
            metaDescription,
            focusKeyword: focusKeyword || null,
            keywords: Array.isArray(keywords) ? keywords : [],
          },
          update: {
            metaTitle,
            metaDescription,
            focusKeyword: focusKeyword || null,
            keywords: Array.isArray(keywords) ? keywords : [],
          },
        });
        appliedTo = 'BLOG_DATABASE_AND_REGISTRY';
        blogUpdated = true;
      }
    }

    // 3. 1-Click Instant Indexing to Google API
    let indexingResult: any = null;
    if (triggerIndexing) {
      try {
        indexingResult = await requestGoogleInstantIndexing(url, 'URL_UPDATED', '1-CLICK-AI-OPTIMIZER');
      } catch (idxErr: any) {
        console.warn('[Save Metadata] Indexing notification warning:', idxErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      appliedTo,
      blogUpdated,
      override: savedOverride,
      indexing: indexingResult,
      message: `Metadata applied successfully to ${url}${indexingResult?.success ? ' & submitted to Google Indexing API!' : '.'}`,
    });
  } catch (error: any) {
    console.error('[Save Metadata API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save metadata' },
      { status: 500 }
    );
  }
}
