import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';

const db = prisma as any;

export interface CreateBatchInput {
  batchCode: string;
  title: string;
  description?: string;
  courseId?: string;
  mentorId?: string;
  startDate: Date;
  endDate?: Date;
  schedule?: string;
  maxCapacity?: number;
}

export interface MarkAttendanceInput {
  sessionId: string;
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }[];
  markedBy: string;
}

let batchesSeeded = false;

/**
 * Ensures initial default cohorts exist in PostgreSQL database
 */
export async function seedBatchesIfEmpty() {
  if (batchesSeeded) return;

  try {
    const count = await db.batch.count();
    if (count > 0) {
      batchesSeeded = true;
      return;
    }

    const [course, mentor, studentProfiles] = await Promise.all([
      prisma.course.findFirst(),
      prisma.mentorProfile.findFirst(),
      prisma.studentProfile.findMany({
        include: { user: { include: { tsIdentity: true } } },
        take: 15,
      }),
    ]);

    const batch1 = await db.batch.create({
      data: {
        batchCode: 'TSE-COHORT-2026-ALPHA',
        title: 'Cyber Threat Intelligence & Active SOC Defense (Cohort Alpha)',
        description: 'Hands-on live cyber range training, defensive packet forensics, and enterprise SIEM incident response.',
        courseId: course?.id || null,
        mentorId: mentor?.id || null,
        startDate: new Date('2026-01-15'),
        schedule: 'Mon / Wed / Fri • 7:00 PM - 9:00 PM IST',
        maxCapacity: 30,
        status: 'ACTIVE',
      },
    });

    const batch2 = await db.batch.create({
      data: {
        batchCode: 'TSE-COHORT-2026-BETA',
        title: 'Foundational & Agentic AI Systems Fellowship (Cohort Beta)',
        description: 'Zero-to-senior curriculum covering Python, PyTorch, RAG, LangGraph multi-agent networks & FastAPI deployment.',
        courseId: course?.id || null,
        mentorId: mentor?.id || null,
        startDate: new Date('2026-02-01'),
        schedule: 'Tue / Thu / Sat • 6:30 PM - 8:30 PM IST',
        maxCapacity: 30,
        status: 'ACTIVE',
      },
    });

    // Assign students to seeded batches
    for (let i = 0; i < studentProfiles.length; i++) {
      const targetBatchId = i % 2 === 0 ? batch1.id : batch2.id;
      await db.studentProfile.update({
        where: { id: studentProfiles[i].id },
        data: { batchId: targetBatchId },
      });
    }

    // Create sample conducted sessions
    const s1 = await db.batchSession.create({
      data: {
        batchId: batch1.id,
        sessionNumber: 1,
        title: 'Module 1: Threat Hunting Fundamentals & PCAP Analysis',
        sessionDate: new Date('2026-02-01T19:00:00Z'),
        durationMins: 120,
        agenda: 'Introductory deep-dive into packet captures, Wireshark filters, and malware beacons.',
      },
    });

    const s2 = await db.batchSession.create({
      data: {
        batchId: batch1.id,
        sessionNumber: 2,
        title: 'Module 2: SOC SIEM Alert Triaging & Log Ingestion',
        sessionDate: new Date('2026-02-10T19:00:00Z'),
        durationMins: 120,
        agenda: 'Hands-on rule crafting in Elastic & Splunk, identifying brute-force and privilege escalation.',
      },
    });

    // Mark attendance records for initial students
    for (const sp of studentProfiles.filter((s: any) => s.batchId === batch1.id)) {
      await db.attendanceRecord.createMany({
        data: [
          {
            sessionId: s1.id,
            studentId: sp.id,
            status: 'PRESENT',
            remarks: 'Successfully extracted suspicious payload hash from sample PCAP.',
            markedBy: 'Faculty Lead Mentor',
            checkInTime: new Date('2026-02-01T19:05:00Z'),
          },
          {
            sessionId: s2.id,
            studentId: sp.id,
            status: 'PRESENT',
            remarks: 'Configured SIEM alert filter for unauthorized SSH brute force in lab.',
            markedBy: 'Faculty Lead Mentor',
            checkInTime: new Date('2026-02-10T19:02:00Z'),
          },
        ],
        skipDuplicates: true,
      });
    }

    batchesSeeded = true;
  } catch (error) {
    console.warn('[seedBatchesIfEmpty] Non-fatal batch seed check warning:', error);
  }
}

