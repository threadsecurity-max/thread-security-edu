'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Clock,
  Share2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Send,
  Lock,
  Layers,
  Award,
} from 'lucide-react';

export interface StudentLabClientProps {
  lab: {
    id: string;
    title: string;
    objective: string;
    difficulty: string;
    estimatedMinutes: number;
    skills: string;
    instructions: string;
    flagHash: string | null;
    course?: {
      id: string;
      title: string;
    } | null;
  };
  attempt: {
    id: string;
    state: string;
    score: number;
    submittedFlag: string | null;
    feedback: string | null;
    startedAt: string | Date;
    completedAt: string | Date | null;
  };
  student: {
    id: string;
    name: string;
    email: string;
    tsId: string;
  };
  initialFlagResult?: string;
}

export function StudentLabInteractiveClient({
  lab,
  attempt: initialAttempt,
  student,
  initialFlagResult,
}: StudentLabClientProps) {
  const [attempt, setAttempt] = useState(initialAttempt);
  const [flagInput, setFlagInput] = useState(initialAttempt.submittedFlag || '');
  const [writeupInput, setWriteupInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(
    initialFlagResult === 'success'
      ? { text: 'Flag verified and attempt recorded successfully! 100/100 points awarded.', type: 'success' }
      : initialFlagResult === 'error'
      ? { text: 'Incorrect flag. Please re-examine your exploit output payload.', type: 'error' }
      : null
  );

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Extract external target URL
  const extractUrl = (): string | null => {
    if (lab.flagHash) {
      if (lab.flagHash.startsWith('URL:')) {
        return lab.flagHash.replace('URL:', '').trim();
      }
      if (lab.flagHash.startsWith('http://') || lab.flagHash.startsWith('https://')) {
        return lab.flagHash.trim();
      }
    }
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matchInst = lab.instructions?.match(urlRegex);
    if (matchInst && matchInst[0]) return matchInst[0].replace(/[.,;\)]+$/, '');
    const matchObj = lab.objective?.match(urlRegex);
    if (matchObj && matchObj[0]) return matchObj[0].replace(/[.,;\)]+$/, '');
    return null;
  };

  const targetUrl = extractUrl();

  // Clean instructions text (strip internal URL: prefix if present)
  const cleanInstructions = (lab.instructions || '')
    .replace(/URL:https?:\/\/[^\s]+/g, '')
    .replace(/^URL:.*$/gm, '')
    .trim();

  // Timer countdown
  const totalSeconds = (lab.estimatedMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (attempt.state === 'COMPLETED') return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt.state]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) {
      setStatusMessage({ text: 'Please enter the extracted flag value.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/student/labs/${lab.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag: flagInput.trim(),
          writeup: writeupInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAttempt(data.attempt);
        setStatusMessage({
          text: data.message || 'Flag verified and submitted for instructor evaluation!',
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: data.error || 'Submission failed. Please check your flag syntax.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Submission error.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const shareText = `🛡️ I successfully completed the "${lab.title}" practical cybersecurity lab on Thread Security Education!\n\nCadet: ${student.name} (${student.tsId})\nScore: ${attempt.score}/100\nDifficulty: ${lab.difficulty}\n\n#Cybersecurity #EthicalHacking #ThreadSecurity`;

  const copyShareText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-8 text-white font-mono max-w-7xl mx-auto">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <Link
            href="/student/labs"
            className="text-xs text-zinc-400 hover:text-[#C6FF34] inline-flex items-center gap-1.5 transition-colors mb-1 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sandbox Labs
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              HANDS-ON LAB SANDBOX
            </Badge>
            <Badge
              className={`font-mono text-[10px] uppercase font-bold ${
                attempt.state === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {attempt.state}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            {lab.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-0.5">
            <span>Difficulty: <strong className="text-white">{lab.difficulty}</strong></span>
            <span>•</span>
            <span>Est. Duration: <strong className="text-white">{lab.estimatedMinutes} mins</strong></span>
            {lab.course && (
              <>
                <span>•</span>
                <span>Course: <strong className="text-zinc-300">{lab.course.title}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Launch External Target, Live Countdown & Share Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 shrink-0">
          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(198,255,52,0.35)] transition-all cursor-pointer text-center hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Lab Target (External) ↗</span>
            </a>
          )}

          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] text-center min-w-[130px]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#C6FF34]" /> TIME SPAN
            </span>
            <span className={`text-xl font-extrabold block mt-0.5 ${secondsRemaining > 300 ? 'text-[#C6FF34]' : 'text-rose-400'}`}>
              {attempt.state === 'COMPLETED' ? 'COMPLETED' : formatTimer(secondsRemaining)}
            </span>
          </div>

          {attempt.state === 'COMPLETED' && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#C6FF34]" />
              <span>Share Result</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs leading-relaxed ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span className="font-mono">{statusMessage.text}</span>
        </div>
      )}

      {/* ── MAIN WORKSPACE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Briefing & Target Environment Launch */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Environment Box */}
          <div className="p-6 rounded-3xl bg-[#0a0a0c] border border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs uppercase tracking-wider text-[#C6FF34] font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#C6FF34]" />
                TARGET ENVIRONMENT &amp; VIRTUAL LAB
              </span>
              <span className="text-[10px] text-zinc-500">SECURE ISOLATION</span>
            </div>

            {targetUrl ? (
              <div className="p-5 rounded-2xl bg-[#0d0f15] border border-[#C6FF34]/30 space-y-4 shadow-xl">
                <div>
                  <h4 className="text-base font-serif font-bold text-white">
                    Live Virtual Sandbox Machine Ready
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                    Click below to open the external target environment in an isolated tab. Scan the host, execute the requested exploit payload, and extract the CTF flag.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,52,0.25)] transition-all cursor-pointer text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Launch Target Lab (Direct External Link) ↗</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(targetUrl);
                      setStatusMessage({ text: 'Target endpoint URL copied to clipboard!', type: 'info' });
                    }}
                    className="py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-black text-[#C6FF34] text-[11px] font-mono truncate border border-white/10 flex items-center justify-between">
                  <span>Target Endpoint: <strong>{targetUrl}</strong></span>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-zinc-400 hover:text-white shrink-0 ml-2"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <Terminal className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-300 font-sans">
                  Target sandbox is hosted within the internal network. Follow the connection instructions below.
                </p>
              </div>
            )}

            {/* Objective & Instructions */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                  Mission Objective:
                </span>
                <div className="text-sm text-zinc-100 font-sans leading-relaxed p-4 rounded-2xl bg-[#12141c] border border-white/10">
                  {lab.objective}
                </div>
              </div>

              {cleanInstructions && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                    Execution Instructions &amp; Target Endpoint:
                  </span>
                  <div className="p-4 rounded-2xl bg-black/80 border border-white/10 text-xs font-mono text-zinc-100 leading-relaxed whitespace-pre-line">
                    {cleanInstructions}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Skills Assessed:</span>
                <div className="flex flex-wrap gap-1.5">
                  {lab.skills.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20 text-[10px] font-bold"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Flag Terminal & Response Writeup Submission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#090b0e] text-white border-2 border-[#C6FF34]/30 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#C6FF34] text-black flex items-center justify-center font-bold">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-[#C6FF34] font-bold block">
                  FLAG &amp; ARTIFACT TERMINAL
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Format: TSE{"{...}"} or Payload Proof
                </span>
              </div>
            </div>

            <form onSubmit={handleFlagSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-zinc-300 uppercase tracking-wider font-bold">
                  Captured Flag Value:
                </label>
                <input
                  type="text"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  placeholder="e.g. TSE{sql_bypass_admin_2026}"
                  className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/20 text-[#C6FF34] font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#C6FF34]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-zinc-300 uppercase tracking-wider font-bold">
                  Student Exploit Methodology &amp; Writeup:
                </label>
                <textarea
                  rows={4}
                  value={writeupInput}
                  onChange={(e) => setWriteupInput(e.target.value)}
                  placeholder="Paste your exploit payload, terminal command output, or brief writeup for your faculty mentor to review and grade..."
                  className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/20 text-zinc-200 font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(198,255,52,0.25)] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Verifying &amp; Saving...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Flag &amp; Writeup for Scoring</span>
                  </>
                )}
              </button>
            </form>

            {/* Current Evaluation Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Current Status:</span>
                <span
                  className={`font-bold ${
                    attempt.state === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {attempt.state}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Evaluated Score:</span>
                <span className="text-[#C6FF34] font-bold text-sm">
                  {attempt.score} / 100
                </span>
              </div>

              {attempt.feedback && (
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">
                    Faculty Remarks:
                  </span>
                  <p className="text-zinc-300 italic text-[11px] font-sans leading-relaxed">
                    &ldquo;{attempt.feedback}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SHARE MODAL ── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0d10] border border-white/10 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#C6FF34]">
                <Award className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Share Lab Completion</span>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-[#C6FF34]/30 space-y-2 text-xs font-mono text-zinc-300">
              <span className="text-[#C6FF34] font-bold block">✓ THREAD SECURITY EDUCATION // VERIFIED</span>
              <p>Cadet: <strong>{student.name}</strong></p>
              <p>TS-Identity: <strong className="text-white">{student.tsId}</strong></p>
              <p>Target Challenge: <strong className="text-white">{lab.title}</strong></p>
              <p>Score: <strong className="text-[#C6FF34]">{attempt.score}/100</strong></p>
            </div>

            <div className="space-y-2">
              <button
                onClick={copyShareText}
                className="w-full py-2.5 rounded-xl bg-[#C6FF34] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-[#b5f425] transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Verification Summary'}</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Share on X (Twitter)</span>
              </a>

              <a
                href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#0077b5]/20 hover:bg-[#0077b5]/30 text-[#38bdf8] border border-[#0077b5]/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Share on LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
