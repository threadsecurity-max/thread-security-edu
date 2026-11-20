import { Metadata } from 'next';
import { IndustrialTrainingHubView } from '@/components/training/IndustrialTrainingHubView';
import { IndustrialTrainingHubJsonLd } from '@/components/seo/IndustrialTrainingJsonLd';
import { getSiteUrl } from '@/lib/seo/siteUrl';

const APP_URL = getSiteUrl();

export const metadata: Metadata = {
  title: {
    absolute: '45-Day & 6-Month Industrial Training in Cyber & AI | TSE', // 56 chars
  },
  description:
    'Join DPIIT-recognized 45-day summer training & 6-month industrial internships in Cybersecurity and AI across Jalandhar, Ludhiana, Chandigarh & Dharamshala.', // 153 chars
  keywords: [
    'industrial training',
    '45 days summer training',
    '6 months industrial training',
    'cybersecurity industrial training',
    'AI industrial training',
    'industrial training in punjab',
    'summer internship for btech cse',
    'ethical hacking industrial training',
    'SOC training',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/industrial-training`,
  },
  openGraph: {
    title: '45-Day & 6-Month Industrial Training in Cyber & AI | TSE',
    description:
      'DPIIT-recognized 45-day summer training & 6-month industrial internships in Cybersecurity & AI with 100% sandboxed cloud labs.',
    url: `${APP_URL}/industrial-training`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/og-thread-security-education.png`,
        width: 1200,
        height: 630,
        alt: 'Industrial Training in Cybersecurity & AI — Thread Security Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '45-Day & 6-Month Industrial Training in Cyber & AI | TSE',
    description:
      'Explore certified 45-day and 6-month industrial training programs in Cybersecurity & AI across North India centers.',
    images: [`${APP_URL}/images/og-thread-security-education.png`],
  },
};

export default function IndustrialTrainingHubPage() {
  return (
    <>
      <IndustrialTrainingHubJsonLd />
      <IndustrialTrainingHubView />
    </>
  );
}
