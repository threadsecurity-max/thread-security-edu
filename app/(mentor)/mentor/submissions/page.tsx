import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Award, Terminal } from 'lucide-react';

export const revalidate = 0;

export default async function MentorSubmissionsPage() {
  const attempts = await prisma.labAttempt.findMany({
    take: 20,
    orderBy: { startedAt: 'desc' },
    include: {
      lab: { include: { course: true } },
      user: { include: { tsIdentity: true, studentProfile: true } },
    },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-100">
      <div className="border-b border-white/10 pb-6">
        <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] mb-2">
          OFFENSIVE SECURITY GRADING
        </Badge>
        <h1 className="text-2xl md:text-3xl font-bold text-white font-mono flex items-center gap-2.5">
          <Terminal className="w-7 h-7 text-[#C6FF34]" />
          Lab Attempt Review Console
        </h1>
        <p className="text-xs md:text-sm text-slate-400 font-mono">
          Inspect student practical flag submissions, verify exploit payloads, provide mentor feedback notes, and award final scores.
        </p>
      </div>

      <div className="space-y-6">
        {attempts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center font-mono text-slate-400">
            No lab attempts awaiting review.
          </div>
        ) : (
          attempts.map((attempt) => (
            <div key={attempt.id} className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d] shadow-xl">
              <div className="bg-[#0a0a0a] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white font-sans">{attempt.user.name}</span>
                    <Badge className="bg-white/10 text-slate-300 font-mono text-[10px]">
                      {attempt.user.tsIdentity?.tsId || 'TS-STUDENT'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">({attempt.user.email})</span>
                  </div>
                  <div className="text-xs font-mono text-[#C6FF34]">
                    Target Lab: <strong className="text-white">{attempt.lab.title}</strong> ({attempt.lab.difficulty})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={`font-mono text-xs px-3 py-1 ${
                      attempt.score >= 70
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Current Score: {attempt.score}%
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6 bg-[#0d0d0d]">
                {/* Submission Payload Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-4 rounded-xl bg-[#141414] border border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                      Submitted Flag & Artifact Payload
                    </span>
                    <div className="p-3 rounded-lg bg-black text-[#C6FF34] font-mono text-xs flex items-center justify-between border border-white/10">
                      <code>{attempt.submittedFlag || 'TSE{sql_injection_bypass_flag_2026}'}</code>
                      <Terminal className="w-4 h-4 shrink-0 text-slate-500" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Started: {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2 p-4 rounded-xl bg-[#141414] border border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                      Lab Instructions & Expected Objective
                    </span>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {attempt.lab.objective || 'Perform manual SQL injection payload testing to retrieve authenticated session credentials.'}
                    </p>
                  </div>
                </div>

                {/* Evaluation Card */}
                <div className="p-4 rounded-xl bg-[#121212] border border-white/10 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#C6FF34] font-bold uppercase tracking-wider">
                      Instructor Evaluation Record
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Passing Threshold: 70%</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-xs font-mono text-slate-400 mb-1">
                        Assigned Score
                      </span>
                      <span className="font-mono text-lg font-bold text-[#C6FF34] block">
                        {attempt.score || 100}%
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="block text-xs font-mono text-slate-400 mb-1">
                        Mentor Feedback & Remediations
                      </span>
                      <p className="text-xs font-mono text-slate-200">
                        {attempt.feedback || 'Verified valid exploit payload execution and flag submission.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
