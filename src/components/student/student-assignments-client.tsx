'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitAssignmentAction } from '@/features/assignments/actions/assignment.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  Clock,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  FileCheck,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  X,
  ShieldCheck,
  Check,
  ExternalLink,
  Info,
} from 'lucide-react';

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string | Date;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  status: string;
  grade?: string | null;
  score?: number | null;
  isPassing?: boolean | null;
  remarks?: string | null;
  gradedAt?: string | Date | null;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  batchId: string;
  batch: { id: string; batchCode: string; title: string };
  moduleId?: string | null;
  module?: { id: string; title: string; orderIndex: number } | null;
  moduleNotes?: string | null;
  scheduledAt: string | Date;
  deadline: string | Date;
  gradingType: string;
  numberMaxScore?: number | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  submissions: Submission[];
}

export interface Batch {
  id: string;
  batchCode: string;
  title: string;
}

export function StudentAssignmentsClient({
  assignments: initialAssignments,
  batch,
  studentName,
  tsId,
  userId,
}: {
  assignments: Assignment[];
  batch?: Batch | null;
  studentName: string;
  tsId: string;
  userId: string;
}) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const [selectedFileMap, setSelectedFileMap] = useState<Record<string, File | null>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [submittingMap, setSubmittingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>({});
  const [successMap, setSuccessMap] = useState<Record<string, string | null>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Filter tabs: All, Pending, Submitted, Graded
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL');

  function formatBytes(bytes?: number | null) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getFileIcon(name?: string | null) {
    if (!name) return <FileText className="w-5 h-5 text-blue-400" />;
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'zip' || ext === 'tar' || ext === 'gz' || ext === 'rar') {
      return <FileArchive className="w-5 h-5 text-amber-400" />;
    }
    if (
      ext === 'py' ||
      ext === 'js' ||
      ext === 'ts' ||
      ext === 'cpp' ||
      ext === 'c' ||
      ext === 'sh' ||
      ext === 'pcap'
    ) {
      return <FileCode className="w-5 h-5 text-[#C6FF34]" />;
    }
    if (ext === 'csv' || ext === 'xlsx' || ext === 'json') {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    return <FileText className="w-5 h-5 text-cyan-400" />;
  }

  function handleFileSelect(assignmentId: string, file: File) {
    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: `File size exceeds 2.5 MB maximum quota. (Selected: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)} MB)`,
      }));
      setSelectedFileMap((prev) => ({ ...prev, [assignmentId]: null }));
      return;
    }
    setErrorMap((prev) => ({ ...prev, [assignmentId]: null }));
    setSelectedFileMap((prev) => ({ ...prev, [assignmentId]: file }));
  }

  async function handleFileSubmit(assignmentId: string) {
    const file = selectedFileMap[assignmentId];
    if (!file) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: 'Please select a solution file to submit.',
      }));
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: `File size (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB) exceeds 2.5 MB maximum quota.`,
      }));
      return;
    }

    setSubmittingMap((prev) => ({ ...prev, [assignmentId]: true }));
    setErrorMap((prev) => ({ ...prev, [assignmentId]: null }));
    setSuccessMap((prev) => ({ ...prev, [assignmentId]: null }));

    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    if (notesMap[assignmentId]) {
      formData.append('notes', notesMap[assignmentId]);
    }

    const res = await submitAssignmentAction(formData);
    setSubmittingMap((prev) => ({ ...prev, [assignmentId]: false }));

    if (!res.success) {
      setErrorMap((prev) => ({
        ...prev,
        [assignmentId]: res.error || 'Submission failed.',
      }));
    } else {
      setSuccessMap((prev) => ({
        ...prev,
        [assignmentId]:
          'Assignment successfully submitted and time-stamped on Atomic Server UTC!',
      }));

      // Update local assignment state immediately
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id === assignmentId) {
            const newSub: Submission = res.submission || {
              id: 'temp-id',
              assignmentId,
              studentId: userId,
              submittedAt: new Date(),
              fileUrl: `/uploads/assignments/student-${file.name}`,
              fileName: file.name,
              fileSize: file.size,
              notes: notesMap[assignmentId] || null,
              status: 'SUBMITTED',
            };
            return {
              ...a,
              submissions: [newSub],
            };
          }
          return a;
        })
      );

      // Switch to ALL tab so student immediately sees their submitted deliverable
      setFilterTab('ALL');
      setSelectedFileMap((prev) => ({ ...prev, [assignmentId]: null }));

      setTimeout(() => {
        router.refresh();
      }, 1200);
    }
  }

  // Filter logic
  const filteredAssignments = assignments.filter((a) => {
    const sub = a.submissions?.[0];
    const isDeadlinePassed = new Date() > new Date(a.deadline);

    if (filterTab === 'PENDING') {
      return !sub && !isDeadlinePassed;
    }
    if (filterTab === 'SUBMITTED') {
      return !!sub && sub.status !== 'GRADED';
    }
    if (filterTab === 'GRADED') {
      return !!sub && sub.status === 'GRADED';
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-mono text-slate-200">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061522] via-[#081B2C] to-[#040C15] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#C6FF34]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Student Academic Portfolio
              </span>
              {batch && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300 border border-white/10">
                  Cohort: {batch.batchCode}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-bold">
                Max 2.5 MB Submissions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Assignments & Lab Deliverables
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Welcome back, <span className="text-white font-bold">{studentName}</span> ({tsId}). Submit your lab deliverables, download mentor briefs, and view evaluation scores.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 shrink-0 max-w-xs text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              Atomic Server UTC Sync
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Deadlines are locked against server clock. Submissions after deadline will lock automatically and be marked 0 / Fail.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-[#061420] border border-white/10">
        <div className="flex items-center gap-1">
          {(
            [
              { key: 'ALL', label: 'All Tasks', count: assignments.length },
              {
                key: 'PENDING',
                label: 'To Do',
                count: assignments.filter(
                  (a) => !a.submissions[0] && new Date() <= new Date(a.deadline)
                ).length,
              },
              {
                key: 'SUBMITTED',
                label: 'Under Review',
                count: assignments.filter(
                  (a) => a.submissions[0]?.status === 'SUBMITTED'
                ).length,
              },
              {
                key: 'GRADED',
                label: 'Evaluated',
                count: assignments.filter(
                  (a) => a.submissions[0]?.status === 'GRADED'
                ).length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                filterTab === tab.key
                  ? 'bg-[#C6FF34] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] ${
                  filterTab === tab.key
                    ? 'bg-black/20 text-slate-950'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Assignment Cards List */}
      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#061420]/50 p-12 text-center space-y-3">
          <FileText className="w-8 h-8 mx-auto text-slate-500" />
          <h3 className="text-sm font-bold text-white">No assignments in this category</h3>
          <p className="text-xs text-slate-400">
            Check the other tabs to view all pending or graded assignments.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAssignments.map((assignment) => {
            const submission = assignment.submissions?.[0];
            const isSubmitted = !!submission;
            const isGraded = submission?.status === 'GRADED';
            const isDeadlinePassed = new Date() > new Date(assignment.deadline);
            const isLocked = !isSubmitted && isDeadlinePassed;

            const selectedFile = selectedFileMap[assignment.id];
            const isSubmitting = submittingMap[assignment.id] || false;
            const errorMsg = errorMap[assignment.id];
            const successMsg = successMap[assignment.id];

            return (
              <div
                key={assignment.id}
                className={`rounded-2xl border transition-all p-6 sm:p-7 space-y-6 ${
                  isGraded
                    ? 'bg-gradient-to-b from-[#061B2B] to-[#04111D] border-emerald-500/30'
                    : isSubmitted
                    ? 'bg-gradient-to-b from-[#061726] to-[#040F1A] border-amber-500/30'
                    : isLocked
                    ? 'bg-gradient-to-b from-[#18080A] to-[#0D0405] border-red-500/30'
                    : 'bg-gradient-to-b from-[#061624] to-[#040E17] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top Row: Meta Badges & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[10px]">
                      {assignment.batch?.batchCode}
                    </Badge>
                    {assignment.module && (
                      <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px]">
                        Module {assignment.module.orderIndex}: {assignment.module.title}
                      </Badge>
                    )}
                    {assignment.gradingType === 'NUMBER' ? (
                      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                        Score Scale: 0-{assignment.numberMaxScore || 100} (Pass ≥25%)
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                        Grade Scale: S, A, B, C, D, F
                      </Badge>
                    )}
                  </div>

                  <div>
                    {isGraded ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          submission.isPassing
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {assignment.gradingType === 'NUMBER'
                          ? `SCORE: ${submission.score}/${assignment.numberMaxScore} (${
                              submission.isPassing ? 'PASS' : 'FAIL'
                            })`
                          : `GRADE: ${submission.grade} (${
                              submission.isPassing ? 'PASS' : 'FAIL'
                            })`}
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted • Awaiting Evaluation
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        <Lock className="w-3.5 h-3.5" />
                        LOCKED (OVERDUE — SCORE: 0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                        <Calendar className="w-3.5 h-3.5" />
                        Open for Submission
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {assignment.title}
                  </h2>
                  {assignment.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {assignment.description}
                    </p>
                  )}
                </div>

                {/* Sequential Module Guidance */}
                {assignment.moduleNotes && (
                  <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      Faculty Module Guidance & Steps:
                    </div>
                    <div className="text-xs text-slate-300 whitespace-pre-line pl-3 border-l-2 border-purple-500 leading-relaxed font-mono">
                      {assignment.moduleNotes}
                    </div>
                  </div>
                )}

                {/* Mentor Problem File Asset Download */}
                {assignment.fileUrl && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(assignment.fileName)}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {assignment.fileName || 'Assignment Brief Asset'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatBytes(assignment.fileSize)} • Starter Problem Statement
                        </span>
                      </div>
                    </div>
                    <a
                      href={assignment.fileUrl}
                      download={assignment.fileName || 'assignment-material'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C6FF34] hover:bg-[#b3fa1b] text-slate-950 text-xs font-bold transition-all shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Asset
                    </a>
                  </div>
                )}

                {/* Deadlines Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>Assigned: {new Date(assignment.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span
                      className={
                        isDeadlinePassed ? 'text-red-400 font-bold' : 'text-[#C6FF34]'
                      }
                    >
                      Deadline: {new Date(assignment.deadline).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Evaluation Card if Graded */}
                {isGraded && (
                  <div className="p-5 rounded-xl bg-[#031522] border border-emerald-500/40 space-y-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        Faculty Mentor Official Evaluation
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Evaluated{' '}
                        {submission.gradedAt
                          ? new Date(submission.gradedAt).toLocaleString()
                          : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="p-3 rounded-lg bg-black/40 border border-white/10 min-w-[140px]">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          Final Score
                        </span>
                        <span className="text-xl font-extrabold text-white">
                          {assignment.gradingType === 'NUMBER'
                            ? `${submission.score} / ${assignment.numberMaxScore || 100}`
                            : `Grade ${submission.grade}`}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-black/40 border border-white/10 min-w-[120px]">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          Outcome
                        </span>
                        <span
                          className={`text-sm font-extrabold ${
                            submission.isPassing ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {submission.isPassing ? 'PASSED (≥25%)' : 'FAILED (<25%)'}
                        </span>
                      </div>
                    </div>

                    {submission.remarks && (
                      <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
                        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                          Mentor Remarks & Feedback:
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-mono">
                          {submission.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Form if Open */}
                {!isSubmitted && !isLocked && (
                  <div className="p-5 rounded-xl bg-[#03111C] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#C6FF34]" />
                        Submit Your Solution Deliverable
                      </span>
                      <span className="text-[10px] text-slate-400">Quota: Max 2.5 MB</span>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    {successMsg && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {/* Drag and Drop Zone */}
                    <div className="space-y-2">
                      <input
                        type="file"
                        id={`file-input-${assignment.id}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileSelect(assignment.id, f);
                        }}
                        className="hidden"
                      />

                      {selectedFile ? (
                        <div className="p-3.5 rounded-xl bg-[#081B2C] border border-[#C6FF34]/40 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {getFileIcon(selectedFile.name)}
                            <div className="min-w-0">
                              <span className="text-white text-xs font-bold truncate block">
                                {selectedFile.name}
                              </span>
                              <span className="text-[10px] text-[#C6FF34]">
                                {formatBytes(selectedFile.size)} / 2.50 MB • Ready
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFileMap((prev) => ({
                                ...prev,
                                [assignment.id]: null,
                              }))
                            }
                            className="p-1 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDraggingId(assignment.id);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setDraggingId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDraggingId(null);
                            const f = e.dataTransfer.files?.[0];
                            if (f) handleFileSelect(assignment.id, f);
                          }}
                          onClick={() =>
                            document
                              .getElementById(`file-input-${assignment.id}`)
                              ?.click()
                          }
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                            draggingId === assignment.id
                              ? 'border-[#C6FF34] bg-[#C6FF34]/10'
                              : 'border-white/20 bg-white/[0.02] hover:border-white/40'
                          }`}
                        >
                          <Upload className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                          <div className="text-xs text-white">
                            Drag and drop solution file or{' '}
                            <span className="text-[#C6FF34] underline">Browse</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Any file up to 2.5 MB (.pdf, .zip, .pcap, .py, .docx, .txt)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Submission Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-300 font-bold block uppercase tracking-wider">
                        Submission Notes / Executive Summary (Optional)
                      </label>
                      <textarea
                        value={notesMap[assignment.id] || ''}
                        onChange={(e) =>
                          setNotesMap((prev) => ({
                            ...prev,
                            [assignment.id]: e.target.value,
                          }))
                        }
                        placeholder="Brief summary of methodology, flags discovered, or environment details..."
                        rows={2}
                        className="w-full bg-[#081B2C] border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C6FF34] text-xs"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        disabled={isSubmitting || !selectedFile}
                        onClick={() => handleFileSubmit(assignment.id)}
                        className="bg-[#C6FF34] hover:bg-[#b3fa1b] text-slate-950 font-bold text-xs px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(198,255,52,0.25)]"
                      >
                        {isSubmitting
                          ? 'Uploading Solution...'
                          : 'Submit Solution Deliverable'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Previously Submitted Details */}
                {isSubmitted && !isGraded && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {getFileIcon(submission.fileName)}
                      <div>
                        <span className="text-white font-bold block">
                          {submission.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatBytes(submission.fileSize)} • Submitted on{' '}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {submission.fileUrl && (
                      <a
                        href={submission.fileUrl}
                        download={submission.fileName || 'solution-file'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download My Submission
                      </a>
                    )}
                  </div>
                )}

                {/* Locked Banner if Overdue */}
                {isLocked && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                    <Lock className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Assignment Submission Locked</span>
                      <span className="text-[11px] text-red-300/80">
                        The submission deadline was{' '}
                        {new Date(assignment.deadline).toLocaleString()}. Overdue tasks
                        cannot be submitted and receive a score of 0 / Fail.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
