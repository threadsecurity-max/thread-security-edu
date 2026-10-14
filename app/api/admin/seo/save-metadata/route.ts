import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, metaTitle, metaDescription, focusKeyword, keywords } = body;

    if (!url || !metaTitle || !metaDescription) {
      return NextResponse.json(
        { error: 'URL, metaTitle, and metaDescription are required.' },
        { status: 400 }
      );
    }

    // Check if target is a blog post
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

        return NextResponse.json({
          success: true,
          appliedTo: 'BLOG_DATABASE',
          message: `Successfully saved Meta Title & Description directly to Database for blog: /blog/${blogSlug}`,
        });
      }
    }

    // For Courses or Static Pages, return code snippet instruction
    return NextResponse.json({
      success: true,
      appliedTo: 'SITE_REGISTRY',
      message: `Metadata ready for ${url}. Copy the Title & Description to your Course Registry or page <Head> config.`,
    });
  } catch (error: any) {
    console.error('[Save Metadata API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save metadata' },
      { status: 500 }
    );
  }
}
