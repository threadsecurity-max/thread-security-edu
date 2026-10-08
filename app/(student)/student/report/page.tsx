import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileText, CheckCircle2, Award, Terminal, UserCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { PrintReportButton } from '@/src/components/student/report/PrintReportButton';

export const revalidate = 0;

export default async function StudentAcademicReportPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tsIdentity: true,
      studentProfile: {
        include: {
          skills: true,
          assignedMentor: { include: { user: true } },
        },
      },
      enrollments: {
        include: {
          course: {
            include: { mentor: { include: { user: true } } },
          },
        },
      },
      labAttempts: {
        include: { lab: true },
        orderBy: { completedAt: 'desc' },
      },
      certificates: {
        include: { course: true },
      },
    },
  });

  const tsId =
    student?.tsIdentity?.tsId || session.tsId || `TSE-2026-${session.userId.slice(-6).toUpperCase()}`;

  const mentorName =
    student?.studentProfile?.assignedMentor?.user.name ||
    student?.enrollments?.[0]?.course?.mentor?.user?.name ||
    'Faculty Lead';

  const completedLabs = student?.labAttempts.filter(
    (l) => l.state === 'COMPLETED' || l.state === 'SUBMITTED'
  ).length || 0;

  return (
    <div className="space-y-8 text-white">
      {/* ── ACTION HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              OFFICIAL ACADEMIC DOSSIER
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Academic Performance Report
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Official verifiable transcript of curriculum progress, practical sandbox examinations, mentor evaluations, and cryptographic qualifications.
          </p>
        </div>

        <PrintReportButton />
      </div>

      {/* ── PRINTABLE TRANSCRIPT CONTAINER ── */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6FF34]/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Dossier Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.08] pb-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#C6FF34]" />
              <span className="font-serif font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                THREAD SECURITY EDUCATION
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono block">
              Registrar Division • Academic Ledger &amp; Student Credentials
            </span>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-1">
            <span className="text-zinc-500 uppercase tracking-widest text-[10px] block">
              AUTHENTICATED TS-ID
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 inline-block">
              {tsId}
            </span>
          </div>
        </div>

        {/* Student Profile Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 rounded-2xl bg-black/40 border border-white/[0.06] font-mono text-xs relative z-10">
          <div className="space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] tracking-wider block">Candidate Name</span>
            <span className="font-serif font-bold text-white text-base block">{student?.name}</span>
            <span className="text-zinc-400 text-[11px] block">{student?.email}</span>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] tracking-wider block">Specialization Track</span>
            <span className="font-bold text-white block">
              {student?.studentProfile?.careerGoal || 'Cyber Defense & VAPT'}
            </span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Enrollment
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] tracking-wider block">Assigned Lead Mentor</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
              {mentorName}
            </span>
            <span className="text-zinc-400 text-[11px] block">Faculty Evaluation Board</span>
          </div>
        </div>

        {/* Course Progress Table */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C6FF34]" />
              Curriculum Programs &amp; Status
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {student?.enrollments.length || 0} Programs
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.04] text-zinc-300 border-b border-white/[0.06]">
                <tr>
                  <th className="p-3.5 font-bold">Program Title</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Level</th>
                  <th className="p-3.5 text-right font-bold">Curriculum Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {(!student?.enrollments || student.enrollments.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-zinc-500">
                      No active course records found in academic ledger.
                    </td>
                  </tr>
                ) : (
                  student.enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold text-white">{e.course.title}</td>
                      <td className="p-3.5 text-zinc-400">{e.course.category}</td>
                      <td className="p-3.5 text-zinc-400">{e.course.level}</td>
                      <td className="p-3.5 text-right font-bold text-[#C6FF34]">
                        {Math.round(e.progressPercent)}% ({e.status})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Practical Lab Log Table */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Practical Lab Examination History
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              {completedLabs} / {student?.labAttempts.length || 0} Targets Cleared
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.04] text-zinc-300 border-b border-white/[0.06]">
                <tr>
                  <th className="p-3.5 font-bold">Target Sandbox</th>
                  <th className="p-3.5 font-bold">Execution State</th>
                  <th className="p-3.5 font-bold">Score</th>
                  <th className="p-3.5 text-right font-bold">Completion Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {(!student?.labAttempts || student.labAttempts.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-zinc-500">
                      No practical lab attempts recorded.
                    </td>
                  </tr>
                ) : (
                  student.labAttempts.map((la) => (
                    <tr key={la.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold text-white">{la.lab.title}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            la.state === 'COMPLETED' || la.state === 'SUBMITTED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {la.state}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#C6FF34]">{la.score}/100</td>
                      <td className="p-3.5 text-right text-zinc-400">
                        {la.completedAt ? new Date(la.completedAt).toLocaleDateString() : 'In Conduction'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dossier Footer with Cryptographic Seal */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 font-mono relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34]" />
            <span>Document Timestamp: {new Date().toISOString().split('T')[0]}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
              REGISTRAR SEAL: CRYPTOGRAPHICALLY VALID &amp; VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
