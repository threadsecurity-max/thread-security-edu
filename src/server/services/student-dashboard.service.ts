import { prisma } from '../database/prisma';

export interface StudentDashboardData {
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    tsId: string;
    batchName: string | null;
    batchCode: string | null;
    currentStreak: number;
    streakDays: { day: string; active: boolean; date: string }[];
    totalHours: number;
    weeklyHours: number;
    weeklyGoalHours: number;
    assignedMentor: {
      name: string;
      title: string;
      company: string;
      expertise: string;
      officeHours: string | null;
      email: string;
    } | null;
  };
  learningJourney: {
    overallProgressPercent: number;
    coursesEnrolledCount: number;
    coursesCompletedCount: number;
    modulesTotalCount: number;
    modulesCompletedCount: number;
    assessmentsCompletedCount: number;
    certificatesEarnedCount: number;
  };
  currentCourse: {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    progressPercent: number;
    modulesCount: number;
    completedModulesCount: number;
    currentModuleTitle: string;
    currentLessonTitle: string;
    lastActivityText: string;
    ctaText: string;
    ctaHref: string;
  } | null;
  courses: {
    id: string;
    title: string;
    slug: string;
    category: string;
    level: string;
    durationHours: number;
    progressPercent: number;
    modulesCount: number;
    mentorName: string | null;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    href: string;
  }[];
  assessments: {
    id: string;
    title: string;
    courseTitle: string;
    questionsCount: number;
    durationMinutes: number;
    passingScore: number;
    dueText: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
    score: number | null;
    href: string;
  }[];
  activityTimeline: {
    id: string;
    type: 'MODULE_COMPLETED' | 'QUIZ_SCORED' | 'LAB_SUBMITTED' | 'ATTENDANCE_LOGGED';
    title: string;
    subtitle: string;
    timestamp: string;
    timeAgo: string;
  }[];
  announcements: {
    id: string;
    title: string;
    message: string;
    timeAgo: string;
    priority: 'HIGH' | 'NORMAL';
  }[];
  resources: {
    id: string;
    title: string;
    type: string;
    courseTitle: string;
    url: string;
    createdAt: string;
  }[];
  calendarEvents: {
    id: string;
    title: string;
    type: 'LECTURE' | 'ASSESSMENT' | 'DEADLINE';
    dateText: string;
    timeText: string;
  }[];
  certificate: {
    isIssued: boolean;
    certificateId: string | null;
    verificationHash: string | null;
    courseTitle: string | null;
    issuedAt: string | null;
    requiredModulesRemaining: number;
  };
}

