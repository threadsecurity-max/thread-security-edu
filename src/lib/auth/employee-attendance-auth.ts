/**
 * Employee Attendance Management Authorization Engine
 *
 * Strict Server & Client Safe Access Control:
 * 1. Super Admin: threadsecurity@gmail.com (Full access + Exclusive Rectification & Audit Authority)
 * 2. Attendance Manager: akshay.kumar@threadsecurity.org (Capture, Submit & Finalize, Directory, Reports, View Calendars)
 *    STRICT RESTRICTION: Attendance Manager CANNOT edit, delete, or rectify historical finalized attendance.
 */

export const SUPER_ADMIN_ATTENDANCE_EMAIL = 'threadsecurity@gmail.com';
export const ATTENDANCE_MANAGER_EMAIL = 'akshay.kumar@threadsecurity.org';

/**
 * Designated Testing Accounts:
 * These accounts are testing users and MUST NEVER appear in attendance operations
 * for Attendance Coordinator (Akshay Kumar) unless Super Admin explicitly enables Testing Mode.
 */
export const ATTENDANCE_TESTING_USER_EMAILS = [
  'staff.junior@threadsecurity.org',
  'staff.executive@threadsecurity.org',
  'threadsecuritymentor@gmail.com',
  'threadsecurity@gmail.com',
];

export function isAttendanceTestingEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ATTENDANCE_TESTING_USER_EMAILS.some((testEmail) => testEmail.toLowerCase() === clean);
}

export interface AttendanceAuthUser {
  userId?: string | null;
  email?: string | null;
  role?: string | null;
  name?: string | null;
}

/**
 * Checks if user is the designated Super Admin with exclusive rectification authority
 */
export function isSuperAdminAttendanceUser(user?: AttendanceAuthUser | null): boolean {
  if (!user || !user.email) return false;
  const emailMatch = user.email.trim().toLowerCase() === SUPER_ADMIN_ATTENDANCE_EMAIL.toLowerCase();
  const roleMatch = (user.role || '').toUpperCase() === 'SUPER_ADMIN';
  return emailMatch || roleMatch;
}

/**
 * Checks if user is the authorized Attendance Manager (Akshay Kumar)
 */
export function isAttendanceManagerUser(user?: AttendanceAuthUser | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const name = (user.name || '').trim().toLowerCase();
  const userId = user.userId || '';

  return (
    email === ATTENDANCE_MANAGER_EMAIL.toLowerCase() ||
    email.includes('akshay') ||
    name.includes('akshay kumar') ||
    userId === 'cmv6l9la40000c9014xt46hcv'
  );
}

/**
 * Checks if user is allowed to access the Employee Attendance System
 * (Super Admin OR Akshay Kumar / Attendance Manager OR Admin roles)
 */
export function canAccessEmployeeAttendance(user?: AttendanceAuthUser | null): boolean {
  if (!user) return false;
  if (isSuperAdminAttendanceUser(user)) return true;
  if (isAttendanceManagerUser(user)) return true;

  const role = (user.role || '').toUpperCase();
  return ['SUPER_ADMIN', 'ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(role);
}

/**
 * Checks if user can capture / submit daily attendance
 */
export function canCaptureEmployeeAttendance(user?: AttendanceAuthUser | null): boolean {
  return canAccessEmployeeAttendance(user);
}

/**
 * Checks if user can rectify / edit historical or finalized attendance records
 * STRICT REQUIREMENT: Only Super Admin (threadsecurity@gmail.com) can rectify attendance.
 * Akshay Kumar / Attendance Manager is STRICTLY FORBIDDEN from rectifying finalized records.
 */
export function canRectifyEmployeeAttendance(user?: AttendanceAuthUser | null): boolean {
  return isSuperAdminAttendanceUser(user);
}

