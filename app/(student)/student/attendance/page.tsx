import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getStudentBatchAndAttendanceService } from '@/server/services/batch.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#04111C] via-[#071A2B] to-[#04111C] text-white border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="security" className="bg-security-green text-primary-dark font-mono text-[10px]">
              ACADEMIC COHORT TRACKING
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              TS-ID: {session.tsId || 'TSE-2026-STUDENT'}
            </span>
          </div>
          <h1 className="tse-h1 text-white">
            My Academic Batch & Attendance Ledger
          </h1>
          <p className="tse-body-sm text-slate-300 max-w-2xl">
            Track your assigned cohort schedule, live session attendance records, and explicit faculty mentor feedback remarks on your hands-on laboratory performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Attendance Rate</span>
            <span
              className={`text-2xl font-bold block mt-0.5 ${
                attendanceRate >= 80 ? 'text-security-green' : 'text-amber-400'
              }`}
            >
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {!batch ? (
        <Card className="p-12 text-center bg-white border border-border space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold font-sans text-primary">
            No Cohort Batch Assigned Yet
          </h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Your TS-ID is currently active in the general registry. An Academic Administrator will assign you to your respective cohort batch shortly.
          </p>
          <Link href="/courses">
            <Button variant="security" size="sm" className="font-mono text-xs">
              Explore Course Catalog
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Assigned Batch Details Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Batch Info Card */}
            <Card className="lg:col-span-2 bg-white border border-border shadow-sm rounded-2xl">
              <CardHeader className="border-b border-border/80 pb-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-security-green-dark border-security-green font-mono text-[10px]"
                  >
                    {batch.batchCode}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                    {batch.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold font-sans text-primary mt-2">
                  {batch.title}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  {batch.description || 'Structured academic cohort with live lab mentorship.'}
                </p>
              </CardHeader>

              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Faculty Lead / Mentor</span>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-4 h-4 text-security-green-dark" />
                    <span className="font-bold text-primary text-sm">
                      {batch.mentor?.user?.name || 'Lead Security Mentor'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-sans mt-0.5">
                    {batch.mentor?.title || 'Senior Cyber Security Instructor'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Schedule & Timings</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-primary text-xs">
                      {batch.schedule || 'Regular Schedule'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-sans mt-0.5">
                    Live interactive terminal sessions
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Performance Metrics */}
            <Card className="bg-white border border-border shadow-sm rounded-2xl flex flex-col justify-between">
              <CardHeader className="border-b border-border/80 pb-4">
                <CardTitle className="text-base font-bold font-sans text-primary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-security-green-dark" />
                  Participation Fidelity
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Conducted Classes:</span>
                  <strong className="text-primary font-bold">{totalSessions} Sessions</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Attended Classes:</span>
                  <strong className="text-emerald-700 font-bold">{attendedSessions} Sessions</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Compliance Status:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                    {attendanceRate >= 80 ? 'ELGIBLE FOR EXAM' : 'ATTENDANCE WARNING'}
                  </Badge>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px]">
                    <span>Attendance Rate:</span>
                    <strong>{attendanceRate}%</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        attendanceRate >= 80 ? 'bg-security-green' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, attendanceRate)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cohort Broadcasts & Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Announcements Card */}
            <Card className="bg-white border border-border shadow-sm rounded-2xl">
              <CardHeader className="border-b border-border/80 pb-3">
                <CardTitle className="text-sm font-bold font-sans text-primary flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-security-green-dark" />
                    Cohort Announcements & Broadcasts
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {batch.broadcasts?.length || 0} Announcements
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {!batch.broadcasts || batch.broadcasts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-sans py-2">
                    No broadcasts published yet for this cohort.
                  </p>
                ) : (
                  batch.broadcasts.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary font-sans">{b.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 font-sans leading-relaxed whitespace-pre-line">
                        {b.message}
                      </p>
                      {b.attachmentUrl && (
                        <a
                          href={b.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-security-green-dark hover:underline font-bold mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Attachment / Resource Link
                        </a>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Resources Card */}
            <Card className="bg-white border border-border shadow-sm rounded-2xl">
              <CardHeader className="border-b border-border/80 pb-3">
                <CardTitle className="text-sm font-bold font-sans text-primary flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-security-green-dark" />
                    Cohort Study Materials & Resources
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {batch.resources?.length || 0} Files
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {!batch.resources || batch.resources.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-sans py-2">
                    No reference materials shared yet. Mentors will attach slides and labs here.
                  </p>
                ) : (
                  batch.resources.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <span className="font-bold text-primary block truncate font-sans">
                          {r.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">
                          {r.fileType} • {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-security-green text-primary font-mono font-bold text-[11px] hover:bg-security-green-dark transition-colors flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Access
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Attendance & Mentor Remarks Ledger */}
          <Card className="bg-white border border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-border p-5 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-sans text-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-security-green-dark" />
                  Detailed Session Log & Mentor Observations ("What You Are Up To")
                </CardTitle>
                <p className="text-xs text-muted mt-0.5">
                  Explicit check-in timestamps and faculty feedback remarks for each conducted cohort session.
                </p>
              </div>

              <Badge variant="outline" className="font-mono text-xs">
                {batch.sessions?.length || 0} Total Sessions Logged
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {batch.sessions?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-sans">
                    No sessions conducted yet. Check back after your next live lab class.
                  </div>
                ) : (
                  batch.sessions?.map((session: any) => {
                    const record = records.find((r: any) => r.sessionId === session.id);
                    const status = record?.status || 'NOT_MARKED_YET';
                    const isPresent = status === 'PRESENT' || status === 'LATE';

                    return (
                      <div
                        key={session.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-security-green-dark">
                              Session #{session.sessionNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              • {new Date(session.sessionDate).toLocaleDateString()} ({session.durationMins || 120} mins)
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-primary font-sans">
                            {session.title}
                          </h4>

                          {session.agenda && (
                            <p className="text-xs text-slate-500 font-sans">
                              {session.agenda}
                            </p>
                          )}

                          {session.topicsCovered && (
                            <div className="mt-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 font-sans">
                              <span className="font-bold text-[10px] uppercase font-mono text-slate-500 block mb-0.5">
                                Topics Delivered:
                              </span>
                              {session.topicsCovered}
                            </div>
                          )}

                          {session.homework && (
                            <div className="mt-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-200 rounded-lg p-2 font-sans">
                              <span className="font-bold text-[10px] uppercase font-mono text-amber-700 block mb-0.5">
                                Assigned Homework / Practice:
                              </span>
                              {session.homework}
                            </div>
                          )}

                          {session.importantNotes && (
                            <div className="mt-2 text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-200 rounded-lg p-2 font-sans">
                              <span className="font-bold text-[10px] uppercase font-mono text-indigo-700 block mb-0.5">
                                Faculty Notes:
                              </span>
                              {session.importantNotes}
                            </div>
                          )}

                          {/* Mentor Remarks Block ("What they are up to") */}
                          {record?.remarks ? (
                            <div className="p-2.5 rounded-lg bg-cyan-50/70 border border-cyan-200/60 text-xs text-cyan-950 flex items-start gap-2 mt-2">
                              <MessageSquare className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[10px] uppercase font-mono text-cyan-800 block">
                                  Faculty Mentor Observation:
                                </span>
                                <p className="font-sans text-xs text-cyan-900 mt-0.5">
                                  "{record.remarks}"
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono italic block pt-1">
                              No written mentor remark for this session.
                            </span>
                          )}
                        </div>

                        {/* Status Badge & Timestamp */}
                        <div className="text-right shrink-0 space-y-1 font-mono text-xs">
                          <Badge
                            className={`font-mono text-xs ${
                              status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : status === 'LATE'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : status === 'ABSENT'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {status === 'PRESENT'
                              ? '✅ PRESENT'
                              : status === 'LATE'
                              ? '⏰ LATE'
                              : status === 'ABSENT'
                              ? '❌ ABSENT'
                              : '⏳ SCHEDULED'}
                          </Badge>

                          {record?.checkInTime && (
                            <span className="text-[10px] text-slate-400 block">
                              Logged: {new Date(record.checkInTime).toLocaleTimeString()}
                            </span>
                          )}
                          {record?.markedBy && (
                            <span className="text-[10px] text-slate-500 block">
                              By: {record.markedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
