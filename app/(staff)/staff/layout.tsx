import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { StaffNavigation } from '@/components/staff/staff-navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-purple-500 selection:text-white">
      {/* Staff Left Sidebar */}
      <StaffNavigation
        user={{
          userId: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

