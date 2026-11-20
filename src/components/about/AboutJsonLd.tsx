import React from 'react';
import { ABOUT_FAQS, GROUND_TRUTH } from '@/data/aboutUsData';

export function AboutJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://threadsecurity.in/#organization',
        name: 'Thread Security Education',
        alternateName: ['Thread Security', 'TSE'],
        url: 'https://threadsecurity.in',
        parentOrganization: {
          '@type': 'Organization',
          name: 'Thread Security',
          url: GROUND_TRUTH.parentOrgUrl,
        },
        description:
          'Thread Security Education is a cybersecurity education and technology ecosystem providing structured, practical, and hands-on training with live containerized browser sandboxes and verifiable credentials.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '3rd Floor, Vasal Mall, Opposite Hotel President, Police Line',
          addressLocality: 'Jalandhar',
          addressRegion: 'Punjab',
          postalCode: '144001',
          addressCountry: 'IN',
        },
        telephone: GROUND_TRUTH.contactPhone,
        email: GROUND_TRUTH.contactEmail,
        identifier: [
          {
            '@type': 'PropertyValue',
            name: 'Startup India DPIIT Recognition',
            value: GROUND_TRUTH.dpiitId,
          },
          {
            '@type': 'PropertyValue',
            name: 'Quality Management System Standard',
            value: GROUND_TRUTH.isoStandard,
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://threadsecurity.in/about#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://threadsecurity.in',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'About Thread Security',
            item: 'https://threadsecurity.in/about',
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': 'https://threadsecurity.in/about#webpage',
        url: 'https://threadsecurity.in/about',
        name: 'About Thread Security | Our Mission, Vision & Cybersecurity Education',
        description:
          'Discover Thread Security, our mission, vision, cybersecurity learning approach, verification information, and the details you should review before enrolling.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://threadsecurity.in/#website',
          url: 'https://threadsecurity.in',
          name: 'Thread Security Education',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://threadsecurity.in/about#faq',
        mainEntity: ABOUT_FAQS.map((faq) => ({
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
