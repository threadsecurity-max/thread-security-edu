import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';
import { generateDomainTSID } from '@/lib/auth/ts-id';
import { sendStudentOnboardingEmail } from '../email/onboarding.service';
import { randomBytes, createHash } from 'crypto';

export function hashPassword(pwd: string): string {
  return createHash('sha256').update(pwd).digest('hex');
}

const db = prisma as any;

/**
 * Resolves the authenticated user's mentor profile, or verifies ADMIN role.
 * Throws an error if the user is neither a mentor nor an admin.
 */
export async function getAuthorizedMentorProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mentorProfile: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ACADEMIC_ADMIN';
  const isMentor = user.role === 'MENTOR';

  if (!isAdmin && !isMentor) {
    throw new Error('Access denied. Mentor or Administrator clearance required.');
  }

  // If mentor profile doesn't exist yet for MENTOR, create one seamlessly
  let mentorProfile = user.mentorProfile;
  if (!mentorProfile && isMentor) {
    mentorProfile = await prisma.mentorProfile.create({
      data: {
        userId,
        title: 'Senior Cybersecurity Faculty',
        company: 'Thread Security Education',
        bio: 'Lead faculty mentor directing practical offensive security and SOC defense cohorts.',
        expertise: 'VAPT, SOC Defense, DevSecOps, Ethical Hacking',
      },
    });
  }

  return {
    user,
    mentorProfile,
    isAdmin,
  };
}

/**
 * Retrieves all batches the mentor is authorized to manage.
 * If Admin, returns all batches.
 */
