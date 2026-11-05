import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getEmployeeAttendanceProfileService } from '@/server/services/employee-attendance.service';
import { EmployeeAttendanceProfileClient } from '@/components/admin/employee-attendance/EmployeeAttendanceProfileClient';

export const metadata: Metadata = {
  title: 'My Attendance & Standing | Thread Security Faculty Workspace',
  description: 'Personal employee attendance ledger, monthly interactive calendar, credit formula standing, and duty logs.',
};

export const revalidate = 0;

export default async function MentorMyAttendancePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login?error=UnauthorizedAccess');
  }

  try {
    const profileData = await getEmployeeAttendanceProfileService(session.userId);

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EmployeeAttendanceProfileClient
          currentUser={session}
          initialData={JSON.parse(JSON.stringify(profileData))}
          isPersonalView={true}
          returnHref="/mentor"
        />
      </div>
    );
  } catch (err) {
    console.error('[MentorMyAttendancePage] Failed to fetch personal attendance:', err);
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-base font-bold text-slate-900">Attendance Profile Initializing</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your employee attendance record is being synchronized with the operational registry. Please refresh in a moment.
        </p>
      </div>
    );
  }
}
