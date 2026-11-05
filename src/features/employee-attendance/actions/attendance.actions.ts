'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/session';
import {
  canAccessEmployeeAttendance,
  canCaptureEmployeeAttendance,
  canRectifyEmployeeAttendance,
  isSuperAdminAttendanceUser,
} from '@/lib/auth/employee-attendance-auth';
import {
  getDailyAttendanceService,
  captureDailyAttendanceService,
  getEmployeeDirectoryService,
  getEmployeeAttendanceProfileService,
  rectifyAttendanceRecordService,
  getAttendanceAuditHistoryService,
  getAttendanceAnalyticsOverviewService,
  getMonthlyAttendanceReportService,
  getAttendanceWindowStatus,
  publishDailyRosterService,
  getDailyRosterService,
  createEmployeeRecordService,
  updateEmployeeRecordService,
  toggleEmployeeStatusService,
  toggleEmployeeEligibilityService,
} from '@/server/services/employee-attendance.service';
import { EmployeeAttendanceStatus } from '@prisma/client';

/**
 * 1. GET Dashboard Overview Metrics & Daily Overview
 */
export async function getEmployeeAttendanceOverviewAction(dateInput?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !canAccessEmployeeAttendance(user)) {
      return { success: false, error: 'Unauthorized: Access restricted to authorized personnel.', data: null };
    }

    const data = await getAttendanceAnalyticsOverviewService(dateInput);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch overview metrics';
    return { success: false, error: msg, data: null };
  }
}

/**
 * 2. GET Daily Attendance by Date & Department
 */
export async function getDailyAttendanceAction(date: string, department?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !canAccessEmployeeAttendance(user)) {
      return { success: false, error: 'Unauthorized: Access restricted.', data: null };
    }

    const data = await getDailyAttendanceService(date, department);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch daily attendance';
    return { success: false, error: msg, data: null };
  }
}

/**
 * 3. POST / Capture Daily Attendance (Save Draft or Submit & Finalize)
 * Attendance Manager (Akshay Kumar) & Super Admin can capture and submit.
 * STRICT ENFORCEMENT: Once finalized, Attendance Manager CANNOT overwrite or rectify.
 */
export async function captureEmployeeAttendanceAction(params: {
  date: string;
  records: Array<{
    employeeId: string;
    status: EmployeeAttendanceStatus;
    remarks?: string;
  }>;
  isFinalized?: boolean;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !canCaptureEmployeeAttendance(user)) {
      return { success: false, error: 'Unauthorized: Cannot capture employee attendance.' };
    }

    const result = await captureDailyAttendanceService({
      date: params.date,
      records: params.records,
      markedById: user.userId,
      markedByEmail: user.email || '',
      isFinalized: params.isFinalized ?? true,
    });

    revalidatePath('/admin/employee-attendance');
    revalidatePath('/admin/employee-attendance/capture');
    revalidatePath('/admin/employee-attendance/directory');

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit attendance';
    return { success: false, error: msg };
  }
}

/**
 * 4. PATCH / Super Admin Exclusive Rectification Action
 * STRICT BACKEND VALIDATION:
 * Validates authenticated user is threadsecurity@gmail.com / SUPER_ADMIN.
 * Non-super admin requests are strictly rejected with 403 Forbidden.
 */
export async function rectifyEmployeeAttendanceAction(params: {
  attendanceId: string;
  newStatus: EmployeeAttendanceStatus;
  remarks: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required.' };
    }

    if (!canRectifyEmployeeAttendance(user)) {
      return {
        success: false,
        error: 'Forbidden: Only Super Admin (threadsecurity@gmail.com) has authority to rectify historical attendance.',
      };
    }

    const result = await rectifyAttendanceRecordService({
      attendanceId: params.attendanceId,
      newStatus: params.newStatus,
      remarks: params.remarks,
      superAdminId: user.userId,
      superAdminEmail: user.email || '',
    });

    revalidatePath('/admin/employee-attendance');
    revalidatePath('/admin/employee-attendance/corrections');
    revalidatePath('/admin/employee-attendance/audit');

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to rectify attendance record';
    return { success: false, error: msg };
  }
}

/**
 * 5. GET Individual Employee Attendance Profile & Monthly Calendar
 */
export async function getEmployeeAttendanceDetailAction(
  employeeId: string,
  year?: number,
  month?: number
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required.', data: null };
    }
    // Allow if user has attendance management clearance OR if they are requesting their OWN attendance!
    if (!canAccessEmployeeAttendance(user) && user.userId !== employeeId) {
      return { success: false, error: 'Unauthorized to view employee profile.', data: null };
    }

    const data = await getEmployeeAttendanceProfileService(employeeId, year, month);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch employee attendance detail';
    return { success: false, error: msg, data: null };
  }
}

