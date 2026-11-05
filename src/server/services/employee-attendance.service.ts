import { prisma } from '../database/prisma';
import {
  SUPER_ADMIN_ATTENDANCE_EMAIL,
  isSuperAdminAttendanceUser,
} from '@/lib/auth/employee-attendance-auth';
import { EmployeeAttendanceStatus } from '@prisma/client';

const db = prisma as any;

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
      },
    });
  }
}

/**
 * 1. GET Employee Directory with profiles and real-time attendance stats
 */
export async function getEmployeeDirectoryService(filters?: {
  department?: string;
  search?: string;
}) {
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

  return employees.map((emp) => {
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
    };
  });
}

/**
 * 2. GET Daily Attendance for a given date
 */
export async function getDailyAttendanceService(dateInput: string | Date, department?: string) {
  await syncEmployeeProfilesService();
  const targetDate = normalizeAttendanceDate(dateInput);

  // Fetch all operational employees
  const directory = await getEmployeeDirectoryService(department && department !== 'ALL' ? { department } : undefined);

  // Fetch attendance records for this date
  const records = await db.employeeAttendance.findMany({
    where: {
      attendanceDate: targetDate,
    },
    include: {
      markedBy: {
        select: { id: true, name: true, email: true },
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
      remarks: existing?.remarks || '',
      isMarked: Boolean(existing),
      isFinalized: existing?.isFinalized ?? false,
      markedBy: existing?.markedBy || null,
      submittedAt: existing?.submittedAt ? existing.submittedAt.toISOString() : null,
      updatedAt: existing?.updatedAt ? existing.updatedAt.toISOString() : null,
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
 * Enforces strict locking: Once finalized, Attendance Manager CANNOT overwrite.
 * Only Super Admin (threadsecurity@gmail.com) can update finalized records.
 */
export async function captureDailyAttendanceService(params: {
  date: string | Date;
  records: Array<{
    employeeId: string;
    status: EmployeeAttendanceStatus;
    remarks?: string;
  }>;
  markedById: string;
  markedByEmail: string;
  isFinalized?: boolean;
}) {
  const targetDate = normalizeAttendanceDate(params.date);
  const isFinalized = params.isFinalized ?? true;

  // 1. Check if attendance for this date is already finalized
  const existingRecords = await db.employeeAttendance.findMany({
    where: { attendanceDate: targetDate },
    select: { id: true, isFinalized: true },
  });

  const isAlreadyFinalized = existingRecords.some((r: any) => r.isFinalized);

  if (isAlreadyFinalized) {
    const isSuperAdmin = isSuperAdminAttendanceUser({
      userId: params.markedById,
      email: params.markedByEmail,
    });

    if (!isSuperAdmin) {
      throw new Error(
        'Forbidden: Attendance for this date has already been finalized and locked. Only Super Admin has rectification authority.'
      );
    }
  }

  // 2. Perform atomic batch upsert inside transaction
  const upsertOps = params.records.map((rec) => {
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
        remarks: rec.remarks || null,
        markedById: params.markedById,
        isFinalized,
        submittedAt: new Date(),
      },
      update: {
        status: rec.status,
        remarks: rec.remarks || null,
        markedById: params.markedById,
        isFinalized,
        updatedAt: new Date(),
      },
    });
  });

  await prisma.$transaction(upsertOps);

  return {
    success: true,
    count: params.records.length,
    date: formatDateKey(targetDate),
    isFinalized,
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
  attendanceId: string;
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

  const existing = await db.employeeAttendance.findUnique({
    where: { id: params.attendanceId },
    include: {
      employee: { select: { id: true, name: true, email: true } },
    },
  });

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
export async function getAttendanceAnalyticsOverviewService(dateInput?: string | Date) {
  const targetDate = normalizeAttendanceDate(dateInput || new Date());
  const daily = await getDailyAttendanceService(targetDate);
  const directory = await getEmployeeDirectoryService();

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
export async function getMonthlyAttendanceReportService(year: number, month: number) {
  await syncEmployeeProfilesService();
  const directory = await getEmployeeDirectoryService();

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

