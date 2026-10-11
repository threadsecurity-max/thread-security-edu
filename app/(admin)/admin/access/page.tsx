import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ShieldCheck, Mail, Key, Clock, Copy, Plus, CheckCircle2, Lock } from 'lucide-react';
import { AccessInvitationsClient } from '@/app/(admin)/admin/access/access-invitations-client';

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
  } catch (e) {
    // Graceful fallback
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
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              CREDENTIAL &amp; INVITATION DISPATCH
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Access Control &amp; Account Invitations
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1 font-mono">
            Generate single-use activation tokens, dispatch faculty and student setup links, monitor token expiration, and audit credential provisioning.
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
