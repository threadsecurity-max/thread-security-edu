import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { canCaptureEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import {
  getEmployeeDirectoryService,
  getDailyAttendanceService,
  formatDateKey,
} from '@/server/services/employee-attendance.service';
import { CaptureEmployeeAttendanceClient } from '@/components/admin/employee-attendance/CaptureEmployeeAttendanceClient';

export const metadata: Metadata = {
  title: 'Capture Employee Attendance | Thread Security Admin',
  description: 'Daily employee attendance capture, shift registers, and bulk verification interface.',
};

export const revalidate = 0;

export default async function CaptureEmployeeAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getSession();

  if (!session || !canCaptureEmployeeAttendance(session)) {
    redirect('/login?error=UnauthorizedAttendanceAccess');
  }

  const { date } = await searchParams;
  const targetDateStr = date || formatDateKey(new Date());

  const [directory, daily] = await Promise.all([
    getEmployeeDirectoryService(),
    getDailyAttendanceService(targetDateStr),
  ]);

  const initialRecords = (daily?.items || []).map((item: any) => ({
    employeeId: item.employee.id,
    status: item.status,
    remarks: item.remarks,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CaptureEmployeeAttendanceClient
        currentUser={session}
        employees={JSON.parse(JSON.stringify(directory || []))}
        initialRecords={JSON.parse(JSON.stringify(initialRecords || []))}
        initialDate={targetDateStr}
        isDateFinalized={Boolean(daily?.isFinalized)}
      />
    </div>
  );
}

