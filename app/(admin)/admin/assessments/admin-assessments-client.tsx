'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Eye,
  Edit,
  Send,
  Sparkles,
  Layers,
  Database,
  Cpu,
  X,
  Loader2,
  FileCheck,
} from 'lucide-react';

export interface AdminTestItem {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  durationMinutes: number;
  questionsPerAttempt: number;
  totalMarks: number;
  passingScore: number;
  maxAttempts: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  course: { id: string; title: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
  attemptsCount: number;
}

export interface AdminAssessmentsClientProps {
  initialTests: AdminTestItem[];
  overview: {
    totalTests: number;
    publishedTests: number;
    draftTests: number;
    totalQuestions: number;
    totalCategories: number;
    totalAttempts: number;
    completedAttempts: number;
    averagePercentage: number;
    passRatePercent: number;
  };
}

export function AdminAssessmentsClient({ initialTests, overview }: AdminAssessmentsClientProps) {
  const [tests, setTests] = useState<AdminTestItem[]>(initialTests);
  const [simulationData, setSimulationData] = useState<any | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Trigger test publishing
  const handlePublish = async (testId: string) => {
    setPublishingId(testId);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/admin/assessments/${testId}/publish`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed publishing test');
      }

      setTests((prev) =>
        prev.map((t) => (t.id === testId ? { ...t, status: 'PUBLISHED' } : t))
      );
      setActionNotice({
        type: 'success',
        message: 'Assessment passed all blueprint validations and is now LIVE for students!',
      });
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Error validating blueprint for publication.',
      });
    } finally {
      setPublishingId(null);
    }
  };

  // Trigger test simulation
  const handleSimulate = async (testId: string) => {
    setSimulatingId(testId);
    try {
      const res = await fetch(`/api/admin/assessments/${testId}/simulate`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Simulation failed');
      }
      setSimulationData(json.data);
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Simulation error' });
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#ef4444]" />
            <Badge variant="outline" className="font-mono text-xs text-red-700 bg-red-50/50 border-red-200">
              EVALUATION ENGINE COMMAND CENTER
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Assessment &amp; Test Management
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Build blueprints, configure difficulty distributions, manage cyber question banks, and review live attempt telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/assessments/builder">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Create New Test</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── METRICS TILES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4 font-mono">
        <div className="p-4 rounded-xl bg-white border border-red-200/70 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TOTAL TESTS</span>
          <div className="text-2xl font-black text-slate-900">{overview.totalTests}</div>
          <span className="text-[10px] text-slate-500">{overview.publishedTests} Published</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200/70 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">QUESTION BANK</span>
          <div className="text-2xl font-black text-slate-900">{overview.totalQuestions}</div>
          <span className="text-[10px] text-slate-500">Active Questions</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200/70 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CATEGORIES</span>
          <div className="text-2xl font-black text-slate-900">{overview.totalCategories}</div>
          <span className="text-[10px] text-slate-500">Security Domains</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200/70 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TOTAL ATTEMPTS</span>
          <div className="text-2xl font-black text-slate-900">{overview.totalAttempts}</div>
          <span className="text-[10px] text-slate-500">{overview.completedAttempts} Finalized</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200/70 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AVERAGE SCORE</span>
          <div className="text-2xl font-black text-slate-900">{overview.averagePercentage}%</div>
          <span className="text-[10px] text-slate-500">Class Average</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200/70 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">PASS RATE</span>
          <div className="text-2xl font-black text-emerald-600">{overview.passRatePercent}%</div>
          <span className="text-[10px] text-emerald-700/80">Qualification</span>
        </div>
      </div>

      {/* ── ACTION NOTICES ── */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-500 hover:text-slate-900 ml-3 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── SUB-NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-red-200/70 pb-3 font-mono text-xs scrollbar-none">
        <Link
          href="/admin/assessments"
          className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold whitespace-nowrap shadow-xs"
        >
          Tests &amp; Exams ({tests.length})
        </Link>
        <Link
          href="/admin/assessments/question-bank"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold whitespace-nowrap transition-colors"
        >
          Question Bank ({overview.totalQuestions})
        </Link>
        <Link
          href="/admin/assessments/categories"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold whitespace-nowrap transition-colors"
        >
          Domains ({overview.totalCategories})
        </Link>
        <Link
          href="/admin/assessments/families"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold whitespace-nowrap transition-colors"
        >
          Question Families
        </Link>
        <Link
          href="/admin/assessments/results"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold whitespace-nowrap transition-colors"
        >
          Student Attempts &amp; Results ({overview.totalAttempts})
        </Link>
      </div>

      {/* ── TESTS TABLE ── */}
      <Card className="bg-white border border-red-200/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-red-600" />
            <span>CONFIGURED TESTS &amp; BLUEPRINTS</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5 font-bold">TEST TITLE &amp; COURSE</th>
                <th className="py-3 px-4 font-bold">DOMAIN</th>
                <th className="py-3 px-4 font-bold text-center">QUESTIONS</th>
                <th className="py-3 px-4 font-bold text-center">TIME</th>
                <th className="py-3 px-4 font-bold text-center">PASSING</th>
                <th className="py-3 px-4 font-bold text-center">ATTEMPTS</th>
                <th className="py-3 px-4 font-bold text-center">STATUS</th>
                <th className="py-3 px-5 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No tests configured yet. Click &quot;Create New Test&quot; to build your first assessment.
                  </td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                      <span className="text-[11px] text-slate-500">{t.course.title}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="border-slate-200 text-slate-700">
                        {t.category?.name || 'General'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {t.questionsPerAttempt}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-700 font-bold">
                      {t.durationMinutes}m
                    </td>
                    <td className="py-4 px-4 text-center text-slate-700 font-bold">
                      {t.passingScore}%
                    </td>
                    <td className="py-4 px-4 text-center text-slate-700 font-bold">
                      {t.attemptsCount}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {t.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> PUBLISHED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold text-[10px]">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Simulate Blueprint */}
                        <button
                          onClick={() => handleSimulate(t.id)}
                          disabled={simulatingId === t.id}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Simulate Random Selection Against Blueprint"
                        >
                          {simulatingId === t.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </button>

                        {/* Publish (if draft) */}
                        {t.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(t.id)}
                            disabled={publishingId === t.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                            title="Validate Pool & Publish Test"
                          >
                            {publishingId === t.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Publish</span>
                          </button>
                        )}

                        {/* Edit Test */}
                        <Link href={`/admin/assessments/builder?id=${t.id}`}>
                          <button
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Edit Test & Blueprint"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </Link>

                        {/* View Results */}
                        <Link href={`/admin/assessments/results?testId=${t.id}`}>
                          <button
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="View Student Results & Attempts"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── SIMULATION PREVIEW MODAL ── */}
      {simulationData && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 bg-white rounded-2xl shadow-2xl border border-slate-200 space-y-5 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  BLUEPRINT SIMULATION RESULTS
                </h3>
              </div>
              <button
                onClick={() => setSimulationData(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 text-sm block">
                  {simulationData.assessmentTitle}
                </span>
                <span className="text-slate-500">
                  {simulationData.questionsPerAttempt} questions • {simulationData.durationMinutes} mins • {simulationData.totalMarks} marks
                </span>
              </div>

              {/* Status */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Feasibility Status:</span>
                {simulationData.validation.isValid ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300">
                    ✓ BLUEPRINT VALIDATED — POOL SATISFIED
                  </Badge>
                ) : (
                  <Badge className="bg-rose-50 text-rose-700 border border-rose-300">
                    ✕ DEFICIT — INSUFFICIENT QUESTIONS IN POOL
                  </Badge>
                )}
              </div>

              {/* Difficulty Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block">Difficulty Balance:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">EASY</span>
                    <span className="font-bold text-slate-800">
                      {simulationData.validation.calculatedCounts.easy} Qs
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">MEDIUM</span>
                    <span className="font-bold text-slate-800">
                      {simulationData.validation.calculatedCounts.medium} Qs
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">HARD</span>
                    <span className="font-bold text-slate-800">
                      {simulationData.validation.calculatedCounts.hard} Qs
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings or Errors */}
              {simulationData.validation.errors.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <span className="font-bold block">Deficit Details:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {simulationData.validation.errors.map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setSimulationData(null)}
                className="text-xs font-bold"
              >
                Close Simulation
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
