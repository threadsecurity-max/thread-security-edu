import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserPlus, Sparkles, Shield } from 'lucide-react';
import { MentorDirectoryClient } from './mentor-directory-client';

export const revalidate = 0;

export default async function AdminMentorDirectoryPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  let mentors: any[] = [];
  try {
    mentors = await prisma.mentorProfile.findMany({
      include: {
        user: {
          include: {
            tsIdentity: true,
            mentorIdentity: true,
          } as any,
        },
        courses: true,
        batches: {
          include: {
            sessions: true,
          },
        },
        students: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });
  } catch (e) {
    console.error('Failed to query mentors roster:', e);
  }

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              FACULTY &amp; INSTRUCTOR OPERATIONS
            </Badge>
            <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs">
              ACTIVE ROSTER ({mentors.length})
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Faculty Roster &amp; Mentor Lifecycle
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1 font-mono">
            Provision atomic Mentor IDs, manage account activations, suspend or revoke dashboard permissions, and inspect faculty workload across batches and courses.
          </p>
        </div>
      </div>

      {/* Interactive Mentor Directory Client Component */}
      <MentorDirectoryClient mentors={mentors} />
    </div>
  );
}
