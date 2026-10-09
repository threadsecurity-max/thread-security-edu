import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getStudentBatchAndAttendanceService } from '@/server/services/batch.service';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Users,
  MessageSquare,
  Sparkles,
  BookOpen,
  Activity,
  AlertCircle,
  Radio,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function StudentBatchAttendancePage() {
  const session = await getSession();

  if (!session || (session.role !== 'STUDENT' && (session.role as string) !== 'GUEST')) {
    redirect('/login');
  }

  const data = await getStudentBatchAndAttendanceService(session.userId);

  const batch = data.batch;
  const attendanceRate = data.attendancePercentage;
  const totalSessions = data.totalSessions;
  const attendedSessions = data.presentSessions;
  const records = data.records;

  return (
    <div className="space-y-8 text-white">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              ACADEMIC COHORT TRACKING
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              TS-ID: {session.tsId || 'TSE-2026-STUDENT'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Batch Schedule &amp; Attendance Ledger
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Faculty mentor conducted cohort sessions, real-time check-in ledger, assigned curriculum homework, and individual instructor performance remarks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[120px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">ATTENDANCE FIDELITY</span>
            <span
              className={`text-2xl font-extrabold block mt-0.5 ${
                attendanceRate >= 80 ? 'text-[#C6FF34]' : 'text-amber-400'
              }`}
            >
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {!batch ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-4">
          <Layers className="w-12 h-12 text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-white">No Cohort Batch Assigned Yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Your student ID is registered in the central academic directory. An administrator will allocate your cohort schedule shortly.
            </p>
          </div>
          <Link href="/student/courses" className="inline-block pt-2">
            <button className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs transition-all cursor-pointer">
              Explore Active Pathways
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* ── BATCH & PARTICIPATION OVERVIEW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Batch Info Card */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                    {batch.batchCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase font-bold">
                    {batch.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">ASSIGNED WORKSPACE</span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                  {batch.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {batch.description || 'Structured academic cohort with live lab mentorship.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                    Lead Faculty Mentor
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-4 h-4 text-[#C6FF34]" />
                    <span className="font-bold text-white text-sm">
                      {batch.mentor?.user?.name || 'Lead Security Mentor'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block pt-0.5 font-sans">
                    {batch.mentor?.title || 'Senior Cyber Security Instructor'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                    Conduction Schedule
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="font-bold text-white text-xs">
                      {batch.schedule || 'Scheduled Classes'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block pt-0.5 font-sans">
                    Live interactive terminal sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Performance Metrics */}
            <div className="p-6 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-5">
              <div className="pb-3 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#C6FF34]" />
                  Participation Fidelity
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">LIVE METER</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Conducted Classes:</span>
                  <strong className="text-white font-bold">{totalSessions} Sessions</strong>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Attended Classes:</span>
                  <strong className="text-[#C6FF34] font-bold">{attendedSessions} Sessions</strong>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Compliance Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      attendanceRate >= 80
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {attendanceRate >= 80 ? 'ELIGIBLE FOR EXAMS' : 'ATTENDANCE WARNING'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Overall Ratio:</span>
                    <strong className="text-white">{attendanceRate}%</strong>
                  </div>
                  <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        attendanceRate >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-[#C6FF34]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, attendanceRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-zinc-500 text-center">
                Maintained by Faculty Registrar
              </div>
            </div>
          </div>

          {/* ── BROADCASTS & RESOURCES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Announcements Card */}
            <div className="p-6 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#C6FF34]" />
                  Cohort Announcements &amp; Broadcasts
                </h3>
                <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400">
                  {batch.broadcasts?.length || 0} Posts
                </span>
              </div>

              <div className="space-y-3">
                {!batch.broadcasts || batch.broadcasts.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono py-4 text-center">
                    No broadcasts published yet for this cohort.
                  </p>
                ) : (
                  batch.broadcasts.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-sans text-sm">{b.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-400 font-sans leading-relaxed whitespace-pre-line text-xs">
                        {b.message}
                      </p>
                      {b.attachmentUrl && (
                        <a
                          href={b.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#C6FF34] hover:underline font-bold mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Attachment Resource
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resources Card */}
            <div className="p-6 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Cohort Study Materials &amp; Resources
                </h3>
                <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400">
                  {batch.resources?.length || 0} Files
                </span>
              </div>

              <div className="space-y-3">
                {!batch.resources || batch.resources.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono py-4 text-center">
                    No reference materials shared yet. Faculty will attach lab notes and slides here.
                  </p>
                ) : (
                  batch.resources.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <span className="font-bold text-white block truncate font-sans text-xs">
                          {r.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block uppercase">
                          {r.fileType} • {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#C6FF34] text-black font-mono font-bold text-[11px] hover:bg-[#b5f425] transition-colors flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Access
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── DETAILED SESSION LOG & MENTOR OBSERVATIONS ── */}
          <div className="p-6 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C6FF34]" />
                  Conducted Sessions Ledger &amp; Mentor Remarks
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Check-in timestamps, delivered modules, homework, and faculty observations on your performance.
                </p>
              </div>

              <span className="text-xs font-mono text-zinc-400 shrink-0">
                {batch.sessions?.length || 0} Total Sessions Logged
              </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {batch.sessions?.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                  No sessions conducted yet. Check back after your next live lab class.
                </div>
              ) : (
                batch.sessions?.map((sessionItem: any) => {
                  const record = records.find((r: any) => r.sessionId === sessionItem.id);
                  const status = record?.status || 'NOT_MARKED_YET';

                  return (
                    <div
                      key={sessionItem.id}
                      className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#C6FF34]">
                            Session #{sessionItem.sessionNumber}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            • {new Date(sessionItem.sessionDate).toLocaleDateString()} ({sessionItem.durationMins || 120} mins)
                          </span>
                        </div>

                        <h4 className="text-base font-serif font-bold text-white">
                          {sessionItem.title}
                        </h4>

                        {sessionItem.agenda && (
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {sessionItem.agenda}
                          </p>
                        )}

                        {sessionItem.topicsCovered && (
                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-zinc-300">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
                              Topics Delivered:
                            </span>
                            {sessionItem.topicsCovered}
                          </div>
                        )}

                        {sessionItem.homework && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-sans">
                            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono block mb-0.5">
                              Assigned Homework / Practice:
                            </span>
                            {sessionItem.homework}
                          </div>
                        )}

                        {sessionItem.importantNotes && (
                          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 font-sans">
                            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-mono block mb-0.5">
                              Faculty Notes:
                            </span>
                            {sessionItem.importantNotes}
                          </div>
                        )}

                        {/* Live Classroom Meeting Link */}
                        {(() => {
                          let meetingUrl: string | null = null;
                          if (sessionItem.resourcesJson) {
                            try {
                              const parsed = JSON.parse(sessionItem.resourcesJson);
                              if (parsed.meetingUrl) meetingUrl = parsed.meetingUrl;
                            } catch {}
                          }
                          if (!meetingUrl) {
                            const match = `${sessionItem.importantNotes || ''} ${sessionItem.agenda || ''}`.match(/https?:\/\/[^\s]+/);
                            if (match) meetingUrl = match[0];
                          }
                          if (!meetingUrl) return null;

                          return (
                            <div className="pt-2">
                              <a
                                href={meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(198,255,52,0.3)] transition-all cursor-pointer"
                              >
                                <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
                                <span>Join Live Classroom Session</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          );
                        })()}

                        {/* Mentor Remarks Block ("What you are up to") */}
                        {record?.remarks ? (
                          <div className="p-3.5 rounded-2xl bg-[#C6FF34]/[0.06] border border-[#C6FF34]/20 text-xs text-white flex items-start gap-2.5 mt-2">
                            <MessageSquare className="w-4 h-4 text-[#C6FF34] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-mono text-[#C6FF34] font-bold block">
                                Faculty Mentor Observation:
                              </span>
                              <p className="text-xs text-zinc-200 italic leading-relaxed">
                                &ldquo;{record.remarks}&rdquo;
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-mono italic block pt-1">
                            No individual mentor remark recorded for this session.
                          </span>
                        )}
                      </div>

                      {/* Status Badge & Timestamp */}
                      <div className="text-right shrink-0 space-y-1 font-mono text-xs">
                        <span
                          className={`px-3 py-1 rounded-full font-mono text-xs font-bold inline-block ${
                            status === 'PRESENT'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : status === 'LATE'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : status === 'ABSENT'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]'
                          }`}
                        >
                          {status === 'PRESENT'
                            ? '✅ PRESENT'
                            : status === 'LATE'
                            ? '⏰ LATE'
                            : status === 'ABSENT'
                            ? '❌ ABSENT'
                            : '⏳ SCHEDULED'}
                        </span>

                        {record?.checkInTime && (
                          <span className="text-[10px] text-zinc-500 block">
                            Logged: {new Date(record.checkInTime).toLocaleTimeString()}
                          </span>
                        )}
                        {record?.markedBy && (
                          <span className="text-[10px] text-zinc-400 block">
                            By: {record.markedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
