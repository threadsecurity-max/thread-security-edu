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
    <div className="space-y-6 text-white font-mono">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2 border backdrop-blur-md ${
            toastMessage.type === 'success'
              ? 'bg-[#050706]/90 border-[#C6FF34]/50 text-[#C6FF34]'
              : 'bg-[#180507]/90 border-rose-500/50 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#C6FF34]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              OFFENSIVE SECURITY LAB REVIEW CONSOLE
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Cadet Lab Submissions &amp; Grading
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
            Review student practical flag submissions, inspect exploit payloads, award final scores, and automatically dispatch official evaluation emails to cadets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center min-w-[120px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">ATTEMPTS</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">
              {attempts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/[0.08]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by cadet name, TS-ID, or lab title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#C6FF34]/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 uppercase">Status:</span>
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#C6FF34] text-black font-bold shadow-[0_0_15px_rgba(198,255,52,0.2)]'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
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
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] text-zinc-500 space-y-2">
            <Terminal className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm">No lab attempts matching your filter criteria.</p>
          </div>
        ) : (
          filteredAttempts.map((attempt) => {
            const isCompleted = attempt.state === 'COMPLETED';
            const isPendingGrading = !isCompleted || attempt.score === 0;

            return (
              <div
                key={attempt.id}
                className="rounded-3xl border border-white/[0.08] overflow-hidden bg-gradient-to-b from-white/[0.03] to-white/[0.01] shadow-xl backdrop-blur-xl transition-all"
              >
                {/* Header Row */}
                <div className="bg-black/40 p-5 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-base text-white font-sans">
                        {attempt.user.name}
                      </span>
                      <Badge className="bg-white/10 text-zinc-300 font-mono text-[10px]">
                        {attempt.user.tsIdentity?.tsId || 'TSE-CADET'}
                      </Badge>
                      <span className="text-xs text-zinc-400 font-mono">
                        ({attempt.user.email})
                      </span>
                    </div>

                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 pt-0.5">
                      <span>Target:</span>
                      <strong className="text-white">{attempt.lab.title}</strong>
                      <span className="text-[10px] text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-white/[0.04]">
                        {attempt.lab.difficulty}
                      </span>
                      {attempt.lab.course?.title && (
                        <span className="text-[11px] text-zinc-500">
                          • {attempt.lab.course.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      className={`font-mono text-xs px-3 py-1 font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
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
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                        Submitted Flag / Payload Proof:
                      </span>
                      <div className="p-3 rounded-xl bg-black text-[#C6FF34] font-mono text-xs flex items-center justify-between border border-white/10 break-all">
                        <code>{attempt.submittedFlag || 'No flag submitted yet'}</code>
                        <Terminal className="w-4 h-4 shrink-0 text-zinc-500 ml-2" />
                      </div>
                      <span className="text-[10px] text-zinc-500 block pt-1">
                        Started: {new Date(attempt.startedAt).toLocaleString()}
                        {attempt.completedAt && ` • Evaluated: ${new Date(attempt.completedAt).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                        Lab Objective &amp; Requirements:
                      </span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-3">
                        {attempt.lab.objective}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Grading Panel */}
                  <div className="p-5 rounded-2xl bg-[#C6FF34]/[0.02] border border-[#C6FF34]/20 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#C6FF34]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          Faculty Evaluation &amp; Score Dispatch
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        Passing threshold: &ge; 70%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Score Input */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[11px] text-zinc-400 block uppercase">
                          Score Awarded (0 - 100):
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
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 text-white font-mono text-sm font-bold focus:outline-none focus:border-[#C6FF34]"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">
                            / 100
                          </span>
                        </div>
                      </div>

                      {/* Feedback Textarea */}
                      <div className="md:col-span-6 space-y-1.5">
                        <label className="text-[11px] text-zinc-400 block uppercase">
                          Faculty Feedback &amp; Remediation Notes:
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
                          placeholder="Provide specific exploit feedback and praise..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 text-white font-sans text-xs focus:outline-none focus:border-[#C6FF34]"
                        />
                      </div>

                      {/* Submit Grade Button */}
                      <div className="md:col-span-3">
                        <button
                          onClick={() => handleGradeSubmit(attempt.id)}
                          disabled={evaluatingId === attempt.id}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {evaluatingId === attempt.id ? (
                            <span>Saving &amp; Dispatching...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit &amp; Email Cadet</span>
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
