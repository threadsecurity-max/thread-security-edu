export function generateCourseJsonLd(course: {
  title: string;
  description: string;
  slug: string;
  category: string;
  durationHours: number;
  level: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threadsec.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Thread Security Education',
      sameAs: baseUrl,
    },
    educationalLevel: course.level,
    category: course.category,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${course.durationHours}H`,
    },
    url: `${baseUrl}/courses/${course.slug}`,
  };
}

export function generateWorkshopJsonLd(workshop: {
  title: string;
  description: string;
  date: string;
  instructorName: string;
  category: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threadsec.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: workshop.title,
    description: workshop.description,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    startDate: new Date(workshop.date).toISOString(),
    organizer: {
      '@type': 'Organization',
      name: 'Thread Security Education',
      url: baseUrl,
    },
    performer: {
      '@type': 'Person',
      name: workshop.instructorName,
    },
  };
}

export function generateOrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threadsec.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Thread Security Education',
    url: baseUrl,
    logo: `${baseUrl}/images/tse-logo.png`,
    sameAs: [
      'https://linkedin.com/company/threadsec',
      'https://github.com/threadsec',
      'https://twitter.com/threadsec',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9876543210',
      contactType: 'admissions',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}
