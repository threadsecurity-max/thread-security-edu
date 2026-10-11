import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';
import { generateTSID, generateDomainTSID, StudentTrack } from '@/lib/auth/ts-id';

/**
 * Calculates the next available TS-ID for a student based on existing IDs + 1.
 * For track 'CYBER': prefix is TS-C (e.g. TS-C147)
 * For track 'AI': prefix is TS-A (e.g. TS-A147)
 */
export async function getNextSuggestedTSID(track: StudentTrack = 'CYBER'): Promise<string> {
  const prefix = track === 'AI' ? 'TS-A' : 'TS-C';
  
  const allIdentities = await prisma.tSIdentity.findMany({
    select: { tsId: true },
  });

  let maxNum = 100; // baseline, first is 101
  for (const record of allIdentities) {
    // Match either TS-C###, TS-A###, or any trailing digits
    const match = record.tsId.match(/^TS-[A-Za-z](\d+)$/i) || record.tsId.match(/(\d{3,4})$/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxNum && parsed < 10000) {
        maxNum = parsed;
      }
    }
  }

  return `${prefix}${maxNum + 1}`;
}

export async function createStudentService({
  name,
  email,
  phone,
  careerGoal,
  track = 'CYBER',
  customTsId,
}: {
  name: string;
  email: string;
  phone?: string;
  careerGoal?: string;
  track?: StudentTrack;
  customTsId?: string;
}) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  let tsId = customTsId?.trim();
  if (!tsId) {
    tsId = await getNextSuggestedTSID(track);
  } else {
    const existingId = await prisma.tSIdentity.findUnique({
      where: { tsId },
    });
    if (existingId) {
      throw new Error(`Student ID ${tsId} is already in use by another student.`);
    }
  }

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


import { generateMentorTSID } from '@/lib/auth/ts-id';
import { randomBytes } from 'crypto';

export async function createMentorService({
  name,
  email,
  title,
  company,
  expertise,
  bio,
  batchId,
}: {
  name: string;
  email: string;
  title: string;
  company: string;
  expertise: string;
  bio: string;
  batchId?: string;
}) {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const mentorId = generateMentorTSID();
  const inviteToken = `tse-inv-${randomBytes(16).toString('hex')}`;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash: 'MFA_OTP_ONLY',
        role: 'MENTOR',
        isActive: true,
        isDashboardAccessGranted: true,
        dashboardAccessGrantedAt: new Date(),
      },
    });

    const mentor = await tx.mentorProfile.create({
      data: {
        userId: user.id,
        title: title.trim(),
        company: company.trim(),
        expertise: expertise.trim(),
        bio: bio.trim(),
      },
    });

    // Save Mentor Identity
    try {
      await (tx as any).mentorIdentity.create({
        data: {
          mentorId,
          userId: user.id,
        },
      });
    } catch {
      // Fallback to TSIdentity if mentorIdentity not yet migrated
      await tx.tSIdentity.create({
        data: {
          tsId: mentorId,
          userId: user.id,
        },
      });
    }

    // Create an Invitation Token record
    try {
      await (tx as any).invitationToken.create({
        data: {
          token: inviteToken,
          email: cleanEmail,
          role: 'MENTOR',
          targetId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    } catch {}

    return { user, mentor, mentorId, inviteToken };
  });

  if (batchId) {
    try {
      await prisma.batch.update({
        where: { id: batchId },
        data: { mentorId: result.mentor.id },
      });
    } catch (e) {
      console.warn('Failed to assign batch during mentor provision:', e);
    }
  }

  await logAuditEvent({
    action: 'MENTOR_CREATED',
    entity: 'MENTOR_PROFILE',
    entityId: result.mentor.id,
    details: `Created mentor ${name} (${cleanEmail}, Mentor ID: ${mentorId}).`,
  });

  return result;
}

export async function assignBatchToMentorService(mentorProfileId: string, batchId: string) {
  const updated = await prisma.batch.update({
    where: { id: batchId },
    data: { mentorId: mentorProfileId },
  });

  await logAuditEvent({
    action: 'BATCH_ASSIGNED_TO_MENTOR',
    entity: 'BATCH',
    entityId: batchId,
    details: `Assigned batch ${updated.batchCode} to mentor ${mentorProfileId}`,
  });

  return updated;
}