/**
 * Retrieves all batches with course, mentor, and student counts
 */
export async function getAllBatchesService() {
  await seedBatchesIfEmpty();

  const batches = await db.batch.findMany({
    include: {
      course: true,
      mentor: {
        include: { user: true },
      },
      students: {
        include: {
          user: {
            include: { tsIdentity: true },
          },
        },
      },
      sessions: {
        include: {
          attendanceRecords: true,
        },
        orderBy: { sessionNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return batches;
}

/**
 * Super Admin creates a new batch
 */
export async function createBatchService(data: CreateBatchInput, adminUserId: string) {
  const cleanCode = data.batchCode.trim().toUpperCase();

  const existing = await db.batch.findUnique({
    where: { batchCode: cleanCode },
  });

  if (existing) {
    throw new Error(`Batch with code '${cleanCode}' already exists.`);
  }

  const batch = await db.batch.create({
    data: {
      batchCode: cleanCode,
      title: data.title.trim(),
      description: data.description?.trim(),
      courseId: data.courseId || null,
      mentorId: data.mentorId || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      schedule: data.schedule || 'Mon / Wed / Fri • 7:00 PM - 9:00 PM IST',
      maxCapacity: data.maxCapacity || 30,
    },
    include: {
      course: true,
      mentor: { include: { user: true } },
    },
  });

  await logAuditEvent({
    actorId: adminUserId,
    action: 'BATCH_CREATED_BY_SUPER_ADMIN',
    entity: 'BATCH',
    entityId: batch.id,
    details: JSON.stringify({ batchCode: batch.batchCode, title: batch.title }),
  });

  return batch;
}

/**
 * Assigns or reassigns a student to a batch
 */
export async function assignStudentToBatchService(
  studentProfileId: string,
  batchId: string | null,
  adminUserId: string
) {
  const profile = await db.studentProfile.update({
    where: { id: studentProfileId },
    data: { batchId },
    include: {
      user: { include: { tsIdentity: true } },
      batch: true,
    },
  });

  await logAuditEvent({
    actorId: adminUserId,
    action: 'STUDENT_BATCH_ASSIGNMENT_UPDATED',
    entity: 'STUDENT_PROFILE',
    entityId: studentProfileId,
    details: JSON.stringify({
      student: profile.user.name,
      tsId: profile.user.tsIdentity?.tsId,
      batchId,
      batchCode: profile.batch?.batchCode || 'UNASSIGNED',
    }),
  });

  return profile;
}

/**
 * Retrieves batches assigned to a specific mentor
 */
export async function getMentorBatchesService(mentorUserId: string) {
  await seedBatchesIfEmpty();

  const mentorProfile = await db.mentorProfile.findUnique({
    where: { userId: mentorUserId },
  });

  if (!mentorProfile) {
    // If no specific mentor profile, return all active batches so mentor can view & conduct
    const allBatches = await db.batch.findMany({
      include: {
        course: true,
        students: {
          include: {
            user: { include: { tsIdentity: true } },
            attendanceRecords: {
              include: { session: true },
            },
          },
        },
        sessions: {
          include: {
            attendanceRecords: {
              include: {
                student: {
                  include: { user: { include: { tsIdentity: true } } },
                },
              },
            },
          },
          orderBy: { sessionNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return allBatches;
  }

  const batches = await db.batch.findMany({
    where: { mentorId: mentorProfile.id },
    include: {
      course: true,
      students: {
        include: {
          user: { include: { tsIdentity: true } },
          attendanceRecords: {
            include: { session: true },
          },
        },
      },
      sessions: {
        include: {
          attendanceRecords: {
            include: {
              student: {
                include: { user: { include: { tsIdentity: true } } },
              },
            },
          },
        },
        orderBy: { sessionNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return batches;
}

/**
 * Creates a new session for a batch
 */
export async function createBatchSessionService(
  batchId: string,
  title: string,
  sessionDate: Date,
  durationMins: number = 120,
  agenda?: string,
  actorUserId?: string
) {
  const lastSession = await db.batchSession.findFirst({
    where: { batchId },
    orderBy: { sessionNumber: 'desc' },
  });

  const nextNumber = (lastSession?.sessionNumber || 0) + 1;

  const session = await db.batchSession.create({
    data: {
      batchId,
      sessionNumber: nextNumber,
      title: title.trim(),
      sessionDate,
      durationMins,
      agenda: agenda?.trim(),
    },
    include: {
      batch: true,
    },
  });

  if (actorUserId) {
    await logAuditEvent({
      actorId: actorUserId,
      action: 'BATCH_SESSION_CONDUCTED',
      entity: 'BATCH_SESSION',
      entityId: session.id,
      details: JSON.stringify({
        batchCode: session.batch.batchCode,
        sessionNumber: session.sessionNumber,
        title: session.title,
      }),
    });
  }

  return session;
}

/**
 * Mentor explicitly marks and updates attendance for all students in a session
 */
export async function markBatchAttendanceService(input: MarkAttendanceInput, actorUserId: string) {
  const session = await db.batchSession.findUnique({
    where: { id: input.sessionId },
    include: { batch: true },
  });

  if (!session) {
    throw new Error('Batch session not found.');
  }

  const results = [];

  for (const record of input.records) {
    const attendance = await db.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: input.sessionId,
          studentId: record.studentId,
        },
      },
      update: {
        status: record.status,
        remarks: record.remarks?.trim() || null,
        markedBy: input.markedBy,
        checkInTime: record.status === 'PRESENT' || record.status === 'LATE' ? new Date() : null,
      },
      create: {
        sessionId: input.sessionId,
        studentId: record.studentId,
        status: record.status,
        remarks: record.remarks?.trim() || null,
        markedBy: input.markedBy,
        checkInTime: record.status === 'PRESENT' || record.status === 'LATE' ? new Date() : null,
      },
    });

    results.push(attendance);
  }

  await logAuditEvent({
    actorId: actorUserId,
    action: 'BATCH_ATTENDANCE_EXPLICITLY_MARKED',
    entity: 'BATCH_SESSION',
    entityId: input.sessionId,
    details: JSON.stringify({
      batchCode: session.batch.batchCode,
      sessionNumber: session.sessionNumber,
      updatedCount: results.length,
      markedBy: input.markedBy,
    }),
  });

  return results;
}

/**
 * Retrieves student's assigned batch details, mentor info, and full attendance history
 */
export async function getStudentBatchAndAttendanceService(studentUserId: string) {
  await seedBatchesIfEmpty();

  const profile = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    include: {
      user: { include: { tsIdentity: true } },
      batch: {
        include: {
          course: true,
          mentor: { include: { user: true } },
          sessions: {
            orderBy: { sessionNumber: 'asc' },
            include: {
              attendanceRecords: true,
            },
          },
          broadcasts: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          resources: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      attendanceRecords: {
        include: {
          session: {
            include: { batch: true },
          },
        },
        orderBy: { session: { sessionDate: 'desc' } },
      },
    },
  });

  if (!profile || !profile.batch) {
    return {
      profile,
      batch: null,
      attendancePercentage: 0,
      totalSessions: 0,
      presentSessions: 0,
      records: [],
    };
  }

  const totalSessions = profile.batch.sessions?.length || 0;
  const presentSessions = (profile.attendanceRecords || []).filter(
    (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length;

  const attendancePercentage =
    totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  return {
    profile,
    batch: profile.batch,
    attendancePercentage,
    totalSessions,
    presentSessions,
    records: profile.attendanceRecords || [],
  };
}

/**
 * Retrieves all delivered lectures across batches for date-based & lecture-based admin auditing
 */
export async function getAllDeliveredSessionsService() {
  await seedBatchesIfEmpty();

  const sessions = await db.batchSession.findMany({
    include: {
      batch: {
        include: {
          mentor: { include: { user: true } },
          students: { include: { user: { include: { tsIdentity: true } } } },
        },
      },
      attendanceRecords: {
        include: {
          student: {
            include: { user: { include: { tsIdentity: true } } },
          },
        },
      },
    },
    orderBy: { sessionDate: 'desc' },
  });

  return sessions.map((sess: any) => {
    const totalEnrolled = sess.batch?.students?.length || 0;
    const records = sess.attendanceRecords || [];
    const presentCount = records.filter((r: any) => r.status === 'PRESENT').length;
    const lateCount = records.filter((r: any) => r.status === 'LATE').length;
    const absentCount = records.filter((r: any) => r.status === 'ABSENT').length;
    const excusedCount = records.filter((r: any) => r.status === 'EXCUSED').length;

    const attendedTotal = presentCount + lateCount;
    const attendancePercentage = totalEnrolled > 0 ? Math.round((attendedTotal / totalEnrolled) * 100) : 100;

    return {
      id: sess.id,
      sessionNumber: sess.sessionNumber,
      title: sess.title,
      sessionDate: sess.sessionDate,
      durationMins: sess.durationMins,
      agenda: sess.agenda || 'Standard Curriculum Module Delivery',
      batchCode: sess.batch?.batchCode || 'N/A',
      batchTitle: sess.batch?.title || 'N/A',
      mentorName: sess.batch?.mentor?.user?.name || 'Unassigned Mentor',
      mentorEmail: sess.batch?.mentor?.user?.email || 'N/A',
      totalEnrolled,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      attendancePercentage,
      records: records.map((r: any) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.student?.user?.name || 'Student',
        studentEmail: r.student?.user?.email || 'N/A',
        tsId: r.student?.user?.tsIdentity?.tsId || 'N/A',
        status: r.status,
        checkInTime: r.checkInTime,
        remarks: r.remarks || '',
        markedBy: r.markedBy || 'Mentor',
      })),
    };
  });
}

/**
 * Validates whether a mentor or admin is authorized to view/operate on a batch
 */
export async function validateMentorBatchAccess(userId: string, batchId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { mentorProfile: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  // Admins always have executive oversight
  if (user.role === 'SUPER_ADMIN' || user.role === 'ACADEMIC_ADMIN') {
    const batch = await db.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new Error('Batch not found.');
    return { authorized: true, user, mentorProfile: user.mentorProfile, batch };
  }

  if (user.role !== 'MENTOR') {
    throw new Error('Unauthorized: User is not a mentor.');
  }

  const mentorProfile = user.mentorProfile;
  if (!mentorProfile) {
    throw new Error('Mentor profile not found for this account.');
  }

  const batch = await db.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error('Batch not found.');
  }

  if (batch.mentorId && batch.mentorId !== mentorProfile.id) {
    throw new Error('Unauthorized: You are not assigned to manage this batch.');
  }

  return { authorized: true, user, mentorProfile, batch };
}

/**
 * Returns isolated Batch Workspace data for the mentor panel
 */
export async function getBatchWorkspaceService(batchId: string, userId: string) {
  await seedBatchesIfEmpty();
  await validateMentorBatchAccess(userId, batchId);

  const batch = await db.batch.findUnique({
    where: { id: batchId },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { orderIndex: 'asc' },
            include: {
              lessons: { orderBy: { orderIndex: 'asc' } },
            },
          },
        },
      },
      mentor: {
        include: { user: true },
      },
      students: {
        include: {
          user: {
            include: {
              tsIdentity: true,
              progress: true,
              enrollments: true,
              labAttempts: true,
              assessments: true,
              certificates: true,
            },
          },
          attendanceRecords: {
            include: { session: true },
          },
        },
      },
      sessions: {
        include: {
          module: true,
          attendanceRecords: {
            include: {
              student: {
                include: { user: { include: { tsIdentity: true } } },
              },
            },
          },
          attendanceAudits: {
            orderBy: { createdAt: 'desc' },
          },
          resources: true,
          correctionRequests: {
            include: {
              student: { include: { user: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { sessionDate: 'asc' },
      },
      resources: {
        include: {
          module: true,
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      broadcasts: {
        include: {
          mentor: { include: { user: true } },
          recipients: {
            include: {
              student: { include: { user: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      correctionRequests: {
        include: {
          session: true,
          student: { include: { user: true } },
          mentor: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!batch) {
    throw new Error('Batch not found.');
  }

  // Calculate batch metrics
  const totalStudents = batch.students.length;
  const totalSessions = batch.sessions.length;
  const completedSessions = batch.sessions.filter((s: any) => s.status === 'COMPLETED').length;

  let totalPossibleAttendances = 0;
  let totalPresentAttendances = 0;

  batch.sessions.forEach((s: any) => {
    s.attendanceRecords.forEach((r: any) => {
      totalPossibleAttendances++;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        totalPresentAttendances++;
      }
    });
  });

  const averageAttendance =
    totalPossibleAttendances > 0
      ? Math.round((totalPresentAttendances / totalPossibleAttendances) * 100)
      : 100;

  // Module delivery calculation
  const totalCourseModules = batch.course?.modules?.length || 1;
  const distinctModulesTaught = new Set(
    batch.sessions
      .filter((s: any) => s.status === 'COMPLETED' && s.moduleId)
      .map((s: any) => s.moduleId)
  ).size;
  const moduleDeliveryPercent = Math.min(
    100,
    Math.round((distinctModulesTaught / totalCourseModules) * 100) || (completedSessions > 0 ? 50 : 0)
  );

  // Student progress calculation
  const studentLearningPercents = batch.students.map((st: any) => {
    const totalLessons = (batch.course?.modules || []).reduce(
      (acc: number, m: any) => acc + (m.lessons?.length || 0),
      0
    );
    const completedLessons = st.user?.progress?.filter((p: any) => p.isCompleted)?.length || 0;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 50;
  });

  const averageStudentLearning =
    studentLearningPercents.length > 0
      ? Math.round(
          studentLearningPercents.reduce((a: number, b: number) => a + b, 0) /
            studentLearningPercents.length
        )
      : 50;

  return {
    batch,
    metrics: {
      totalStudents,
      totalSessions,
      completedSessions,
      remainingSessions: Math.max(0, totalSessions - completedSessions),
      averageAttendance,
      moduleDeliveryPercent,
      averageStudentLearning,
      assessmentCompletionPercent: 65,
    },
  };
}

/**
 * Mentor updates lecture conduction record
 */
export async function updateLectureRecordService(
  sessionId: string,
  data: {
    status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    topicsCovered?: string;
    importantNotes?: string;
    homework?: string;
    resourcesJson?: string;
    moduleId?: string;
    agenda?: string;
    durationMins?: number;
  },
  userId: string
) {
  const session = await db.batchSession.findUnique({
    where: { id: sessionId },
    include: { batch: true },
  });

  if (!session) {
    throw new Error('Lecture session not found.');
  }

  await validateMentorBatchAccess(userId, session.batchId);

  const updated = await db.batchSession.update({
    where: { id: sessionId },
    data: {
      status: data.status || session.status,
      topicsCovered: data.topicsCovered !== undefined ? data.topicsCovered : session.topicsCovered,
      importantNotes: data.importantNotes !== undefined ? data.importantNotes : session.importantNotes,
      homework: data.homework !== undefined ? data.homework : session.homework,
      resourcesJson: data.resourcesJson !== undefined ? data.resourcesJson : session.resourcesJson,
      moduleId: data.moduleId !== undefined ? data.moduleId : session.moduleId,
      agenda: data.agenda !== undefined ? data.agenda : session.agenda,
      durationMins: data.durationMins || session.durationMins,
    },
    include: {
      module: true,
      batch: true,
    },
  });

  await logAuditEvent({
    actorId: userId,
    action: 'LECTURE_RECORD_UPDATED',
    entity: 'BATCH_SESSION',
    entityId: sessionId,
    details: JSON.stringify({
      title: updated.title,
      status: updated.status,
      topicsCovered: updated.topicsCovered,
    }),
  });

  return updated;
}

/**
 * Checks if attendance is locked for a session based on batch.attendanceLockHours (default 24h)
 */
export function isSessionAttendanceLocked(sessionDate: Date, lockHours: number = 24): boolean {
  const sessionTime = new Date(sessionDate).getTime();
  const currentTime = new Date().getTime();
  const elapsedHours = (currentTime - sessionTime) / (1000 * 60 * 60);
  return elapsedHours > lockHours;
}

/**
 * Mark attendance with strict locking check and audit logging
 */
export async function markBatchAttendanceWithLockCheckService(
  input: {
    sessionId: string;
    records: {
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      remarks?: string;
    }[];
    markedBy: string;
    forceAdminBypass?: boolean;
  },
  userId: string
) {
  const session = await db.batchSession.findUnique({
    where: { id: input.sessionId },
    include: {
      batch: true,
      attendanceRecords: true,
    },
  });

  if (!session) {
    throw new Error('Batch session not found.');
  }

  const { user } = await validateMentorBatchAccess(userId, session.batchId);
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ACADEMIC_ADMIN';

  // Check 24/48 hour locking rule
  const locked = isSessionAttendanceLocked(session.sessionDate, session.batch.attendanceLockHours);

  if (locked && !isAdmin && !input.forceAdminBypass) {
    throw new Error(
      `ATTENDANCE_LOCKED: Attendance for this session was locked after ${session.batch.attendanceLockHours} hours. Please submit an Attendance Correction Request to Admin.`
    );
  }

  const existingMap = new Map(
    session.attendanceRecords.map((r: any) => [r.studentId, r.status])
  );

  const updatedRecords = [];
  const auditEntries = [];

  for (const record of input.records) {
    const oldStatus = existingMap.get(record.studentId) || null;
    const isChange = oldStatus !== record.status;

    const saved = await db.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: input.sessionId,
          studentId: record.studentId,
        },
      },
      update: {
        status: record.status,
        remarks: record.remarks?.trim() || null,
        markedBy: input.markedBy,
        checkInTime: record.status === 'PRESENT' || record.status === 'LATE' ? new Date() : null,
      },
      create: {
        sessionId: input.sessionId,
        studentId: record.studentId,
        status: record.status,
        remarks: record.remarks?.trim() || null,
        markedBy: input.markedBy,
        checkInTime: record.status === 'PRESENT' || record.status === 'LATE' ? new Date() : null,
      },
    });

    updatedRecords.push(saved);

    if (isChange || !oldStatus) {
      auditEntries.push({
        mentorId: userId,
        batchId: session.batchId,
        sessionId: input.sessionId,
        studentId: record.studentId,
        date: session.sessionDate,
        oldStatus: oldStatus as any,
        newStatus: record.status,
        action: !oldStatus ? 'INITIAL_MARK' : 'ATTENDANCE_MODIFIED',
        reason: record.remarks || 'Regular classroom attendance update',
        approvedBy: isAdmin ? user.name : null,
      });
    }
  }

  if (auditEntries.length > 0) {
    await db.attendanceAudit.createMany({
      data: auditEntries,
    });
  }

  // Update session status to completed if not already
  if (session.status === 'SCHEDULED' || session.status === 'LIVE') {
    await db.batchSession.update({
      where: { id: input.sessionId },
      data: { status: 'COMPLETED' },
    });
  }

  return updatedRecords;
}

/**
 * Mentor submits an Attendance Correction Request when attendance is locked
 */
export async function requestAttendanceCorrectionService(
  input: {
    batchId: string;
    sessionId: string;
    studentId: string;
    requestedStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    reason: string;
  },
  userId: string
) {
  const { mentorProfile } = await validateMentorBatchAccess(userId, input.batchId);

  if (!mentorProfile) {
    throw new Error('Mentor profile is required to request correction.');
  }

  const req = await db.attendanceCorrectionRequest.create({
    data: {
      batchId: input.batchId,
      sessionId: input.sessionId,
      studentId: input.studentId,
      mentorId: mentorProfile.id,
      requestedStatus: input.requestedStatus,
      reason: input.reason.trim(),
      status: 'PENDING',
    },
    include: {
      student: { include: { user: true } },
      session: true,
      batch: true,
    },
  });

  // Notify admins
  const admins = await db.user.findMany({
    where: { role: { in: ['SUPER_ADMIN', 'ACADEMIC_ADMIN'] } },
  });

  for (const admin of admins) {
    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'Attendance Correction Request',
        message: `Mentor ${mentorProfile.user?.name || 'Mentor'} requested attendance correction for ${req.student.user.name} in ${req.batch.batchCode}. Reason: ${input.reason}`,
        type: 'ATTENDANCE',
        linkUrl: `/admin/batches`,
      },
    });
  }

  await logAuditEvent({
    actorId: userId,
    action: 'ATTENDANCE_CORRECTION_REQUESTED',
    entity: 'ATTENDANCE_CORRECTION_REQUEST',
    entityId: req.id,
    details: JSON.stringify({
      student: req.student.user.name,
      requestedStatus: input.requestedStatus,
      reason: input.reason,
    }),
  });

  return req;
}

/**
 * Admin reviews (Approves or Rejects) an Attendance Correction Request
 */
export async function adminReviewCorrectionRequestService(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  adminNotes: string,
  adminUserId: string
) {
  const admin = await db.user.findUnique({ where: { id: adminUserId } });
  if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ACADEMIC_ADMIN')) {
    throw new Error('Unauthorized: Only administrators can review correction requests.');
  }

  const req = await db.attendanceCorrectionRequest.findUnique({
    where: { id: requestId },
    include: {
      student: { include: { user: true } },
      mentor: { include: { user: true } },
      session: true,
      batch: true,
    },
  });

  if (!req) {
    throw new Error('Correction request not found.');
  }

  const updatedReq = await db.attendanceCorrectionRequest.update({
    where: { id: requestId },
    data: {
      status: decision,
      adminNotes: adminNotes.trim(),
      reviewedBy: admin.name,
    },
  });

  if (decision === 'APPROVED') {
    // Get previous status
    const previousRecord = await db.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: req.sessionId,
          studentId: req.studentId,
        },
      },
    });

    // Update AttendanceRecord
    await db.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: req.sessionId,
          studentId: req.studentId,
        },
      },
      update: {
        status: req.requestedStatus,
        remarks: `Correction Approved by Admin (${admin.name}): ${req.reason}`,
        markedBy: `Admin (${admin.name})`,
        checkInTime: req.requestedStatus === 'PRESENT' || req.requestedStatus === 'LATE' ? new Date() : null,
      },
      create: {
        sessionId: req.sessionId,
        studentId: req.studentId,
        status: req.requestedStatus,
        remarks: `Correction Approved by Admin (${admin.name}): ${req.reason}`,
        markedBy: `Admin (${admin.name})`,
        checkInTime: req.requestedStatus === 'PRESENT' || req.requestedStatus === 'LATE' ? new Date() : null,
      },
    });

    // Create Audit entry
    await db.attendanceAudit.create({
      data: {
        mentorId: req.mentorId,
        batchId: req.batchId,
        sessionId: req.sessionId,
        studentId: req.studentId,
        date: req.session.sessionDate,
        oldStatus: previousRecord?.status || null,
        newStatus: req.requestedStatus,
        action: 'CORRECTION_APPROVED',
        reason: req.reason,
        approvedBy: admin.name,
      },
    });
  }

  // Notify Mentor
  if (req.mentor?.userId) {
    await db.notification.create({
      data: {
        userId: req.mentor.userId,
        title: `Correction Request ${decision}`,
        message: `Admin ${admin.name} ${decision.toLowerCase()} your attendance correction for ${req.student.user.name} in ${req.batch.batchCode}. ${adminNotes ? `Notes: ${adminNotes}` : ''}`,
        type: 'ATTENDANCE',
        linkUrl: `/mentor/batches/${req.batchId}/attendance`,
      },
    });
  }

  await logAuditEvent({
    actorId: adminUserId,
    action: `ATTENDANCE_CORRECTION_${decision}`,
    entity: 'ATTENDANCE_CORRECTION_REQUEST',
    entityId: requestId,
    details: JSON.stringify({
      decision,
      adminNotes,
      student: req.student.user.name,
    }),
  });

  return updatedReq;
}

/**
 * Mentor creates a new learning resource in the batch workspace
 */
export async function createBatchResourceService(
  input: {
    batchId: string;
    moduleId?: string;
    sessionId?: string;
    title: string;
    description?: string;
    resourceType: string;
    url: string;
    driveFileId?: string;
    driveMetadataJson?: string;
  },
  userId: string
) {
  await validateMentorBatchAccess(userId, input.batchId);

  const resource = await db.batchResource.create({
    data: {
      batchId: input.batchId,
      moduleId: input.moduleId || null,
      sessionId: input.sessionId || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      resourceType: input.resourceType || 'PDF',
      url: input.url.trim(),
      driveFileId: input.driveFileId?.trim() || null,
      driveMetadataJson: input.driveMetadataJson || null,
      createdById: userId,
    },
    include: {
      batch: true,
      module: true,
      session: true,
    },
  });

  await logAuditEvent({
    actorId: userId,
    action: 'BATCH_RESOURCE_SHARED',
    entity: 'BATCH_RESOURCE',
    entityId: resource.id,
    details: JSON.stringify({
      title: resource.title,
      resourceType: resource.resourceType,
      batchCode: resource.batch.batchCode,
    }),
  });

  return resource;
}

/**
 * Mentor publishes a one-way broadcast announcement to the batch
 */
export async function sendBatchBroadcastService(
  input: {
    batchId: string;
    title: string;
    message: string;
    attachmentUrl?: string;
  },
  userId: string
) {
  const { mentorProfile, batch } = await validateMentorBatchAccess(userId, input.batchId);

  const students = await db.studentProfile.findMany({
    where: { batchId: input.batchId },
    include: { user: true },
  });

  const broadcast = await db.broadcast.create({
    data: {
      batchId: input.batchId,
      mentorId: mentorProfile.id,
      title: input.title.trim(),
      message: input.message.trim(),
      attachmentUrl: input.attachmentUrl?.trim() || null,
      recipientsCount: students.length,
      deliveryStatus: 'DELIVERED',
    },
  });

  // Create BroadcastRecipient entries and student notifications
  if (students.length > 0) {
    await db.broadcastRecipient.createMany({
      data: students.map((s: any) => ({
        broadcastId: broadcast.id,
        studentId: s.id,
        deliveredAt: new Date(),
        isRead: false,
      })),
      skipDuplicates: true,
    });

    for (const student of students) {
      await db.notification.create({
        data: {
          userId: student.userId,
          title: `Announcement: ${input.title.trim()}`,
          message: input.message.trim(),
          type: 'ANNOUNCEMENT',
          linkUrl: `/student/attendance`,
        },
      });
    }
  }

  await logAuditEvent({
    actorId: userId,
    action: 'BATCH_BROADCAST_SENT',
    entity: 'BROADCAST',
    entityId: broadcast.id,
    details: JSON.stringify({
      batchCode: batch.batchCode,
      title: broadcast.title,
      recipientsCount: students.length,
    }),
  });

  return broadcast;
}

/**
 * Retrieves full unified calendar schedule for a mentor
 */
export async function getMentorCalendarService(userId: string) {
  await seedBatchesIfEmpty();
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { mentorProfile: true },
  });

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ACADEMIC_ADMIN';
  const mentorId = user?.mentorProfile?.id;

  const batches = await db.batch.findMany({
    where: isAdmin ? undefined : { mentorId: mentorId || undefined },
    include: {
      course: true,
      sessions: {
        include: {
          module: true,
          attendanceRecords: true,
        },
        orderBy: { sessionDate: 'asc' },
      },
    },
  });

  const events: any[] = [];

  batches.forEach((b: any) => {
    b.sessions.forEach((s: any) => {
      const isLocked = isSessionAttendanceLocked(s.sessionDate, b.attendanceLockHours);
      const isMarked = s.attendanceRecords?.length > 0;
      events.push({
        id: s.id,
        type: 'LECTURE',
        title: s.title,
        batchId: b.id,
        batchCode: b.batchCode,
        batchTitle: b.title,
        courseTitle: b.course?.title || 'Security Curriculum',
        moduleTitle: s.module?.title || 'Core Module',
        date: s.sessionDate,
        durationMins: s.durationMins,
        status: s.status,
        isLocked,
        isMarked,
        presentCount: s.attendanceRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length,
        totalEnrolled: b.students?.length || s.attendanceRecords.length || 30,
      });
    });
  });

  return events;
}

/**
 * Returns student's comprehensive dossier within a batch
 */
export async function getStudentDossierInBatchService(
  batchId: string,
  studentId: string,
  userId: string
) {
  await validateMentorBatchAccess(userId, batchId);

  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: {
        include: {
          tsIdentity: true,
          enrollments: { include: { course: true } },
          progress: { include: { lesson: { include: { module: true } } } },
          labAttempts: { include: { lab: true } },
          assessments: { include: { assessment: true } },
          certificates: true,
        },
      },
      batch: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
              },
            },
          },
          sessions: {
            include: {
              module: true,
              attendanceRecords: {
                where: { studentId },
              },
            },
            orderBy: { sessionDate: 'asc' },
          },
        },
      },
      skills: true,
      attendanceRecords: {
        where: { session: { batchId } },
        include: { session: true },
        orderBy: { session: { sessionDate: 'desc' } },
      },
    },
  });

  if (!student) {
    throw new Error('Student record not found.');
  }

  // Calculate student metrics
  const totalClasses = student.batch?.sessions?.length || 0;
  const attendedClasses = student.attendanceRecords.filter(
    (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length;
  const absentClasses = student.attendanceRecords.filter((r: any) => r.status === 'ABSENT').length;
  const attendancePercentage =
    totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

  // Determine risk indicator
  let riskStatus: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'AT_RISK' = 'ON_TRACK';
  let riskReason = 'Student performance and attendance are meeting faculty benchmarks.';

  if (attendancePercentage < 70) {
    riskStatus = 'AT_RISK';
    riskReason = `Attendance is critically below the 75% required threshold (${attendancePercentage}%).`;
  } else if (attendancePercentage < 80) {
    riskStatus = 'NEEDS_ATTENTION';
    riskReason = `Attendance is approaching the minimum threshold (${attendancePercentage}%).`;
  }

  return {
    student,
    metrics: {
      totalClasses,
      attendedClasses,
      absentClasses,
      attendancePercentage,
      riskStatus,
      riskReason,
    },
  };
}