export async function getMentorAuthorizedBatches(userId: string) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const whereClause = isAdmin ? {} : { mentorId: mentorProfile?.id };

  return await db.batch.findMany({
    where: whereClause,
    include: {
      course: true,
      mentor: { include: { user: true } },
      students: {
        include: {
          user: { include: { tsIdentity: true } },
        },
      },
      sessions: {
        include: { attendanceRecords: true },
        orderBy: { sessionNumber: 'desc' },
      },
      assignments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Strict Scoping: Retrieves ONLY students belonging to the mentor's currently authorized batches.
 * (Rule #3 & Rule #15: A mentor must ONLY see students belonging to their currently authorized batches).
 */
export async function getMentorAuthorizedStudents(
  userId: string,
  options?: {
    search?: string;
    batchId?: string;
    courseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  // 1. Determine authorized batch IDs
  const authorizedBatches = await db.batch.findMany({
    where: isAdmin ? {} : { mentorId: mentorProfile?.id },
    select: { id: true },
  });
  const authorizedBatchIds = authorizedBatches.map((b: any) => b.id);

  if (authorizedBatchIds.length === 0 && !isAdmin) {
    return {
      students: [],
      total: 0,
      page: options?.page || 1,
      limit: options?.limit || 20,
      totalPages: 0,
    };
  }

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  // 2. Build where filter strictly scoped to authorized batches
  const where: any = {
    role: 'STUDENT',
    studentProfile: {
      batchId: options?.batchId
        ? options.batchId
        : { in: authorizedBatchIds },
    },
  };

  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { tsIdentity: { tsId: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (options?.courseId) {
    where.enrollments = {
      some: { courseId: options.courseId },
    };
  }

  if (options?.status) {
    if (options.status === 'ACTIVE') {
      where.isActive = true;
    } else if (options.status === 'INACTIVE') {
      where.isActive = false;
    }
  }

  const [total, students] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        tsIdentity: true,
        studentProfile: {
          include: {
            batch: {
              include: {
                course: true,
                mentor: { include: { user: true } },
              },
            },
            attendanceRecords: {
              include: { session: true },
            },
          },
        },
        enrollments: {
          include: { course: true },
        },
        labAttempts: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
        certificates: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  // Transform and calculate dynamic metrics
  const mappedStudents = students.map((s) => {
    const records = s.studentProfile?.attendanceRecords || [];
    const presentCount = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length;
    const attendancePercentage =
      records.length > 0 ? Math.round((presentCount / records.length) * 100) : 100;

    const avgProgress =
      s.enrollments.length > 0
        ? Math.round(
            s.enrollments.reduce((acc, e) => acc + e.progressPercent, 0) /
              s.enrollments.length
          )
        : 0;

    const lastActivity =
      s.labAttempts[0]?.startedAt ||
      s.studentProfile?.attendanceRecords[0]?.createdAt ||
      s.createdAt;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.studentProfile?.phone || null,
      isActive: s.isActive,
      tsId: s.tsIdentity?.tsId || 'N/A',
      batch: s.studentProfile?.batch
        ? {
            id: s.studentProfile.batch.id,
            code: s.studentProfile.batch.batchCode,
            title: s.studentProfile.batch.title,
            mentorName: s.studentProfile.batch.mentor?.user.name,
          }
        : null,
      course: s.enrollments[0]?.course
        ? {
            id: s.enrollments[0].course.id,
            title: s.enrollments[0].course.title,
            slug: s.enrollments[0].course.slug,
          }
        : null,
      attendancePercentage,
      totalSessionsAttended: presentCount,
      totalSessionsLogged: records.length,
      averageProgress: avgProgress,
      certificatesCount: s.certificates.length,
      lastActivity,
      createdAt: s.createdAt,
    };
  });

  return {
    students: mappedStudents,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Creates a new student under the mentor's authorized batch.
 * Automatically generates credentials and dispatches an onboarding email (Rule #10 & #11).
 */
export async function createStudentByMentor(
  userId: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    batchId: string;
    courseId?: string;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  // Verify batch ownership
  const batch = await db.batch.findUnique({
    where: { id: input.batchId },
    include: {
      course: true,
      mentor: { include: { user: true } },
    },
  });

  if (!batch) {
    throw new Error('Selected batch not found.');
  }

  if (!isAdmin && batch.mentorId !== mentorProfile?.id) {
    throw new Error('Unauthorized. You can only create students in batches you mentor.');
  }

  const cleanEmail = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existingUser) {
    throw new Error(`An account with email '${cleanEmail}' already exists.`);
  }

  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const tsId = generateDomainTSID('CYBER');
  const tempPassword = `TSE-${randomBytes(4).toString('hex').toUpperCase()}!`;
  const passwordHash = hashPassword(tempPassword);

  const courseId = input.courseId || batch.courseId;

  // Transactional creation
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: cleanEmail,
        name: fullName,
        passwordHash,
        role: 'STUDENT',
        isActive: true,
        isDashboardAccessGranted: true,
      },
    });

    await tx.tSIdentity.create({
      data: {
        tsId,
        userId: user.id,
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: user.id,
        phone: input.phone?.trim() || null,
        batchId: batch.id,
        assignedMentorId: batch.mentorId || mentorProfile?.id,
        careerGoal: 'Cyber Threat Defense & VAPT Specialist',
      },
    });

    if (courseId) {
      await tx.enrollment.create({
        data: {
          userId: user.id,
          courseId,
          progressPercent: 0,
          status: 'ACTIVE',
        },
      });
    }

    return user;
  });

  // Log Audit Trail
  await logAuditEvent({
    actorId: userId,
    action: 'STUDENT_CREATED_BY_MENTOR',
    entity: 'USER',
    entityId: newUser.id,
    details: JSON.stringify({
      name: fullName,
      email: cleanEmail,
      tsId,
      batchCode: batch.batchCode,
      courseId,
    }),
  });

  // Dispatch Welcome Onboarding Credentials Email
  const emailResult = await sendStudentOnboardingEmail({
    toEmail: cleanEmail,
    studentName: fullName,
    tsId,
    tempPassword,
    batchCode: batch.batchCode,
    courseTitle: batch.course?.title,
    mentorName: batch.mentor?.user.name,
    loginUrl: 'https://www.threadsecurity.in/login',
  });

  return {
    student: {
      id: newUser.id,
      name: fullName,
      email: cleanEmail,
      tsId,
      batchCode: batch.batchCode,
      batchId: batch.id,
    },
    emailDispatched: emailResult.success,
  };
}

/**
 * Moves a student from their current batch to another batch.
 * Strictly preserves student account, TS-ID, enrollments, attendance, and certificates (Rule #2, #14).
 */
export async function moveStudentBatch(
  userId: string,
  input: {
    studentId: string; // User ID
    targetBatchId: string;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const student = await prisma.user.findUnique({
    where: { id: input.studentId },
    include: {
      tsIdentity: true,
      studentProfile: {
        include: { batch: true },
      },
    },
  });

  if (!student || !student.studentProfile) {
    throw new Error('Student profile not found.');
  }

  const currentBatch = student.studentProfile.batch;

  // Authorization check: mentor must manage student's current batch, target batch, or be admin
  const targetBatch = await db.batch.findUnique({
    where: { id: input.targetBatchId },
    include: { mentor: { include: { user: true } }, course: true },
  });

  if (!targetBatch) {
    throw new Error('Target batch does not exist.');
  }

  if (
    !isAdmin &&
    currentBatch?.mentorId !== mentorProfile?.id &&
    targetBatch.mentorId !== mentorProfile?.id
  ) {
    throw new Error('Unauthorized. You do not have permission to move students between these batches.');
  }

  // Update batch membership ONLY - all other records remain untouched
  const updatedProfile = await db.studentProfile.update({
    where: { id: student.studentProfile.id },
    data: {
      batchId: targetBatch.id,
      assignedMentorId: targetBatch.mentorId || student.studentProfile.assignedMentorId,
    },
    include: {
      batch: true,
      user: { include: { tsIdentity: true } },
    },
  });

  // Ensure student has enrollment in target batch's course if not already enrolled
  if (targetBatch.courseId) {
    await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: targetBatch.courseId,
        },
      },
      update: {},
      create: {
        userId: student.id,
        courseId: targetBatch.courseId,
        progressPercent: 0,
        status: 'ACTIVE',
      },
    });
  }

  await logAuditEvent({
    actorId: userId,
    action: 'STUDENT_MOVED_BETWEEN_BATCHES',
    entity: 'STUDENT_PROFILE',
    entityId: student.studentProfile.id,
    details: JSON.stringify({
      studentName: student.name,
      tsId: student.tsIdentity?.tsId,
      previousBatch: currentBatch?.batchCode || 'UNASSIGNED',
      newBatch: targetBatch.batchCode,
      newMentor: targetBatch.mentor?.user.name,
    }),
  });

  return {
    success: true,
    studentName: student.name,
    tsId: student.tsIdentity?.tsId,
    previousBatchCode: currentBatch?.batchCode || 'UNASSIGNED',
    newBatchCode: targetBatch.batchCode,
  };
}

