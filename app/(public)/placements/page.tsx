import { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import PlacementHighlightsClient from '../placements/PlacementHighlightsClient';

const APP_URL =
  process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'https://threadsecurity.in';

export const metadata: Metadata = {
  title: 'Cyber Security Placement Training & Job Assistance | Hiring Partners',
  description:
    '100% job-oriented cyber security course with placement assistance. Master interview preparation, resume optimization, hands-on portfolio labs, and connect with top hiring partners across India for SOC Analyst and Ethical Hacker roles.',
  keywords: [
    'cybersecurity placement training',
    'job oriented cyber security course',
    'cybersecurity job training',
    'cyber security career training',
    'SOC analyst interview preparation',
    'ethical hacking interview preparation',
    'penetration testing interview preparation',
    'cybersecurity resume training',
    'cybersecurity portfolio training',
    'cybersecurity job ready course',
    'cyber security course with placement support',
    'cyber security career after BTech',
    'cyber security career after BCA',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/placements`,
  },
  openGraph: {
    title: 'Cyber Security Placement Training & Career Outcomes | Thread Security Education',
    description:
      'Explore verified career transformation stories and hiring partners of Thread Security Education alumni placed at top cybersecurity firms.',
    url: `${APP_URL}/placements`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/og-thread-security-education.png`,
        width: 1200,
        height: 630,
        alt: 'Cyber Security Placements & Career Outcomes — Thread Security Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyber Security Placement Training & Career Outcomes | Thread Security Education',
    description:
      '100% placement support, resume reviews, technical mock interviews, and direct hiring referrals.',
    images: [`${APP_URL}/images/og-thread-security-education.png`],
  },
};

export default function PlacementsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Placements', url: '/placements' },
        ]}
      />
      <PlacementHighlightsClient />
    </>
  );
}
