import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { isSuperAdminAttendanceUser } from '@/lib/auth/employee-attendance-auth';
import { getAttendanceAuditHistoryService } from '@/server/services/employee-attendance.service';
import { AttendanceAuditHistoryClient } from '@/components/admin/employee-attendance/AttendanceAuditHistoryClient';

export const metadata: Metadata = {
  title: 'Attendance Audit History | Thread Security Admin',
  description: 'Immutable historical audit logs for all employee attendance rectifications.',
};

export const revalidate = 0;

export default async function AttendanceAuditHistoryPage() {
  const session = await getSession();

  // STRICT AUTHORIZATION: Only Super Admin (threadsecurity@gmail.com)
  if (!session || !isSuperAdminAttendanceUser(session)) {
    redirect('/admin/employee-attendance?error=SuperAdminRequired');
  }

  const logs = await getAttendanceAuditHistoryService();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AttendanceAuditHistoryClient logs={JSON.parse(JSON.stringify(logs || []))} />
    </div>
  );
}

