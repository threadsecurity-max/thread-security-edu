import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';

export async function getMentorDashboardData(userId: string) {
  // Find mentor profile
  let mentor = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      courses: {
        include: {
          enrollments: true,
          labs: true,
        },
      },
      students: {
        include: {
          user: {
            include: {
              tsIdentity: true,
              enrollments: { include: { course: true } },
            },
          },
        },
      },
    },
  });

  // If user is MENTOR but profile missing, create default
  if (!mentor) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === 'MENTOR') {
      mentor = await prisma.mentorProfile.create({
        data: {
          userId,
          title: 'Senior Cybersecurity Instructor',
          company: 'Thread Security Education',
          bio: 'Lead Security Mentor specializing in VAPT and Offensive Security.',
          expertise: 'Cybersecurity, Penetration Testing, Bug Bounty',
        },
        include: {
          user: true,
          courses: {
            include: {
              enrollments: true,
              labs: true,
            },
          },
          students: {
            include: {
              user: {
                include: {
                  tsIdentity: true,
                  enrollments: { include: { course: true } },
                },
              },
            },
          },
        },
      });
    }
  }

  // Pending lab attempts to grade
  const pendingAttempts = await prisma.labAttempt.findMany({
    take: 10,
    orderBy: { startedAt: 'desc' },
    include: {
      lab: { include: { course: true } },
      user: { include: { tsIdentity: true } },
    },
  });

  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  const totalCourses = mentor?.courses.length || 0;
  const totalSubmissions = pendingAttempts.length;

  return {
    mentor,
    stats: {
      totalMentees: mentor?.students.length || totalStudents,
      totalCourses,
      pendingGrades: pendingAttempts.filter((a) => a.state === 'SUBMITTED' || a.score === 0).length,
      totalSubmissions,
    },
    pendingAttempts,
  };
}

export async function gradeLabSubmission(
  mentorUserId: string,
  attemptId: string,
  score: number,
  feedback: string
) {
  const attempt = await prisma.labAttempt.findUnique({
    where: { id: attemptId },
    include: { lab: true, user: true },
  });

  if (!attempt) {
    throw new Error('Lab submission record not found.');
  }

  const updated = await prisma.labAttempt.update({
    where: { id: attemptId },
    data: {
      score,
      feedback,
      state: score >= 70 ? 'COMPLETED' : 'SUBMITTED',
      completedAt: new Date(),
    },
  });

  await logAuditEvent({
    actorId: mentorUserId,
    action: 'MENTOR_GRADED_LAB',
    entity: 'LAB_ATTEMPT',
    entityId: attemptId,
    details: { score, feedback, studentId: attempt.userId },
  });

  return updated;
}
