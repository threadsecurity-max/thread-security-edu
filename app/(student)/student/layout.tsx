import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { StudentSidebar } from '@/components/student/layout/StudentSidebar';
import { StudentTopbar } from '@/components/student/layout/StudentTopbar';
import { BroadcastNotificationBanner } from '@/components/notifications/broadcast-banner';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // 1. Strict Authentication Enforcement
  if (!session || !session.userId) {
    redirect('/login');
  }

  // 2. Fetch authenticated student strictly by session userId
  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tsIdentity: true,
      studentProfile: true,
    },
  });

  if (!student) {
    redirect('/login?error=SessionNotFound');
  }

  // 3. Gatekeeper clearance verification
  if (!student.isDashboardAccessGranted && student.role === 'STUDENT') {
    redirect('/?notice=clearance-pending');
  }

  const tsId =
    student.tsIdentity?.tsId || session.tsId || `TSE-2026-${student.id.slice(-6).toUpperCase()}`;
  const studentName = student.name || session.name || 'Student';

  return (
    <div className="min-h-screen flex bg-[#050706] text-white font-sans selection:bg-[#C6FF34] selection:text-black relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#C6FF34]/[0.025] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#C6FF34_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.02]" />

      {/* Desktop Collapsible Glass Sidebar */}
      <StudentSidebar
        student={{
          name: studentName,
          email: student.email,
          tsId,
          avatarUrl: student.avatarUrl,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#080B09]/80">
        {/* Glass Topbar */}
        <StudentTopbar
          student={{
            userId: student.id,
            name: studentName,
            tsId,
          }}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-28 md:pb-12 max-w-7xl w-full mx-auto space-y-6">
          <BroadcastNotificationBanner userId={student.id} />
          {children}
        </main>
      </div>
    </div>
  );
}
