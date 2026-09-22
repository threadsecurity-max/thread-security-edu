import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { WorkshopGalleryClient, WorkshopItem } from './WorkshopGalleryClient';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Cybersecurity Workshops & Live Bootcamps | Hands-on Training',
  description: 'Participate in live hands-on cybersecurity workshops, red teaming bootcamps, and cloud defense masterclasses led by industry practitioners at Thread Security Education.',
  keywords: [
    'Cybersecurity Workshops',
    'Ethical Hacking Bootcamps',
    'Live Security Seminars',
    'Hands-on Hacking Labs',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/workshops`,
  },
  openGraph: {
    title: 'Cybersecurity Workshops & Bootcamps | Thread Security Education',
    description: 'Participate in live hands-on cybersecurity workshops led by senior industry practitioners.',
    url: `${APP_URL}/workshops`,
    type: 'website',
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
    <WorkshopGalleryClient
      userRole={session?.role ?? null}
      initialWorkshops={initialWorkshops.length > 0 ? initialWorkshops : undefined}
    />
  );
}
