import { prisma } from '../database/prisma';
import {
  SUPER_ADMIN_ATTENDANCE_EMAIL,
  isSuperAdminAttendanceUser,
  isAttendanceTestingEmail,
  ATTENDANCE_TESTING_USER_EMAILS,
  AttendanceAuthUser,
} from '@/lib/auth/employee-attendance-auth';
import { EmployeeAttendanceStatus } from '@prisma/client';

const db = prisma as any;

/**
 * Feature Flag Key for Attendance Testing Mode:
 * Controls whether test accounts are showcased to coordinator Akshay Kumar.
 */
export const ATTENDANCE_TESTING_FLAG_KEY = 'ATTENDANCE_SHOWCASE_TEST_USERS';

/**
 * Checks if Super Admin has enabled Testing Mode (showcasing test users to coordinator)
 */
export async function isAttendanceTestingModeActive(): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: ATTENDANCE_TESTING_FLAG_KEY },
    });
    return Boolean(flag?.isEnabled);
  } catch (err) {
    console.warn('[AttendanceTestingMode] Error reading testing mode flag:', err);
    return false;
  }
}

/**
 * Toggles Testing Mode (Exclusive Super Admin Authority)
 */
export async function setAttendanceTestingModeService(
  enabled: boolean,
  adminUser: AttendanceAuthUser
): Promise<{ success: boolean; isEnabled: boolean }> {
  if (!isSuperAdminAttendanceUser(adminUser)) {
    throw new Error('Forbidden: Only Super Admin has authority to toggle attendance testing mode.');
  }

  const updated = await prisma.featureFlag.upsert({
    where: { key: ATTENDANCE_TESTING_FLAG_KEY },
    create: {
      key: ATTENDANCE_TESTING_FLAG_KEY,
      description: `Showcase test users (staff.junior, staff.executive, etc.) to coordinator Akshay Kumar. Toggled by ${adminUser.email}`,
      isEnabled: enabled,
      targetRoles: ['SUPER_ADMIN', 'MENTOR'],
      percentage: 100,
    },
    update: {
      isEnabled: enabled,
      description: `Showcase test users in attendance operations to coordinator Akshay Kumar. Toggled by ${adminUser.email} at ${new Date().toISOString()}`,
    },
  });

  return { success: true, isEnabled: updated.isEnabled };
}

/**
 * Normalizes any Date or ISO string to UTC Midnight (YYYY-MM-DDT00:00:00.000Z)
 */
