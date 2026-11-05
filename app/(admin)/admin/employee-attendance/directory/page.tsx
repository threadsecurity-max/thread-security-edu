import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { getEmployeeDirectoryService } from '@/server/services/employee-attendance.service';
import { EmployeeDirectoryClient } from '@/components/admin/employee-attendance/EmployeeDirectoryClient';

export const metadata: Metadata = {
  title: 'Employee Directory & Attendance Roster | Thread Security Admin',
  description: 'Complete employee roster with department mapping, designation, and lifetime attendance calculations.',
};

export const revalidate = 0;

export default async function EmployeeDirectoryPage() {
  const session = await getSession();

  if (!session || !canAccessEmployeeAttendance(session)) {
    redirect('/login?error=UnauthorizedAttendanceAccess');
  }

  const directory = await getEmployeeDirectoryService();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EmployeeDirectoryClient
        currentUser={session}
        initialDirectory={JSON.parse(JSON.stringify(directory || []))}
      />
    </div>
  );
}

