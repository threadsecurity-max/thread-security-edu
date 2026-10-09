import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { getStudentBatchAndAttendanceService } from '@/server/services/batch.service';
import { getStudentAssessmentsList } from '@/server/services/assessment/analytics.service';
import { StudentCoursesHubClient } from '@/components/student/courses/StudentCoursesHubClient';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function StudentCoursesPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const rawTab = resolvedSearchParams?.tab;
  const initialTab =
    rawTab === 'assessments' || rawTab === 'attendance' ? rawTab : 'courses';

  // 1. Fetch Enrolled Courses
  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
                orderBy: { orderIndex: 'asc' },
              },
              labs: true,
              mentor: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  const enrolledCourseIds = student?.enrollments?.map((e) => e.courseId) || [];

  // 2. Fetch Other Published Courses Created by Faculty/Admin
  const otherCourses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      id: { notIn: enrolledCourseIds },
    },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { orderIndex: 'asc' },
      },
      labs: true,
      mentor: { include: { user: true } },
    },
  });

  // 3. Fetch Assessments with Student Attempts & Scores
  let assessments: any[] = [];
  try {
    const assessmentRes = await getStudentAssessmentsList(session.userId);
    assessments = assessmentRes?.assessments || [];
  } catch (err) {
    console.error('Error fetching student assessments list:', err);
    // Fallback direct query
    assessments = await (prisma as any).assessment.findMany({
      where: {
        status: 'PUBLISHED',
        ...(enrolledCourseIds.length > 0 ? { courseId: { in: enrolledCourseIds } } : {}),
      },
      include: {
        course: { select: { id: true, title: true } },
        questions: true,
        testAttempts: {
          where: { userId: session.userId },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // 4. Fetch Attendance & Live Session Records
  let attendanceData = {
    batch: null as any,
    attendancePercentage: 0,
    totalSessions: 0,
    presentSessions: 0,
    records: [] as any[],
  };

  try {
    const attendanceResult = await getStudentBatchAndAttendanceService(session.userId);
    if (attendanceResult) {
      attendanceData = {
        batch: attendanceResult.batch,
        attendancePercentage: attendanceResult.attendancePercentage || 0,
        totalSessions: attendanceResult.totalSessions || 0,
        presentSessions: attendanceResult.presentSessions || 0,
        records: attendanceResult.records || [],
      };
    }
  } catch (err) {
    console.error('Error fetching student attendance records:', err);
  }

  const enrollments = student?.enrollments || [];

  return (
    <StudentCoursesHubClient
      enrollments={enrollments}
      otherCourses={otherCourses}
      assessments={assessments}
      attendance={attendanceData}
      initialTab={initialTab}
    />
  );
}
