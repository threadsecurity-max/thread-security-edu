import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { isSuperAdminAttendanceUser } from '@/lib/auth/employee-attendance-auth';
import {
  getEmployeeDirectoryService,
  getDailyAttendanceService,
  formatDateKey,
} from '@/server/services/employee-attendance.service';
import { SuperAdminCorrectionClient } from '@/components/admin/employee-attendance/SuperAdminCorrectionClient';

export const metadata: Metadata = {
  title: 'Super Admin Attendance Rectification | Thread Security',
  description: 'Exclusive Super Admin override console with mandatory audit log tracking.',
};

export const revalidate = 0;

export default async function AttendanceCorrectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getSession();

  // STRICT SECURITY VALIDATION: Only Super Admin (threadsecurity@gmail.com)
  if (!session || !isSuperAdminAttendanceUser(session)) {
    redirect('/admin/employee-attendance?error=SuperAdminRequired');
  }

  const { date } = await searchParams;
  const targetDateStr = date || formatDateKey(new Date());

  const [directory, daily] = await Promise.all([
    getEmployeeDirectoryService(),
    getDailyAttendanceService(targetDateStr),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SuperAdminCorrectionClient
        currentUser={session}
        employees={JSON.parse(JSON.stringify(directory || []))}
        initialDaily={JSON.parse(JSON.stringify(daily || {}))}
        initialDate={targetDateStr}
      />
    </div>
  );
}