export function normalizeAttendanceDate(inputDate: string | Date): Date {
  const d = typeof inputDate === 'string' ? new Date(inputDate) : new Date(inputDate.getTime());
  // Use UTC year, month, date
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Formats a Date to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Dynamic Attendance Percentage Calculator based on required Thread Security formula:
 * Attendance Percentage = (Attendance Credits / Total Working Days) × 100
 *
 * Credits:
 * - Present = 1
 * - WFH = 1
 * - Half Day = 0.5
 * - Absent = 0
 * - Approved Leave = Excluded from working-day denominator
 * - Holiday / Weekly Off = Excluded from working-day denominator
 */
export function calculateAttendancePercentage(counts: {
  present: number;
  wfh?: number;
  halfDay: number;
  absent: number;
}): {
  credits: number;
  totalWorkingDays: number;
  percentage: number;
} {
  const wfh = counts.wfh || 0;
  const credits = counts.present * 1 + wfh * 1 + counts.halfDay * 0.5;
  const totalWorkingDays = counts.present + wfh + counts.halfDay + counts.absent;
  const percentage = totalWorkingDays > 0 ? Math.round((credits / totalWorkingDays) * 1000) / 10 : 100;

  return { credits, totalWorkingDays, percentage };
}

export interface AttendanceWindowInfo {
  isOpen: boolean;
  isPastDeadline: boolean;
  isBeforeOpen: boolean;
  isToday: boolean;
  targetDateKey: string;
  todayIstDateKey: string;
  openTimeLabel: string;
  closeTimeLabel: string;
  serverTimeIst: string; // 24-hour clock string e.g. "10:30:15 IST (24-Hour Clock)"
  serverTime24Hr: string; // 24-hour time "10:30:15"
  remainingMinutes: number;
  remainingTimeFormatted: string;
  status: 'OPEN' | 'LOCKED' | 'ROSTER_NOT_PUBLISHED' | 'BEFORE_WINDOW';
  message: string;
}

/**
 * Authoritative Server-Side 24-Hour Daily Attendance Window Calculator
 * Timezone: Asia/Kolkata (IST, UTC+05:30)
 * Window: 24 Hours of the calendar day (00:00:00 to 23:59:59 IST)
 * Multiple submissions/updates are permitted within the 24-hour window.
 */
export function getAttendanceWindowStatus(targetDateInput?: string | Date): AttendanceWindowInfo {
  const now = new Date();

  // Convert current server time to Asia/Kolkata (24-hour clock)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => { partMap[p.type] = p.value; });

  const todayIstDateKey = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const istHour = parseInt(partMap.hour, 10);
  const istMinute = parseInt(partMap.minute, 10);
  const istSecond = parseInt(partMap.second || '00', 10);

  // Exact 24-hour clock formatting
  const serverTime24Hr = `${String(istHour).padStart(2, '0')}:${String(istMinute).padStart(2, '0')}:${String(istSecond).padStart(2, '0')}`;
  const serverTimeIst = `${serverTime24Hr} IST (24-Hour Clock)`;

  // Parse target date
  let targetDateKey = todayIstDateKey;
  if (targetDateInput) {
    const d = typeof targetDateInput === 'string' ? new Date(targetDateInput) : targetDateInput;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    targetDateKey = `${y}-${m}-${day}`;
  }

  const isToday = targetDateKey === todayIstDateKey;
  const isPastDay = targetDateKey < todayIstDateKey;
  const isFutureDay = targetDateKey > todayIstDateKey;

  // In the 24-hour daily window architecture:
  // Today's date is OPEN for the entire 24-hour calendar day (00:00:00 to 23:59:59 IST)
  const isOpen = isToday;
  const isPastDeadline = isPastDay;
  const isBeforeOpen = false;

  // Calculate remaining time in today's 24-hour window
  const totalSecondsInDay = 86400;
  const elapsedSecondsToday = istHour * 3600 + istMinute * 60 + istSecond;
  const remainingSeconds = Math.max(0, totalSecondsInDay - elapsedSecondsToday);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMinsModulo = remainingMinutes % 60;

  let remainingTimeFormatted = '';
  let status: 'OPEN' | 'LOCKED' | 'ROSTER_NOT_PUBLISHED' | 'BEFORE_WINDOW' = 'LOCKED';
  let message = '';

  if (isPastDay) {
    status = 'LOCKED';
    remainingTimeFormatted = '24-hour daily window expired';
    message = 'Attendance for this date is closed and read-only. Only Super Admin has historical rectification authority.';
  } else if (isFutureDay) {
    status = 'LOCKED';
    remainingTimeFormatted = 'Future date locked';
    message = 'Daily attendance cannot be marked for future dates.';
  } else if (isOpen) {
    status = 'OPEN';
    remainingTimeFormatted = `${remainingHours}h ${remainingMinsModulo}m remaining in today's 24-hour window`;
    message = `Attendance window is OPEN (24-Hour Clock: ${serverTime24Hr} IST). You may update attendance multiple times within the 24-hour cycle in proper sequence.`;
  } else {
    status = 'LOCKED';
    remainingTimeFormatted = '24-hour window closed';
    message = 'Daily editing deadline reached. Attendance is now locked. Only Super Admin can rectify records.';
  }

  return {
    isOpen,
    isPastDeadline,
    isBeforeOpen,
    isToday,
    targetDateKey,
    todayIstDateKey,
    openTimeLabel: '00:00:00 IST (24-Hour Window)',
    closeTimeLabel: '23:59:59 IST (Midnight)',
    serverTimeIst,
    serverTime24Hr,
    remainingMinutes,
    remainingTimeFormatted,
    status,
    message,
  };
}

/**
 * Ensures all non-student users have an EmployeeProfile record
 */
export async function syncEmployeeProfilesService() {
  const missingProfiles = await prisma.user.findMany({
    where: { role: { not: 'STUDENT' }, employeeProfile: null },
    include: { tsIdentity: true, mentorIdentity: true, mentorProfile: true },
  });

  if (missingProfiles.length === 0) return;

  for (const u of missingProfiles) {
    const empId =
      u.tsIdentity?.tsId ||
      u.mentorIdentity?.mentorId ||
      `TSE-EMP-${u.id.slice(-4).toUpperCase()}`;

    let dept = 'Academics & Faculty';
    let desig = u.mentorProfile?.title || 'Faculty Mentor';

    if (u.role === 'SUPER_ADMIN') {
      dept = 'Executive Management';
      desig = 'Super Administrator';
    } else if (u.role === 'SECURITY_ADMIN') {
      dept = 'Cyber Operations & SOC';
      desig = 'Security Operations Analyst';
    } else if (u.role === 'STAFF_EXECUTIVE') {
      dept = 'Academic Operations';
      desig = 'Executive Staff Associate';
    } else if (u.role === 'STAFF_JUNIOR') {
      dept = 'Lab & Technical Support';
      desig = 'Junior Technical Associate';
    }

    await db.employeeProfile.create({
      data: {
        userId: u.id,
        employeeId: empId,
        department: dept,
        designation: desig,
        status: 'ACTIVE',
        attendanceEligible: true,
      },
    });
  }
}

/**
 * 1. GET Employee Directory with profiles and real-time attendance stats
 */
export async function getEmployeeDirectoryService(
  filters?: {
    department?: string;
    search?: string;
  },
  caller?: AttendanceAuthUser | null
) {
  await syncEmployeeProfilesService();

  const whereUser: any = {
    role: { not: 'STUDENT' },
  };

  if (filters?.search) {
    const s = filters.search.trim();
    whereUser.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { employeeProfile: { employeeId: { contains: s, mode: 'insensitive' } } },
      { employeeProfile: { department: { contains: s, mode: 'insensitive' } } },
      { employeeProfile: { designation: { contains: s, mode: 'insensitive' } } },
    ];
  }

  if (filters?.department && filters.department !== 'ALL') {
    whereUser.employeeProfile = {
      department: filters.department,
    };
  }

  const employees = await prisma.user.findMany({
    where: whereUser,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      employeeProfile: true,
      employeeAttendances: {
        select: {
          status: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' },
      { name: 'asc' },
    ],
  });

  const mapped = employees.map((emp) => {
    const records = emp.employeeAttendances || [];
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const wfh = records.filter((r) => r.status === 'WFH').length;
    const halfDay = records.filter((r) => r.status === 'HALF_DAY').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const leave = records.filter((r) => r.status === 'LEAVE').length;
    const holiday = records.filter((r) => r.status === 'HOLIDAY').length;

    const { credits, totalWorkingDays, percentage } = calculateAttendancePercentage({
      present,
      wfh,
      halfDay,
      absent,
    });

    const isTestingUser = isAttendanceTestingEmail(emp.email);

    return {
      id: emp.id,
      userId: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      avatarUrl: emp.avatarUrl,
      employeeId: emp.employeeProfile?.employeeId || `TSE-EMP-${emp.id.slice(-4).toUpperCase()}`,
      department: emp.employeeProfile?.department || 'Academics & Faculty',
      designation: emp.employeeProfile?.designation || 'Faculty Member',
      joiningDate: emp.employeeProfile?.joiningDate?.toISOString() || new Date().toISOString(),
      status: emp.employeeProfile?.status || 'ACTIVE',
      attendanceEligible: emp.employeeProfile?.attendanceEligible ?? true,
      phone: emp.employeeProfile?.phone || null,
      totalRecords: records.length,
      presentDays: present,
      wfhDays: wfh,
      halfDays: halfDay,
      absentDays: absent,
      leaveDays: leave,
      holidayDays: holiday,
      attendanceCredits: credits,
      totalWorkingDays,
      attendancePercentage: percentage,
      isTestingUser,
    };
  });

  // STRICT ACCESS FILTER FOR ATTENDANCE COORDINATOR (AKSHAY KUMAR):
  // Test users (staff.junior, staff.executive, threadsecuritymentor, threadsecurity@gmail.com)
  // are completely hidden from coordinator unless Super Admin enabled Testing Mode.
  const isSuperAdmin = caller ? isSuperAdminAttendanceUser(caller) : false;
  if (!isSuperAdmin) {
    const isTestingMode = await isAttendanceTestingModeActive();
    if (!isTestingMode) {
      return mapped.filter((emp) => !emp.isTestingUser);
    }
  }

  return mapped;
}

/**
 * 2. GET Daily Attendance for a given date with Roster & 12-Hour Window Check
 */
export async function getDailyAttendanceService(
  dateInput: string | Date,
  department?: string,
  caller?: AttendanceAuthUser | null
) {
  await syncEmployeeProfilesService();
  const targetDate = normalizeAttendanceDate(dateInput);
  const windowInfo = getAttendanceWindowStatus(targetDate);
  const isSuperAdmin = caller ? isSuperAdminAttendanceUser(caller) : false;
  const isTestingMode = await isAttendanceTestingModeActive();

  // 1. Fetch Daily Roster snapshot for this date
  const rosterEntries = await db.dailyAttendanceRoster.findMany({
    where: { attendanceDate: targetDate },
    include: {
      publishedBy: { select: { id: true, name: true, email: true } },
    },
  });

  const isRosterPublished = rosterEntries.length > 0;
  const publishedEmployeeIds = new Set(rosterEntries.map((r: any) => r.employeeId));
  const publishedMetadata = isRosterPublished
    ? {
        publishedAt: rosterEntries[0].publishedAt.toISOString(),
        publishedBy: rosterEntries[0].publishedBy?.name || rosterEntries[0].publishedBy?.email || 'Super Admin',
      }
    : null;

  // If Attendance Manager (Akshay) views and roster is not published yet:
  if (!isSuperAdmin && !isRosterPublished) {
    windowInfo.status = 'ROSTER_NOT_PUBLISHED';
    windowInfo.message = 'Super Admin has not published the attendance roster for this date yet. Attendance cannot be captured until the roster is published.';
  }

  // Fetch all operational employees (respecting caller testing visibility)
  let directory = await getEmployeeDirectoryService(department && department !== 'ALL' ? { department } : undefined, caller);

  // If Attendance Manager views: ONLY show employees included in the published roster
  if (!isSuperAdmin) {
    if (!isRosterPublished) {
      directory = [];
    } else {
      directory = directory.filter((emp) => publishedEmployeeIds.has(emp.id));
    }
  }

  // Fetch attendance records for this date
  const records = await db.employeeAttendance.findMany({
    where: {
      attendanceDate: targetDate,
    },
    include: {
      markedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  const recordMap = new Map<string, any>();
  records.forEach((r: any) => recordMap.set(r.employeeId, r));

  const items = directory.map((emp) => {
    const existing = recordMap.get(emp.id);
    return {
      employee: emp,
      attendanceId: existing?.id || null,
      status: (existing?.status as EmployeeAttendanceStatus) || 'PRESENT',
      checkInTime: existing?.checkInTime || null,
      sequenceNumber: existing?.sequenceNumber || 1,
      remarks: existing?.remarks || '',
      isMarked: Boolean(existing),
      isFinalized: existing?.isFinalized ?? false,
      inRoster: publishedEmployeeIds.has(emp.id),
      markedBy: existing?.markedBy || null,
      submittedAt: existing?.submittedAt ? existing.submittedAt.toISOString() : null,
      updatedAt: existing?.updatedAt ? existing.updatedAt.toISOString() : null,
      isTestingUser: isAttendanceTestingEmail(emp.email),
    };
  });

  const markedCount = items.filter((i) => i.isMarked).length;
  const isFinalized = records.length > 0 && records.some((r: any) => r.isFinalized);
  const presentCount = items.filter((i) => i.status === 'PRESENT' && i.isMarked).length;
  const wfhCount = items.filter((i) => i.status === 'WFH' && i.isMarked).length;
  const absentCount = items.filter((i) => i.status === 'ABSENT' && i.isMarked).length;
  const halfDayCount = items.filter((i) => i.status === 'HALF_DAY' && i.isMarked).length;
  const leaveCount = items.filter((i) => i.status === 'LEAVE' && i.isMarked).length;
  const holidayCount = items.filter((i) => i.status === 'HOLIDAY' && i.isMarked).length;

  const { percentage } = calculateAttendancePercentage({
    present: presentCount,
    wfh: wfhCount,
    halfDay: halfDayCount,
    absent: absentCount,
  });

  return {
    date: formatDateKey(targetDate),
    targetDateIso: targetDate.toISOString(),
    isFinalized,
    isRosterPublished,
    publishedMetadata,
    windowInfo,
    isTestingModeActive: isTestingMode,
    totalEmployees: directory.length,
    markedCount,
    presentCount,
    wfhCount,
    absentCount,
    halfDayCount,
    leaveCount,
    holidayCount,
    overallPercentage: percentage,
    items,
  };
}

/**
 * 3. POST / Capture Daily Attendance
 * STRICT RULES:
 * - 24-Hour daily attendance window (00:00:00 to 23:59:59 IST)
 * - Akshay Kumar & Admin can update multiple times during the open window for today.
 * - Sequential accountability: Tracks check-in time via 24-hour clock and incremental act sequence.
 * - Akshay can only mark employees who exist in the published DailyAttendanceRoster.
 * - Only Super Admin (threadsecurity@gmail.com) can update finalized or historical records.
 */
export async function captureDailyAttendanceService(params: {
  date: string | Date;
  records: Array<{
    employeeId: string;
    status: EmployeeAttendanceStatus;
    checkInTime?: string;
    remarks?: string;
  }>;
  markedById: string;
  markedByEmail: string;
  isFinalized?: boolean;
}) {
  const targetDate = normalizeAttendanceDate(params.date);
  const isFinalized = params.isFinalized ?? true;

  const isSuperAdmin = isSuperAdminAttendanceUser({
    userId: params.markedById,
    email: params.markedByEmail,
  });

  const windowInfo = getAttendanceWindowStatus(targetDate);

  // STRICT SERVER-SIDE TIME WINDOW & ROSTER ENFORCEMENT FOR ATTENDANCE MANAGER (AKSHAY KUMAR)
  if (!isSuperAdmin) {
    if (!windowInfo.isToday) {
      throw new Error(
        `Forbidden: Attendance Manager can only capture attendance for the current working day (${windowInfo.todayIstDateKey}). Past and future dates cannot be modified.`
      );
    }

    if (!windowInfo.isOpen) {
      throw new Error(
        `Forbidden: Daily attendance window is active for 24 hours of the current day. Attendance editing is currently closed. ${windowInfo.message}`
      );
    }

    // ROSTER MEMBERSHIP VALIDATION FOR ATTENDANCE MANAGER
    const rosterEntries = await db.dailyAttendanceRoster.findMany({
      where: { attendanceDate: targetDate },
      select: { employeeId: true },
    });

    if (rosterEntries.length === 0) {
      throw new Error(
        'Forbidden: Daily attendance roster has not been published by Super Admin for this date. Attendance cannot be submitted.'
      );
    }

    const rosterSet = new Set(rosterEntries.map((r: any) => r.employeeId));
    for (const rec of params.records) {
      if (!rosterSet.has(rec.employeeId)) {
        throw new Error(
          `Forbidden: Employee ID ${rec.employeeId} is not in the Super Admin published roster for this date.`
        );
      }
    }
  }

  // Fetch marker details for accountability
  const marker = await prisma.user.findUnique({
    where: { id: params.markedById },
    select: { id: true, name: true, email: true, role: true },
  });
  const markerName = marker?.name || params.markedByEmail;
  const markerRoleLabel = isSuperAdmin ? 'Super Admin' : 'Attendance Coordinator (Akshay Kumar)';

  // Fetch existing attendance records to track incremental sequence acts within 24 hours
  const existingRecords = await db.employeeAttendance.findMany({
    where: { attendanceDate: targetDate },
  });
  const existingMap = new Map<string, any>(existingRecords.map((r: any) => [r.employeeId, r]));
  const now24Hr = windowInfo.serverTime24Hr;

  // Perform atomic batch upsert inside transaction
  const upsertOps = params.records.map((rec) => {
    const existing = existingMap.get(rec.employeeId);
    const currentSeq = existing?.sequenceNumber || 1;
    const nextSeq = existing ? currentSeq + 1 : 1;
    const effectiveCheckIn =
      rec.checkInTime ||
      (['PRESENT', 'WFH', 'HALF_DAY'].includes(rec.status) ? existing?.checkInTime || now24Hr : null);

    return db.employeeAttendance.upsert({
      where: {
        employeeId_attendanceDate: {
          employeeId: rec.employeeId,
          attendanceDate: targetDate,
        },
      },
      create: {
        employeeId: rec.employeeId,
        attendanceDate: targetDate,
        status: rec.status,
        checkInTime: effectiveCheckIn,
        sequenceNumber: 1,
        remarks: rec.remarks || null,
        markedById: params.markedById,
        isFinalized,
        submittedAt: new Date(),
      },
      update: {
        status: rec.status,
        checkInTime: effectiveCheckIn,
        sequenceNumber: nextSeq,
        remarks: rec.remarks || null,
        markedById: params.markedById,
        isFinalized,
        updatedAt: new Date(),
      },
    });
  });

  await prisma.$transaction(upsertOps);

  // Audit Logging for accountability and proper sequence tracking
  try {
    const auditEntries: any[] = [];
    for (const rec of params.records) {
      const existing = existingMap.get(rec.employeeId);
      const nextSeq = existing ? (existing.sequenceNumber || 1) + 1 : 1;
      const effectiveCheckIn =
        rec.checkInTime ||
        (['PRESENT', 'WFH', 'HALF_DAY'].includes(rec.status) ? existing?.checkInTime || now24Hr : null);

      const attendanceRecord = await db.employeeAttendance.findUnique({
        where: {
          employeeId_attendanceDate: {
            employeeId: rec.employeeId,
            attendanceDate: targetDate,
          },
        },
        select: { id: true },
      });

      if (attendanceRecord) {
        auditEntries.push({
          attendanceId: attendanceRecord.id,
          previousStatus: existing ? existing.status : rec.status,
          updatedStatus: rec.status,
          checkInTime: effectiveCheckIn,
          sequenceNumber: nextSeq,
          reason: `Daily Marking Act #${nextSeq} [24-Hr Clock: ${effectiveCheckIn || 'N/A'} IST] by ${markerRoleLabel} (${markerName} <${params.markedByEmail}>)`,
          modifiedById: params.markedById,
        });
      }
    }

    if (auditEntries.length > 0) {
      await db.employeeAttendanceAuditLog.createMany({
        data: auditEntries,
      });
    }
  } catch (auditErr) {
    console.warn('[EmployeeAttendance] Notice logging sequence audit acts:', auditErr);
  }

  return {
    success: true,
    count: params.records.length,
    date: formatDateKey(targetDate),
    isFinalized,
    windowInfo,
  };
}

/**
 * 4. GET Individual Employee Attendance Profile & Monthly Calendar
 */
export async function getEmployeeAttendanceProfileService(
  employeeIdOrUserId: string,
  year?: number,
  month?: number // 1-12
) {
  await syncEmployeeProfilesService();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: employeeIdOrUserId },
        { employeeProfile: { employeeId: employeeIdOrUserId } },
      ],
    },
    include: {
      employeeProfile: true,
      employeeAttendances: {
        include: {
          markedBy: { select: { id: true, name: true, email: true } },
          auditLogs: {
            include: { modifiedBy: { select: { id: true, name: true, email: true } } },
            orderBy: { modifiedAt: 'desc' },
          },
        },
        orderBy: { attendanceDate: 'desc' },
      },
    },
  });

  if (!user) {
    throw new Error('Employee not found in directory');
  }

  const allRecords = user.employeeAttendances || [];

  // Overall Statistics
  const overallPresent = allRecords.filter((r) => r.status === 'PRESENT').length;
  const overallWFH = allRecords.filter((r) => r.status === 'WFH').length;
  const overallHalfDay = allRecords.filter((r) => r.status === 'HALF_DAY').length;
  const overallAbsent = allRecords.filter((r) => r.status === 'ABSENT').length;
  const overallLeave = allRecords.filter((r) => r.status === 'LEAVE').length;
  const overallHoliday = allRecords.filter((r) => r.status === 'HOLIDAY').length;

  const overallStats = calculateAttendancePercentage({
    present: overallPresent,
    wfh: overallWFH,
    halfDay: overallHalfDay,
    absent: overallAbsent,
  });

  // Selected Month Calendar Filtering
  const targetYear = year || new Date().getUTCFullYear();
  const targetMonth = month || new Date().getUTCMonth() + 1; // 1-indexed

  const monthRecords = allRecords.filter((r) => {
    const d = new Date(r.attendanceDate);
    return d.getUTCFullYear() === targetYear && d.getUTCMonth() + 1 === targetMonth;
  });

  const monthPresent = monthRecords.filter((r) => r.status === 'PRESENT').length;
  const monthWFH = monthRecords.filter((r) => r.status === 'WFH').length;
  const monthHalfDay = monthRecords.filter((r) => r.status === 'HALF_DAY').length;
  const monthAbsent = monthRecords.filter((r) => r.status === 'ABSENT').length;
  const monthLeave = monthRecords.filter((r) => r.status === 'LEAVE').length;
  const monthHoliday = monthRecords.filter((r) => r.status === 'HOLIDAY').length;

  const monthStats = calculateAttendancePercentage({
    present: monthPresent,
    wfh: monthWFH,
    halfDay: monthHalfDay,
    absent: monthAbsent,
  });

  // Build calendar map: key is YYYY-MM-DD
  const calendarMap: Record<
    string,
    {
      status: EmployeeAttendanceStatus;
      remarks?: string | null;
      isFinalized: boolean;
      markedBy?: string | null;
      attendanceId: string;
      hasAuditLogs: boolean;
    }
  > = {};

  allRecords.forEach((r) => {
    const key = formatDateKey(new Date(r.attendanceDate));
    calendarMap[key] = {
      status: r.status,
      remarks: r.remarks,
      isFinalized: r.isFinalized,
      markedBy: r.markedBy?.name || r.markedBy?.email || null,
      attendanceId: r.id,
      hasAuditLogs: (r.auditLogs || []).length > 0,
    };
  });

  const directory = await getEmployeeDirectoryService();
  const allEmployees = directory.map((emp) => ({
    id: emp.id,
    name: emp.name,
    employeeId: emp.employeeId,
    department: emp.department,
    designation: emp.designation,
  }));

  const allHistory = allRecords.map((r) => ({
    id: r.id,
    date: formatDateKey(new Date(r.attendanceDate)),
    status: r.status,
    remarks: r.remarks,
    isFinalized: r.isFinalized,
    markedBy: r.markedBy?.name || r.markedBy?.email || 'System',
    updatedAt: r.updatedAt.toISOString(),
    auditLogsCount: (r.auditLogs || []).length,
  }));

  return {
    employee: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      employeeId: user.employeeProfile?.employeeId || `TSE-EMP-${user.id.slice(-4).toUpperCase()}`,
      department: user.employeeProfile?.department || 'Academics & Faculty',
      designation: user.employeeProfile?.designation || 'Faculty Member',
      joiningDate: user.employeeProfile?.joiningDate?.toISOString() || user.createdAt.toISOString(),
      status: user.employeeProfile?.status || 'ACTIVE',
    },
    allEmployees,
    allHistory,
    overall: {
      totalRecords: allRecords.length,
      presentDays: overallPresent,
      wfhDays: overallWFH,
      halfDays: overallHalfDay,
      absentDays: overallAbsent,
      leaveDays: overallLeave,
      holidayDays: overallHoliday,
      attendanceCredits: overallStats.credits,
      totalWorkingDays: overallStats.totalWorkingDays,
      attendancePercentage: overallStats.percentage,
    },
    monthly: {
      year: targetYear,
      month: targetMonth,
      totalDaysMarked: monthRecords.length,
      presentDays: monthPresent,
      wfhDays: monthWFH,
      halfDays: monthHalfDay,
      absentDays: monthAbsent,
      leaveDays: monthLeave,
      holidayDays: monthHoliday,
      attendanceCredits: monthStats.credits,
      totalWorkingDays: monthStats.totalWorkingDays,
      attendancePercentage: monthStats.percentage,
    },
    calendarMap,
    recentHistory: allHistory.slice(0, 31),
  };
}