/**
 * Soft toggles student activation status.
 */
export async function toggleStudentStatus(
  userId: string,
  studentId: string,
  isActive: boolean
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: { studentProfile: true },
  });

  if (!student) {
    throw new Error('Student not found.');
  }

  if (!isAdmin && student.studentProfile?.assignedMentorId !== mentorProfile?.id) {
    // Check if in mentor's batch
    const batch = await db.batch.findFirst({
      where: {
        id: student.studentProfile?.batchId || '',
        mentorId: mentorProfile?.id,
      },
    });
    if (!batch) {
      throw new Error('Unauthorized to modify this student.');
    }
  }

  const updated = await prisma.user.update({
    where: { id: studentId },
    data: { isActive },
  });

  await logAuditEvent({
    actorId: userId,
    action: isActive ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
    entity: 'USER',
    entityId: studentId,
    details: JSON.stringify({ name: updated.name, email: updated.email, isActive }),
  });

  return updated;
}

/**
 * Schedules a new lecture session with auto-computed duration (Rule #16).
 */
export async function scheduleLectureByMentor(
  userId: string,
  input: {
    batchId: string;
    title: string;
    sessionDate: Date;
    startTime: string; // e.g. "10:00"
    endTime: string;   // e.g. "11:30"
    agenda?: string;
    meetingLink?: string;
    topicsCovered?: string;
    homework?: string;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const batch = await db.batch.findUnique({
    where: { id: input.batchId },
  });

  if (!batch) {
    throw new Error('Batch not found.');
  }

  if (!isAdmin && batch.mentorId !== mentorProfile?.id) {
    throw new Error('Unauthorized to schedule lectures for this batch.');
  }

  // Calculate duration in minutes from start and end times
  let durationMins = 90;
  if (input.startTime && input.endTime) {
    const [startH, startM] = input.startTime.split(':').map(Number);
    const [endH, endM] = input.endTime.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff > 0) {
      durationMins = diff;
    }
  }

  const lastSession = await db.batchSession.findFirst({
    where: { batchId: batch.id },
    orderBy: { sessionNumber: 'desc' },
  });

  const nextNumber = (lastSession?.sessionNumber || 0) + 1;

  const session = await db.batchSession.create({
    data: {
      batchId: batch.id,
      sessionNumber: nextNumber,
      title: input.title.trim(),
      sessionDate: input.sessionDate,
      durationMins,
      agenda: input.agenda?.trim(),
      topicsCovered: input.topicsCovered?.trim(),
      homework: input.homework?.trim(),
      importantNotes: input.meetingLink ? `Meeting Link: ${input.meetingLink}` : null,
      status: 'SCHEDULED',
    },
    include: { batch: true },
  });

  await logAuditEvent({
    actorId: userId,
    action: 'LECTURE_SCHEDULED_BY_MENTOR',
    entity: 'BATCH_SESSION',
    entityId: session.id,
    details: JSON.stringify({
      title: session.title,
      batchCode: batch.batchCode,
      date: session.sessionDate,
      durationMins,
    }),
  });

  return session;
}

