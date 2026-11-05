import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { getMonthlyAttendanceReportService } from '@/server/services/employee-attendance.service';
import { AttendanceReportsClient } from '@/components/admin/employee-attendance/AttendanceReportsClient';

export const metadata: Metadata = {
  title: 'Attendance Reports & CSV Export | Thread Security Admin',
  description: 'Monthly employee attendance reporting matrix, printable registers, and CSV export engine.',
};

export const revalidate = 0;

export default async function AttendanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await getSession();

  if (!session || !canAccessEmployeeAttendance(session)) {
    redirect('/login?error=UnauthorizedAttendanceAccess');
  }

  const { year: yStr, month: mStr } = await searchParams;
  const now = new Date();
  const year = yStr ? parseInt(yStr, 10) : now.getUTCFullYear();
  const month = mStr ? parseInt(mStr, 10) : now.getUTCMonth() + 1;

  const report = await getMonthlyAttendanceReportService(year, month);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AttendanceReportsClient initialReport={JSON.parse(JSON.stringify(report))} />
    </div>
  );
}

