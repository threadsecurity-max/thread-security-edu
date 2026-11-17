import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';
import { generateTSID, generateDomainTSID, StudentTrack } from '@/lib/auth/ts-id';
import {
  sendStudentOnboardingEmail,
  sendFacultyOnboardingEmail,
  sendStaffOrAdminOnboardingEmail,
} from '../email/onboarding.service';
import { RoleType } from '@prisma/client';

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

export async function getNextSuggestedMentorID(): Promise<string> {
  const allIdentities = await prisma.tSIdentity.findMany({
    select: { tsId: true },
  });

  let maxNum = 100;
  for (const record of allIdentities) {
    const match = record.tsId.match(/^TS-M(?:NT)?-(\d+)$/i) || record.tsId.match(/^TS-M(\d+)$/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxNum && parsed < 10000) {
        maxNum = parsed;
      }
    }
  }

  return `TS-MNT-${maxNum + 1}`;
}

export async function createStudentService({
  name,
  email,
  phone,
  careerGoal,
  track = 'CYBER',
  customTsId,
  batchId,
  tempPassword,
  dispatchEmail,
}: {
  name: string;
  email: string;
  phone?: string;
  careerGoal?: string;
  track?: StudentTrack;
  customTsId?: string;
  batchId?: string;
  tempPassword?: string;
  dispatchEmail?: boolean;
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

  const generatedPassword = tempPassword?.trim() || `TSE-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash: generatedPassword,
        role: 'STUDENT',
        isActive: true,
        isDashboardAccessGranted: true,
        dashboardAccessGrantedAt: new Date(),
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
        batchId: batchId || null,
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

  let emailDispatched = false;
  if (dispatchEmail !== false) {
    try {
      let batchCode: string | undefined;
      let courseTitle: string | undefined;
      let mentorName: string | undefined;

      if (batchId) {
        const batch = await prisma.batch.findUnique({
          where: { id: batchId },
          include: { course: true, mentor: { include: { user: true } } },
        });
        if (batch) {
          batchCode = batch.batchCode;
          courseTitle = batch.course?.title;
          mentorName = batch.mentor?.user?.name;
        }
      }

      const emailRes = await sendStudentOnboardingEmail({
        toEmail: cleanEmail,
        studentName: name.trim(),
        tsId,
        tempPassword: generatedPassword,
        batchCode,
        courseTitle,
        mentorName,
      });
      emailDispatched = emailRes.success;
    } catch (emailErr) {
      console.warn('[Student Onboarding Email Warning]:', emailErr);
    }
  }

  return { user, tsId, emailDispatched };
}

export async function dispatchStudentCredentialsService(userId: string, customPassword?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
        },
      },
    },
  });

  if (!user || user.role !== 'STUDENT') {
    throw new Error('Student account not found.');
  }

  const tsId = user.tsIdentity?.tsId || 'TS-STUDENT';
  const tempPassword = customPassword?.trim() || `TSE-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: tempPassword,
      isDashboardAccessGranted: true,
      isActive: true,
    },
  });

  const batch = user.studentProfile?.batch;
  let emailDispatched = false;
  let emailRes: any = null;
  try {
    emailRes = await sendStudentOnboardingEmail({
      toEmail: user.email,
      studentName: user.name,
      tsId,
      tempPassword,
      batchCode: batch?.batchCode,
      courseTitle: batch?.course?.title,
      mentorName: batch?.mentor?.user?.name,
    });
    emailDispatched = emailRes?.success ?? true;
  } catch (err: any) {
    console.error('[dispatchStudentCredentialsService Email Error]:', err?.message);
  }

  await logAuditEvent({
    action: 'STUDENT_CREDENTIALS_DISPATCHED',
    entity: 'USER',
    entityId: user.id,
    details: `Dispatched login credentials email to student ${user.name} (${user.email}, TS-ID: ${tsId}). Email dispatched: ${emailDispatched}`,
  });

  return { success: true, email: user.email, tsId, emailDispatched, emailResult: emailRes };
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
  batchIds,
  courseIds,
  schedule,
  passkey,
  dispatchEmail,
  customMentorId,
}: {
  name: string;
  email: string;
  title: string;
  company: string;
  expertise: string;
  bio: string;
  batchId?: string;
  batchIds?: string[];
  courseIds?: string[];
  schedule?: string;
  passkey?: string;
  dispatchEmail?: boolean;
  customMentorId?: string;
}) {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const mentorId = customMentorId?.trim().toUpperCase() || generateMentorTSID();
  const existingId = await prisma.tSIdentity.findUnique({
    where: { tsId: mentorId },
  });
  if (existingId) {
    throw new Error(`Faculty ID ${mentorId} is already assigned to another account.`);
  }

  const inviteToken = `tse-inv-${randomBytes(16).toString('hex')}`;
  const facultyPasskey = passkey?.trim() || `TSE-MNT-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash: facultyPasskey,
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
        officeHours: schedule?.trim() || null,
      },
    });

    // Save Mentor TSIdentity
    await tx.tSIdentity.create({
      data: {
        tsId: mentorId,
        userId: user.id,
      },
    });

    return { user, mentor, mentorId, inviteToken };
  });

  // Assign Batches to Mentor
  const targetBatchIds = new Set<string>();
  if (batchId) targetBatchIds.add(batchId);
  if (batchIds && Array.isArray(batchIds)) {
    batchIds.forEach((b) => b && targetBatchIds.add(b));
  }

  const assignedBatchCodes: string[] = [];
  if (targetBatchIds.size > 0) {
    const ids = Array.from(targetBatchIds);
    try {
      await prisma.batch.updateMany({
        where: { id: { in: ids } },
        data: { mentorId: result.mentor.id },
      });
      const bList = await prisma.batch.findMany({
        where: { id: { in: ids } },
        select: { batchCode: true },
      });
      assignedBatchCodes.push(...bList.map((b) => b.batchCode));
    } catch (e) {
      console.warn('Failed to assign batches during mentor provision:', e);
    }
  }

  // Assign Courses to Mentor
  const assignedCourseTitles: string[] = [];
  if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
    try {
      await prisma.course.updateMany({
        where: { id: { in: courseIds } },
        data: { mentorId: result.mentor.id },
      });
      const cList = await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { title: true },
      });
      assignedCourseTitles.push(...cList.map((c) => c.title));
    } catch (e) {
      console.warn('Failed to assign courses during mentor provision:', e);
    }
  }

  await logAuditEvent({
    action: 'MENTOR_CREATED',
    entity: 'MENTOR_PROFILE',
    entityId: result.mentor.id,
    details: `Created mentor ${name} (${cleanEmail}, Mentor ID: ${mentorId}, Batches: ${assignedBatchCodes.join(', ') || 'None'}).`,
  });

  // Dispatch Welcome Credentials Email to Faculty
  let emailDispatched = false;
  if (dispatchEmail !== false) {
    try {
      const emailRes = await sendFacultyOnboardingEmail({
        toEmail: cleanEmail,
        facultyName: name.trim(),
        mentorId,
        tempPassword: facultyPasskey,
        batches: assignedBatchCodes,
        courses: assignedCourseTitles,
        schedule: schedule?.trim(),
      });
      emailDispatched = emailRes.success;
    } catch (emailErr) {
      console.warn('[Faculty Onboarding Email Warning]:', emailErr);
    }
  }

  return { ...result, emailDispatched };
}

export async function dispatchMentorCredentialsService(mentorProfileId: string, customPasskey?: string) {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    include: {
      user: {
        include: {
          tsIdentity: true,
        },
      },
      batches: { select: { batchCode: true } },
      courses: { select: { title: true } },
    },
  });

  if (!mentor || !mentor.user) {
    throw new Error('Mentor profile not found.');
  }

  const mentorId = (mentor.user as any).mentorIdentity?.mentorId || mentor.user.tsIdentity?.tsId || 'TS-MNT-ACTIVE';
  const facultyPasskey = customPasskey?.trim() || `TSE-MNT-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;

  await prisma.user.update({
    where: { id: mentor.userId },
    data: {
      passwordHash: facultyPasskey,
      isDashboardAccessGranted: true,
      isActive: true,
    },
  });

  let emailDispatched = false;
  let emailRes: any = null;
  try {
    emailRes = await sendFacultyOnboardingEmail({
      toEmail: mentor.user.email,
      facultyName: mentor.user.name,
      mentorId,
      tempPassword: facultyPasskey,
      batches: mentor.batches.map((b) => b.batchCode),
      courses: mentor.courses.map((c) => c.title),
      schedule: mentor.officeHours || undefined,
    });
    emailDispatched = emailRes?.success ?? true;
  } catch (err: any) {
    console.error('[dispatchMentorCredentialsService Email Error]:', err?.message);
  }

  await logAuditEvent({
    action: 'MENTOR_CREDENTIALS_DISPATCHED',
    entity: 'MENTOR_PROFILE',
    entityId: mentor.id,
    details: `Dispatched login credentials email to mentor ${mentor.user.name} (${mentor.user.email}, Mentor ID: ${mentorId}). Email dispatched: ${emailDispatched}`,
  });

  return { success: true, email: mentor.user.email, mentorId, emailDispatched, emailResult: emailRes };
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

  // Connectivity fix: Auto-enroll student into the batch's associated course
  if (newBatchId) {
    const targetBatch = await prisma.batch.findUnique({
      where: { id: newBatchId },
      select: { courseId: true },
    });
    if (targetBatch?.courseId) {
      await (prisma as any).enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: targetBatch.courseId,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          userId: user.id,
          courseId: targetBatch.courseId,
          status: 'ACTIVE',
        },
      });
    }
  }

  await logAuditEvent({
    actorId,
    action: 'STUDENT_BATCH_REASSIGNED',
    entity: 'STUDENT_PROFILE',
    entityId: user.studentProfile.id,
    details: `Transferred student ${user.name} (${user.tsIdentity?.tsId || 'N/A'}) from batch ${oldBatchCode} to ${newBatchCode}.`,
  });

  return { success: true, oldBatchCode, newBatchCode };
}