/**
 * Creates a Cybersecurity Lab (Rule #21, #22, #23).
 * Restricts creation exclusively to Cybersecurity courses.
 */
export async function createCybersecurityLab(
  userId: string,
  input: {
    title: string;
    objective: string;
    courseId: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    estimatedMinutes: number;
    skills: string;
    instructions: string;
    labUrl?: string;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
  });

  if (!course) {
    throw new Error('Course not found.');
  }

  // Rule #23: Validate course category is cybersecurity related
  const categoryLower = (course.category || '').toLowerCase();
  const allowedCategories = [
    'cybersecurity',
    'web security',
    'network security',
    'vapt',
    'soc',
    'cloud security',
    'devsecops',
    'ethical hacking',
    'offensive security',
    'defensive security',
  ];

  const isCybersecurity = allowedCategories.some((cat) =>
    categoryLower.includes(cat)
  );

  if (!isCybersecurity && !isAdmin) {
    throw new Error(
      'Lab functionality is restricted exclusively to Cybersecurity, Web Security, SOC, and VAPT courses.'
    );
  }

  const lab = await db.lab.create({
    data: {
      courseId: course.id,
      title: input.title.trim(),
      objective: input.objective.trim(),
      difficulty: input.difficulty,
      estimatedMinutes: input.estimatedMinutes || 60,
      skills: input.skills.trim(),
      instructions: input.instructions.trim(),
      flagHash: input.labUrl ? `URL:${input.labUrl.trim()}` : null,
    },
    include: { course: true },
  });

  await logAuditEvent({
    actorId: userId,
    action: 'CYBER_LAB_CREATED',
    entity: 'LAB',
    entityId: lab.id,
    details: JSON.stringify({ title: lab.title, courseTitle: course.title }),
  });

  return lab;
}

/**
 * Creates a cohort assignment (Rule #29).
 */
