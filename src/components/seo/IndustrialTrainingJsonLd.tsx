import React from 'react';
import { safeJsonLdStringify } from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/seo/siteUrl';
import { IndustrialTrainingCity } from '@/data/industrialTrainingCities';

interface IndustrialTrainingJsonLdProps {
  city: IndustrialTrainingCity;
}

export function IndustrialTrainingJsonLd({ city }: IndustrialTrainingJsonLdProps) {
  const baseUrl = getSiteUrl();
  const pageUrl = `${baseUrl}/industrial-training/${city.slug}`;
  const hubUrl = `${baseUrl}/industrial-training`;
  const orgId = `${baseUrl}/#organization`;

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Parent & Educational Organization
      {
        '@type': ['EducationalOrganization', 'Organization'],
        '@id': orgId,
        name: 'Thread Security Education',
        alternateName: ['TSE', 'Thread Security Training Institute'],
        url: baseUrl,
        logo: `${baseUrl}/icon-512.png`,
        image: `${baseUrl}/images/og-thread-security-education.png`,
        description:
          'DPIIT-recognized and ISO 9001:2015 certified cybersecurity and artificial intelligence education institute in India. Offering 45-day summer training and 6-month industrial internships with 100% sandboxed cloud labs.',
        parentOrganization: {
          '@type': 'Organization',
          name: 'Thread Security',
          url: 'https://threadsecurity.org/',
          description: 'Global cybersecurity research, enterprise threat defense, and defensive intelligence organization.',
        },
        identifier: [
          {
            '@type': 'PropertyValue',
            name: 'DPIIT Recognition Number',
            value: 'DIPP169824',
          },
          {
            '@type': 'PropertyValue',
            name: 'ISO Certification',
            value: 'ISO 9001:2015 Quality Management System',
          },
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: '3rd Floor, Vasal Mall, Opposite Hotel President, Police Line',
          addressLocality: 'Jalandhar',
          addressRegion: 'Punjab',
          postalCode: '144001',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-7347398956',
          contactType: 'admissions',
          email: 'edu@threadsecurity.in',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi', 'Punjabi'],
        },
      },

      // 2. Course Definition with Local Instance & Area Served
      {
        '@type': 'Course',
        '@id': `${pageUrl}#course`,
        name: `${city.cityName} 45-Day & 6-Month Industrial Training in Cybersecurity & AI`,
        description: city.metaDescription,
        provider: {
          '@type': 'EducationalOrganization',
          '@id': orgId,
          name: 'Thread Security Education',
        },
        educationalCredentialAwarded: 'TS-ID Verifiable Industrial Training & Internship Certificate (DPIIT Recognized)',
        occupationalCategory: 'Cybersecurity Analyst, Penetration Tester, SOC Engineer, AI Security Engineer',
        hasCourseInstance: [
          {
            '@type': 'CourseInstance',
            name: `45-Day Summer Industrial Training in Cybersecurity & AI (${city.cityName})`,
            courseMode: city.courseMode === 'onsite' ? 'onsite' : city.courseMode === 'blended' ? 'blended' : 'online',
            courseWorkload: 'P6W',
            location: {
              '@type': 'Place',
              name: city.courseMode === 'onsite' ? 'Thread Security Education Flagship Campus' : `${city.cityName} Region & Cloud Range`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: city.cityName,
                addressRegion: city.state,
                addressCountry: 'IN',
              },
            },
          },
          {
            '@type': 'CourseInstance',
            name: `6-Month Full-Semester Industrial Fellowship in Cybersecurity & AI (${city.cityName})`,
            courseMode: city.courseMode === 'onsite' ? 'onsite' : city.courseMode === 'blended' ? 'blended' : 'online',
            courseWorkload: 'P24W',
            location: {
              '@type': 'Place',
              name: city.courseMode === 'onsite' ? 'Thread Security Education Flagship Campus' : `${city.cityName} Region & Cloud Range`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: city.cityName,
                addressRegion: city.state,
                addressCountry: 'IN',
              },
            },
          },
        ],
        areaServed: {
          '@type': 'AdministrativeArea',
          name: `${city.cityName}, ${city.state}, India`,
        },
        url: pageUrl,
      },

      // 3. BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Industrial Training',
            item: hubUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${city.cityName} Training`,
            item: pageUrl,
          },
        ],
      },

      // 4. FAQPage
      {
        '@type': 'FAQPage',
        mainEntity: city.localFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(schemaGraph) }}
    />
  );
}

export function IndustrialTrainingHubJsonLd() {
  const baseUrl = getSiteUrl();
  const pageUrl = `${baseUrl}/industrial-training`;
  const orgId = `${baseUrl}/#organization`;

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['EducationalOrganization', 'Organization'],
        '@id': orgId,
        name: 'Thread Security Education',
        url: baseUrl,
        parentOrganization: {
          '@type': 'Organization',
          name: 'Thread Security',
          url: 'https://threadsecurity.org/',
        },
        identifier: [
          {
            '@type': 'PropertyValue',
            name: 'DPIIT Recognition Number',
            value: 'DIPP169824',
          },
          {
            '@type': 'PropertyValue',
            name: 'ISO Certification',
            value: 'ISO 9001:2015',
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Industrial Training',
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(schemaGraph) }}
    />
  );
}
