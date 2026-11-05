import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getEmployeeAttendanceProfileService } from '@/server/services/employee-attendance.service';
import {
  ClipboardList,
  MessageSquare,
  Bell,
  BookOpen,
  CalendarCheck,
  UserCheck,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Flame,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Staff Operations Dashboard | Thread Security',
  description: 'Execute team directives, communicate with your Team Lead, manage docket assignments and verify attendance.',
};

export const revalidate = 0;

export default async function StaffDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const userId = session.userId;

  // 1. Resolve Team Lead & Delegation Block
  let teamBlock: any = null;
  let userGrants: string[] = [];
  try {
    const membership = await (prisma as any).delegationMember.findFirst({
      where: { userId },
      include: {
        team: {
          include: {
            lead: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (membership?.team) {
      teamBlock = membership.team;
      userGrants = membership.systemGrants || [];
    }
  } catch (err) {
    console.warn('[StaffDashboard] Could not resolve delegation team:', err);
  }

  // Fallback Team Lead if not formally assigned to a team block yet
  if (!teamBlock) {
    try {
      const defaultLead = await prisma.user.findFirst({
        where: {
          OR: [
            { role: 'MENTOR' },
            { role: 'STAFF_EXECUTIVE' },
            { role: 'SUPER_ADMIN' },
          ],
        },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      });
      if (defaultLead) {
        teamBlock = {
          name: 'General Cyber Operations Staff',
          code: 'OPS-MAIN',
          lead: defaultLead,
        };
      }
    } catch {}
  }

  // 2. Fetch Assigned Docket Items (Work from Team Lead)
  let docketItems: any[] = [];
  let pendingTasksCount = 0;
  let inProgressCount = 0;
  let completedTodayCount = 0;
  try {
    docketItems = await (prisma as any).todaysDocketItem.findMany({
      where: { assigneeId: userId },
      include: {
        creator: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    pendingTasksCount = docketItems.filter((i) => i.status === 'PENDING').length;
    inProgressCount = docketItems.filter((i) => i.status === 'IN_PROGRESS').length;
    completedTodayCount = docketItems.filter((i) => i.status === 'VERIFIED_COMPLETED' || i.status === 'SUBMITTED_FOR_REVIEW').length;
  } catch (err) {
    console.warn('[StaffDashboard] Error fetching docket items:', err);
  }

  // 3. Fetch Personal Employee Attendance Standing
  let attendanceProfile: any = null;
  try {
    attendanceProfile = await getEmployeeAttendanceProfileService(userId);
  } catch (err) {
    console.warn('[StaffDashboard] Error querying attendance standing:', err);
  }

  // 4. Fetch Latest Internal Announcements
  let announcements: any[] = [];
  try {
    announcements = await (prisma as any).broadcast.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        createdAt: true,
        batch: { select: { title: true, batchCode: true } },
      },
    });
  } catch {}

  const attendancePercent = attendanceProfile?.summary?.attendancePercentage ?? 100;
  const teamLead = teamBlock?.lead;

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-900/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                STAFF OPERATIONS DESK &bull; LIVE DIRECTIVE CHANNEL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {session.name || session.email?.split('@')[0]}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Your designated station for coordinating communications, claiming directives from your Team Lead, reporting daily docket deliverables, and publishing research.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/staff/docket"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Take Work / Docket</span>
            </Link>
            <Link
              href="/staff/messages"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Team Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KEY OPERATIONAL METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Open Tasks from Lead */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase">Pending Directives</p>
            <p className="text-2xl font-black text-white mt-1">{pendingTasksCount}</p>
            <p className="text-[11px] text-purple-400 mt-1 flex items-center gap-1 font-mono">
              <span>{inProgressCount} In Progress</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Today's Completed / Submitted */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase">Deliverables Filed</p>
            <p className="text-2xl font-black text-white mt-1">{completedTodayCount}</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">Awaiting / Verified</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Personal Attendance % */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase">My Attendance Score</p>
            <p className="text-2xl font-black text-white mt-1">{attendancePercent}%</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">
              {attendanceProfile?.summary?.daysPresent ?? 0} Present &bull; {attendanceProfile?.summary?.daysWfh ?? 0} WFH
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Team Lead Connection */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase">Designated Lead</p>
            <p className="text-sm font-bold text-white mt-1 truncate max-w-[150px]">
              {teamLead?.name || teamLead?.email?.split('@')[0] || 'Team Officer'}
            </p>
            <p className="text-[10px] font-mono text-purple-300/80 mt-1 truncate max-w-[150px]">
              {teamBlock?.name || 'Assigned Division'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN WORK DESK: TEAM LEAD DIRECTIVES & COMMUNICATIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Directives from Team Lead (Today's Docket) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Directives Assigned By Team Lead
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Review assigned tasks, update operational progress &amp; upload deliverables
                  </p>
                </div>
              </div>

              <Link
                href="/staff/docket"
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <span>Open Full Docket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of Tasks */}
            {docketItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                <ClipboardList className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">No active directives assigned</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Your Team Lead has not delegated any docket items to your desk today. Check communications or request an assignment.
                </p>
                <div className="pt-2">
                  <Link
                    href="/staff/messages"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-purple-300 text-xs font-mono font-medium hover:bg-slate-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ping Team Lead</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {docketItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                            item.priority === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : item.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Assigned by {item.creator?.name || 'Team Lead'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2">
                        <p className="text-xs font-mono font-bold text-purple-400">
                          {item.completionPercentage ?? 0}%
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 capitalize">
                          {item.status.replace(/_/g, ' ').toLowerCase()}
                        </p>
                      </div>

                      <Link
                        href="/staff/docket"
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold transition-colors"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Subsystem Access Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/staff/messages"
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 group transition-all space-y-2 block"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                Communications Hub
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Coordinate operational tasks in real time with your designated Team Lead, faculty mentors, and academic administrators.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-400 font-semibold pt-1">
                <span>Start Direct Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/staff/blogs"
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 group transition-all space-y-2 block"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Faculty &amp; Staff Blog Studio
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Draft, edit, and publish technical security case studies, lab walkthroughs, and research articles.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 font-semibold pt-1">
                <span>Write New Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Team Lead Info & Live Attendance Ledger */}
        <div className="space-y-4">
          {/* Team Lead Connection Block */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                HIERARCHICAL REPORTING
              </span>
              <span className="text-[10px] font-mono text-slate-400">Tier 2 Linkage</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md uppercase">
                {(teamLead?.name || teamLead?.email || 'L')[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {teamLead?.name || 'Designated Team Lead'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{teamLead?.email}</p>
                <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {teamLead?.role || 'TEAM_LEAD'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
              <p className="text-[10px] font-mono text-slate-400">Assigned Team Block:</p>
              <p className="font-bold text-white text-xs">{teamBlock?.name || 'Operations Unit'}</p>
              <p className="text-[10px] font-mono text-purple-300/80">Code: {teamBlock?.code || 'OPS'}</p>
            </div>

            <Link
              href="/staff/messages"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Connect with Team Lead</span>
            </Link>
          </div>

          {/* Personal Attendance Ledger Widget */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Attendance Standing</span>
              </div>
              <Link
                href="/staff/my-attendance"
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View History
              </Link>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-black text-white font-mono">{attendancePercent}%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Calculated Working Ratio</p>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-1 rounded-md font-bold uppercase ${
                  attendancePercent >= 85
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : attendancePercent >= 75
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {attendancePercent >= 85 ? 'Exemplary' : attendancePercent >= 75 ? 'Acceptable' : 'Attention'}
              </span>
            </div>

            {/* Attendance Breakdown Bar */}
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400">Present</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">
                  {attendanceProfile?.summary?.daysPresent ?? 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400">WFH</p>
                <p className="text-xs font-bold text-indigo-400 mt-0.5">
                  {attendanceProfile?.summary?.daysWfh ?? 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400">Half Day</p>
                <p className="text-xs font-bold text-amber-400 mt-0.5">
                  {attendanceProfile?.summary?.daysHalfDay ?? 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400">Leave</p>
                <p className="text-xs font-bold text-rose-400 mt-0.5">
                  {attendanceProfile?.summary?.daysLeave ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Internal Announcements */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Staff Bulletins</span>
              </div>
              <Link
                href="/staff/announcements"
                className="text-[10px] font-mono text-purple-400 hover:text-purple-300 font-semibold"
              >
                All Notices
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">No active broadcasts</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <p className="text-xs font-bold text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{a.message}</p>
                    <p className="text-[9px] font-mono text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

