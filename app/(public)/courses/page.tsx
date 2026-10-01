import { Metadata } from 'next';
import { prisma } from '@/server/database/prisma';
import { MASTER_COURSES } from '@/lib/courses/courseRegistry';
import { CourseListJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CoursesSplitClient } from './CoursesSplitClient';

const APP_URL =
  process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://www.threadsecurity.in';

export const metadata: Metadata = {
  title: 'Cyber Security Courses & Training Programs | Ethical Hacking, VAPT & AI Security',
  description:
    'Explore industry-recognized cyber security courses, 45 days summer training, and 6 months industrial internships in Jalandhar, Punjab & Online. Master Ethical Hacking, VAPT, SOC Operations, DevSecOps, and AI Security with 100% sandboxed cloud labs and placement assistance.',
  keywords: [
    'cyber security course',
    'cybersecurity training',
    'cyber security course in Jalandhar',
    'cybersecurity training in Jalandhar',
    'cyber security course Punjab',
    'ethical hacking course',
    'ethical hacking training Jalandhar',
    'VAPT course',
    'penetration testing training',
    'SOC analyst course',
    '45 days cyber security course',
    '6 month cyber security industrial training',
    'cyber security internship for BTech students',
    'job oriented cyber security course',
    'cyber security bootcamp India',
    'CEH certification course',
    'CompTIA Security+ training',
    'OSCP training',
    'hands-on cybersecurity course',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/courses`,
  },
  openGraph: {
    title: 'Cyber Security Courses & Training Programs | Thread Security Education',
    description:
      'Explore industry-recognized cyber security courses, 45 days summer training, and 6 months industrial internships in Jalandhar, Punjab & Online. 100% hands-on sandboxed labs.',
    url: `${APP_URL}/courses`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/og-thread-security-education.png`,
        width: 1200,
        height: 630,
        alt: 'Cyber Security Courses Catalogue — Thread Security Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyber Security Courses & Training Programs | Thread Security Education',
    description:
      'Explore 17 practical, mentor-led masterclasses across Cybersecurity and AI with 100% hands-on labs and placement support.',
    images: [`${APP_URL}/images/og-thread-security-education.png`],
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