export async function getStudentDashboardData(userId: string): Promise<StudentDashboardData> {
  // 1. Fetch user profile, identity, enrollments, progress, labs, attempts, certificates
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tsIdentity: true,
      studentProfile: {
        include: {
          assignedMentor: { include: { user: true } },
          batch: {
            include: {
              mentor: { include: { user: true } },
              sessions: {
                orderBy: { sessionDate: 'asc' },
                take: 10,
              },
              broadcasts: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
              resources: {
                orderBy: { createdAt: 'desc' },
                take: 6,
              },
            },
          },
          attendanceRecords: {
            include: {
              session: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      },
      enrollments: {
        include: {
          course: {
            include: {
              mentor: { include: { user: true } },
              modules: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  lessons: {
                    orderBy: { orderIndex: 'asc' },
                  },
                },
              },
              assessments: {
                where: { status: { in: ['PUBLISHED', 'OPEN'] } },
                take: 5,
              },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      },
      progress: {
        where: { isCompleted: true },
        include: {
          lesson: {
            include: { module: true },
          },
        },
        orderBy: { completedAt: 'desc' },
      },
      labAttempts: {
        include: { lab: true },
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
      testAttempts: {
        include: { assessment: true, result: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      certificates: {
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
        take: 3,
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new Error('Authenticated student profile not found');
  }

  const completedLessonIds = new Set(user.progress.map((p) => p.lessonId));
  const now = new Date();

  // 2. Dynamic Real Streak Calculation
  // Extract all activity dates from completed progress, lab attempts, test attempts, attendance
  const activityDates = new Set<string>();
  user.progress.forEach((p) => activityDates.add(p.completedAt.toISOString().slice(0, 10)));
  user.labAttempts.forEach((l) => activityDates.add(l.startedAt.toISOString().slice(0, 10)));
  user.testAttempts.forEach((t) => activityDates.add(t.createdAt.toISOString().slice(0, 10)));
  user.studentProfile?.attendanceRecords?.forEach((a) =>
    activityDates.add(a.createdAt.toISOString().slice(0, 10))
  );

  // Compute consecutive streak ending today or yesterday
  let streak = 0;
  const checkDate = new Date();
  const todayStr = checkDate.toISOString().slice(0, 10);
  checkDate.setDate(checkDate.getDate() - 1);
  const yesterdayStr = checkDate.toISOString().slice(0, 10);

  let currentCheckingDate = activityDates.has(todayStr)
    ? new Date()
    : activityDates.has(yesterdayStr)
    ? checkDate
    : null;

  if (currentCheckingDate) {
    while (true) {
      const dateKey = currentCheckingDate.toISOString().slice(0, 10);
      if (activityDates.has(dateKey)) {
        streak++;
        currentCheckingDate.setDate(currentCheckingDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Fallback to recorded profile streak if profile has a positive number and no activity records yet
  if (streak === 0 && (user.studentProfile?.currentStreak || 0) > 0) {
    streak = user.studentProfile?.currentStreak || 0;
  }

  // 7-day M-T-W-T-F-S-S breakdown (Current week Monday -> Sunday)
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const streakDays = dayNames.map((dayLabel, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dStr = d.toISOString().slice(0, 10);
    return {
      day: dayLabel,
      active: activityDates.has(dStr),
      date: dStr,
    };
  });

  // 3. Dynamic Real Total Learning Hours
  // Duration of completed lessons (minutes / 60)
  let calculatedHours = 0;
  user.progress.forEach((p) => {
    calculatedHours += (p.lesson.durationMinutes || 15) / 60;
  });
  // Duration of attended batch sessions
  user.studentProfile?.attendanceRecords?.forEach((att) => {
    if (att.status === 'PRESENT' || att.status === 'LATE') {
      calculatedHours += (att.session.durationMins || 120) / 60;
    }
  });
  // Completed labs
  user.labAttempts.forEach((l) => {
    if (l.state === 'COMPLETED') {
      calculatedHours += (l.lab.estimatedMinutes || 45) / 60;
    }
  });

  // If newly registered and calculatedHours is 0, fallback to profile totalHours
  const totalHours =
    calculatedHours > 0
      ? Math.round(calculatedHours * 10) / 10
      : Math.round((user.studentProfile?.totalHours || 0) * 10) / 10;

  // Weekly hours: only count activities from this Monday onwards
  let weeklyHours = 0;
  user.progress.forEach((p) => {
    if (p.completedAt >= monday) {
      weeklyHours += (p.lesson.durationMinutes || 15) / 60;
    }
  });
  user.studentProfile?.attendanceRecords?.forEach((att) => {
    if (att.createdAt >= monday && (att.status === 'PRESENT' || att.status === 'LATE')) {
      weeklyHours += (att.session.durationMins || 120) / 60;
    }
  });
  weeklyHours = Math.round(weeklyHours * 10) / 10;

  // 4. Learning Journey Calculations
  let totalModulesCount = 0;
  let completedModulesCount = 0;
  let totalLessonsAcrossCourses = 0;

  const coursesList = user.enrollments.map((enr) => {
    const course = enr.course;
    const modules = course.modules || [];
    let courseTotalLessons = 0;
    let courseCompletedLessons = 0;
    let courseCompletedModules = 0;

    modules.forEach((mod) => {
      totalModulesCount++;
      const lessons = mod.lessons || [];
      const isModComplete =
        lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l.id));

      if (isModComplete) {
        completedModulesCount++;
        courseCompletedModules++;
      }

      lessons.forEach((l) => {
        totalLessonsAcrossCourses++;
        courseTotalLessons++;
        if (completedLessonIds.has(l.id)) {
          courseCompletedLessons++;
        }
      });
    });

    const progressPercent =
      courseTotalLessons > 0
        ? Math.round((courseCompletedLessons / courseTotalLessons) * 100)
        : Math.round(enr.progressPercent || 0);

    const status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' =
      progressPercent >= 100
        ? 'COMPLETED'
        : progressPercent > 0
        ? 'IN_PROGRESS'
        : 'NOT_STARTED';

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      level: course.level,
      durationHours: course.durationHours,
      progressPercent,
      modulesCount: modules.length,
      mentorName: course.mentor?.user?.name || null,
      status,
      href: `/student/courses/${course.id}`,
    };
  });

  const overallProgressPercent =
    totalLessonsAcrossCourses > 0
      ? Math.round((user.progress.length / totalLessonsAcrossCourses) * 100)
      : coursesList.length > 0
      ? Math.round(coursesList.reduce((acc, c) => acc + c.progressPercent, 0) / coursesList.length)
      : 0;

  // 5. Active Current Course & Next Incomplete Module/Lesson
  let currentCourseData: StudentDashboardData['currentCourse'] = null;

  // Select the enrolled course with work in progress or the first course
  const activeEnrollment =
    user.enrollments.find((e) => {
      const courseMatch = coursesList.find((c) => c.id === e.courseId);
      return courseMatch && courseMatch.progressPercent < 100;
    }) || user.enrollments[0];

  if (activeEnrollment && activeEnrollment.course) {
    const course = activeEnrollment.course;
    const courseStats = coursesList.find((c) => c.id === course.id);
    const modules = course.modules || [];

    // Find first incomplete module and lesson
    let nextIncompleteModule = modules[0];
    let nextIncompleteLesson = nextIncompleteModule?.lessons?.[0];

    for (const mod of modules) {
      const incompleteLesson = mod.lessons?.find((l) => !completedLessonIds.has(l.id));
      if (incompleteLesson) {
        nextIncompleteModule = mod;
        nextIncompleteLesson = incompleteLesson;
        break;
      }
    }

    const ctaHref = nextIncompleteLesson
      ? `/student/courses/${course.id}/learn/${nextIncompleteLesson.id}`
      : `/student/courses/${course.id}`;

    const ctaText =
      (courseStats?.progressPercent || 0) === 0
        ? 'Start Course →'
        : (courseStats?.progressPercent || 0) >= 100
        ? 'Review Course →'
        : 'Continue Module →';

    // Format last activity
    const lastProgress = user.progress.find((p) =>
      course.modules.some((m) => m.id === p.lesson.moduleId)
    );
    const lastActivityText = lastProgress
      ? `Last completed: ${lastProgress.lesson.title}`
      : 'Ready to begin';

    currentCourseData = {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      category: course.category,
      progressPercent: courseStats?.progressPercent || 0,
      modulesCount: modules.length,
      completedModulesCount:
        modules.filter(
          (m) => m.lessons.length > 0 && m.lessons.every((l) => completedLessonIds.has(l.id))
        ).length,
      currentModuleTitle: nextIncompleteModule?.title || 'Core Syllabus',
      currentLessonTitle: nextIncompleteLesson?.title || 'Introduction & Environment Setup',
      lastActivityText,
      ctaText,
      ctaHref,
    };
  }

  // 6. Assessments List
  const userAttemptedAssessments = new Map<string, { status: string; score: number | null }>();
  user.testAttempts.forEach((t) => {
    userAttemptedAssessments.set(t.assessmentId, {
      status: t.result?.passed ? 'PASSED' : t.status === 'SUBMITTED' ? 'FAILED' : 'IN_PROGRESS',
      score: t.result?.percentage !== undefined ? Math.round(t.result.percentage) : null,
    });
  });

  const allAssessments: StudentDashboardData['assessments'] = [];
  user.enrollments.forEach((enr) => {
    (enr.course.assessments || []).forEach((ass) => {
      const attempt = userAttemptedAssessments.get(ass.id);
      allAssessments.push({
        id: ass.id,
        title: ass.title,
        courseTitle: enr.course.title,
        questionsCount: ass.questionsPerAttempt || 20,
        durationMinutes: ass.durationMinutes || 30,
        passingScore: ass.passingScore || 70,
        dueText: 'Window Open',
        status: (attempt?.status as any) || 'NOT_STARTED',
        score: attempt?.score ?? null,
        href: `/student/assessments/${ass.id}`,
      });
    });
  });

  // 7. Recent Activity Timeline
  const activityTimeline: StudentDashboardData['activityTimeline'] = [];

  user.progress.slice(0, 4).forEach((p) => {
    activityTimeline.push({
      id: `prog-${p.id}`,
      type: 'MODULE_COMPLETED',
      title: `Completed lesson: ${p.lesson.title}`,
      subtitle: p.lesson.module?.title || 'Course Module',
      timestamp: p.completedAt.toISOString(),
      timeAgo: formatTimeAgo(p.completedAt),
    });
  });

  user.testAttempts.slice(0, 3).forEach((t) => {
    activityTimeline.push({
      id: `test-${t.id}`,
      type: 'QUIZ_SCORED',
      title: `Assessment: ${t.assessment.title}`,
      subtitle: t.result
        ? `Score: ${Math.round(t.result.percentage)}% (${t.result.passed ? 'PASSED' : 'NEEDS RETAKE'})`
        : 'Attempt recorded',
      timestamp: t.createdAt.toISOString(),
      timeAgo: formatTimeAgo(t.createdAt),
    });
  });

  user.labAttempts.slice(0, 2).forEach((l) => {
    activityTimeline.push({
      id: `lab-${l.id}`,
      type: 'LAB_SUBMITTED',
      title: `Sandbox Lab: ${l.lab.title}`,
      subtitle: `Status: ${l.state}`,
      timestamp: l.startedAt.toISOString(),
      timeAgo: formatTimeAgo(l.startedAt),
    });
  });

  activityTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 8. Live Announcements
  const announcements: StudentDashboardData['announcements'] = [];
  const batchBroadcasts = user.studentProfile?.batch?.broadcasts || [];
  batchBroadcasts.forEach((b) => {
    announcements.push({
      id: b.id,
      title: b.title,
      message: b.message,
      timeAgo: formatTimeAgo(b.createdAt),
      priority: 'HIGH',
    });
  });

  user.notifications.slice(0, 3).forEach((n) => {
    announcements.push({
      id: n.id,
      title: n.title,
      message: n.message,
      timeAgo: formatTimeAgo(n.createdAt),
      priority: 'NORMAL',
    });
  });

  // 9. Quick Resources
  const resources: StudentDashboardData['resources'] = [];
  const batchResources = user.studentProfile?.batch?.resources || [];
  batchResources.forEach((res) => {
    resources.push({
      id: res.id,
      title: res.title,
      type: res.resourceType || 'PDF',
      courseTitle: user.studentProfile?.batch?.title || 'Academic Cohort',
      url: res.url,
      createdAt: res.createdAt.toISOString(),
    });
  });

  // 10. Calendar Events
  const calendarEvents: StudentDashboardData['calendarEvents'] = [];
  const sessions = user.studentProfile?.batch?.sessions || [];
  sessions.forEach((s) => {
    const sDate = new Date(s.sessionDate);
    calendarEvents.push({
      id: s.id,
      title: s.title,
      type: 'LECTURE',
      dateText: sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeText: sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
  });

  // 11. Certificate Status
  const issuedCert = user.certificates[0];
  const certificate: StudentDashboardData['certificate'] = {
    isIssued: !!issuedCert,
    certificateId: issuedCert?.certificateId || null,
    verificationHash: issuedCert?.verificationHash || null,
    courseTitle: issuedCert?.course?.title || null,
    issuedAt: issuedCert?.issuedAt ? issuedCert.issuedAt.toLocaleDateString() : null,
    requiredModulesRemaining: Math.max(0, totalModulesCount - completedModulesCount),
  };

  // 12. Assigned Mentor details
  const mentorProfile =
    user.studentProfile?.assignedMentor || user.studentProfile?.batch?.mentor;

  const assignedMentor = mentorProfile
    ? {
        name: mentorProfile.user.name,
        title: mentorProfile.title,
        company: mentorProfile.company,
        expertise: mentorProfile.expertise,
        officeHours: mentorProfile.officeHours,
        email: mentorProfile.user.email,
      }
    : null;

  return {
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      tsId: user.tsIdentity?.tsId || `TSE-2026-${user.id.slice(-6).toUpperCase()}`,
      batchName: user.studentProfile?.batch?.title || 'Self-Paced Track',
      batchCode: user.studentProfile?.batch?.batchCode || 'GENERAL',
      currentStreak: streak,
      streakDays,
      totalHours,
      weeklyHours,
      weeklyGoalHours: 10,
      assignedMentor,
    },
    learningJourney: {
      overallProgressPercent,
      coursesEnrolledCount: coursesList.length,
      coursesCompletedCount: coursesList.filter((c) => c.status === 'COMPLETED').length,
      modulesTotalCount: totalModulesCount,
      modulesCompletedCount: completedModulesCount,
      assessmentsCompletedCount: user.testAttempts.length,
      certificatesEarnedCount: user.certificates.length,
    },
    currentCourse: currentCourseData,
    courses: coursesList,
    assessments: allAssessments.slice(0, 4),
    activityTimeline: activityTimeline.slice(0, 5),
    announcements: announcements.slice(0, 4),
    resources: resources.slice(0, 6),
    calendarEvents: calendarEvents.slice(0, 5),
    certificate,
  };
}

function formatTimeAgo(date: Date): string {
  const diffSec = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