/**
 * Calculates next available sequential TS-ID for Staff, Security Admin, or Super Admin
 */
export async function getNextSuggestedStaffOrAdminID(
  role: RoleType | string
): Promise<string> {
  const prefix =
    role === 'SECURITY_ADMIN'
      ? 'TS-SEC'
      : role === 'SUPER_ADMIN'
      ? 'TS-ADM'
      : 'TS-STF';

  const allIdentities = await prisma.tSIdentity.findMany({
    where: { tsId: { startsWith: prefix } },
    select: { tsId: true },
  });

  let maxNum = 0;
  for (const record of allIdentities) {
    const match = record.tsId.match(/(\d+)$/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
    }
  }
  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum < 10 ? '0' + nextNum : nextNum}`;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  role: RoleType;
  customTsId?: string;
  passkey?: string;
  secretKey?: string;
  department?: string;
  batchId?: string;
  track?: StudentTrack;
  dispatchEmail?: boolean;
  actorId?: string;
}

export async function createUserService({
  name,
  email,
  phone,
  role,
  customTsId,
  passkey,
  secretKey,
  department,
  batchId,
  track = 'CYBER',
  dispatchEmail = true,
  actorId,
}: CreateUserInput) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();

  // 1. Verify Email Uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existingUser) {
    throw new Error(`An account with email ${cleanEmail} already exists.`);
  }

  // 2. Resolve TS-ID
  let appointedTsId = customTsId?.trim().toUpperCase();
  if (!appointedTsId) {
    if (role === 'STUDENT') {
      appointedTsId = await getNextSuggestedTSID(track);
    } else if (role === 'MENTOR') {
      appointedTsId = await getNextSuggestedMentorID();
    } else if (role === 'SECURITY_ADMIN') {
      appointedTsId = await getNextSuggestedStaffOrAdminID('SECURITY_ADMIN');
    } else if (role === 'SUPER_ADMIN') {
      appointedTsId = await getNextSuggestedStaffOrAdminID('SUPER_ADMIN');
    } else {
      appointedTsId = await getNextSuggestedStaffOrAdminID('ACADEMIC_ADMIN');
    }
  }

  // 3. Verify TS-ID Uniqueness
  const existingTsId = await prisma.tSIdentity.findUnique({
    where: { tsId: appointedTsId },
  });
  if (existingTsId) {
    throw new Error(`TS-ID ${appointedTsId} is already in use by another account.`);
  }

  // 4. Resolve Passkey & Secret Key
  let resolvedPasskey = passkey?.trim();
  let resolvedSecretKey = secretKey?.trim();

  if (role === 'SECURITY_ADMIN') {
    resolvedSecretKey = resolvedSecretKey || process.env.SECURITY_ADMIN_SECRET_KEY || 'TSE-SEC-ADMIN-789';
    resolvedPasskey = resolvedPasskey || process.env.SECURITY_ADMIN_PASSKEY || 'ThreadSec@789789789';
  } else if (role === 'SUPER_ADMIN') {
    resolvedSecretKey = resolvedSecretKey || process.env.ADMIN_SECRET_KEY || 'TSE-ADMIN-8080';
    resolvedPasskey = resolvedPasskey || process.env.ADMIN_PASSKEY || 'ThreadSec@789';
  } else if (role === 'STAFF_EXECUTIVE' || role === 'STAFF_JUNIOR') {
    resolvedSecretKey = resolvedSecretKey || process.env.STAFF_SECRET_KEY || 'TSE-STF-8426';
    resolvedPasskey = resolvedPasskey || process.env.STAFF_PASSKEY || 'StaffThread6248';
  } else if (role === 'ACADEMIC_ADMIN' || role === 'CONTENT_MANAGER') {
    resolvedSecretKey = resolvedSecretKey || process.env.ADMIN_SECRET_KEY || 'TSE-ADMIN-8080';
    resolvedPasskey = resolvedPasskey || process.env.ADMIN_PASSKEY || 'ThreadSec@789';
  } else if (role === 'MENTOR') {
    resolvedSecretKey = resolvedSecretKey || process.env.MENTOR_SECRET_KEY || 'TSE-MENTOR-78987';
    resolvedPasskey = resolvedPasskey || process.env.MENTOR_PASSKEY || 'MentorThreadSec@525';
  } else {
    // STUDENT or GUEST
    resolvedPasskey = resolvedPasskey || `TSE-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
  }

  // 5. Atomic Creation
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash: resolvedPasskey,
        role,
        isActive: true,
        isDashboardAccessGranted: true,
        dashboardAccessGrantedAt: new Date(),
        approvedBy: JSON.stringify({
          actorId: actorId || 'Admin',
          secretKey: resolvedSecretKey,
          passkey: resolvedPasskey,
        }),
      },
    });

    await tx.tSIdentity.create({
      data: {
        tsId: appointedTsId,
        userId: user.id,
      },
    });

    if (role === 'STUDENT') {
      await tx.studentProfile.create({
        data: {
          userId: user.id,
          phone: phone?.trim() || null,
          batchId: batchId || null,
          careerGoal: department || (track === 'AI' ? 'Artificial Intelligence Track' : 'Cybersecurity Track'),
        },
      });
    } else if (role === 'MENTOR') {
      const mentorProfile = await tx.mentorProfile.create({
        data: {
          userId: user.id,
          title: department || 'Faculty Mentor',
          company: 'Thread Security',
          expertise: department || 'Cybersecurity & Systems',
          bio: 'Faculty mentor & research guide at Thread Security Education.',
        },
      });
      if (batchId) {
        await tx.batch.update({
          where: { id: batchId },
          data: { mentorId: mentorProfile.id },
        });
      }
      // Create EmployeeProfile for Mentor
      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          employeeId: appointedTsId,
          department: department || 'Academics & Faculty',
          designation: 'Faculty Mentor',
          joiningDate: new Date(),
          status: 'ACTIVE',
          attendanceEligible: true,
        },
      });
    } else if (role !== 'GUEST') {
      // Staff, Security Admin, Academic Admin, Super Admin
      let dept = department || 'Academic Operations';
      let desig = 'Staff Associate';
      if (role === 'SUPER_ADMIN') {
        dept = department || 'Executive Management';
        desig = 'Super Administrator';
      } else if (role === 'SECURITY_ADMIN') {
        dept = department || 'Cyber Operations & SOC';
        desig = 'Security Operations Analyst';
      } else if (role === 'STAFF_EXECUTIVE') {
        dept = department || 'Academic Operations';
        desig = 'Executive Staff Associate';
      } else if (role === 'STAFF_JUNIOR') {
        dept = department || 'Lab & Technical Support';
        desig = 'Junior Technical Associate';
      } else if (role === 'CONTENT_MANAGER') {
        dept = department || 'Content & Curriculum';
        desig = 'Content Manager';
      }

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          employeeId: appointedTsId,
          department: dept,
          designation: desig,
          joiningDate: new Date(),
          status: 'ACTIVE',
          attendanceEligible: true,
        },
      });
    }

    return user;
  });

  // 6. Automatic Credentials Email Dispatch (Guarded against throwing)
  let emailDispatched = false;
  if (dispatchEmail !== false) {
    try {
      if (role === 'STUDENT') {
        let batchCode: string | undefined;
        let courseTitle: string | undefined;
        if (batchId) {
          const b = await prisma.batch.findUnique({
            where: { id: batchId },
            include: { course: true },
          });
          batchCode = b?.batchCode;
          courseTitle = b?.course?.title;
        }
        const res = await sendStudentOnboardingEmail({
          toEmail: cleanEmail,
          studentName: cleanName,
          tsId: appointedTsId,
          tempPassword: resolvedPasskey,
          batchCode,
          courseTitle,
        });
        emailDispatched = res?.success ?? true;
      } else if (role === 'MENTOR') {
        const res = await sendFacultyOnboardingEmail({
          toEmail: cleanEmail,
          facultyName: cleanName,
          mentorId: appointedTsId,
          tempPassword: resolvedPasskey,
        });
        emailDispatched = res?.success ?? true;
      } else {
        const res = await sendStaffOrAdminOnboardingEmail({
          toEmail: cleanEmail,
          name: cleanName,
          role: role as any,
          tsId: appointedTsId,
          secretKey: resolvedSecretKey,
          passkey: resolvedPasskey,
          department,
        });
        emailDispatched = res?.success ?? true;
      }
    } catch (mailErr: any) {
      console.warn('[CreateUser Email Dispatch Error - Handled]:', mailErr?.message);
    }
  }

  await logAuditEvent({
    actorId,
    action: 'USER_CREATED',
    entity: 'USER',
    entityId: newUser.id,
    details: `Created new user ${cleanName} (${cleanEmail}, Role: ${role}, TS-ID: ${appointedTsId}).`,
  });

  return {
    success: true,
    user: newUser,
    tsId: appointedTsId,
    passkey: resolvedPasskey,
    secretKey: resolvedSecretKey,
  };
}

