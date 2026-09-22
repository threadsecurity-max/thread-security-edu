import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserPlus, Sparkles } from 'lucide-react';
import { MentorDirectoryClient } from './mentor-directory-client';

export const revalidate = 0;

export default async function AdminMentorDirectoryPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  const mentors = await prisma.mentorProfile.findMany({
    include: {
      user: true,
      courses: true,
      students: true,
    },
    orderBy: { user: { name: 'asc' } },
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              FACULTY & INSTRUCTOR MANAGEMENT
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
              ACTIVE ROSTER ({mentors.length})
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Mentor Directory & Faculty Roster
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Manage academic mentors, provision instructor accounts, update faculty schedules, and send direct one-way administrative notices.
          </p>
        </div>
      </div>

      {/* Interactive Mentor Directory Client Component */}
      <MentorDirectoryClient mentors={mentors} />
    </div>
  );
}
