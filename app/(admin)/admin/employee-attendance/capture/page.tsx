import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { canCaptureEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import {
  getEmployeeDirectoryService,
  getDailyAttendanceService,
  formatDateKey,
  normalizeAttendanceDate,
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

  const resolvedParams = searchParams ? await searchParams : {};
  const dateParam = resolvedParams?.date;

  let targetDateStr = formatDateKey(new Date());
  if (dateParam) {
    try {
      const cleaned = decodeURIComponent(dateParam).trim().replace(/[\s_/]+/g, '-');
      const d = normalizeAttendanceDate(cleaned);
      targetDateStr = formatDateKey(d);
    } catch {
      targetDateStr = formatDateKey(new Date());
    }
  }

  let directory: any[] = [];
  let daily: any = null;

  try {
    const results = await Promise.all([
      getEmployeeDirectoryService(undefined, session).catch((err) => {
        console.error('[CaptureEmployeeAttendancePage] Error fetching directory:', err);
        return [];
      }),
      getDailyAttendanceService(targetDateStr, undefined, session).catch((err) => {
        console.error('[CaptureEmployeeAttendancePage] Error fetching daily attendance:', err);
        return null;
      }),
    ]);
    directory = results[0] || [];
    daily = results[1] || null;
  } catch (err) {
    console.error('[CaptureEmployeeAttendancePage] Unexpected load failure:', err);
  }

  const initialRecords = (daily?.items || [])
    .filter((item: any) => item && (item.employee?.id || item.employeeId))
    .map((item: any) => ({
      employeeId: item.employee?.id || item.employeeId,
      status: item.status || 'PRESENT',
      remarks: item.remarks || '',
    }));

  const cleanEmployees = (directory || []).filter((emp: any) => emp && emp.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CaptureEmployeeAttendanceClient
        currentUser={session}
        employees={JSON.parse(JSON.stringify(cleanEmployees))}
        initialRecords={JSON.parse(JSON.stringify(initialRecords))}
        initialDate={targetDateStr}
        isDateFinalized={Boolean(daily?.isFinalized)}
      />
    </div>
  );
}