export type UserClassification = 'STAFF_OPERATIONAL' | 'NON_STAFF' | 'TESTING';

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: RoleType;
  isActive?: boolean;
  isDashboardAccessGranted?: boolean;
  joiningDate?: string | Date;
  department?: string;
  designation?: string;
  attendanceEligible?: boolean;
  classification?: UserClassification;
  newPasskey?: string;
  newSecretKey?: string;
  dispatchUpdatedCredentials?: boolean;
  actorId?: string;
}

export async function toggleUserActiveService(userId: string, isActive: boolean, actorId?: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!existing) throw new Error('User not found.');

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isDashboardAccessGranted: true,
      createdAt: true,
    },
  });

  // Keep employee profile synced for attendance
  try {
    const existingEmp = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (existingEmp) {
      await prisma.employeeProfile.update({
        where: { userId },
        data: {
          status: isActive ? 'ACTIVE' : 'INACTIVE',
          attendanceEligible: isActive,
        },
      });
    } else if (existing.role !== 'STUDENT') {
      await prisma.employeeProfile.create({
        data: {
          userId,
          employeeId: `TSE-EMP-${userId.slice(-4).toUpperCase()}`,
          department: 'Academics & Faculty',
          designation: 'Faculty Member',
          joiningDate: new Date(),
          status: isActive ? 'ACTIVE' : 'INACTIVE',
          attendanceEligible: isActive,
        },
      });
    }

    // If account was deactivated, immediately evict from rosters and remove unfinalized attendance
    if (!isActive) {
      await prisma.dailyAttendanceRoster.deleteMany({
        where: { employeeId: userId },
      });
      await prisma.employeeAttendance.deleteMany({
        where: {
          employeeId: userId,
          isFinalized: false,
        },
      });
    }
  } catch (err) {
    console.warn('[AdminService] EmployeeProfile sync error:', err);
  }

  await logAuditEvent({
    actorId,
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    entity: 'USER',
    entityId: userId,
    details: `${isActive ? 'Activated' : 'Deactivated'} user account for ${existing.name} (${existing.email}, Role: ${existing.role}). Attendance eligibility set to ${isActive}.`,
  });

  return updatedUser;
}

