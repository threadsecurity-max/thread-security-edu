import { Metadata } from 'next';
import { prisma } from '@/server/database/prisma';
import { MASTER_COURSES } from '@/lib/courses/courseRegistry';
import { CourseListJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CoursesSplitClient } from './CoursesSplitClient';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Courses & Academic Catalogue | Cybersecurity & AI Masterclasses',
  description: 'Explore 16 practical, mentor-led masterclasses across Cybersecurity Architecture (Lime Track) and Artificial Intelligence Systems (Violet Track). 100% hands-on sandboxed labs and verified TS-ID credentials.',
  keywords: [
    'Cybersecurity Courses',
    'AI Security Training',
    'Ethical Hacking Course',
    'SOC Analyst Training',
    'DevSecOps Certification',
    'LLM Red Teaming',
    'VAPT Masterclass',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/courses`,
  },
  openGraph: {
    title: 'Courses & Academic Catalogue | Thread Security Education',
    description: 'Explore 16 practical, mentor-led masterclasses across Cybersecurity Architecture and AI Systems. 100% hands-on sandboxed labs.',
    url: `${APP_URL}/courses`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
        width: 1200,
        height: 630,
        alt: 'Courses Catalogue — Thread Security Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Courses & Academic Catalogue | Thread Security Education',
    description: 'Explore 16 practical, mentor-led masterclasses across Cybersecurity and AI.',
    images: [`${APP_URL}/logos/TSE%20Logo%20Dark.svg`],
  },
};

export const dynamic = 'force-dynamic';

export default async function PublicCourseCataloguePage() {
  let courses: any[] = [];

  try {
    const fetchedCourses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        mentor: { include: { user: true } },
        modules: true,
        labs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    courses = fetchedCourses;
  } catch (error) {
    console.error('[PublicCourseCataloguePage] Database query transient error:', error);
  }

  const courseListItems = MASTER_COURSES.map((c) => ({
    name: c.title,
    description: c.description,
    url: `/courses/${c.slug}`,
  }));

  return (
    <>
      <CourseListJsonLd courses={courseListItems} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Courses', url: '/courses' },
        ]}
      />
      <CoursesSplitClient initialCourses={courses} />
    </>
  );
}
