import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import {
  Bell,
  Search,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Internal Announcements & Bulletins | Thread Security Staff',
  description: 'View real-time institute circulars, batch conduction notices, and operational directives.',
};

export const revalidate = 0;

export default async function StaffAnnouncementsPage() {
  const session = await getSession();
  const allowedRoles = [
    'STAFF_EXECUTIVE',
    'STAFF_JUNIOR',
    'SUPER_ADMIN',
    'ADMIN',
    'ACADEMIC_ADMIN',
    'SECURITY_ADMIN',
  ];

  if (!session || !allowedRoles.includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  let broadcasts: any[] = [];
  try {
    broadcasts = await (prisma as any).broadcast.findMany({
      include: {
        batch: {
          select: { id: true, batchCode: true, title: true },
        },
        mentor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (err) {
    console.error('[StaffAnnouncementsPage] Error querying broadcasts:', err);
    broadcasts = [];
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-purple-400 uppercase">
              INSTITUTE CIRCULARS &bull; STAFF DIRECTIVE BROADCAST
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-purple-400" />
            <span>Internal Announcements</span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Official communications, security announcements, scheduled laboratory sessions, and timetable modifications dispatched across Thread Security.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>{broadcasts.length} Active Circulars</span>
        </div>
      </div>

      {/* ── BROADCASTS FEED ── */}
      {broadcasts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No active announcements</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All operational circulars and academic broadcast notifications are currently up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/30 transition-all shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-bold uppercase">
                    {b.batch?.batchCode || 'SYSTEM BROADCAST'}
                  </span>
                  {b.batch?.title && (
                    <span className="text-xs text-slate-400 truncate max-w-xs font-medium">
                      {b.batch.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(b.createdAt).toLocaleString()}</span>
                  </span>
                  {b.mentor?.user?.name && (
                    <span>By {b.mentor.user.name}</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{b.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                  {b.message}
                </p>
              </div>

              {b.attachmentUrl && (
                <div className="pt-2">
                  <a
                    href={b.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 text-xs font-mono font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Associated Attachment</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

