import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { WorkshopGalleryClient, WorkshopItem } from './WorkshopGalleryClient';

const APP_URL =
  process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'https://threadsecurity.in';

export const metadata: Metadata = {
  title: 'Cybersecurity Workshops, 45 Days Summer Training & 6 Month Internships',
  description:
    'Enroll in accredited 45 days cyber security summer training, 6 weeks bootcamps, and 6 months industrial internships in Jalandhar, Punjab & Online. Hands-on ethical hacking, VAPT, bug bounty, and AI security workshops for BTech, BCA & MCA college students.',
  keywords: [
    '45 days cyber security course',
    '45 days cybersecurity training',
    '45 days cyber security internship',
    '45 days cyber security industrial training',
    '45 days ethical hacking course',
    '45 days VAPT course',
    '6 week cyber security course',
    '6 weeks cybersecurity training',
    '6 month cyber security course',
    '6 months cybersecurity training',
    '6 month cyber security internship',
    '6 month cyber security industrial training',
    '45 days cyber security course Jalandhar',
    '6 month cyber security course Punjab',
    'cyber security internship for BTech students',
    'cyber security industrial training for BCA students',
    'cybersecurity workshops',
    'ethical hacking summer training',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/workshops`,
  },
  openGraph: {
    title: 'Cybersecurity Workshops, 45 Days Summer Training & 6 Month Internships | Thread Security Education',
    description:
      'Enroll in accredited 45 days cyber security summer training and 6 months industrial internships in Jalandhar, Punjab & Online.',
    url: `${APP_URL}/workshops`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/og-thread-security-education.png`,
        width: 1200,
        height: 630,
        alt: 'Cybersecurity Workshops & Industrial Training — Thread Security Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cybersecurity Workshops & 45-Day / 6-Month Internships | Thread Security Education',
    description:
      'Accredited 45 days summer training and 6 months industrial internships with live sandboxed labs and university credit letters.',
    images: [`${APP_URL}/images/og-thread-security-education.png`],
  },
};

export const dynamic = 'force-dynamic';

async function getWorkshopsOnServer(): Promise<WorkshopItem[]> {
  try {
    const workshopModel = (prisma as any).workshop || (prisma as any).Workshop;
    if (!workshopModel) {
      return [];
    }

    const dbWorkshops = await workshopModel.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (dbWorkshops && dbWorkshops.length > 0) {
      return dbWorkshops.map((ws: any) => ({
        ...ws,
        highlights: typeof ws.highlights === 'string' ? JSON.parse(ws.highlights) : ws.highlights,
        instructor: {
          name: ws.instructorName || 'Thread Security Lead',
          role: ws.instructorRole || 'Senior Security Instructor',
        },
      }));
    }
  } catch (error) {
    console.error('Server-side workshop database query failed:', error);
  }
  return [];
}

export default async function WorkshopsPage() {
  const [session, initialWorkshops] = await Promise.all([
    getSession(),
    getWorkshopsOnServer(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Workshops', url: '/workshops' },
        ]}
      />
      <WorkshopGalleryClient
        userRole={session?.role ?? null}
        initialWorkshops={initialWorkshops.length > 0 ? initialWorkshops : undefined}
      />
    </>
  );
}
