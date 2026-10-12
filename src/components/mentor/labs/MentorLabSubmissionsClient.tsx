'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Mail,
  Send,
  Sparkles,
  ExternalLink,
  Clock,
  User,
} from 'lucide-react';
import { gradeLabAttemptAction } from '@/features/mentor/actions/mentor.actions';

export interface LabSubmissionItem {
  id: string;
  labId: string;
  userId: string;
  state: string;
  score: number;
  submittedFlag: string | null;
  feedback: string | null;
  startedAt: string | Date;
  completedAt: string | Date | null;
  lab: {
    id: string;
    title: string;
    difficulty: string;
    objective: string;
    course?: {
      id: string;
      title: string;
    } | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    tsIdentity?: {
      tsId: string;
    } | null;
  };
}

export function MentorLabSubmissionsClient({
  initialAttempts,
}: {
  initialAttempts: LabSubmissionItem[];
}) {
  const [attempts, setAttempts] = useState<LabSubmissionItem[]>(initialAttempts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  // Per-attempt form state
  const [formScores, setFormScores] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initialAttempts.forEach((a) => {
      map[a.id] = a.score || (a.state === 'COMPLETED' ? 100 : 70);
    });
    return map;
  });

  const [formFeedbacks, setFormFeedbacks] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialAttempts.forEach((a) => {
      map[a.id] = a.feedback || 'Exploit payload verified and flag capture confirmed. Good execution.';
    });
    return map;
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGradeSubmit = async (attemptId: string) => {
    const score = Number(formScores[attemptId] ?? 100);
    const feedback = formFeedbacks[attemptId] || 'Exploit verified successfully.';

    if (isNaN(score) || score < 0 || score > 100) {
      showToast('Score must be a number between 0 and 100.', 'error');
      return;
    }

    setEvaluatingId(attemptId);
    try {
      const res = await gradeLabAttemptAction(attemptId, score, feedback);
      if (res.success) {
        showToast(`Evaluation saved! Result email dispatched to student.`, 'success');
        setAttempts((prev) =>
          prev.map((item) =>
            item.id === attemptId
              ? {
                  ...item,
                  score,
                  feedback,
                  state: score >= 70 ? 'COMPLETED' : 'SUBMITTED',
                  completedAt: new Date(),
                }
              : item
          )
        );
      } else {
        showToast(res.error || 'Failed to submit grade.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating evaluation.', 'error');
    } finally {
      setEvaluatingId(null);
    }
  };

  const filteredAttempts = attempts.filter((attempt) => {
    const studentName = (attempt.user.name || '').toLowerCase();
    const studentEmail = (attempt.user.email || '').toLowerCase();
    const tsId = (attempt.user.tsIdentity?.tsId || '').toLowerCase();
    const labTitle = (attempt.lab.title || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      studentName.includes(q) ||
      studentEmail.includes(q) ||
      tsId.includes(q) ||
      labTitle.includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && attempt.state !== 'COMPLETED') ||
      (statusFilter === 'COMPLETED' && attempt.state === 'COMPLETED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-800'
              : 'bg-white border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold">
              Practical Lab Submissions
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              Student Submissions &amp; Grading
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Lab Submissions &amp; Evaluations
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Review captured flags, inspect exploit methodologies, assign evaluation grades, and dispatch feedback emails directly to students.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 text-center min-w-[130px]">
            <span className="text-[11px] text-violet-700 font-semibold tracking-wider uppercase block">TOTAL SUBMISSIONS</span>
            <span className="text-2xl font-bold text-violet-900 block mt-0.5">
              {attempts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, TS-ID, or lab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List of Submissions */}
      <div className="space-y-6">
        {filteredAttempts.length === 0 ? (
          <div className="p-16 text-center rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No lab attempts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">No student lab attempts match your current search or filter criteria.</p>
          </div>
        ) : (
          filteredAttempts.map((attempt) => {
            const isCompleted = attempt.state === 'COMPLETED';

            return (
              <div
                key={attempt.id}
                className="rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs hover:border-violet-300 transition-all"
              >
                {/* Header Row */}
                <div className="bg-slate-50/70 p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base text-slate-900">
                        {attempt.user.name}
                      </span>
                      <Badge className="bg-violet-50 text-violet-700 border border-violet-200 font-mono text-xs font-semibold">
                        {attempt.user.tsIdentity?.tsId || 'TS-ID'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        ({attempt.user.email})
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 pt-0.5 flex-wrap">
                      <span className="font-medium text-slate-500">Lab:</span>
                      <strong className="text-slate-900">{attempt.lab.title}</strong>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {attempt.lab.difficulty}
                      </span>
                      {attempt.lab.course?.title && (
                        <span className="text-xs text-slate-500">
                          • {attempt.lab.course.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      className={`text-xs px-3 py-1 font-semibold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isCompleted ? '✓ COMPLETED' : '⏳ IN PROGRESS'} • {attempt.score}%
                    </Badge>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">
                  {/* Flag and Objective */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <span className="text-[11px] uppercase font-semibold text-slate-500 block">
                        Captured Flag:
                      </span>
                      <div className="p-3 rounded-xl bg-white text-violet-700 font-mono text-xs flex items-center justify-between border border-slate-200 break-all font-semibold">
                        <code>{attempt.submittedFlag || 'No flag submitted yet'}</code>
                        <Terminal className="w-4 h-4 shrink-0 text-slate-400 ml-2" />
                      </div>
                      <span className="text-xs text-slate-500 block pt-1">
                        Started: {new Date(attempt.startedAt).toLocaleString()}
                        {attempt.completedAt && ` • Evaluated: ${new Date(attempt.completedAt).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <span className="text-[11px] uppercase font-semibold text-slate-500 block">
                        Lab Objective:
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {attempt.lab.objective}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Grading Panel */}
                  <div className="p-5 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-violet-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-900">
                          Instructor Evaluation &amp; Grade Dispatch
                        </span>
                      </div>
                      <span className="text-xs text-violet-700 font-medium">
                        Passing score: &ge; 70%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Score Input */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-xs text-slate-700 block font-medium">
                          Score (0 - 100):
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formScores[attempt.id] ?? 100}
                            onChange={(e) =>
                              setFormScores((prev) => ({
                                ...prev,
                                [attempt.id]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                            / 100
                          </span>
                        </div>
                      </div>

                      {/* Feedback Textarea */}
                      <div className="md:col-span-6 space-y-1.5">
                        <label className="text-xs text-slate-700 block font-medium">
                          Faculty Remarks &amp; Feedback:
                        </label>
                        <input
                          type="text"
                          value={formFeedbacks[attempt.id] ?? ''}
                          onChange={(e) =>
                            setFormFeedbacks((prev) => ({
                              ...prev,
                              [attempt.id]: e.target.value,
                            }))
                          }
                          placeholder="Provide specific feedback or commendation notes..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>

                      {/* Submit Grade Button */}
                      <div className="md:col-span-3">
                        <button
                          onClick={() => handleGradeSubmit(attempt.id)}
                          disabled={evaluatingId === attempt.id}
                          className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                        >
                          {evaluatingId === attempt.id ? (
                            <span>Dispatching...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Save &amp; Email Student</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