export async function updateUserClassificationService(
  userId: string,
  classification: UserClassification,
  actorId?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employeeProfile: true, tsIdentity: true },
  });

  if (!user) {
    throw new Error('User account not found.');
  }

  const status =
    classification === 'TESTING'
      ? 'TESTING'
      : classification === 'NON_STAFF'
      ? 'NON_STAFF'
      : 'ACTIVE';

  const attendanceEligible = classification === 'STAFF_OPERATIONAL' || classification === 'TESTING';

  let empProfile = await prisma.employeeProfile.findUnique({ where: { userId } });
  if (empProfile) {
    empProfile = await prisma.employeeProfile.update({
      where: { userId },
      data: {
        status,
        attendanceEligible,
      },
    });
  } else {
    empProfile = await prisma.employeeProfile.create({
      data: {
        userId,
        employeeId: user.tsIdentity?.tsId || `TSE-EMP-${userId.slice(-4).toUpperCase()}`,
        department: classification === 'NON_STAFF' ? 'External / Learner' : 'Academics & Operations',
        designation: classification === 'NON_STAFF' ? 'Non-Staff Learner' : 'Staff Associate',
        joiningDate: user.createdAt,
        status,
        attendanceEligible,
      },
    });
  }

  if (classification === 'NON_STAFF') {
    try {
      await prisma.dailyAttendanceRoster.deleteMany({
        where: { employeeId: userId },
      });
      await prisma.employeeAttendance.deleteMany({
        where: {
          employeeId: userId,
          isFinalized: false,
        },
      });
    } catch (err) {
      console.warn('[AdminService] Evict non-staff attendance error:', err);
    }
  }

  await logAuditEvent({
    actorId,
    action: 'USER_CLASSIFICATION_UPDATED',
    entity: 'USER',
    entityId: userId,
    details: `Updated operational classification for ${user.name} (${user.email}) to ${classification} (status: ${status}, attendanceEligible: ${attendanceEligible}).`,
  });

  return { user, employeeProfile: empProfile, classification };
}

