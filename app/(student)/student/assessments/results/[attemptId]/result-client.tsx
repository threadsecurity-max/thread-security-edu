'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';
import { FinalScorecard } from '@/server/services/assessment/scoring.service';

export interface ResultClientProps {
  scorecard: FinalScorecard;
  detailedReview?: {
    questions: Array<{
      attemptQuestionId: string;
      displayOrder: number;
      questionText: string;
      explanation: string | null;
      marks: number;
      topic: string;
      difficulty: string;
      category: string;
      isCorrect: boolean;
      marksAwarded: number;
      selectedOptionId: string | null;
      correctOptionId?: string;
      options: Array<{
        optionId: string;
        optionText: string;
        displayOrder: number;
        isCorrect: boolean;
        isSelected: boolean;
      }>;
    }>;
  };
}

export function ResultClient({ scorecard, detailedReview }: ResultClientProps) {
  const [showReview, setShowReview] = useState(false);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/student/assessments"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ALL ASSESSMENTS</span>
        </Link>
      </div>

      {/* ── HERO SCORECARD ── */}
      <Card className="p-4 sm:p-6 md:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6 sm:space-y-8 relative overflow-hidden">
        {/* Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            scorecard.passed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Top Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="secondary" className="font-mono text-xs bg-slate-100 text-slate-700">
                {scorecard.courseTitle}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs border-slate-200 text-slate-600">
                Attempt #{scorecard.attemptNumber}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {scorecard.testTitle}
            </h1>
          </div>

          <div className="shrink-0">
            {scorecard.passed ? (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>QUALIFIED / PASSED</span>
              </Badge>
            ) : (
              <Badge className="bg-rose-50 text-rose-700 border border-rose-300 font-mono text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs w-fit">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>DID NOT PASS</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
              FINAL SCORE
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {scorecard.obtainedMarks}
              <span className="text-sm sm:text-base text-slate-400 font-bold"> / {scorecard.totalMarks}</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 font-mono block">
              Grade: {scorecard.percentage}%
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
              PASSING BENCHMARK
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{scorecard.passingScore}%</div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono block">Required threshold</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
              TIME CONSUMED
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
              {formatDuration(scorecard.timeTakenSeconds)}
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono block">Authoritative duration</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
              ACCURACY RATIO
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {scorecard.correctAnswers}
              <span className="text-sm sm:text-base text-slate-400 font-bold"> / {scorecard.totalQuestions}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-mono block">Questions correct</span>
          </div>
        </div>

        {/* Tally Pill */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">CORRECT</span>
            <span className="font-bold text-emerald-600 text-xs sm:text-sm">+{scorecard.correctAnswers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">WRONG</span>
            <span className="font-bold text-rose-600 text-xs sm:text-sm">{scorecard.wrongAnswers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">UNANSWERED</span>
            <span className="font-bold text-slate-500 text-xs sm:text-sm">{scorecard.unansweredQuestions}</span>
          </div>
        </div>

        {/* ── VISUAL PERFORMANCE BREAKDOWNS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Category Performance */}
          <div className="p-5 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>DOMAIN PERFORMANCE</span>
            </h3>

            <div className="space-y-3">
              {scorecard.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{cat.category}</span>
                    <span className="font-bold text-slate-900">
                      {cat.correct}/{cat.total} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cat.percentage >= 70 ? 'bg-emerald-500' : cat.percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Performance */}
          <div className="p-5 rounded-xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>DIFFICULTY BREAKDOWN</span>
            </h3>

            <div className="space-y-3">
              {scorecard.difficultyBreakdown.map((diff) => (
                <div key={diff.difficulty} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-slate-700">{diff.difficulty}</span>
                    <span className="font-bold text-slate-900">
                      {diff.correct}/{diff.total} ({diff.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        diff.percentage >= 70 ? 'bg-emerald-500' : diff.percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${diff.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ACTION FOOTER ── */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/student/assessments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full font-bold text-xs border-slate-200 cursor-pointer">
              Return to Assessments
            </Button>
          </Link>

          {detailedReview && (
            <Button
              onClick={() => setShowReview(!showReview)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showReview ? 'Hide Detailed Answers' : 'View Detailed Question Review'}</span>
              {showReview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </Card>

      {/* ── DETAILED QUESTION REVIEW SECTION ── */}
      {showReview && detailedReview && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>POST-EXAMINATION QUESTION REVIEW</span>
          </h2>

          <div className="space-y-4">
            {detailedReview.questions.map((q) => (
              <Card
                key={q.attemptQuestionId}
                className={`p-4 sm:p-6 bg-white rounded-2xl border shadow-xs space-y-4 transition-all ${
                  q.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs font-mono">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">QUESTION {q.displayOrder}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {q.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {q.difficulty}
                    </Badge>
                  </div>

                  <div className="w-fit">
                    {q.isCorrect ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> +{q.marksAwarded} Marks (Correct)
                      </span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-bold flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3 h-3 text-rose-600 shrink-0" /> 0 / {q.marks} Marks (Incorrect)
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-sm font-bold text-slate-900 leading-relaxed break-words">{q.questionText}</p>

                {/* Choices breakdown */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isStudentSelection = opt.isSelected;
                    const isCorrectAnswer = opt.isCorrect;

                    let optionBorder = 'border-slate-200 bg-slate-50/50 text-slate-700';

                    if (isCorrectAnswer) {
                      optionBorder = 'border-emerald-400 bg-emerald-50/70 text-emerald-950 font-bold';
                    } else if (isStudentSelection && !isCorrectAnswer) {
                      optionBorder = 'border-rose-400 bg-rose-50/70 text-rose-950 font-medium';
                    }

                    return (
                      <div
                        key={opt.optionId}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2.5 sm:gap-3 ${optionBorder}`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded font-mono font-bold text-[10px] bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="break-words leading-relaxed pt-0.5">{opt.optionText}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] mt-0.5">
                          {isCorrectAnswer && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                            </span>
                          )}
                          {isStudentSelection && !isCorrectAnswer && (
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                    <span className="font-bold font-mono text-[10px] uppercase text-slate-500 block">
                      EXPLANATION & REMEDIATION
                    </span>
                    <p className="leading-relaxed break-words">{q.explanation}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