export async function updateMentorService(
  mentorId: string,
  data: {
    name?: string;
    title?: string;
    company?: string;
    expertise?: string;
    bio?: string;
    officeHours?: string;
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
      data: { name: data.name.trim() },
    });
  }

  const updatedMentor = await prisma.mentorProfile.update({
    where: { id: mentorId },
    data: {
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.company ? { company: data.company.trim() } : {}),
      ...(data.expertise ? { expertise: data.expertise.trim() } : {}),
      ...(data.bio ? { bio: data.bio.trim() } : {}),
      ...(data.officeHours !== undefined ? { officeHours: data.officeHours.trim() } : {}),
    },
  });

  await logAuditEvent({
    action: 'MENTOR_UPDATED',
    entity: 'MENTOR_PROFILE',
    entityId: mentorId,
    details: `Updated mentor details for ${data.name || mentor.user.name}.`,
  });

  return updatedMentor;
}

/**
 * Safe Deactivation / Archival of Mentor (Preserves historical course, batch, and attendance attribution)
 */
export async function deleteMentorService(mentorId: string) {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
    include: { user: true },
  });

  if (!mentor) {
    throw new Error('Mentor profile not found.');
  }

  // Deactivate the user and revoke dashboard access rather than hard-deleting the profile
  await prisma.user.update({
    where: { id: mentor.userId },
    data: {
      isActive: false,
      isDashboardAccessGranted: false,
    },
  });

  await logAuditEvent({
    action: 'MENTOR_ACCESS_REVOKED_AND_ARCHIVED',
    entity: 'MENTOR_PROFILE',
    entityId: mentorId,
    details: `Revoked access and archived mentor account for ${mentor.user.name} (${mentor.user.email}). Historical records preserved.`,
  });

  return true;
}

/**
 * Granular Lifecycle Status Toggle for Mentors (Active, Suspended, Revoked)
 */
export async function toggleMentorAccessService(
  mentorId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED',
  actorId?: string
) {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
    include: { user: true },
  });

  if (!mentor) {
    throw new Error('Mentor profile not found.');
  }

  const isActive = status === 'ACTIVE';
  const isGranted = status === 'ACTIVE';

  await prisma.user.update({
    where: { id: mentor.userId },
    data: {
      isActive,
      isDashboardAccessGranted: isGranted,
    },
  });

  await logAuditEvent({
    actorId,
    action: `MENTOR_STATUS_${status}`,
    entity: 'MENTOR_PROFILE',
    entityId: mentorId,
    details: `Set mentor ${mentor.user.name} access status to ${status}.`,
  });

  return true;
}

/**
 * Direct Batch Assignment / Transfer for Students
 */
export async function reassignStudentBatchService(
  userId: string,
  newBatchId: string | null,
  actorId?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: { include: { batch: true } }, tsIdentity: true },
  });

  if (!user || !user.studentProfile) {
    throw new Error('Student profile record not found.');
  }

  const oldBatchCode = user.studentProfile.batch?.batchCode || 'None';

  let newBatchCode = 'None';
  if (newBatchId) {
    const newBatch = await prisma.batch.findUnique({ where: { id: newBatchId } });
    if (!newBatch) throw new Error('Target batch does not exist.');
    newBatchCode = newBatch.batchCode;
  }

  await prisma.studentProfile.update({
    where: { id: user.studentProfile.id },
    data: { batchId: newBatchId },
  });

  await logAuditEvent({
    actorId,
    action: 'STUDENT_BATCH_REASSIGNED',
    entity: 'STUDENT_PROFILE',
    entityId: user.studentProfile.id,
    details: `Transferred student ${user.name} (${user.tsIdentity?.tsId || 'N/A'}) from batch ${oldBatchCode} to ${newBatchCode}.`,
  });

  return { success: true, oldBatchCode, newBatchCode };
}


