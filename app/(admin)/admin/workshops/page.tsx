import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { WorkshopsManagementClient } from '@/app/(admin)/admin/workshops/workshops-management-client';

export const metadata = {
  title: 'Workshops Command & Conduction | Thread Security Admin',
  description: 'Conduct live cybersecurity masterclasses, publish practical red teaming workshops, and track registrations.',
};

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
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span className="text-[11px] font-semibold tracking-wider text-violet-600 uppercase">
              Hands-On Workshops &amp; Masterclasses
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
              {workshops.length} Live
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Workshops Command &amp; Conduction
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Conduct live cybersecurity masterclasses, publish practical workshops, assign faculty leads, manage Google Drive resources, and track registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workshops"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Workshop Portal</span>
          </Link>
        </div>
      </div>

      <WorkshopsManagementClient initialWorkshops={workshops} mentors={mentors} />
    </div>
  );
}
