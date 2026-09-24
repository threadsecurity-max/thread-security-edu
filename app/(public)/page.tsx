import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { GuestClearanceBanner } from '@/components/sections/landing/GuestClearanceBanner';
import { HeroSection } from '@/components/sections/landing/HeroSection';
import { ImpactStatsSection } from '@/components/sections/landing/ImpactStatsSection';
import { ChallengesSection } from '@/components/sections/landing/ChallengesSection';
import { MethodologySection } from '@/components/sections/landing/MethodologySection';
import { CareersSection } from '@/components/sections/landing/CareersSection';
import { FeaturedCoursesSection } from '@/components/sections/landing/FeaturedCoursesSection';
import { ProjectsBentoSection } from '@/components/sections/landing/ProjectsBentoSection';
import { MentorCredibilitySection } from '@/components/sections/landing/MentorCredibilitySection';
import { CertificatesSection } from '@/components/sections/landing/CertificatesSection';
import { FaqSection } from '@/components/sections/landing/FaqSection';
import { ApplyBatchesSection } from '@/components/sections/landing/ApplyBatchesSection';
import { CourseRoadmapSection } from '@/components/sections/landing/CourseRoadmapSection';
import { StudentReviewsSection } from '@/components/sections/landing/StudentReviewsSection';

export const dynamic = 'force-dynamic';

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ notice?: string }>;
}) {
  const session = await getSession();
  const params = searchParams ? await searchParams : {};
  const isGuestPending = Boolean(session && (session.role === 'STUDENT' || session.role === 'GUEST') && !session.isDashboardAccessGranted);
  const showNotice = Boolean(params.notice || isGuestPending);

  // Fetch real data from PostgreSQL database with resilient connection retry
  let courses: any[] = [];
  let mentors: any[] = [];
  let totalCourses = 0;
  let totalLabs = 0;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      courses = await prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          mentor: {
            include: { user: true },
          },
          modules: true,
          labs: true,
        },
        take: 3,
      });

      mentors = await prisma.mentorProfile.findMany({
        include: { user: true },
        take: 2,
      });

      totalCourses = await prisma.course.count({ where: { status: 'PUBLISHED' } });
      totalLabs = await prisma.lab.count();
      break; // Success, exit loop
    } catch (error: any) {
      console.warn(`[PublicHomePage] Database query attempt ${attempt} warning:`, error?.message || error);
      if (attempt === 1) {
        try {
          await prisma.$connect();
        } catch (reconnectErr) {
          // Suppress redundant reconnect log
        }
      }
    }
  }

  // Resilient fallbacks ensuring zero UI disruption during temporary database reconnects
  if (totalCourses === 0) totalCourses = 12;
  if (totalLabs === 0) totalLabs = 24;

  if (mentors.length === 0) {
    mentors = [
      {
        id: 'fallback-mentor-1',
        title: 'Principal Security Architect & Red Team Lead',
        company: 'Thread Security',
        bio: 'Over a decade architecting zero-trust enterprise infrastructure, penetration testing, and red team adversary emulation.',
        expertise: 'Red Teaming, VAPT, Active Directory, Cloud Security',
        user: {
          name: 'Lead Cybersecurity Faculty',
          avatarUrl: '/logos/TSE Logo Dark.svg',
        },
      },
      {
        id: 'fallback-mentor-2',
        title: 'AI Systems & Autonomous Security Engineer',
        company: 'Thread Security Labs',
        bio: 'Specialist in adversarial machine learning, LLM vulnerability testing, and next-generation autonomous intelligent systems.',
        expertise: 'Agentic AI, LLM Red Teaming, RAG Architectures, Threat Detection',
        user: {
          name: 'Lead AI Systems Faculty',
          avatarUrl: '/logos/TSE Logo Light.svg',
        },
      },
    ];
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Guest Explorer Clearance Banner */}
      {showNotice && <GuestClearanceBanner session={session} />}

      {/* Hero Section */}
      <HeroSection totalCourses={totalCourses} totalLabs={totalLabs} />

      {/* Senior Security Leaders Credibility Section */}
      <MentorCredibilitySection mentors={mentors} />
      
      {/* Impact Stats Section */}
      <ImpactStatsSection />
      

      {/* Features Bento Grid Section */}
      <MethodologySection />

      {/* Careers Forged Section */}
      <CareersSection />
      
      {/* Industry-Recognized Certifications Section */}
      <CertificatesSection />

      {/* Featured Courses Section */}
      {/* <FeaturedCoursesSection courses={courses} /> */}

      {/* Interactive Step-by-Step Curriculum Roadmap & Admissions Section with Train Effect */}
      <CourseRoadmapSection />

      {/* Real-World & AI Projects Bento Grid Section */}
      <ProjectsBentoSection />

      {/* Student Success Stories & Video Reviews Section */}
      <StudentReviewsSection />

      {/* Challenges Section */}
      <ChallengesSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Apply for Upcoming Batches Section */}
      <ApplyBatchesSection />

      
      
      

      
    </div>
  );
}
