import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  INDUSTRIAL_TRAINING_CITIES,
  IndustrialTrainingCity,
} from '@/data/industrialTrainingCities';
import { IndustrialTrainingCityView } from '@/components/training/IndustrialTrainingCityView';
import { IndustrialTrainingJsonLd } from '@/components/seo/IndustrialTrainingJsonLd';
import { getSiteUrl } from '@/lib/seo/siteUrl';

const APP_URL = getSiteUrl();

export function generateStaticParams() {
  return [
    { city: 'jalandhar' },
    { city: 'phagwara' },
    { city: 'ludhiana' },
    { city: 'chandigarh' },
    { city: 'dharamshala' },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: rawCity } = await params;
  const cityKey = (rawCity || '').toLowerCase().trim();
  const city: IndustrialTrainingCity | undefined = INDUSTRIAL_TRAINING_CITIES[cityKey];

  if (!city) {
    return {
      title: 'Industrial Training in North India | Thread Security Education',
      description: 'Accredited 45-day and 6-month industrial training in Cybersecurity & AI.',
    };
  }

  const pageCanonical = `${APP_URL}/industrial-training/${city.slug}`;

  return {
    title: {
      absolute: city.metaTitle,
    },
    description: city.metaDescription,
    keywords: [
      city.primaryKeyword,
      `45 days industrial training in ${city.cityName}`,
      `6 months industrial training in ${city.cityName}`,
      `cyber security training in ${city.cityName}`,
      `ethical hacking training in ${city.cityName}`,
      `AI internship in ${city.cityName}`,
      `btech cse internship ${city.cityName}`,
      'Thread Security Education',
    ],
    alternates: {
      canonical: pageCanonical,
    },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: pageCanonical,
      type: 'website',
      images: [
        {
          url: `${APP_URL}/images/og-thread-security-education.png`,
          width: 1200,
          height: 630,
          alt: `${city.heroH1} — Thread Security Education`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: city.metaTitle,
      description: city.metaDescription,
      images: [`${APP_URL}/images/og-thread-security-education.png`],
    },
  };
}

export default async function IndustrialTrainingCityPageRoute({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: rawCity } = await params;
  const cityKey = (rawCity || '').toLowerCase().trim();
  const city: IndustrialTrainingCity | undefined = INDUSTRIAL_TRAINING_CITIES[cityKey];

  if (!city) {
    notFound();
  }

  return (
    <>
      <IndustrialTrainingJsonLd city={city} />
      <IndustrialTrainingCityView city={city} />
    </>
  );
}
