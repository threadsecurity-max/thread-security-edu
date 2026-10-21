import { Suspense } from 'react';
import { Metadata } from 'next';
import { InternshipTrainingClient } from '@/components/training/InternshipTrainingClient';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/seo/siteUrl';

const APP_URL = getSiteUrl();

export const metadata: Metadata = {
  title: '45 Days, 3 Months & 6 Months Industrial Training & Internship | Cyber Security & AI',
  description:
    'Join accredited 45 Days summer training, 3 Months internship, and 6 Months industrial training in Jalandhar, Punjab & Online. Master Ethical Hacking, VAPT, SOC Operations, and Agentic AI with 100% sandboxed cloud labs, university project reports, and placement assistance.',
  keywords: [
    '45 days industrial training',
    '45 days cyber security training',
    '3 months industrial training',
    '3 months internship cyber security',
    '6 months industrial training in Jalandhar',
    '6 month industrial training Punjab',
    'cyber security internship for BTech students',
    'AI internship in Jalandhar',
    'summer internship in Jalandhar',
    'ethical hacking industrial training',
    'Thread Security Education internship',
  ],
  alternates: {
    canonical: `${APP_URL}/internship-training`,
  },
  openGraph: {
    title: '45 Days, 3 Months & 6 Months Industrial Training & Internship | Thread Security Education',
    description:
      'Explore certified 45 Days, 3 Months, and 6 Months industrial training programs in Cyber Security and Artificial Intelligence with 100% hands-on cloud labs.',
    url: `${APP_URL}/internship-training`,
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default function InternshipTrainingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Internship & Training', url: '/internship-training' },
        ]}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading training curriculum...</div>}>
        <InternshipTrainingClient />
      </Suspense>
    </>
  );
}
