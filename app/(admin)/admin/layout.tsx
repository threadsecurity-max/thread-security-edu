import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { Sparkles, Globe, Activity } from 'lucide-react';
import { BroadcastMessageModal } from '@/components/notifications/broadcast-modal';
import { BroadcastNotificationBanner } from '@/components/notifications/broadcast-banner';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Strict role validation: allow SUPER_ADMIN, ACADEMIC_ADMIN, and SECURITY_ADMIN
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN' && session.role !== 'SECURITY_ADMIN')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const [admin, mentorsCount] = await Promise.all([
    prisma.user.findFirst({
      where: { id: session.userId },
    }),
    prisma.mentorProfile.count(),
  ]);

  const headerActions = (
    <>
      <BroadcastMessageModal />

      <Link href="/admin/workshops">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-medium text-xs border border-violet-200 transition-all cursor-pointer">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span className="hidden sm:inline">Conduct Workshop</span>
        </button>
      </Link>

      <Link href="/admin/server-health">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-all cursor-pointer">
          <Activity className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">Server Health</span>
        </button>
      </Link>

      <Link href="/">
        <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-all cursor-pointer">
          <Globe className="w-3.5 h-3.5 text-slate-600" />
          <span>Landing Page</span>
        </button>
      </Link>
    </>
  );

  return (
    <AdminShell
      user={{
        userId: session.userId,
        name: admin?.name || session.name,
        email: admin?.email || session.email,
        role: session.role,
      }}
      mentorsCount={mentorsCount}
      headerActions={headerActions}
    >
      <BroadcastNotificationBanner userId={session.userId} />
      {children}
    </AdminShell>
  );
}
