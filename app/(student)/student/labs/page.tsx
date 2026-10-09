import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Terminal,
  Clock,
  ShieldCheck,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
} from 'lucide-react';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export const revalidate = 0;

export default async function StudentLabsListPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const labs = await prisma.lab.findMany({
    include: {
      course: true,
      attempts: {
        where: { userId: session.userId },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCompleted = labs.filter(
    (l) => l.attempts[0]?.state === 'COMPLETED' || l.attempts[0]?.state === 'SUBMITTED'
  ).length;

  return (
    <div className="space-y-8 text-white">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              PRACTICAL SANDBOX ENVIRONMENT
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              ISOLATED CYBER RANGE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Hands-On Practical Labs
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Deploy dedicated virtual targets configured by faculty mentors. Execute vulnerability exploitation methodologies, extract CTF proof-of-concept flags, and submit live execution logs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[110px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">COMPLETED</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">
              {totalCompleted} / {labs.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── LABS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
            <Terminal className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-white">No active labs provisioned</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Faculty mentors are currently provisioning sandbox targets for your assigned course cohort.
            </p>
          </div>
        ) : (
          labs.map((lab) => {
            const attempt = lab.attempts[0];
            const state = attempt?.state || 'AVAILABLE';
            const isCompleted = state === 'COMPLETED' || state === 'SUBMITTED';

            // Extract external lab URL if present
            let targetUrl: string | null = null;
            if (lab.flagHash) {
              if (lab.flagHash.startsWith('URL:')) {
                targetUrl = lab.flagHash.replace('URL:', '').trim();
              } else if (lab.flagHash.startsWith('http://') || lab.flagHash.startsWith('https://')) {
                targetUrl = lab.flagHash.trim();
              }
            }
            if (!targetUrl) {
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const matchInst = lab.instructions?.match(urlRegex);
              if (matchInst && matchInst[0]) targetUrl = matchInst[0].replace(/[.,;\)]+$/, '');
              else {
                const matchObj = lab.objective?.match(urlRegex);
                if (matchObj && matchObj[0]) targetUrl = matchObj[0].replace(/[.,;\)]+$/, '');
              }
            }

            return (
              <div
                key={lab.id}
                className="p-6 rounded-3xl bg-[#0d0f14] hover:bg-[#11141b] border border-white/[0.08] hover:border-[#C6FF34]/30 transition-all duration-200 backdrop-blur-xl flex flex-col justify-between space-y-5 group relative overflow-hidden shadow-2xl"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : state === 'IN_PROGRESS'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20'
                      }`}
                    >
                      {isCompleted ? 'COMPLETED' : state}
                    </span>

                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {lab.estimatedMinutes} mins
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                      {lab.course?.title || 'Core Cybersecurity'}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors tracking-tight mt-0.5">
                      {lab.title}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {lab.objective}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Target Competencies
                    </span>
                    <p className="text-xs font-mono text-[#C6FF34] truncate">
                      {lab.skills || 'Reconnaissance • Exploit Execution • Report Generation'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {targetUrl ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_2px_12px_rgba(198,255,52,0.2)] hover:scale-[1.01] transition-all cursor-pointer text-center"
                      >
                        <span>Launch Lab ↗</span>
                      </a>

                      <Link href={`/student/labs/${lab.id}`} className="block">
                        <button
                          className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/10 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>{isCompleted ? 'Review Submission' : 'Submit Flag'}</span>
                          <Terminal className="w-3.5 h-3.5 text-[#C6FF34]" />
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <Link href={`/student/labs/${lab.id}`} className="block">
                      <button
                        className={`w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08]'
                            : 'bg-[#C6FF34] hover:bg-[#b5f425] text-black shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99]'
                        }`}
                      >
                        <span>{isCompleted ? 'Review Lab Execution Proof' : 'Launch Sandbox & Submit'}</span>
                        <Terminal
                          className={`w-4 h-4 ${isCompleted ? 'text-[#C6FF34]' : 'text-black'}`}
                        />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
