'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Loader2,
  RefreshCw,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { StudentSafeAttemptState } from '@/server/services/assessment/generator.service';

export interface ExamRoomClientProps {
  initialAttempt: StudentSafeAttemptState;
}

export function ExamRoomClient({ initialAttempt }: ExamRoomClientProps) {
  const router = useRouter();

  // Core Attempt State
  const [attempt, setAttempt] = useState<StudentSafeAttemptState>(initialAttempt);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const q of initialAttempt.questions) {
      if (q.selectedOptionId) {
        map[q.attemptQuestionId] = q.selectedOptionId;
      }
    }
    return map;
  });

  // Visited questions tracking
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  // Auto-save Status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Submit modal & process
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Time tracking
  const [secondsLeft, setSecondsLeft] = useState<number>(initialAttempt.remainingSeconds);
  const timerExpiredRef = useRef(false);

  // Anti-cheating & proctoring notices
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentQ = attempt.questions[currentIdx];

  // 1. Authoritative Timer Effect
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!timerExpiredRef.current) {
        timerExpiredRef.current = true;
        handleAutoSubmit();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!timerExpiredRef.current) {
            timerExpiredRef.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Timer urgency class
  const getTimerStyles = () => {
    if (secondsLeft <= 60) {
      return 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse';
    }
    if (secondsLeft <= 300) {
      return 'bg-amber-50 border-amber-300 text-amber-700';
    }
    return 'bg-slate-50 border-slate-200 text-slate-800';
  };

  // 2. Anti-Cheating Listeners (Tab Switches, Window Blurs, Copy/Paste)
  useEffect(() => {
    const logEvent = async (eventType: string, metadata?: any) => {
      try {
        await fetch(`/api/assessments/attempts/${attempt.attemptId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, metadata }),
        });
      } catch {
        // Silently capture
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('TAB_SWITCHED', { currentIdx });
        setWarningMessage('Warning: Browser focus lost. Tab switches are logged for academic integrity.');
      }
    };

    const handleWindowBlur = () => {
      logEvent('FOCUS_LOST', { currentIdx });
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (attempt.antiCheating.copyPasteRestriction) {
        e.preventDefault();
        logEvent('COPY_ATTEMPT');
        setWarningMessage('Notice: Clipboard copying is disabled during examinations.');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (attempt.antiCheating.copyPasteRestriction) {
        e.preventDefault();
        logEvent('PASTE_ATTEMPT');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (attempt.antiCheating.rightClickRestriction) {
        e.preventDefault();
        logEvent('CONTEXT_MENU_ATTEMPT');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [attempt.attemptId, attempt.antiCheating, currentIdx]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // 3. Option Selection & Auto-Save
  const handleSelectOption = async (optionId: string) => {
    if (!currentQ || isSubmitting) return;

    // Optimistic UI update
    setAnswers((prev) => ({
      ...prev,
      [currentQ.attemptQuestionId]: optionId,
    }));
    setSaveStatus('saving');

    try {
      const res = await fetch(`/api/assessments/attempts/${attempt.attemptId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptQuestionId: currentQ.attemptQuestionId,
          selectedOptionId: optionId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.expired) {
          handleAutoSubmit();
          return;
        }
        throw new Error(json.error || 'Failed to sync answer');
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  // 4. Navigation controls
  const goToQuestion = (idx: number) => {
    if (idx < 0 || idx >= attempt.questions.length) return;
    setCurrentIdx(idx);
    setVisited((prev) => new Set([...prev, idx]));
    setMobileNavOpen(false);
  };

  // 5. Authoritative Submission
  const handleAutoSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/assessments/attempts/${attempt.attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAutoSubmit: true }),
      });
      const json = await res.json();
      router.push(`/student/assessments/results/${attempt.attemptId}`);
    } catch {
      router.push(`/student/assessments/results/${attempt.attemptId}`);
    }
  }, [attempt.attemptId, router]);

  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/assessments/attempts/${attempt.attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAutoSubmit: false }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed submitting exam.');
      }

      router.push(`/student/assessments/results/${attempt.attemptId}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error. Please retry.');
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = attempt.totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white pb-12">
      {/* ── TOP AUTHORITATIVE HEADER BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Test title & course */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 truncate">{attempt.title}</h1>
              <span className="text-[11px] text-slate-500 font-mono block truncate">
                {attempt.courseTitle} • Attempt #{attempt.attemptNumber}
              </span>
            </div>
          </div>

          {/* Center / Right: Save Status, Timer & Actions */}
          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
              {saveStatus === 'saving' && (
                <span className="text-amber-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-rose-600 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3 h-3" /> Sync Issue
                </span>
              )}
            </div>

            {/* Authoritative Countdown Timer */}
            <div
              className={`px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm tracking-tight flex items-center gap-2 shadow-xs transition-colors ${getTimerStyles()}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(secondsLeft)}</span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="hidden md:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Mobile Nav Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Question Navigator"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Submit Button */}
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Submit</span>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Warning notification banner */}
        {warningMessage && (
          <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warningMessage}</span>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN TEST CONTENT AREA ── */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Question Card & Controls */}
        <div className="flex-1 w-full space-y-6">
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            {/* Question Progress & Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  QUESTION {currentIdx + 1} OF {attempt.totalQuestions}
                </span>
                <Badge variant="outline" className="font-mono text-[10px] text-slate-600">
                  {currentQ?.categoryName}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] text-slate-600">
                  {currentQ?.difficulty}
                </Badge>
              </div>

              <span className="font-mono text-xs text-slate-500 font-bold">
                {currentQ?.marks} {currentQ?.marks === 1 ? 'Mark' : 'Marks'}
              </span>
            </div>

            {/* Question Prompt */}
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ?.questionText}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ?.options.map((option, optIdx) => {
                const isSelected = answers[currentQ.attemptQuestionId] === option.optionId;
                const letterKey = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={option.optionId}
                    onClick={() => handleSelectOption(option.optionId)}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/70 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {letterKey}
                      </span>
                      <span className="leading-relaxed">{option.optionText}</span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-white bg-white text-slate-900' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentIdx - 1)}
              disabled={currentIdx === 0 || isSubmitting}
              className="text-xs font-bold border-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Press 1-4 or click to select
            </span>

            {currentIdx < attempt.totalQuestions - 1 ? (
              <Button
                onClick={() => goToQuestion(currentIdx + 1)}
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Review & Submit</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-200 p-6 shadow-xl transition-transform lg:static lg:w-72 lg:inset-auto lg:p-6 lg:rounded-2xl lg:border lg:shadow-xs lg:translate-x-0 ${
            mobileNavOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
              QUESTION NAVIGATOR
            </h3>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick status counters */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="font-bold text-sm block">{answeredCount}</span>
              <span className="text-[10px]">Answered</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
              <span className="font-bold text-sm block">{unansweredCount}</span>
              <span className="text-[10px]">Unanswered</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-[55vh] overflow-y-auto pr-1">
            {attempt.questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = !!answers[q.attemptQuestionId];
              const isSeen = visited.has(idx);

              let buttonStyle = 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';

              if (isCurrent) {
                buttonStyle = 'border-2 border-slate-900 bg-slate-900 text-white font-black shadow-xs';
              } else if (isAnswered) {
                buttonStyle = 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold';
              } else if (isSeen) {
                buttonStyle = 'bg-slate-100 border-slate-300 text-slate-800';
              }

              return (
                <button
                  key={q.attemptQuestionId}
                  onClick={() => goToQuestion(idx)}
                  className={`h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${buttonStyle}`}
                  title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-5 mt-5 border-t border-slate-100 space-y-2 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-900" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── SUBMISSION CONFIRMATION MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 sm:p-7 bg-white rounded-2xl shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Ready to Submit Exam?</h3>
                <p className="text-xs text-slate-500">
                  Please review your answering progress before finalizing.
                </p>
              </div>
            </div>

            {/* Answer tally breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80">
                <span className="text-[10px] text-emerald-700 uppercase block">ANSWERED</span>
                <span className="text-xl font-bold text-emerald-700">
                  {answeredCount} / {attempt.totalQuestions}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80">
                <span className="text-[10px] text-amber-700 uppercase block">UNANSWERED</span>
                <span className="text-xl font-bold text-amber-700">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50/80 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                You have <strong>{unansweredCount}</strong> unanswered questions. Unanswered questions will receive 0 marks.
              </p>
            )}

            {submitError && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {submitError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="text-xs font-bold border-slate-200 cursor-pointer"
              >
                Continue Test
              </Button>

              <Button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading & Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Submission</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
