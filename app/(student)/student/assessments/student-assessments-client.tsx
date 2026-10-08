'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  Search,
  Filter,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface AssessmentItem {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  categoryId: string | null;
  categoryName: string;
  durationMinutes: number;
  questionsPerAttempt: number;
  totalMarks: number;
  passingScore: number;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number | string;
  status: 'Not Started' | 'Available' | 'In Progress' | 'Passed' | 'Failed' | 'Attempt Limit Reached';
  activeAttemptId: string | null;
  highestScore: number | null;
  lastAttempt: {
    id: string;
    attemptNumber: number;
    score: number;
    percentage: number;
    passed: boolean;
    submittedAt: string | null;
    timeTakenSeconds: number;
  } | null;
  history: Array<{
    id: string;
    attemptNumber: number;
    percentage: number;
    passed: boolean;
    submittedAt: string | null;
    timeTakenSeconds: number;
  }>;
}

export interface StudentAssessmentsClientProps {
  initialData: {
    assessments: AssessmentItem[];
    summary: {
      totalCompleted: number;
      testsPassed: number;
      inProgressCount: number;
      availableCount: number;
      averageScore: number;
    };
  };
}

export function StudentAssessmentsClient({ initialData }: StudentAssessmentsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const assessments = initialData?.assessments || [];
  const summary = initialData?.summary || {
    totalCompleted: 0,
    testsPassed: 0,
    inProgressCount: 0,
    availableCount: 0,
    averageScore: 0,
  };

  // Filter assessments
  const filtered = assessments.filter((item) => {
    if (!item) return false;
    // Tab filter
    if (activeTab === 'available' && item.status !== 'Available' && item.status !== 'Not Started') return false;
    if (activeTab === 'in-progress' && item.status !== 'In Progress') return false;
    if (activeTab === 'completed' && item.status !== 'Passed' && item.status !== 'Failed' && item.status !== 'Attempt Limit Reached') return false;

    // Category filter
    if (selectedCategory !== 'all' && item.categoryName !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.courseTitle || '').toLowerCase().includes(q) ||
        (item.categoryName || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(assessments.map((a) => a.categoryName).filter(Boolean)));

  return (
    <div className="space-y-8 text-white">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              ACADEMIC EVALUATION ENGINE v2.0
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              FACULTY-CONDUCTED EXAMINATIONS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Assessments &amp; Examination Center
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Standardized, server-evaluated qualification exams with dynamic question variants, server-authoritative timers, and instant analytical gradebooks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[110px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">PASS RATE</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">
              {summary.averageScore}%
            </span>
          </div>
        </div>
      </div>

      {/* ── METRIC TILES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">AVAILABLE</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{summary.availableCount}</div>
          <span className="text-[11px] text-zinc-400">Ready to attempt</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">IN PROGRESS</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">{summary.inProgressCount}</div>
          <span className="text-[11px] text-zinc-400">Pending completion</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">COMPLETED</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{summary.totalCompleted}</div>
          <span className="text-[11px] text-zinc-400">Attempts logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">TESTS PASSED</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">{summary.testsPassed}</div>
          <span className="text-[11px] text-zinc-400">Benchmark met</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">AVG SCORE</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#C6FF34]">{summary.averageScore}%</div>
          <span className="text-[11px] text-zinc-400">Overall index</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.025] p-3 sm:p-3.5 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Evaluations' },
            { id: 'available', label: 'Available' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-white/[0.08] rounded-xl px-2.5 py-1.5 bg-black/60 text-zinc-300 font-mono focus:outline-none focus:border-[#C6FF34] cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Domains</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-white/[0.08] bg-black/60 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF34] transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* ── ASSESSMENTS GRID ── */}
      {filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-zinc-500 flex items-center justify-center mx-auto">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-white">No assessments found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {searchQuery
              ? 'No evaluations match your search criteria. Try clearing filters.'
              : 'There are currently no active assessments matching this category filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => {
            const isPassed = item.status === 'Passed';
            const isFailed = item.status === 'Failed';
            const isInProgress = item.status === 'In Progress';
            const isLimitReached = item.status === 'Attempt Limit Reached';

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group shadow-lg backdrop-blur-xl"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                        {item.courseTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 bg-black/40 border border-white/[0.06]">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isInProgress && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          IN PROGRESS
                        </span>
                      )}
                      {isPassed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          PASSED ({item.highestScore}%)
                        </span>
                      )}
                      {isFailed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          FAILED ({item.lastAttempt?.percentage}%)
                        </span>
                      )}
                      {isLimitReached && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/[0.08]">
                          ATTEMPTS EXHAUSTED
                        </span>
                      )}
                      {(item.status === 'Available' || item.status === 'Not Started') && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                          AVAILABLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Quick specs pill */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-center font-mono text-[11px]">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Questions</span>
                      <span className="font-bold text-white">{item.questionsPerAttempt}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Duration</span>
                      <span className="font-bold text-white">{item.durationMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Pass Score</span>
                      <span className="font-bold text-[#C6FF34]">{item.passingScore}%</span>
                    </div>
                  </div>

                  {/* Attempt Info */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pt-0.5">
                    <span>
                      Attempts used: <strong className="text-white">{item.attemptsUsed}</strong>
                      {item.maxAttempts > 0 ? ` / ${item.maxAttempts}` : ' (Unlimited)'}
                    </span>
                    {item.lastAttempt && (
                      <span className="text-[11px] text-zinc-400">
                        Last score: <strong className="text-[#C6FF34]">{item.lastAttempt.percentage}%</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* ── ACTION FOOTER ── */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                  {isInProgress && item.activeAttemptId ? (
                    <Link href={`/student/assessments/take/${item.activeAttemptId}`} className="w-full">
                      <button className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Ongoing Attempt</span>
                      </button>
                    </Link>
                  ) : isLimitReached ? (
                    item.lastAttempt ? (
                      <Link href={`/student/assessments/results/${item.lastAttempt.id}`} className="w-full">
                        <button className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Best Result</span>
                        </button>
                      </Link>
                    ) : (
                      <button disabled className="w-full py-2.5 rounded-xl bg-white/[0.02] text-zinc-600 font-mono text-xs cursor-not-allowed">
                        Attempt Limit Reached
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <Link href={`/student/assessments/${item.id}`} className="flex-1">
                        <button className="w-full py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{item.attemptsUsed > 0 ? 'Retake Assessment' : 'Start Assessment'}</span>
                        </button>
                      </Link>

                      {item.lastAttempt && (
                        <Link href={`/student/assessments/results/${item.lastAttempt.id}`}>
                          <button
                            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="View Previous Result"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