export async function updateUserService(userId: string, data: UpdateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tsIdentity: true,
      studentProfile: true,
      mentorProfile: true,
    },
  });

  if (!existing) {
    throw new Error('User not found.');
  }

  const updatePayload: any = {};
  if (data.name) updatePayload.name = data.name.trim();
  if (data.email) {
    const cleanEmail = data.email.toLowerCase().trim();
    if (cleanEmail !== existing.email) {
      const emailConflict = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (emailConflict) throw new Error(`Email ${cleanEmail} is already taken by another account.`);
      updatePayload.email = cleanEmail;
    }
  }
  if (data.role) updatePayload.role = data.role;
  if (typeof data.isActive === 'boolean') updatePayload.isActive = data.isActive;
  if (typeof data.isDashboardAccessGranted === 'boolean') {
    updatePayload.isDashboardAccessGranted = data.isDashboardAccessGranted;
    if (data.isDashboardAccessGranted && !existing.isDashboardAccessGranted) {
      updatePayload.dashboardAccessGrantedAt = new Date();
    }
  }
  if (data.newPasskey?.trim()) {
    updatePayload.passwordHash = data.newPasskey.trim();
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updatePayload,
    include: {
      tsIdentity: true,
      studentProfile: true,
      mentorProfile: true,
    },
  });

  // Phone update on student profile if exists
  if (data.phone !== undefined && existing.studentProfile) {
    await prisma.studentProfile.update({
      where: { userId },
      data: { phone: data.phone.trim() || null },
    });
  }

  // Ensure role profiles if role was updated
  if (data.role === 'STUDENT' && !existing.studentProfile) {
    await prisma.studentProfile.create({
      data: {
        userId,
        careerGoal: 'Cybersecurity Specialist',
      },
    });
  } else if (data.role === 'MENTOR' && !existing.mentorProfile) {
    await prisma.mentorProfile.create({
      data: {
        userId,
        title: 'Faculty Mentor',
        company: 'Thread Security',
        expertise: 'Cybersecurity & Systems',
        bio: 'Faculty mentor profile.',
      },
    });
  }

  // Sync EmployeeProfile if tenure/department/status/classification was modified
  if (
    data.joiningDate ||
    data.department ||
    data.designation ||
    data.classification ||
    typeof data.isActive === 'boolean' ||
    typeof data.attendanceEligible === 'boolean'
  ) {
    try {
      const existingEmp = await prisma.employeeProfile.findUnique({ where: { userId } });
      let activeStatus = data.isActive === false ? 'INACTIVE' : (existingEmp?.status || 'ACTIVE');
      if (data.classification === 'TESTING') activeStatus = 'TESTING';
      else if (data.classification === 'NON_STAFF') activeStatus = 'NON_STAFF';
      else if (data.classification === 'STAFF_OPERATIONAL') activeStatus = 'ACTIVE';

      const attendanceEligible =
        data.classification === 'NON_STAFF'
          ? false
          : typeof data.attendanceEligible === 'boolean'
          ? data.attendanceEligible
          : typeof data.isActive === 'boolean'
          ? data.isActive
          : (existingEmp?.attendanceEligible ?? true);

      if (existingEmp) {
        await prisma.employeeProfile.update({
          where: { userId },
          data: {
            ...(data.joiningDate ? { joiningDate: new Date(data.joiningDate) } : {}),
            ...(data.department ? { department: data.department.trim() } : {}),
            ...(data.designation ? { designation: data.designation.trim() } : {}),
            status: activeStatus,
            attendanceEligible,
          },
        });
      } else if (existing.role !== 'STUDENT' || (data.role && data.role !== 'STUDENT')) {
        await prisma.employeeProfile.create({
          data: {
            userId,
            employeeId: `TSE-EMP-${userId.slice(-4).toUpperCase()}`,
            department: data.department?.trim() || 'Academics & Faculty',
            designation: data.designation?.trim() || 'Faculty Member',
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : existing.createdAt,
            status: activeStatus,
            attendanceEligible,
          },
        });
      }
    } catch (empErr) {
      console.warn('[AdminService] EmployeeProfile update warning:', empErr);
    }
  }

  if (data.dispatchUpdatedCredentials) {
    await dispatchUserCredentialsService(userId, data.newPasskey, data.newSecretKey);
  }

  await logAuditEvent({
    actorId: data.actorId,
    action: 'USER_UPDATED',
    entity: 'USER',
    entityId: userId,
    details: `Updated user profile for ${updatedUser.name} (${updatedUser.email}, Role: ${updatedUser.role}).`,
  });

  return updatedUser;
}

