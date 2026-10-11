import { prisma } from '@/server/database/prisma';
import { Card, CardContent } from '@/components/ui/card';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  Server,
  Layers,
  Award,
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { DBSyncClient } from './db-sync-client';

export const metadata = {
  title: 'Database Control & Live Sync Sheet | Thread Security Admin',
  description: 'Real-time synchronization sheet for relational Prisma models and entities.',
};

export const revalidate = 0;

export default async function SuperAdminDbSyncPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  // Fetch real-time metrics across Prisma models
  const [usersCount, tsIdCount, coursesCount, certsCount, attemptsCount, auditLogsCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.tSIdentity.count(),
      prisma.course.count(),
      prisma.certificate.count(),
      prisma.labAttempt.count(),
      prisma.auditLog.count(),
    ]);

  // Fetch full student identity sync data
  const studentsSyncData = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      tsIdentity: true,
      studentProfile: true,
      enrollments: { include: { course: true } },
      certificates: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span className="text-[11px] font-semibold tracking-wider text-violet-600 uppercase">
              Relational Database &amp; Entity State
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
              Live Synchronized
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Database Control &amp; Live Sync Sheet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Real-time inspection sheet for relational Prisma models, student credentials, courses, certificates, and CSV export.
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            revalidatePath('/admin/db-sync');
            revalidatePath('/admin/students');
            revalidatePath('/admin/users');
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Sync Database Cache</span>
          </button>
        </form>
      </div>

      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 text-slate-900 shadow-xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Database Engine
              </span>
              <div className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-1">
                <Server className="w-4 h-4 text-violet-600" />
                PostgreSQL
              </div>
              <span className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Online (Pooled SSL)
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 text-slate-900 shadow-xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Student TS-IDs
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {tsIdCount} Identities
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {usersCount} total users
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 text-slate-900 shadow-xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Courses &amp; Modules
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {coursesCount} Active
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {attemptsCount} lab attempts
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 text-slate-900 shadow-xs rounded-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Issued Certificates
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {certsCount} Verified
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {auditLogsCount} audit events
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Table Client */}
      <DBSyncClient students={studentsSyncData} />
    </div>
  );
}
