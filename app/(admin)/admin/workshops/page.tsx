import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, ExternalLink, Calendar, Users, ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';
import { WorkshopsManagementClient } from '@/app/(admin)/admin/workshops/workshops-management-client';

export const revalidate = 0;

export default async function AdminWorkshopsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-module');
  }

  // Fetch workshops from database with fallback
  let workshops: any[] = [];
  try {
    if ((prisma as any).workshop) {
      workshops = await (prisma as any).workshop.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (err) {
    console.error('Failed to fetch workshops:', err);
  }

  // If database has 0 workshops, fetch from local API to ensure seed data displays
  if (workshops.length === 0) {
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:8080'}/api/workshops`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.workshops) {
        workshops = data.workshops;
      }
    } catch {}
  }

  // Fetch mentors roster so admin can assign real mentors as instructors
  const mentors = await prisma.mentorProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              HANDS-ON WORKSHOP CONDUCTION
            </Badge>
            <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs">
              LIVE SESSIONS ({workshops.length})
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Workshops Command &amp; Conduction
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1 font-mono">
            Conduct live cybersecurity masterclasses, publish practical red teaming workshops, assign faculty leads, manage Google Drive resources, and track participant registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workshops"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Workshops Page</span>
          </Link>
        </div>
      </div>

      <WorkshopsManagementClient initialWorkshops={workshops} mentors={mentors} />
    </div>
  );
}
