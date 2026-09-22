import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';
import { generateTSID, generateDomainTSID, StudentTrack } from '@/lib/auth/ts-id';

export async function createStudentService({
  name,
  email,
  phone,
  careerGoal,
  track = 'CYBER',
}: {
  name: string;
  email: string;
  phone?: string;
  careerGoal?: string;
  track?: StudentTrack;
}) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const tsId = generateDomainTSID(track);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash: 'MFA_OTP_ONLY',
        role: 'STUDENT',
      },
    });

    await tx.tSIdentity.create({
      data: {
        tsId: tsId,
        userId: newUser.id,
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: newUser.id,
        phone: phone?.trim() || null,
        careerGoal: careerGoal?.trim() || (track === 'AI' ? 'Artificial Intelligence & Machine Learning' : 'Cybersecurity & VAPT Specialist'),
      },
    });

    return newUser;
  });

  await logAuditEvent({
    action: 'STUDENT_CREATED',
    entity: 'USER',
    entityId: user.id,
    details: `Created new student account for ${name} (${cleanEmail}, Track: ${track}, TS-ID: ${tsId}).`,
  });

  return { user, tsId };
}

export async function reassignStudentTrackService(userId: string, track: StudentTrack) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tsIdentity: true },
  });

  if (!user || !user.tsIdentity) {
    throw new Error('Student identity record not found.');
  }

  const newTsId = generateDomainTSID(track);

  await prisma.tSIdentity.update({
    where: { userId },
    data: { tsId: newTsId },
  });

  await logAuditEvent({
    action: 'STUDENT_TSID_REASSIGNED',
    entity: 'TS_IDENTITY',
    entityId: userId,
    details: `Reassigned student ${user.name} TS-ID to ${newTsId} (Track: ${track}).`,
  });

  return newTsId;
}

export async function updateStudentService(
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    careerGoal?: string;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tsIdentity: true, studentProfile: true },
  });

  if (!user || user.role !== 'STUDENT') {
    throw new Error('Student account not found.');
  }

  const cleanName = data.name?.trim();
  const cleanEmail = data.email?.trim().toLowerCase();

  if (cleanEmail && cleanEmail !== user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      throw new Error('Another account is already using that email address.');
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(cleanName ? { name: cleanName } : {}),
      ...(cleanEmail ? { email: cleanEmail } : {}),
    },
  });

  if (user.studentProfile) {
    await prisma.studentProfile.update({
      where: { userId },
      data: {
        ...(data.phone !== undefined ? { phone: data.phone.trim() || null } : {}),
        ...(data.careerGoal !== undefined ? { careerGoal: data.careerGoal.trim() || null } : {}),
      },
    });
  }

  await logAuditEvent({
    action: 'STUDENT_UPDATED',
    entity: 'USER',
    entityId: userId,
    details: `Updated student details for ${cleanName || user.name} (${user.tsIdentity?.tsId || 'N/A'}).`,
  });

  return true;
}

export async function deleteStudentService(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tsIdentity: true },
  });

  if (!user) {
    throw new Error('Student account not found.');
  }

  const studentName = user.name;
  const tsId = user.tsIdentity?.tsId || 'N/A';

  await prisma.user.delete({
    where: { id: userId },
  });

  await logAuditEvent({
    action: 'STUDENT_DELETED',
    entity: 'USER',
    entityId: userId,
    details: `Deleted student account for ${studentName} (${tsId}).`,
  });

  return true;
}

export async function logStudentViewService(userId: string, actorId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tsIdentity: true },
  });

  if (!user) return;

  await logAuditEvent({
    actorId,
    action: 'STUDENT_PROFILE_VIEWED',
    entity: 'USER',
    entityId: userId,
    details: `Inspected student dashboard and profile details for ${user.name} (${user.email}, ${user.tsIdentity?.tsId || 'N/A'}).`,
  });
}

/**
 * Single-toggle Service: Instantly grant or revoke student dashboard & learning environment access.
 */
