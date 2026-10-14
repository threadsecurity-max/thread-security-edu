import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

import { getSiteUrl } from '@/lib/seo/siteUrl';

const APP_URL = getSiteUrl();

function escapeXml(unsafe: string) {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export async function GET() {
  try {
    const db = prisma as any;
    const blogs = await db.blog.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: {
        category: true,
        author: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    const itemsXml = (blogs || [])
      .map((b: any) => {
        const title = escapeXml(b.title);
        const link = `${APP_URL}/blog/${b.slug}`;
        const description = escapeXml(b.excerpt || b.subtitle || '');
        const pubDate = (b.publishedAt || b.createdAt || new Date()).toUTCString();
        const category = escapeXml(b.category?.name || 'Cybersecurity');
        const author = escapeXml(b.author?.user?.name || 'Thread Security Mentor');

        return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <category>${category}</category>
      <author>${author}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      })
      .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Thread Security Research &amp; Cyber Blog</title>
    <link>${APP_URL}/blog</link>
    <description>Cutting-edge cybersecurity research, SOC analysis, adversary emulation, and technical writeups from Thread Security Education faculty.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${APP_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('<error>Failed to generate RSS feed</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
