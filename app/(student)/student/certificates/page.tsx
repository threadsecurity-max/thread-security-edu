import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Lock, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export const revalidate = 0;

export default async function StudentCertificatesPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tsIdentity: true,
      certificates: { include: { course: true } },
      enrollments: { include: { course: true } },
    },
  });

  const tsId =
    student?.tsIdentity?.tsId || session.tsId || `TSE-2026-${session.userId.slice(-6).toUpperCase()}`;

  const certificates = student?.certificates || [];
  const inProgressCourses = (student?.enrollments || []).filter(
    (e) => !certificates.some((c) => c.courseId === e.courseId)
  );

  return (
    <div className="space-y-8 text-white">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              VERIFIED ACADEMIC CREDENTIALS
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              CRYPTOGRAPHIC PROOF OF MASTERY
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Earned Qualifications &amp; Diplomas
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Cryptographically signed graduation credentials issued by faculty mentors and academic registrars. Bound to your unique identity identifier (<code className="font-mono text-[#C6FF34] font-bold">{tsId}</code>).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[110px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">CREDENTIALS</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">
              {certificates.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── ISSUED CERTIFICATES ── */}
      {certificates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-white">No certificates issued yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Complete your enrolled cybersecurity courses, score &ge; 75% on practical lab challenges, and pass faculty-evaluated assessments to earn verifiable credentials.
            </p>
          </div>
          <Link href="/student/courses" className="inline-block pt-2">
            <button className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] transition-all cursor-pointer">
              <span>Continue Active Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-[#C6FF34]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C6FF34]/[0.05] rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-[#C6FF34] text-black flex items-center justify-center font-bold shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                  {cert.certificateId}
                </span>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CRYPTOGRAPHICALLY VERIFIED
                </span>
                <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                  {cert.course.title}
                </h3>
                <span className="text-xs font-mono text-zinc-400 block pt-0.5">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] font-mono text-[11px] space-y-1 relative z-10">
                <span className="text-zinc-500 block uppercase text-[9px] tracking-wider">SHA-256 Verification Hash</span>
                <span className="text-zinc-300 break-all leading-tight block">{cert.verificationHash}</span>
              </div>

              <Link href={`/verify-certificate?id=${cert.certificateId}`} target="_blank" className="block relative z-10">
                <button className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <span>Open Public Verification Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C6FF34]" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── IN PROGRESS QUALIFICATION TRACKS ── */}
      {inProgressCourses.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-zinc-400" />
              Credentials In Progress ({inProgressCourses.length})
            </h2>
            <span className="text-xs font-mono text-zinc-400">Milestone Driven</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressCourses.map((enr) => (
              <div
                key={enr.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-serif font-bold text-white truncate">
                    {enr.course.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span>Progress: {Math.round(enr.progressPercent)}%</span>
                    <span>•</span>
                    <span className="text-amber-400">Requirements Pending</span>
                  </div>
                </div>

                <Link href={`/student/courses`}>
                  <button className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-zinc-200 transition-colors cursor-pointer shrink-0">
                    Resume
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
