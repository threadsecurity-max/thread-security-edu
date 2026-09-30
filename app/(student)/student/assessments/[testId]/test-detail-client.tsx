'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  FileText,
  Eye,
  Maximize2,
  Lock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export interface TestDetailProps {
  test: {
    id: string;
    title: string;
    description: string;
    instructions: string | null;
    courseTitle: string;
    courseId: string;
    categoryName: string;
    durationMinutes: number;
    questionsPerAttempt: number;
    totalMarks: number;
    passingScore: number;
    maxAttempts: number;
    attemptsUsed: number;
    attemptsRemaining: number | string;
    activeAttemptId: string | null;
    antiCheating: {
      fullScreen: boolean;
      tabSwitchDetection: boolean;
      copyPasteRestriction: boolean;
      rightClickRestriction: boolean;
    };
    previousAttempts: Array<{
      id: string;
      attemptNumber: number;
      score: number;
      percentage: number;
      passed: boolean;
      submittedAt: string | null;
      timeTakenSeconds: number;
    }>;
  };
}

export function TestDetailClient({ test }: TestDetailProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasActiveAttempt = !!test.activeAttemptId;
  const isLimitReached =
    typeof test.attemptsRemaining === 'number' && test.attemptsRemaining <= 0 && !hasActiveAttempt;

  const handleStartOrResume = async () => {
    if (hasActiveAttempt) {
      router.push(`/student/assessments/take/${test.activeAttemptId}`);
      return;
    }

    try {
      setIsStarting(true);
      setErrorMsg(null);

      const res = await fetch(`/api/assessments/${test.id}/start`, {
        method: 'POST',
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to initialize assessment');
      }

      const attemptId = json.data.attemptId;
      router.push(`/student/assessments/take/${attemptId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error initializing attempt. Please try again.');
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/assessments"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ASSESSMENTS</span>
        </Link>
      </div>

      {/* Main Container */}
      <Card className="p-4 sm:p-6 md:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6 sm:space-y-8">
        {/* Title Header */}
        <div className="space-y-2.5 sm:space-y-3 pb-5 sm:pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-mono text-xs bg-slate-100 text-slate-700">
              {test.courseTitle}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs border-slate-200 text-slate-600">
              {test.categoryName}
            </Badge>
            {hasActiveAttempt && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-mono text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                ACTIVE ATTEMPT RUNNING
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
            {test.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {test.description}
          </p>
        </div>

        {/* Specifications Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono uppercase text-[10px] truncate">QUESTIONS</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">{test.questionsPerAttempt}</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Randomized variant set</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono uppercase text-[10px] truncate">DURATION</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">{test.durationMinutes} Mins</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Authoritative countdown</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono uppercase text-[10px] truncate">TOTAL MARKS</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">{test.totalMarks} Marks</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Passing: {test.passingScore}%</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono uppercase text-[10px] truncate">ATTEMPTS LEFT</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">{test.attemptsRemaining}</div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">{test.attemptsUsed} used so far</span>
          </div>
        </div>

        {/* Examination Instructions */}
        <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>EXAMINATION RULES & INSTRUCTIONS</span>
          </h3>

          <ul className="text-xs text-blue-950/80 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><strong>Server Auto-Save:</strong> Every answer you select is immediately synced and verified with the authoritative LMS backend.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><strong>Authoritative Timer:</strong> The test countdown runs on the server. If time expires, the system automatically grades and submits your current selections.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><strong>Refresh Resilience:</strong> In the event of network disruption or accidental page refresh, your ongoing attempt snapshot will be restored with your saved answers.</span>
            </li>
            {test.instructions && (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span className="whitespace-pre-line">{test.instructions}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Anti-Cheating & Integrity Policy */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ASSESSMENT INTEGRITY PROTOCOLS ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${test.antiCheating.fullScreen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Full Screen {test.antiCheating.fullScreen ? 'Enforced' : 'Optional'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${test.antiCheating.tabSwitchDetection ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Tab Switch Auditing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${test.antiCheating.copyPasteRestriction ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Clipboard Guard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${test.antiCheating.rightClickRestriction ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Context Menu Guard</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── START / RESUME ACTION ── */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-mono">
            {isLimitReached ? (
              <span className="text-rose-600 font-bold">Maximum attempts reached for this qualification.</span>
            ) : hasActiveAttempt ? (
              <span className="text-amber-600 font-bold">You have an ongoing exam in progress.</span>
            ) : (
              <span>Clicking start will lock your attempt snapshot and initialize the examination timer.</span>
            )}
          </div>

          <Button
            onClick={handleStartOrResume}
            disabled={isStarting || isLimitReached}
            className={`w-full sm:w-auto px-8 py-3 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${hasActiveAttempt
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Test Snapshot...</span>
              </>
            ) : hasActiveAttempt ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME TEST NOW</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START ASSESSMENT EXAM</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* ── PREVIOUS ATTEMPTS TABLE ── */}
      {test.previousAttempts.length > 0 && (
        <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-500" />
            <span>ATTEMPT HISTORY</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2.5 font-medium">ATTEMPT</th>
                  <th className="py-2.5 font-medium">DATE</th>
                  <th className="py-2.5 font-medium">SCORE</th>
                  <th className="py-2.5 font-medium">PERCENTAGE</th>
                  <th className="py-2.5 font-medium">STATUS</th>
                  <th className="py-2.5 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {test.previousAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-800">Attempt #{att.attemptNumber}</td>
                    <td className="py-3 text-slate-500">
                      {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 font-bold text-slate-800">
                      {att.score} / {test.totalMarks}
                    </td>
                    <td className="py-3 font-bold text-slate-900">{att.percentage}%</td>
                    <td className="py-3">
                      {att.passed ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">FAILED</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/student/assessments/results/${att.id}`}>
                        <button className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
