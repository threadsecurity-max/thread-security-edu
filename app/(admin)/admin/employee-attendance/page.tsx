import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import {
  getDailyAttendanceService,
  getAttendanceAnalyticsOverviewService,
  formatDateKey,
} from '@/server/services/employee-attendance.service';
import { EmployeeAttendanceDashboardClient } from '@/components/admin/employee-attendance/EmployeeAttendanceDashboardClient';

export const metadata: Metadata = {
  title: 'Employee Attendance Management | Thread Security Admin',
  description: 'Enterprise operational employee attendance dashboard, percentage metrics, and hierarchical audit governance.',
};

export const revalidate = 0;

export default async function EmployeeAttendanceDashboardPage() {
  const session = await getSession();

  if (!session || !canAccessEmployeeAttendance(session)) {
    redirect('/login?error=UnauthorizedAttendanceAccess');
  }

  const todayStr = formatDateKey(new Date());

  const [overview, daily] = await Promise.all([
    getAttendanceAnalyticsOverviewService(todayStr).catch(() => null),
    getDailyAttendanceService(todayStr).catch(() => null),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EmployeeAttendanceDashboardClient
        currentUser={session}
        initialOverview={JSON.parse(JSON.stringify(overview || {}))}
        initialDaily={JSON.parse(JSON.stringify(daily || {}))}
        initialDate={todayStr}
      />
    </div>
  );
}

