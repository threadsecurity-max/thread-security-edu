import React from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Thread Security Education',
    alternateName: 'TSE Academy',
    url: APP_URL,
    logo: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
    description: 'Premier cybersecurity and artificial intelligence education academy. Providing mentor-led training, 100% practical sandbox labs, and verified career placement paths.',
    sameAs: [
      'https://www.linkedin.com/company/thread-security/',
      'https://x.com/ThreadSecurity',
      'https://www.instagram.com/thread_security',
      'https://github.com/threadsecurity',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'admissions',
      email: 'threadsecurity@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Punjabi'],
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Punjab',
      addressCountry: 'IN',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${APP_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface CourseJsonLdProps {
  name: string;
  description: string;
  slug: string;
  courseCode?: string;
  durationHours: number;
  level: string;
  category: string;
  mentorName?: string;
  highlights?: string[];
}

export function CourseJsonLd({
  name,
  description,
  slug,
  courseCode,
  durationHours,
  level,
  category,
  mentorName = 'Kunal Singh',
  highlights = [],
}: CourseJsonLdProps) {
  const courseUrl = `${APP_URL}/courses/${slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    courseCode: courseCode || slug,
    url: courseUrl,
    provider: {
      '@type': 'Organization',
      name: 'Thread Security Education',
      sameAs: APP_URL,
      logo: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
    },
    educationalCredentialAwarded: 'Verified TS-ID Security Credential',
    occupationalCategory: category,
    timeRequired: `PT${durationHours}H`,
    educationalLevel: level,
    teaches: highlights.length > 0 ? highlights : [category, 'Practical Labs', 'Threat Analysis'],
    instructor: {
      '@type': 'Person',
      name: mentorName,
      worksFor: {
        '@type': 'Organization',
        name: 'Thread Security Education',
      },
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Blended',
      courseWorkload: `PT${durationHours}H`,
      instructor: {
        '@type': 'Person',
        name: mentorName,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CourseListJsonLd({
  courses,
}: {
  courses: { name: string; description: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: courses.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Course',
        name: c.name,
        description: c.description,
        url: c.url.startsWith('http') ? c.url : `${APP_URL}${c.url}`,
        provider: {
          '@type': 'Organization',
          name: 'Thread Security Education',
          sameAs: APP_URL,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  imageUrl?: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedTime,
  modifiedTime,
  authorName = 'Thread Security Mentor',
  imageUrl,
}: ArticleJsonLdProps) {
  const articleUrl = `${APP_URL}/blog/${slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished: publishedTime || new Date().toISOString(),
    dateModified: modifiedTime || publishedTime || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Thread Security Education',
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
      },
    },
    image: imageUrl ? [imageUrl] : [`${APP_URL}/logos/TSE%20Logo%20Dark.svg`],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
