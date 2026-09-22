import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  Server,
  Layers,
  Users,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { DBSyncClient } from './db-sync-client';

export const revalidate = 0;

export default async function SuperAdminDbSyncPage() {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  // Fetch real-time metrics across Prisma Postgres models
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
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-red-400" />
              PRISMA POSTGRES SYNC SHEET
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
              SUPER ADMIN EXCLUSIVE
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Database Control & Live Sync Sheet
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Real-time inspection sheet for all relational Prisma models, TS-ID student credentials, certificates, and CSV synchronization status.
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            revalidatePath('/admin/db-sync');
            revalidatePath('/admin/students');
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-white/20 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            <span>Re-Sync Live Database</span>
          </button>
        </form>
      </div>

      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Database Engine
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-2 mt-1">
                <Server className="w-5 h-5 text-emerald-400" />
                Prisma Postgres
              </div>
              <span className="text-[10px] font-mono text-emerald-300 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ONLINE (pooled.db)
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Student TS-IDs
              </span>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                {tsIdCount}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Synced Accounts ({studentsSyncData.length} active)
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Issued Certificates
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {certsCount}
              </div>
              <span className="text-[10px] font-mono text-emerald-300 mt-1 block">
                SHA-256 Verified Ledgers
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Audit Log Entries
              </span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {auditLogsCount}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Append-Only Records
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive DBSyncClient Sheet */}
      <DBSyncClient studentsSyncData={studentsSyncData} />
    </div>
  );
}
