'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const { assessments, summary } = initialData;

  // Filter assessments
  const filtered = assessments.filter((item) => {
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
        item.title.toLowerCase().includes(q) ||
        item.courseTitle.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(assessments.map((a) => a.categoryName)));

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="font-mono text-xs text-slate-700 bg-white shadow-xs">
              ACADEMIC EVALUATION ENGINE v2.0
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessments & Examination Center
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Standardized, server-evaluated qualification exams with dynamic question variant balancing, server-authoritative timers, and instant performance analytics.
          </p>
        </div>
      </div>

      {/* ── METRIC TILES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider block">AVAILABLE</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.availableCount}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Ready to attempt</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-amber-600 uppercase tracking-wider block">IN PROGRESS</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{summary.inProgressCount}</div>
          <span className="text-[10px] sm:text-[11px] text-amber-700/80">Pending completion</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider block">COMPLETED</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.totalCompleted}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Total attempts logged</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-600 uppercase tracking-wider block">TESTS PASSED</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">{summary.testsPassed}</div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700/80">Benchmark met</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider block">AVERAGE SCORE</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.averageScore}%</div>
          <span className="text-[10px] sm:text-[11px] text-slate-500">Historical performance</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Assessments' },
            { id: 'available', label: 'Available' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer w-full sm:w-auto"
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
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── ASSESSMENTS GRID ── */}
      {filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No assessments found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'No assessments match your search criteria. Try clearing filters.'
              : 'There are currently no assessments available matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((item) => {
            const isPassed = item.status === 'Passed';
            const isFailed = item.status === 'Failed';
            const isInProgress = item.status === 'In Progress';
            const isLimitReached = item.status === 'Attempt Limit Reached';

            return (
              <Card
                key={item.id}
                className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 sm:space-y-5 relative overflow-hidden group"
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isPassed
                      ? 'bg-emerald-500'
                      : isFailed
                      ? 'bg-rose-500'
                      : isInProgress
                      ? 'bg-amber-500'
                      : 'bg-slate-200 group-hover:bg-slate-400'
                  } transition-colors`}
                />

                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="font-mono text-[11px] bg-slate-100 text-slate-700">
                        {item.courseTitle}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[11px] border-slate-200 text-slate-600">
                        {item.categoryName}
                      </Badge>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isInProgress && (
                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          IN PROGRESS
                        </Badge>
                      )}
                      {isPassed && (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PASSED ({item.highestScore}%)
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px]">
                          FAILED ({item.lastAttempt?.percentage}%)
                        </Badge>
                      )}
                      {isLimitReached && (
                        <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[11px]">
                          ATTEMPTS EXHAUSTED
                        </Badge>
                      )}
                      {(item.status === 'Available' || item.status === 'Not Started') && (
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px]">
                          AVAILABLE
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Quick specs pill */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Questions</span>
                      <span className="font-bold text-slate-800">{item.questionsPerAttempt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Duration</span>
                      <span className="font-bold text-slate-800">{item.durationMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Passing</span>
                      <span className="font-bold text-slate-800">{item.passingScore}%</span>
                    </div>
                  </div>

                  {/* Attempt Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                    <span>
                      Attempts used: <strong className="text-slate-800">{item.attemptsUsed}</strong>
                      {item.maxAttempts > 0 ? ` / ${item.maxAttempts}` : ' (Unlimited)'}
                    </span>
                    {item.lastAttempt && (
                      <span className="text-[11px] text-slate-400">
                        Last score: {item.lastAttempt.percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* ── ACTION FOOTER ── */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {isInProgress && item.activeAttemptId ? (
                    <Link href={`/student/assessments/take/${item.activeAttemptId}`} className="w-full">
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 py-2 cursor-pointer shadow-sm">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Ongoing Attempt</span>
                      </Button>
                    </Link>
                  ) : isLimitReached ? (
                    item.lastAttempt ? (
                      <Link href={`/student/assessments/results/${item.lastAttempt.id}`} className="w-full">
                        <Button variant="outline" className="w-full font-bold text-xs flex items-center justify-center gap-2 py-2 cursor-pointer border-slate-300">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Best Result</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full text-xs font-medium">
                        Attempt Limit Reached
                      </Button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <Link href={`/student/assessments/${item.id}`} className="flex-1">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 py-2 cursor-pointer shadow-sm">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{item.attemptsUsed > 0 ? 'Retake Assessment' : 'Start Assessment'}</span>
                        </Button>
                      </Link>

                      {item.lastAttempt && (
                        <Link href={`/student/assessments/results/${item.lastAttempt.id}`}>
                          <Button
                            variant="outline"
                            className="px-3 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                            title="View Previous Result"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
