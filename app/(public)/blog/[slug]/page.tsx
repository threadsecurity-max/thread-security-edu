import { getPublicBlogBySlug, getRelatedBlogs } from '@/server/services/blog.service';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PublicBlogArticleClient } from '@/components/blog/public-blog-article-client';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getBlogCoverImageUrl } from '@/lib/blog/coverImageHelper';

import { getSiteUrl } from '@/lib/seo/siteUrl';
import { getPageSeoOverride } from '@/lib/seo/pageSeoStore';
import { getRelatedContent } from '@/lib/vector/upstashVectorService';

const APP_URL = getSiteUrl();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Article Not Found',
      description: 'The requested cybersecurity research article could not be found.',
    };
  }

  const override = getPageSeoOverride(`/blog/${slug}`) || getPageSeoOverride(`https://www.threadsecurity.in/blog/${slug}`);
  const metaTitle = override?.metaTitle || blog.seo?.metaTitle || `${blog.title} | TSE Research Blog`;
  const metaDesc = override?.metaDescription || blog.seo?.metaDescription || blog.excerpt || blog.subtitle || '';
  const coverMedia = blog.media?.find((m: any) => m.id === blog.coverImageId) || blog.media?.[0];
  const ogImage = coverMedia?.url || blog.seo?.ogImage || undefined;
  const canonicalUrl = blog.seo?.canonicalUrl || `${APP_URL}/blog/${slug}`;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: [
      blog.category?.name || 'Cybersecurity',
      ...(blog.tags?.map((t: any) => t.name) || []),
      'Thread Security Research',
      'Technical Article',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.seo?.ogTitle || metaTitle,
      description: blog.seo?.ogDescription || metaDesc,
      url: canonicalUrl,
      type: 'article',
      publishedTime: blog.publishedAt?.toISOString(),
      modifiedTime: blog.updatedAt?.toISOString(),
      authors: [blog.author?.user?.name || 'Thread Security Mentor'],
      images: ogImage
        ? [{ url: ogImage, width: 1080, height: 711, alt: blog.title }]
        : [{ url: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`, width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: ogImage ? [ogImage] : [`${APP_URL}/logos/TSE%20Logo%20Dark.svg`],
    },
  };
}

export default async function PublicBlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const related = await getRelatedBlogs(blog.id, blog.categoryId, 3);
  let semanticCourses: any[] = [];
  try {
    semanticCourses = await getRelatedContent({
      textOrQuery: `${blog.title} ${blog.excerpt || ''}`,
      filterType: 'COURSE',
      limit: 2,
    });
  } catch (err) {
    console.warn('[Blog Page] Vector related courses notice:', err);
  }
  const coverUrl = getBlogCoverImageUrl(blog);
  const ogImage = coverUrl || blog.seo?.ogImage || undefined;

  return (
    <>
      <ArticleJsonLd
        title={blog.title}
        description={blog.seo?.metaDescription || blog.excerpt || blog.subtitle || ''}
        slug={blog.slug}
        publishedTime={blog.publishedAt?.toISOString()}
        modifiedTime={blog.updatedAt?.toISOString()}
        authorName={blog.author?.user?.name || 'Thread Security Mentor'}
        authorRole={blog.author?.title || 'Lead Cybersecurity Mentor'}
        category={blog.category?.name}
        keywords={blog.tags?.map((t: any) => t.name)}
        wordCount={blog.content ? blog.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length : undefined}
        imageUrl={ogImage}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          ...(blog.category ? [{ name: blog.category.name, url: `/blog?category=${blog.category.slug}` }] : []),
          { name: blog.title, url: `/blog/${blog.slug}` },
        ]}
      />

      {/* Visible Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="bg-[#0a0a0a] border-b border-white/10 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ol className="flex items-center gap-2 text-xs font-sans text-slate-400 overflow-x-auto whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            {blog.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <li>
                  <Link
                    href={`/blog?category=${blog.category.slug}`}
                    className="text-[#C6FF34] hover:underline"
                  >
                    {blog.category.name}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <li className="text-white font-medium truncate max-w-xs sm:max-w-md" aria-current="page">
              {blog.title}
            </li>
          </ol>
        </div>
      </nav>

      <PublicBlogArticleClient blog={blog} relatedBlogs={related} />

      {semanticCourses && semanticCourses.length > 0 && (
        <section className="bg-black/95 border-t border-white/10 py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C6FF34]/10 text-[#C6FF34] text-[10px] font-extrabold uppercase tracking-wider border border-[#C6FF34]/20">
                  <span>⚡ AI Semantic Career Path</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white">
                  Advance Your Career: Hands-On Industry Courses
                </h3>
              </div>
              <Link
                href="/courses"
                className="text-xs text-[#C6FF34] hover:underline font-bold inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Explore All 17+ Master Courses</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {semanticCourses.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.metadata.slug}`}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#C6FF34]/60 p-5 transition-all group flex flex-col justify-between space-y-3 hover:bg-white/[0.06]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 uppercase tracking-wider">
                        {c.metadata.track === 'ai' ? '🤖 AI Track' : '🛡️ Cyber Track'}
                      </span>
                      <span className="text-xs text-[#C6FF34] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Syllabus &amp; Labs</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-[#C6FF34] transition">
                      {c.metadata.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.metadata.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>100% Practical Sandboxed Labs</span>
                    <span className="text-emerald-400 font-semibold">TS-ID Verified</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
