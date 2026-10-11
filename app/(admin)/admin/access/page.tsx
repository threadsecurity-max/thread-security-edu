import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import { AccessInvitationsClient } from '@/app/(admin)/admin/access/access-invitations-client';

export const metadata = {
  title: 'Access Control & Invitations | Thread Security Admin',
  description: 'Generate single-use activation tokens, dispatch faculty and student setup links, and monitor token expiration.',
};

export const revalidate = 0;

export default async function AdminAccessInvitationsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-module');
  }

  let invitations: any[] = [];
  try {
    invitations = await (prisma as any).invitationToken.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch {
    invitations = [];
  }

  const mentorsList = await prisma.mentorProfile.findMany({
    include: { user: true },
    take: 30,
  });

  const studentsList = await prisma.user.findMany({
    where: { role: { in: ['STUDENT', 'GUEST'] } },
    include: { tsIdentity: true },
    take: 30,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span className="text-[11px] font-semibold tracking-wider text-violet-600 uppercase">
              Credential &amp; Invitation Dispatch
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Access Control &amp; Account Invitations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Generate single-use activation tokens, dispatch faculty and student onboarding links, monitor expiration, and audit credential provisioning.
          </p>
        </div>
      </div>

      <AccessInvitationsClient
        initialInvitations={invitations}
        mentorsList={mentorsList}
        studentsList={studentsList}
      />
    </div>
  );
}
