import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeAttendance } from '@/lib/auth/employee-attendance-auth';
import { getEmployeeAttendanceProfileService } from '@/server/services/employee-attendance.service';
import { EmployeeAttendanceProfileClient } from '@/components/admin/employee-attendance/EmployeeAttendanceProfileClient';

export const metadata: Metadata = {
  title: 'Employee Attendance Profile | Thread Security Admin',
  description: 'Individual employee attendance record, monthly interactive register, and credits formula audit.',
};

export const revalidate = 0;

export default async function EmployeeAttendanceProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  if (!session || (!canAccessEmployeeAttendance(session) && session.userId !== id)) {
    redirect('/login?error=UnauthorizedAttendanceAccess');
  }

  try {
    const profileData = await getEmployeeAttendanceProfileService(id);
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmployeeAttendanceProfileClient
          currentUser={session}
          initialData={JSON.parse(JSON.stringify(profileData))}
        />
      </div>
    );
  } catch (err) {
    console.error('[EmployeeAttendanceProfilePage] Error loading employee profile:', err);
    notFound();
  }
}