/**
 * 6. GET Audit History (Super Admin Only)
 */
export async function getAttendanceAuditHistoryAction(filters?: {
  employeeId?: string;
  take?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminAttendanceUser(user)) {
      return { success: false, error: 'Forbidden: Audit history is restricted to Super Admin.', data: [] };
    }

    const data = await getAttendanceAuditHistoryService(filters);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch audit history';
    return { success: false, error: msg, data: [] };
  }
}

/**
 * 7. GET Monthly Report for Analytics & Export
 */
export async function getMonthlyAttendanceReportAction(year: number, month: number) {
  try {
    const user = await getCurrentUser();
    if (!user || !canAccessEmployeeAttendance(user)) {
      return { success: false, error: 'Unauthorized.', data: null };
    }

    const data = await getMonthlyAttendanceReportService(year, month);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch monthly report';
    return { success: false, error: msg, data: null };
  }
}

/**
 * 8. GET Authoritative Server-Side Attendance Window Status
 */
export async function getAttendanceWindowStatusAction(targetDate?: string) {
  try {
    const data = getAttendanceWindowStatus(targetDate);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get window status';
    return { success: false, error: msg, data: null };
  }
}

/**
 * 9. POST / Publish Daily Attendance Roster (Super Admin Only)
 */
export async function publishDailyRosterAction(params: {
  attendanceDate: string;
  employeeIds: string[];
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminAttendanceUser(user)) {
      return { success: false, error: 'Forbidden: Only Super Admin can publish the daily attendance roster.' };
    }

    const result = await publishDailyRosterService({
      attendanceDate: params.attendanceDate,
      employeeIds: params.employeeIds,
      publisherId: user.userId,
      publisherEmail: user.email || '',
    });

    revalidatePath('/admin/employee-attendance');
    revalidatePath('/admin/employee-attendance/capture');
    revalidatePath('/admin/employee-attendance/roster');

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish roster';
    return { success: false, error: msg };
  }
}

/**
 * 10. GET Daily Attendance Roster
 */
export async function getDailyRosterAction(date: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !canAccessEmployeeAttendance(user)) {
      return { success: false, error: 'Unauthorized.', data: null };
    }

    const data = await getDailyRosterService(date);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch roster';
    return { success: false, error: msg, data: null };
  }
}

/**
 * 11. POST / Register New Employee (Super Admin Only)
 */
export async function createEmployeeAction(params: {
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  designation: string;
  joiningDate?: string;
  status?: string;
  attendanceEligible?: boolean;
  linkUserId?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminAttendanceUser(user)) {
      return { success: false, error: 'Forbidden: Only Super Admin can register employees.' };
    }

    const result = await createEmployeeRecordService({
      ...params,
      adminId: user.userId,
      adminEmail: user.email || '',
    });

    revalidatePath('/admin/employee-attendance/directory');
    revalidatePath('/admin/employee-attendance/roster');

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to register employee';
    return { success: false, error: msg };
  }
}

/**
 * 12. PATCH / Update Employee Record (Super Admin Only)
 */
export async function updateEmployeeAction(params: {
  employeeId: string;
  name?: string;
  department?: string;
  designation?: string;
  status?: string;
  attendanceEligible?: boolean;
  phone?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminAttendanceUser(user)) {
      return { success: false, error: 'Forbidden: Only Super Admin can modify employee records.' };
    }

    const result = await updateEmployeeRecordService({
      ...params,
      adminId: user.userId,
      adminEmail: user.email || '',
    });

    revalidatePath('/admin/employee-attendance/directory');
    revalidatePath('/admin/employee-attendance/roster');

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update employee';
    return { success: false, error: msg };
  }
}

/**
 * 13. PATCH / Toggle Employee Activation (Activate/Deactivate)
 */
export async function toggleEmployeeStatusAction(employeeId: string, status: 'ACTIVE' | 'INACTIVE') {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminAttendanceUser(user)) {
      return { success: false, error: 'Forbidden: Only Super Admin can activate or deactivate employees.' };
    }

    const result = await toggleEmployeeStatusService(employeeId, status, user.userId, user.email || '');
    revalidatePath('/admin/employee-attendance/directory');
    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update employee status';
    return { success: false, error: msg };
  }
}

/**
 * 14. PATCH / Toggle Employee Attendance Eligibility
 */
export async function toggleEmployeeEligibilityAction(employeeId: string, eligible: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminAttendanceUser(user)) {
      return { success: false, error: 'Forbidden: Only Super Admin can update attendance eligibility.' };
    }

    const result = await toggleEmployeeEligibilityService(employeeId, eligible, user.userId, user.email || '');
    revalidatePath('/admin/employee-attendance/directory');
    revalidatePath('/admin/employee-attendance/roster');
    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update eligibility';
    return { success: false, error: msg };
  }
}

