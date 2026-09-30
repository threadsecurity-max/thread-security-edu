'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileCheck2,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Shield,
  Loader2,
  Calendar,
} from 'lucide-react';

interface AttemptRow {
  id: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  percentage?: number | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  assessment: {
    id: string;
    title: string;
    course?: { id: string; title: string } | null;
    category?: { id: string; name: string } | null;
  };
  result?: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
    timeTakenSeconds?: number | null;
  } | null;
  eventsCount: number;
}

interface AdminResultsClientProps {
  initialAttempts: AttemptRow[];
  courses: { id: string; title: string }[];
  categories: { id: string; name: string }[];
}

export function AdminResultsClient({
  initialAttempts,
  courses,
  categories,
}: AdminResultsClientProps) {
  const [attempts] = useState<AttemptRow[]>(initialAttempts);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer / Inspection Modal
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<any | null>(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.user.name.toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q) ||
        a.assessment.title.toLowerCase().includes(q);

      const matchCourse = !courseFilter || a.assessment.course?.id === courseFilter;
      const matchCategory = !categoryFilter || a.assessment.category?.id === categoryFilter;
      const matchStatus = !statusFilter || a.status === statusFilter;

      return matchSearch && matchCourse && matchCategory && matchStatus;
    });
  }, [attempts, search, courseFilter, categoryFilter, statusFilter]);

  const handleInspect = async (id: string) => {
    setInspectingId(id);
    setLoadingInspect(true);
    setInspectData(null);
    try {
      const res = await fetch(`/api/admin/assessments/attempts/${id}`);
      const json = await res.json();
      if (json.success) {
        setInspectData(json.data);
      } else {
        alert(json.error || 'Failed loading attempt review');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInspect(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link
              href="/admin/assessments"
              className="hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Assessments
            </Link>
            <span>/</span>
            <span className="text-slate-200">Results & Audit</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-red-500" />
            Assessment Submissions & Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review student exam attempts, question-by-question scoring breakdowns, and anti-cheating audit events.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-900/80 border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or test..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="AUTO_SUBMITTED">Auto Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{filteredAttempts.length}</span>{' '}
            submissions
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="py-16 text-center">
            <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No attempts found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              No student assessment submissions match your active filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Assessment / Course</th>
                  <th className="py-3 px-4">Attempt</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Time Taken</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAttempts.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{row.user.name}</div>
                      <div className="text-[11px] text-slate-500">{row.user.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{row.assessment.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {row.assessment.course?.title || 'General Test'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      #{row.attemptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={
                          row.status === 'SUBMITTED'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : row.status === 'AUTO_SUBMITTED'
                            ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            : row.status === 'IN_PROGRESS'
                            ? 'border-sky-500/40 text-sky-400 bg-sky-500/10'
                            : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.percentage !== null && row.percentage !== undefined ? (
                        <div>
                          <span
                            className={`font-bold ${
                              row.percentage >= 70 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {row.percentage.toFixed(0)}%
                          </span>
                          <span className="text-slate-500 ml-1">
                            ({row.score?.toFixed(1) || 0} pts)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {row.result?.timeTakenSeconds
                        ? `${Math.round(row.result.timeTakenSeconds / 60)} min`
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(row.startedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => handleInspect(row.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Attempt Inspection Drawer / Modal */}
      {inspectingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Attempt Inspection & Proctoring Audit
                </h2>
                <code className="text-xs text-slate-500 font-mono">ID: {inspectingId}</code>
              </div>
              <button
                onClick={() => setInspectingId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loadingInspect ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading comprehensive attempt snapshot...</p>
              </div>
            ) : inspectData ? (
              <div className="space-y-6">
                {/* Overview Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Student</span>
                    <span className="font-semibold text-white">{inspectData.user?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Score & Percentage</span>
                    <span className="font-bold text-emerald-400">
                      {inspectData.score} / {inspectData.totalMarks} ({inspectData.percentage}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-semibold text-slate-200">{inspectData.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Attempt Duration</span>
                    <span className="font-semibold text-slate-200">
                      {Math.round((inspectData.result?.timeTakenSeconds || 0) / 60)} min
                    </span>
                  </div>
                </div>

                {/* Audit Events (Anti-Cheating Telemetry) */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Proctoring & Anti-Cheating Telemetry (
                    {inspectData.events?.length || 0} events)
                  </h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg max-h-40 overflow-y-auto p-3 space-y-1.5 font-mono text-[11px]">
                    {(!inspectData.events || inspectData.events.length === 0) ? (
                      <span className="text-slate-500 italic">No suspicious events recorded.</span>
                    ) : (
                      inspectData.events.map((ev: any) => (
                        <div
                          key={ev.id}
                          className={`flex items-center justify-between py-0.5 ${
                            ev.eventType.includes('TAB') || ev.eventType.includes('FOCUS')
                              ? 'text-amber-300'
                              : 'text-slate-400'
                          }`}
                        >
                          <span className="font-semibold">[{ev.eventType}]</span>
                          <span className="text-slate-500">
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Question Response Breakdown
                  </h3>
                  {inspectData.questions?.map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                        q.isCorrect
                          ? 'bg-slate-950/60 border-emerald-900/40'
                          : q.selectedOptionId
                          ? 'bg-slate-950/60 border-rose-900/40'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">
                          Q{idx + 1}. {q.topic} ({q.difficulty})
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            q.isCorrect
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : q.selectedOptionId
                              ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                              : 'border-slate-700 text-slate-500 bg-slate-800'
                          }
                        >
                          {q.isCorrect ? 'Correct' : q.selectedOptionId ? 'Incorrect' : 'Unanswered'}
                        </Badge>
                      </div>

                      <p className="text-slate-200">{q.questionText}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options?.map((opt: any) => {
                          const isSelected = opt.id === q.selectedOptionId;
                          const isCorrect = opt.isCorrect;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded text-[11px] flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                                  : isSelected
                                  ? 'bg-rose-950/60 border border-rose-700 text-rose-300'
                                  : 'bg-slate-900 border border-slate-800/80 text-slate-400'
                              }`}
                            >
                              <span>{opt.optionText}</span>
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-400 font-semibold ml-1">
                                  ✓ Correct
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="text-[10px] text-rose-400 font-semibold ml-1">
                                  ✗ Chosen
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <p className="text-slate-400 italic text-[11px] pt-1">
                          <span className="text-slate-500 not-italic font-semibold">Explanation:</span>{' '}
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <Button
                onClick={() => setInspectingId(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                Close Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