export async function deleteUserService(userId: string, currentAdminUserId?: string) {
  if (currentAdminUserId && userId === currentAdminUserId) {
    throw new Error('Security Restriction: You cannot delete your own active administrator account.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tsIdentity: true,
      mentorProfile: true,
      studentProfile: true,
      employeeProfile: true,
    },
  });

  if (!user) {
    throw new Error('User account not found.');
  }

  const protectedEmails = [
    'threadsecuritydeveloper@gmail.com',
    'threadsecurity@gmail.com',
  ];
  if (protectedEmails.includes(user.email.toLowerCase())) {
    throw new Error('Security Restriction: Primary Super Administrator account is protected and cannot be deleted.');
  }

  const userName = user.name;
  const userEmail = user.email;
  const tsId = user.tsIdentity?.tsId || 'N/A';

  // Perform cascading clean-up across all LMS, Mentorship, Attendance, and Staff dependencies
  await prisma.$transaction(async (tx: any) => {
    // 1. Mentor profile dependent unlinking
    if (user.mentorProfile) {
      const mentorProfileId = user.mentorProfile.id;

      // Unassign students from this mentor
      await tx.studentProfile.updateMany({
        where: { assignedMentorId: mentorProfileId },
        data: { assignedMentorId: null },
      });

      // Unlink courses
      await tx.course.updateMany({
        where: { mentorId: mentorProfileId },
        data: { mentorId: null },
      });

      // Unlink batches
      await tx.batch.updateMany({
        where: { mentorId: mentorProfileId },
        data: { mentorId: null },
      });

      // Reassign blogs authored by this mentor to an alternate mentor so publications remain intact
      const otherMentor = await tx.mentorProfile.findFirst({
        where: { id: { not: mentorProfileId } },
        select: { id: true },
      });
      if (otherMentor) {
        await tx.blog.updateMany({
          where: { authorId: mentorProfileId },
          data: { authorId: otherMentor.id },
        });
      }

      // Delete mentor assignments & correction requests
      await tx.assignment.deleteMany({ where: { mentorId: mentorProfileId } });
      await tx.batchAttendanceCorrectionRequest.deleteMany({ where: { mentorId: mentorProfileId } });
      await tx.mentorProfile.delete({ where: { id: mentorProfileId } });
    }

    // 2. Student profile clean-up
    if (user.studentProfile) {
      const studentProfileId = user.studentProfile.id;
      await tx.attendanceRecord.deleteMany({ where: { studentId: studentProfileId } });
      await tx.batchAttendanceCorrectionRequest.deleteMany({ where: { studentId: studentProfileId } });
      await tx.broadcastDelivery.deleteMany({ where: { studentId: studentProfileId } });
      await tx.studentSkill.deleteMany({ where: { studentId: studentProfileId } });
      await tx.studentProfile.delete({ where: { id: studentProfileId } });
    }

    // 3. Employee & Attendance records
    await tx.employeeAttendanceAuditLog.deleteMany({
      where: {
        OR: [
          { modifiedById: userId },
          { attendance: { employeeId: userId } },
        ],
      },
    });

    await tx.dailyAttendanceRoster.deleteMany({
      where: {
        OR: [
          { employeeId: userId },
          { publishedById: userId },
        ],
      },
    });

    await tx.employeeAttendance.deleteMany({
      where: {
        OR: [
          { employeeId: userId },
          { markedById: userId },
        ],
      },
    });

    if (user.employeeProfile) {
      await tx.employeeProfile.deleteMany({ where: { userId } });
    }

    // 4. Blog revisions created by this user
    try {
      await tx.blogRevision.deleteMany({ where: { changedById: userId } });
    } catch {}

    // 5. Delegation Team & Memberships
    try {
      await tx.delegationEdge.deleteMany({
        where: {
          OR: [{ sourceUserId: userId }, { targetUserId: userId }],
        },
      });
      await tx.delegationMember.deleteMany({ where: { userId } });
      await tx.delegationTeam.deleteMany({ where: { leadId: userId } });
    } catch {}

    // 6. Admin Tasks, Docket Items, Messages, and Conversations
    try {
      await tx.adminTask.deleteMany({
        where: { OR: [{ assigneeId: userId }, { createdById: userId }] },
      });
      await tx.todaysDocketItem.deleteMany({
        where: { OR: [{ assignerId: userId }, { assigneeId: userId }] },
      });
      await tx.adminMessage.deleteMany({ where: { senderId: userId } });
      await tx.adminConversation.deleteMany({
        where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
      });
    } catch {}

    // 7. Student Invoices, Notifications, Certificates, Attempts & Submissions
    try {
      await tx.studentInvoice.deleteMany({ where: { createdById: userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.certificate.deleteMany({ where: { userId } });
      await tx.progress.deleteMany({ where: { userId } });
      await tx.labAttempt.deleteMany({ where: { userId } });
      await tx.assessmentAttempt.deleteMany({ where: { userId } });
      await tx.testAttempt.deleteMany({ where: { userId } });
      await tx.assignmentSubmission.deleteMany({ where: { studentId: userId } });
      await tx.enrollment.deleteMany({ where: { userId } });
      await tx.tSIdentity.deleteMany({ where: { userId } });
      await tx.mentorIdentity.deleteMany({ where: { userId } });
    } catch {}

    // 8. Finally delete User record cleanly
    await tx.user.delete({
      where: { id: userId },
    });
  });

  await logAuditEvent({
    actorId: currentAdminUserId,
    action: 'USER_DELETED',
    entity: 'USER',
    entityId: userId,
    details: `Deleted user account for ${userName} (${userEmail}, TS-ID: ${tsId}).`,
  });

  return { success: true, deletedName: userName, deletedEmail: userEmail };
}

/**
 * Move user account to Trash (Soft delete lifecycle)
 * Maintains separate database state without permanently destroying FK histories.
 */
export async function trashUserService(userId: string, actorId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employeeProfile: true, tsIdentity: true },
  });

  if (!user) {
    throw new Error('User account not found.');
  }

  const protectedEmails = [
    'threadsecuritydeveloper@gmail.com',
    'threadsecurity@gmail.com',
  ];
  if (protectedEmails.includes(user.email.toLowerCase())) {
    throw new Error('Security Restriction: Primary Super Administrator account is protected and cannot be trashed.');
  }

  const trashedTimestamp = new Date().toISOString();
  const trashedTag = `TRASHED:${trashedTimestamp}`;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isDashboardAccessGranted: false,
        approvedBy: trashedTag,
      },
    });

    if (user.employeeProfile) {
      await tx.employeeProfile.update({
        where: { userId },
        data: {
          status: 'TRASH',
          attendanceEligible: false,
        },
      });
    }

    // Immediately evict trashed user from all daily attendance rosters
    await tx.dailyAttendanceRoster.deleteMany({
      where: { employeeId: userId },
    });

    // Remove unfinalized attendance records for this user
    await tx.employeeAttendance.deleteMany({
      where: {
        employeeId: userId,
        isFinalized: false,
      },
    });
  });

  await logAuditEvent({
    actorId,
    action: 'USER_MOVED_TO_TRASH',
    entity: 'USER',
    entityId: userId,
    details: `Moved user account for ${user.name} (${user.email}, ${user.tsIdentity?.tsId || 'N/A'}) to Trash Bin.`,
  });

  return { success: true, userId, trashedAt: trashedTimestamp, name: user.name, email: user.email };
}

