import { getPublicBlogBySlug, getRelatedBlogs } from '@/server/services/blog.service';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PublicBlogArticleClient } from '@/components/blog/public-blog-article-client';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

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

  const metaTitle = blog.seo?.metaTitle || `${blog.title} | TSE Research Blog`;
  const metaDesc = blog.seo?.metaDescription || blog.excerpt || blog.subtitle || '';
  const ogImage = blog.media?.[0]?.url || blog.seo?.ogImage || undefined;
  const canonicalUrl = `${APP_URL}/blog/${slug}`;

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
  const ogImage = blog.media?.[0]?.url || blog.seo?.ogImage || undefined;

  return (
    <>
      <ArticleJsonLd
        title={blog.title}
        description={blog.seo?.metaDescription || blog.excerpt || blog.subtitle || ''}
        slug={blog.slug}
        publishedTime={blog.publishedAt?.toISOString()}
        modifiedTime={blog.updatedAt?.toISOString()}
        authorName={blog.author?.user?.name || 'Thread Security Mentor'}
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
    </>
  );
}
