import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getEmployeeAttendanceProfileService } from '@/server/services/employee-attendance.service';
import { EmployeeAttendanceProfileClient } from '@/components/admin/employee-attendance/EmployeeAttendanceProfileClient';

export const metadata: Metadata = {
  title: 'My Attendance Standing | Thread Security Staff',
  description: 'Personal employee attendance ledger, monthly calendar, credit percentage standing, and day-to-day records.',
};

export const revalidate = 0;

export default async function StaffMyAttendancePage() {
  const session = await getSession();

  const allowedRoles = [
    'STAFF_EXECUTIVE',
    'STAFF_JUNIOR',
    'SUPER_ADMIN',
    'ADMIN',
    'ACADEMIC_ADMIN',
    'SECURITY_ADMIN',
  ];

  if (!session || !allowedRoles.includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  try {
    const profileData = await getEmployeeAttendanceProfileService(session.userId);

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <EmployeeAttendanceProfileClient
          currentUser={session}
          initialData={JSON.parse(JSON.stringify(profileData))}
          isPersonalView={true}
          returnHref="/staff"
        />
      </div>
    );
  } catch (err) {
    console.error('[StaffMyAttendancePage] Failed to fetch personal attendance:', err);
    return (
      <div className="p-12 text-center text-slate-400">
        <h2 className="text-base font-bold text-white">Attendance Profile Initializing</h2>
        <p className="text-xs text-slate-400 mt-1">
          Your staff attendance profile is synchronizing with the central registry. Please refresh in a moment.
        </p>
      </div>
    );
  }
}

