import React from 'react';

const APP_URL =
  process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'https://threadsecurity.in';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'Organization'],
    name: 'Thread Security Education',
    alternateName: ['TSE', 'Thread Security Education Institute'],
    url: APP_URL,
    logo: `${APP_URL}/icon-512.png`,
    image: `${APP_URL}/images/og-thread-security-education.png`,
    description:
      'Premier cybersecurity and artificial intelligence education and training institute in India. Providing mentor-led training, 100% practical sandbox labs, and verified career placement paths.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1280',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://www.linkedin.com/company/thread-security/',
      'https://x.com/ThreadSecurity',
      'https://www.instagram.com/thread_security',
      'https://github.com/threadsecurity',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-7347398956',
      contactType: 'admissions',
      email: 'edu@threadsecurity.in',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Punjabi'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3rd Floor, Vasal Mall, Opposite Hotel President, Police Line',
      addressLocality: 'Jalandhar',
      addressRegion: 'Punjab',
      postalCode: '144001',
      addressCountry: 'IN',
    },
    founder: {
      '@type': 'Person',
      name: 'Kunal Singh',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Thread Security Education',
    alternateName: 'Thread Security Training & Education Portal',
    url: APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/courses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SiteNavigationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Cybersecurity Training & Courses',
        description: 'Comprehensive practical curriculum spanning Ethical Hacking, SOC, DevSecOps, and AI Security.',
        url: `${APP_URL}/courses`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Hands-on Cyber Workshops & Bootcamps',
        description: 'Live interactive cyber defense and offensive security masterclasses.',
        url: `${APP_URL}/workshops`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Placement Records & Hiring Partners',
        description: '100% placement assistance, top hiring partners, and student salaries.',
        url: `${APP_URL}/placements`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Cyber Career Learning Paths',
        description: 'Structured role-based roadmaps from beginner to advanced SOC Analyst and Penetration Tester.',
        url: `${APP_URL}/learning-paths`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 5,
        name: 'Verify TS-ID Certificate',
        description: 'Cryptographically verify student credentials and earned competencies.',
        url: `${APP_URL}/verify-certificate`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 6,
        name: 'Admissions & Career Counselling',
        description: 'Speak with our cybersecurity career advisors and reserve your batch seat.',
        url: `${APP_URL}/contact`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface FaqItemSchema {
  question: string;
  answer: string;
}

export function FaqJsonLd({ faqs }: { faqs: FaqItemSchema[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
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
  mentorName = 'Sujal Tiwari',
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
      '@type': 'EducationalOrganization',
      name: 'Thread Security Education',
      sameAs: APP_URL,
      logo: `${APP_URL}/icon-512.png`,
    },
    educationalCredentialAwarded: 'Verified TS-ID Security Credential',
    occupationalCategory: category,
    timeRequired: `PT${durationHours}H`,
    educationalLevel: level,
    teaches: highlights.length > 0 ? highlights : [category, 'Practical Labs', 'Threat Analysis'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '240',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      category: 'Tuition',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    instructor: {
      '@type': 'Person',
      name: mentorName,
      worksFor: {
        '@type': 'EducationalOrganization',
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
      '@type': 'EducationalOrganization',
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

export interface VideoObjectJsonLdProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}

export function VideoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
}: VideoObjectJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    ...(contentUrl ? { contentUrl } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Thread Security Education',
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
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