/**
 * 5. PATCH / Super Admin Exclusive Rectification Action
 * STRICT BACKEND VALIDATION:
 * Validates superAdminEmail === 'threadsecurity@gmail.com' and creates immutable audit log.
 */
export async function rectifyAttendanceRecordService(params: {
  attendanceId?: string;
  employeeId?: string;
  date?: string | Date;
  newStatus: EmployeeAttendanceStatus;
  remarks: string;
  superAdminId: string;
  superAdminEmail: string;
}) {
  const isAuthorized = isSuperAdminAttendanceUser({
    userId: params.superAdminId,
    email: params.superAdminEmail,
  });

  if (!isAuthorized) {
    throw new Error(
      `Access Denied: Only Super Admin (${SUPER_ADMIN_ATTENDANCE_EMAIL}) possesses rectification authority.`
    );
  }

  if (!params.remarks || !params.remarks.trim()) {
    throw new Error('Mandatory correction remarks/reason must be provided for audit tracking.');
  }

  let existing: any = null;
  if (params.attendanceId) {
    existing = await db.employeeAttendance.findUnique({
      where: { id: params.attendanceId },
      include: {
        employee: { select: { id: true, name: true, email: true } },
      },
    });
  } else if (params.employeeId && params.date) {
    const targetDate = normalizeAttendanceDate(params.date);
    existing = await db.employeeAttendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: params.employeeId,
          attendanceDate: targetDate,
        },
      },
      include: {
        employee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existing) {
      // Create initial record then rectify
      const emp = await prisma.user.findUnique({
        where: { id: params.employeeId },
        select: { id: true, name: true, email: true },
      });
      if (!emp) throw new Error('Target employee not found in database.');

      existing = await db.employeeAttendance.create({
        data: {
          employeeId: emp.id,
          attendanceDate: targetDate,
          status: 'ABSENT',
          remarks: 'Unmarked historical record',
          markedById: params.superAdminId,
          isFinalized: true,
          submittedAt: new Date(),
        },
        include: {
          employee: { select: { id: true, name: true, email: true } },
        },
      });
    }
  }

  if (!existing) {
    throw new Error('Target attendance record not found in database.');
  }

  const previousStatus = existing.status;

  // Perform audit logging and attendance status rectification in a single transaction
  const [auditLog, updatedRecord] = await prisma.$transaction([
    db.employeeAttendanceAuditLog.create({
      data: {
        attendanceId: existing.id,
        previousStatus,
        updatedStatus: params.newStatus,
        reason: params.remarks.trim(),
        modifiedById: params.superAdminId,
        modifiedAt: new Date(),
      },
    }),
    db.employeeAttendance.update({
      where: { id: existing.id },
      data: {
        status: params.newStatus,
        remarks: `[RECTIFIED by Super Admin]: ${params.remarks.trim()}`,
        updatedAt: new Date(),
      },
      include: {
        employee: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    success: true,
    auditLogId: auditLog.id,
    previousStatus,
    updatedStatus: updatedRecord.status,
    employeeName: existing.employee.name,
    date: formatDateKey(new Date(existing.attendanceDate)),
  };
}

/**
 * 6. GET Immutable Audit Logs History (Super Admin Only)
 */
export async function getAttendanceAuditHistoryService(filters?: {
  employeeId?: string;
  take?: number;
}) {
  const where: any = {};
  if (filters?.employeeId) {
    where.attendance = {
      employeeId: filters.employeeId,
    };
  }

  const logs = await db.employeeAttendanceAuditLog.findMany({
    where,
    include: {
      attendance: {
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              employeeProfile: true,
            },
          },
          markedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      modifiedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { modifiedAt: 'desc' },
    take: filters?.take || 100,
  });

  return logs.map((log: any) => ({
    id: log.id,
    attendanceId: log.attendanceId,
    attendanceDate: formatDateKey(new Date(log.attendance.attendanceDate)),
    previousStatus: log.previousStatus,
    updatedStatus: log.updatedStatus,
    checkInTime: log.checkInTime || null,
    sequenceNumber: log.sequenceNumber || 1,
    reason: log.reason,
    modifiedAt: log.modifiedAt.toISOString(),
    modifiedBy: {
      id: log.modifiedBy.id,
      name: log.modifiedBy.name,
      email: log.modifiedBy.email,
    },
    originallyMarkedBy: log.attendance.markedBy
      ? {
          id: log.attendance.markedBy.id,
          name: log.attendance.markedBy.name,
          email: log.attendance.markedBy.email,
        }
      : null,
    employee: {
      id: log.attendance.employee.id,
      name: log.attendance.employee.name,
      email: log.attendance.employee.email,
      role: log.attendance.employee.role,
      employeeId: log.attendance.employee.employeeProfile?.employeeId || 'N/A',
      department: log.attendance.employee.employeeProfile?.department || 'Academics & Faculty',
      designation: log.attendance.employee.employeeProfile?.designation || 'Faculty Member',
    },
  }));
}

/**
 * 7. GET Attendance Analytics Overview
 */
export async function getAttendanceAnalyticsOverviewService(
  dateInput?: string | Date,
  caller?: AttendanceAuthUser | null
) {
  const targetDate = normalizeAttendanceDate(dateInput || new Date());
  const daily = await getDailyAttendanceService(targetDate, undefined, caller);
  const directory = await getEmployeeDirectoryService(undefined, caller);

  const totalEmployees = directory.length;
  const presentToday = daily.presentCount;
  const wfhToday = daily.wfhCount;
  const absentToday = daily.absentCount;
  const halfDayToday = daily.halfDayCount;
  const leaveToday = daily.leaveCount;
  const holidayToday = daily.holidayCount;
  const overallPercentage = daily.overallPercentage;

  // Department breakdown
  const deptMap: Record<string, { total: number; present: number; wfh: number; absent: number; halfDay: number }> = {};
  directory.forEach((emp) => {
    const dept = emp.department || 'Academics & Faculty';
    if (!deptMap[dept]) {
      deptMap[dept] = { total: 0, present: 0, wfh: 0, absent: 0, halfDay: 0 };
    }
    deptMap[dept].total += 1;
  });

  daily.items.forEach((item) => {
    const dept = item.employee.department || 'Academics & Faculty';
    if (deptMap[dept]) {
      if (item.status === 'PRESENT') deptMap[dept].present += 1;
      if (item.status === 'WFH') deptMap[dept].wfh += 1;
      if (item.status === 'ABSENT') deptMap[dept].absent += 1;
      if (item.status === 'HALF_DAY') deptMap[dept].halfDay += 1;
    }
  });

  return {
    date: formatDateKey(targetDate),
    totalEmployees,
    presentToday,
    wfhToday,
    absentToday,
    halfDayToday,
    leaveToday,
    holidayToday,
    overallPercentage,
    isFinalized: daily.isFinalized,
    departmentBreakdown: Object.entries(deptMap).map(([department, data]) => {
      const { percentage } = calculateAttendancePercentage({
        present: data.present,
        wfh: data.wfh,
        halfDay: data.halfDay,
        absent: data.absent,
      });
      return {
        department,
        total: data.total,
        present: data.present,
        wfh: data.wfh,
        absent: data.absent,
        halfDay: data.halfDay,
        percentage,
      };
    }),
  };
}

/**
 * 8. GET Monthly Attendance Report for Export & Analytics
 */
export async function getMonthlyAttendanceReportService(
  year: number,
  month: number,
  caller?: AttendanceAuthUser | null
) {
  await syncEmployeeProfilesService();
  const directory = await getEmployeeDirectoryService(undefined, caller);

  // Determine start and end of month in UTC
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const daysInMonth = endDate.getUTCDate();

  const records = await db.employeeAttendance.findMany({
    where: {
      attendanceDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      employeeId: true,
      attendanceDate: true,
      status: true,
      remarks: true,
      isFinalized: true,
    },
  });

  // Map employeeId -> dateKey -> record
  const empMap = new Map<string, Map<string, any>>();
  directory.forEach((emp) => empMap.set(emp.id, new Map()));

  records.forEach((r: any) => {
    const key = formatDateKey(new Date(r.attendanceDate));
    const subMap = empMap.get(r.employeeId);
    if (subMap) {
      subMap.set(key, r);
    }
  });

  const employeeRows = directory.map((emp) => {
    const subMap = empMap.get(emp.id) || new Map();
    const daysData: Record<number, string> = {};

    let present = 0;
    let wfh = 0;
    let halfDay = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rec = subMap.get(dateKey);
      const status = rec ? rec.status : 'NOT_MARKED';
      daysData[day] = status;

      if (status === 'PRESENT') present++;
      if (status === 'WFH') wfh++;
      if (status === 'HALF_DAY') halfDay++;
      if (status === 'ABSENT') absent++;
      if (status === 'LEAVE') leave++;
      if (status === 'HOLIDAY') holiday++;
    }

    const { credits, totalWorkingDays, percentage } = calculateAttendancePercentage({
      present,
      wfh,
      halfDay,
      absent,
    });

    return {
      id: emp.id,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      designation: emp.designation,
      present,
      wfh,
      halfDay,
      absent,
      leave,
      holiday,
      attendanceCredits: credits,
      totalWorkingDays,
      attendancePercentage: percentage,
      days: daysData,
    };
  });

  return {
    year,
    month,
    daysInMonth,
    totalEmployees: directory.length,
    rows: employeeRows,
  };
}

/**
 * 9. POST / Publish Daily Attendance Roster (Super Admin Only)
 * Creates a date-specific snapshot in DailyAttendanceRoster.
 * Akshay Kumar can only view and capture attendance for employees included in this published snapshot.
 */
export async function publishDailyRosterService(params: {
  attendanceDate: string | Date;
  employeeIds: string[];
  publisherId: string;
  publisherEmail: string;
}) {
  const isAuthorized = isSuperAdminAttendanceUser({
    userId: params.publisherId,
    email: params.publisherEmail,
  });

  if (!isAuthorized) {
    throw new Error(
      `Forbidden: Only Super Admin (${SUPER_ADMIN_ATTENDANCE_EMAIL}) has authority to publish daily rosters.`
    );
  }

  const targetDate = normalizeAttendanceDate(params.attendanceDate);

  if (!Array.isArray(params.employeeIds) || params.employeeIds.length === 0) {
    throw new Error('Please select at least one employee to include in the daily roster.');
  }

  const uniqueEmployeeIds = Array.from(new Set(params.employeeIds));

  // Perform transactional upserts for the snapshot
  const ops = uniqueEmployeeIds.map((empId) =>
    db.dailyAttendanceRoster.upsert({
      where: {
        attendanceDate_employeeId: {
          attendanceDate: targetDate,
          employeeId: empId,
        },
      },
      create: {
        attendanceDate: targetDate,
        employeeId: empId,
        publishedById: params.publisherId,
        publishedAt: new Date(),
      },
      update: {
        publishedById: params.publisherId,
        publishedAt: new Date(),
      },
    })
  );

  await prisma.$transaction(ops);

  return {
    success: true,
    count: uniqueEmployeeIds.length,
    date: formatDateKey(targetDate),
    publishedAt: new Date().toISOString(),
  };
}

/**
 * 10. GET Daily Attendance Roster for a Date
 */
export async function getDailyRosterService(dateInput: string | Date, caller?: AttendanceAuthUser | null) {
  const targetDate = normalizeAttendanceDate(dateInput);
  const isSuperAdmin = caller ? isSuperAdminAttendanceUser(caller) : false;
  const isTestingMode = await isAttendanceTestingModeActive();

  const entries = await db.dailyAttendanceRoster.findMany({
    where: { attendanceDate: targetDate },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          employeeProfile: true,
        },
      },
      publishedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  let filteredEntries = entries;
  if (!isSuperAdmin && !isTestingMode) {
    filteredEntries = entries.filter((e: any) => !isAttendanceTestingEmail(e.employee?.email));
  }

  const isPublished = filteredEntries.length > 0;
  const publishedAt = isPublished ? filteredEntries[0].publishedAt.toISOString() : null;
  const publishedBy = isPublished ? (filteredEntries[0].publishedBy?.name || filteredEntries[0].publishedBy?.email) : null;

  return {
    date: formatDateKey(targetDate),
    isPublished,
    publishedAt,
    publishedBy,
    totalCount: filteredEntries.length,
    employeeIds: filteredEntries.map((e: any) => e.employeeId),
    entries: filteredEntries.map((e: any) => ({
      id: e.id,
      employeeId: e.employeeId,
      name: e.employee?.name || 'Unnamed',
      email: e.employee?.email || '',
      department: e.employee?.employeeProfile?.department || 'Academics & Faculty',
      designation: e.employee?.employeeProfile?.designation || 'Faculty Member',
      status: e.employee?.employeeProfile?.status || 'ACTIVE',
      attendanceEligible: e.employee?.employeeProfile?.attendanceEligible ?? true,
      isTestingUser: isAttendanceTestingEmail(e.employee?.email),
    })),
  };
}

/**
 * 11. POST / Create Employee Record (Super Admin Only)
 */
export async function createEmployeeRecordService(params: {
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  designation: string;
  joiningDate?: string | Date;
  status?: string;
  attendanceEligible?: boolean;
  linkUserId?: string;
  adminId: string;
  adminEmail: string;
}) {
  const isAuthorized = isSuperAdminAttendanceUser({
    userId: params.adminId,
    email: params.adminEmail,
  });

  if (!isAuthorized) {
    throw new Error('Forbidden: Only Super Admin can register employees.');
  }

  const cleanEmployeeId = params.employeeId.trim().toUpperCase();
  const cleanName = params.name.trim();

  // Check unique employeeId
  const existingProfile = await db.employeeProfile.findUnique({
    where: { employeeId: cleanEmployeeId },
  });

  if (existingProfile) {
    throw new Error(`An employee with ID "${cleanEmployeeId}" already exists.`);
  }

  let targetUserId = params.linkUserId;

  if (targetUserId) {
    const userProfile = await db.employeeProfile.findUnique({
      where: { userId: targetUserId },
    });
    if (userProfile) {
      throw new Error('Selected account is already linked to another employee profile.');
    }
  } else {
    const cleanEmail = params.email?.trim().toLowerCase();
    if (cleanEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingUser) {
        targetUserId = existingUser.id;
      }
    }

    if (!targetUserId) {
      const generatedEmail = cleanEmail || `employee.${cleanEmployeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@threadsecurity.org`;
      const newUser = await prisma.user.create({
        data: {
          name: cleanName,
          email: generatedEmail,
          role: 'STAFF_JUNIOR',
          isDashboardAccessGranted: false,
          passwordHash: 'MFA_OTP_ONLY',
          isActive: true,
        },
      });
      targetUserId = newUser.id;
    }
  }

  const createdProfile = await db.employeeProfile.create({
    data: {
      userId: targetUserId,
      employeeId: cleanEmployeeId,
      department: params.department.trim(),
      designation: params.designation.trim(),
      joiningDate: params.joiningDate ? new Date(params.joiningDate) : new Date(),
      status: params.status || 'ACTIVE',
      attendanceEligible: params.attendanceEligible ?? true,
      phone: params.phone?.trim() || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return createdProfile;
}

/**
 * 12. PATCH / Update Employee Record (Super Admin Only)
 */
export async function updateEmployeeRecordService(params: {
  employeeId: string;
  name?: string;
  department?: string;
  designation?: string;
  status?: string;
  attendanceEligible?: boolean;
  phone?: string;
  adminId: string;
  adminEmail: string;
}) {
  const isAuthorized = isSuperAdminAttendanceUser({
    userId: params.adminId,
    email: params.adminEmail,
  });

  if (!isAuthorized) {
    throw new Error('Forbidden: Only Super Admin can modify employee records.');
  }

  const profile = await db.employeeProfile.findUnique({
    where: { employeeId: params.employeeId },
    include: { user: true },
  });

  if (!profile) {
    throw new Error(`Employee with ID ${params.employeeId} not found.`);
  }

  if (params.name?.trim() && profile.userId) {
    await prisma.user.update({
      where: { id: profile.userId },
      data: { name: params.name.trim() },
    });
  }

  const updatedProfile = await db.employeeProfile.update({
    where: { employeeId: params.employeeId },
    data: {
      ...(params.department ? { department: params.department.trim() } : {}),
      ...(params.designation ? { designation: params.designation.trim() } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(typeof params.attendanceEligible === 'boolean' ? { attendanceEligible: params.attendanceEligible } : {}),
      ...(params.phone !== undefined ? { phone: params.phone?.trim() || null } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return updatedProfile;
}

/**
 * 13. Toggle Employee Status (Activate/Deactivate)
 * Never deletes historical attendance records.
 */
export async function toggleEmployeeStatusService(
  employeeId: string,
  newStatus: 'ACTIVE' | 'INACTIVE',
  adminId: string,
  adminEmail: string
) {
  const isAuthorized = isSuperAdminAttendanceUser({
    userId: adminId,
    email: adminEmail,
  });

  if (!isAuthorized) {
    throw new Error('Forbidden: Only Super Admin can change employee activation status.');
  }

  const updated = await db.employeeProfile.update({
    where: { employeeId },
    data: { status: newStatus },
  });

  return updated;
}

/**
 * 14. Toggle Employee Attendance Eligibility
 */
export async function toggleEmployeeEligibilityService(
  employeeId: string,
  eligible: boolean,
  adminId: string,
  adminEmail: string
) {
  const isAuthorized = isSuperAdminAttendanceUser({
    userId: adminId,
    email: adminEmail,
  });

  if (!isAuthorized) {
    throw new Error('Forbidden: Only Super Admin can manage attendance eligibility.');
  }

  const updated = await db.employeeProfile.update({
    where: { employeeId },
    data: { attendanceEligible: eligible },
  });

  return updated;
}

