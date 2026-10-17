import { getPublicBlogs, getBlogCategories } from '@/server/services/blog.service';
import { PublicBlogLandingClient } from '@/components/blog/public-blog-landing-client';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Metadata } from 'next';

import { getSiteUrl } from '@/lib/seo/siteUrl';

const APP_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Cybersecurity & AI Research Blog | Technical Perspectives & Tutorials',
  description: 'Explore technical insights, vulnerability research, AI threat detection, and security engineering perspectives authored by Thread Security Education faculty.',
  keywords: [
    'Cybersecurity Blog',
    'Vulnerability Research',
    'AI Threat Detection',
    'Ethical Hacking Tutorials',
    'SOC Engineering Insights',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/blog`,
  },
  openGraph: {
    title: 'Cybersecurity & AI Research Blog | Thread Security Education',
    description: 'Explore technical insights, vulnerability research, and security engineering perspectives.',
    url: `${APP_URL}/blog`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
        width: 1200,
        height: 630,
        alt: 'Thread Security Research Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cybersecurity & AI Research Blog | Thread Security Education',
    description: 'Explore technical insights, vulnerability research, and AI threat detection.',
    images: [`${APP_URL}/logos/TSE%20Logo%20Dark.svg`],
  },
};

export default async function PublicBlogLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || undefined;
  const categorySlug = params.category || undefined;
  const tagSlug = params.tag || undefined;

  let blogData = { blogs: [] as any[], total: 0, page: 1, totalPages: 1 };
  let categoriesData: any[] = [];

  try {
    const [fetchedBlogs, fetchedCategories] = await Promise.all([
      getPublicBlogs({ search, categorySlug, tagSlug, page, limit: 9 }),
      getBlogCategories(),
    ]);
    blogData = fetchedBlogs;
    categoriesData = fetchedCategories;
  } catch (err) {
    console.warn('[PublicBlogLandingPage] Handled transient fetch error:', err);
    categoriesData = await getBlogCategories();
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
      />
      <PublicBlogLandingClient
        initialBlogs={blogData.blogs}
        totalCount={blogData.total}
        currentPage={blogData.page}
        totalPages={blogData.totalPages}
        categories={categoriesData}
        currentSearch={search || ''}
        currentCategory={categorySlug || ''}
      />
    </>
  );
}
