import { getPublicBlogs, getBlogCategories } from '@/server/services/blog.service';
import { PublicBlogLandingClient } from '@/components/blog/public-blog-landing-client';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

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

  const [blogData, categoriesData] = await Promise.all([
    getPublicBlogs({ search, categorySlug, tagSlug, page, limit: 9 }),
    getBlogCategories(),
  ]);

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