/**
 * Restore user account from Trash back to active standing
 */
export async function restoreUserService(userId: string, actorId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employeeProfile: true, tsIdentity: true },
  });

  if (!user) {
    throw new Error('User account not found.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        isDashboardAccessGranted: true,
        approvedBy: actorId ? `RESTORED_BY:${actorId}` : null,
      },
    });

    if (user.employeeProfile) {
      const restoredStatus = user.role === 'STUDENT' ? 'NON_STAFF' : 'ACTIVE';
      await tx.employeeProfile.update({
        where: { userId },
        data: {
          status: restoredStatus,
          attendanceEligible: user.role !== 'STUDENT',
        },
      });
    }
  });

  await logAuditEvent({
    actorId,
    action: 'USER_RESTORED_FROM_TRASH',
    entity: 'USER',
    entityId: userId,
    details: `Restored user account for ${user.name} (${user.email}) from Trash back to Active standing.`,
  });

  return { success: true, userId, name: user.name, email: user.email };
}

export async function dispatchUserCredentialsService(
  userId: string,
  customPasskey?: string,
  customSecretKey?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
        },
      },
      mentorProfile: {
        include: {
          batches: true,
          courses: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User account not found.');
  }

  const tsId = user.tsIdentity?.tsId || 'TS-USER';
  let resolvedPasskey = customPasskey?.trim();

  if (user.role === 'STUDENT') {
    return dispatchStudentCredentialsService(userId, resolvedPasskey);
  }

  if (user.role === 'MENTOR' && user.mentorProfile) {
    return dispatchMentorCredentialsService(user.mentorProfile.id, resolvedPasskey);
  }

  // Staff / Security Admin / Super Admin
  let resolvedSecretKey = customSecretKey?.trim();
  if (user.role === 'SECURITY_ADMIN') {
    resolvedSecretKey = resolvedSecretKey || process.env.SECURITY_ADMIN_SECRET_KEY || 'TSE-SEC-ADMIN-789';
    resolvedPasskey = resolvedPasskey || process.env.SECURITY_ADMIN_PASSKEY || 'ThreadSec@789789789';
  } else if (user.role === 'SUPER_ADMIN') {
    resolvedSecretKey = resolvedSecretKey || process.env.ADMIN_SECRET_KEY || 'TSE-ADMIN-8080';
    resolvedPasskey = resolvedPasskey || process.env.ADMIN_PASSKEY || 'ThreadSec@789';
  } else if (user.role === 'STAFF_EXECUTIVE' || user.role === 'STAFF_JUNIOR') {
    resolvedSecretKey = resolvedSecretKey || process.env.STAFF_SECRET_KEY || 'TSE-STF-8426';
    resolvedPasskey = resolvedPasskey || process.env.STAFF_PASSKEY || 'StaffThread6248';
  } else {
    // ACADEMIC_ADMIN or CONTENT_MANAGER
    resolvedSecretKey = resolvedSecretKey || process.env.ADMIN_SECRET_KEY || 'TSE-ADMIN-8080';
    resolvedPasskey = resolvedPasskey || process.env.ADMIN_PASSKEY || 'ThreadSec@789';
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: resolvedPasskey,
      approvedBy: JSON.stringify({
        actorId: 'Admin',
        secretKey: resolvedSecretKey,
        passkey: resolvedPasskey,
      }),
      isDashboardAccessGranted: true,
      isActive: true,
    },
  });

  let emailDispatched = false;
  let emailRes: any = null;
  try {
    emailRes = await sendStaffOrAdminOnboardingEmail({
      toEmail: user.email,
      name: user.name,
      role: user.role as any,
      tsId,
      secretKey: resolvedSecretKey,
      passkey: resolvedPasskey,
    });
    emailDispatched = emailRes?.success ?? true;
  } catch (err: any) {
    console.warn('[dispatchUserCredentialsService Email Error - Handled]:', err?.message);
  }

  await logAuditEvent({
    action: 'ADMIN_CREDENTIALS_DISPATCHED',
    entity: 'USER',
    entityId: user.id,
    details: `Dispatched ${user.role} clearance credentials and keys to ${user.name} (${user.email}, TS-ID: ${tsId}). Email dispatched: ${emailDispatched}`,
  });

  return { success: true, email: user.email, tsId, role: user.role, emailDispatched, emailResult: emailRes };
}