export async function toggleStudentDashboardAccessService(
  userId: string,
  grant: boolean,
  actorId?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tsIdentity: true, enrollments: true },
  });

  if (!user) {
    throw new Error('Student account not found.');
  }

  const updatedUser = await (prisma.user as any).update({
    where: { id: userId },
    data: {
      isDashboardAccessGranted: grant,
      dashboardAccessGrantedAt: grant ? new Date() : null,
      approvedBy: actorId || 'Admin',
    },
    include: { tsIdentity: true },
  });

  // If granting access and user has no course enrollments, automatically enroll in foundational courses
  if (grant && user.enrollments.length === 0) {
    const publishedCourses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      take: 2,
    });

    for (const course of publishedCourses) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          userId: user.id,
          courseId: course.id,
          status: 'ACTIVE',
          progressPercent: 0,
        },
      });
    }
  }

  await logAuditEvent({
    actorId,
    action: grant ? 'STUDENT_DASHBOARD_ACCESS_GRANTED' : 'STUDENT_DASHBOARD_ACCESS_REVOKED',
    entity: 'USER',
    entityId: userId,
    details: `${grant ? 'Granted' : 'Revoked'} dashboard and course access for ${user.name} (${user.email}, ${user.tsIdentity?.tsId || 'N/A'}).`,
  });

  return updatedUser;
}

/**
 * Single-toggle Service: Toggle enrollment in specific course for a student
 */
export async function toggleStudentCourseEnrollmentService(
  userId: string,
  courseId: string,
  active: boolean,
  actorId?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tsIdentity: true },
  });
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!user || !course) {
    throw new Error('Student or Course not found.');
  }

  if (active) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { status: 'ACTIVE' },
      create: { userId, courseId, status: 'ACTIVE', progressPercent: 0 },
    });
  } else {
    await prisma.enrollment.deleteMany({
      where: { userId, courseId },
    });
  }

  await logAuditEvent({
    actorId,
    action: active ? 'STUDENT_COURSE_ENROLLED' : 'STUDENT_COURSE_UNENROLLED',
    entity: 'ENROLLMENT',
    entityId: `${userId}:${courseId}`,
    details: `${active ? 'Enrolled' : 'Removed'} ${user.name} (${user.tsIdentity?.tsId}) in course ${course.title}.`,
  });

  return true;
}


export async function createMentorService({
  name,
  email,
  title,
  company,
  expertise,
  bio,
}: {
  name: string;
  email: string;
  title: string;
  company: string;
  expertise: string;
  bio: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash: 'MFA_OTP_ONLY',
        role: 'MENTOR',
      },
    });

    const mentor = await tx.mentorProfile.create({
      data: {
        userId: user.id,
        title,
        company,
        expertise,
        bio,
      },
    });

    return { user, mentor };
  });

  await logAuditEvent({
    action: 'MENTOR_CREATED',
    entity: 'MENTOR_PROFILE',
    entityId: result.mentor.id,
    details: JSON.stringify({ name, email, title, company }),
  });

  return result;
}

export async function updateMentorService(
  mentorId: string,
  data: {
    name?: string;
    title?: string;
    company?: string;
    expertise?: string;
    bio?: string;
  }
) {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
    include: { user: true },
  });

  if (!mentor) {
    throw new Error('Mentor profile not found.');
  }

  if (data.name) {
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { name: data.name },
    });
  }

  const updatedMentor = await prisma.mentorProfile.update({
    where: { id: mentorId },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.company ? { company: data.company } : {}),
      ...(data.expertise ? { expertise: data.expertise } : {}),
      ...(data.bio ? { bio: data.bio } : {}),
    },
  });

  await logAuditEvent({
    action: 'MENTOR_UPDATED',
    entity: 'MENTOR_PROFILE',
    entityId: mentorId,
    details: JSON.stringify({ mentorId, ...data }),
  });

  return updatedMentor;
}

export async function deleteMentorService(mentorId: string) {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
  });

  if (!mentor) {
    throw new Error('Mentor profile not found.');
  }

  // Deactivate user and delete mentor profile
  await prisma.$transaction([
    prisma.mentorProfile.delete({ where: { id: mentorId } }),
    prisma.user.update({
      where: { id: mentor.userId },
      data: { isActive: false },
    }),
  ]);

  await logAuditEvent({
    action: 'MENTOR_DELETED',
    entity: 'MENTOR_PROFILE',
    entityId: mentorId,
    details: JSON.stringify({ mentorId }),
  });

  return true;
}