export async function createAssignmentByMentor(
  userId: string,
  input: {
    batchId: string;
    title: string;
    description: string;
    deadline: Date;
    totalMarks?: number;
    fileUrl?: string;
    fileName?: string;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const batch = await db.batch.findUnique({
    where: { id: input.batchId },
  });

  if (!batch) {
    throw new Error('Batch not found.');
  }

  if (!isAdmin && batch.mentorId !== mentorProfile?.id) {
    throw new Error('Unauthorized to publish assignments for this batch.');
  }

  const assignment = await db.assignment.create({
    data: {
      batchId: batch.id,
      title: input.title.trim(),
      description: input.description.trim(),
      deadline: input.deadline,
      numberMaxScore: input.totalMarks || 100,
      gradingType: 'NUMBER',
      fileUrl: input.fileUrl || null,
      fileName: input.fileName || null,
      createdById: userId,
    },
    include: { batch: true },
  });

  await logAuditEvent({
    actorId: userId,
    action: 'ASSIGNMENT_CREATED',
    entity: 'ASSIGNMENT',
    entityId: assignment.id,
    details: JSON.stringify({ title: assignment.title, batchCode: batch.batchCode }),
  });

  return assignment;
}

/**
 * Grades a student submission (Rule #31).
 */
export async function gradeStudentSubmission(
  userId: string,
  submissionId: string,
  score: number,
  remarks?: string
) {
  const submission = await db.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: { include: { batch: true } },
      student: true,
    },
  });

  if (!submission) {
    throw new Error('Submission not found.');
  }

  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);
  if (!isAdmin && submission.assignment.batch.mentorId !== mentorProfile?.id) {
    throw new Error('Unauthorized to grade submissions for this batch.');
  }

  const maxScore = submission.assignment.numberMaxScore || 100;
  const isPassing = score >= maxScore * 0.4;

  const graded = await db.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score,
      remarks: remarks?.trim() || null,
      status: 'GRADED',
      isPassing,
      gradedAt: new Date(),
      gradedById: userId,
    },
  });

  await logAuditEvent({
    actorId: userId,
    action: 'ASSIGNMENT_GRADED',
    entity: 'ASSIGNMENT_SUBMISSION',
    entityId: submissionId,
    details: JSON.stringify({
      student: submission.student.name,
      assignment: submission.assignment.title,
      score,
      isPassing,
    }),
  });

  return graded;
}

/**
 * Publishes an announcement / broadcast to a batch (Rule #34, #35).
 */
export async function sendBatchAnnouncement(
  userId: string,
  input: {
    batchId: string;
    title: string;
    message: string;
    attachmentUrl?: string;
  }
) {
  const { mentorProfile, isAdmin } = await getAuthorizedMentorProfile(userId);

  const batch = await db.batch.findUnique({
    where: { id: input.batchId },
    include: {
      students: { include: { user: true } },
    },
  });

  if (!batch) {
    throw new Error('Batch not found.');
  }

  if (!isAdmin && batch.mentorId !== mentorProfile?.id) {
    throw new Error('Unauthorized to send announcements to this batch.');
  }

  const broadcast = await db.broadcast.create({
    data: {
      batchId: batch.id,
      mentorId: batch.mentorId || mentorProfile?.id,
      title: input.title.trim(),
      message: input.message.trim(),
      attachmentUrl: input.attachmentUrl || null,
      recipientsCount: batch.students.length,
      deliveryStatus: 'DELIVERED',
      recipients: {
        create: batch.students.map((sp: any) => ({
          studentId: sp.id,
          isRead: false,
        })),
      },
    },
  });

  // Also create in-app notifications for each student
  await Promise.all(
    batch.students.map((sp: any) =>
      db.notification.create({
        data: {
          userId: sp.userId,
          title: `Announcement: ${input.title.trim()}`,
          message: input.message.trim(),
          type: 'BROADCAST',
          linkUrl: '/student/attendance',
        },
      })
    )
  );

  await logAuditEvent({
    actorId: userId,
    action: 'BATCH_ANNOUNCEMENT_SENT',
    entity: 'BROADCAST',
    entityId: broadcast.id,
    details: JSON.stringify({ batchCode: batch.batchCode, title: broadcast.title }),
  });

  return broadcast;
}
