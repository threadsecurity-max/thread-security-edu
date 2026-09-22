'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createAssignmentAction,
  gradeSubmissionAction,
} from '@/features/assignments/actions/assignment.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  FileText,
  Calendar,
  Clock,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  Layers,
  FileCode,
  Lock,
  Search,
  ChevronRight,
  Sparkles,
  BookOpen,
  X,
  FileArchive,
  FileSpreadsheet,
  ShieldAlert,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export interface ModuleLesson {
  id: string;
  title: string;
  orderIndex: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: ModuleLesson[];
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  tsIdentity?: { tsId: string } | null;
}

export interface StudentProfile {
  id: string;
  user: StudentUser;
}

export interface Batch {
  id: string;
  batchCode: string;
  title: string;
  course?: {
    id: string;
    title: string;
    modules: Module[];
  } | null;
  students: StudentProfile[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  student: StudentUser;
  submittedAt: string | Date;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  status: string; // SUBMITTED, GRADED, LOCKED_OVERDUE
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
  gradingType: string; // 'GRADE' | 'NUMBER'
  numberMaxScore?: number | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  submissions: Submission[];
  createdAt: string | Date;
}

const BRIEFING_TIPS = [
  {
    title: 'Atomic Server Deadlines',
    desc: 'Submissions are validated against Server UTC. Students cannot alter system clocks to bypass overdue lockouts.',
  },
  {
    title: 'Selective Module Sequencing',
    desc: 'Specify sequential guidance steps to steer students through related modules and prerequisites in exact order.',
  },
  {
    title: 'Dual Grading Criteria',
    desc: 'Support letter grades (S to F) or numerical ranges (0-5, 0-20, 0-50, 0-100). Any score < 25% is an automatic Fail.',
  },
];

export function AssignmentsManagerClient({
  batches,
  initialAssignments,
  currentUserId,
  userRole,
}: {
  batches: Batch[];
  initialAssignments: Assignment[];
  currentUserId: string;
  userRole: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'GRADED' | 'OVERDUE'>('ALL');

  // Creation Dialog & Step State (Structured like CareerCounsellingSection)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [moduleNotes, setModuleNotes] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead
    return d.toISOString().slice(0, 16);
  });
  const [gradingType, setGradingType] = useState<'GRADE' | 'NUMBER'>('NUMBER');
  const [numberMaxScore, setNumberMaxScore] = useState<number>(100);
  const [mentorFile, setMentorFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Review & Grading Roster Modal State
  const [activeReviewAssignment, setActiveReviewAssignment] = useState<Assignment | null>(null);
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('A');
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeSuccess, setGradeSuccess] = useState<string | null>(null);

  // Active batch object
  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const batchModules = currentBatch?.course?.modules || [];

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesBatch = !selectedBatchId || a.batchId === selectedBatchId;
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesBatch || !matchesSearch) return false;

    const isPast = new Date() > new Date(a.deadline);
    if (statusFilter === 'ACTIVE') return !isPast;
    if (statusFilter === 'OVERDUE') return isPast;
    if (statusFilter === 'GRADED') return a.submissions.some((s) => s.status === 'GRADED');
    return true;
  });

  // Statistics
  const totalAssignmentsCount = assignments.length;
  const totalSubmissionsCount = assignments.reduce(
    (acc, a) => acc + (a.submissions?.length || 0),
    0
  );
  const pendingGradingCount = assignments.reduce((acc, a) => {
    const pendingInThis =
      a.submissions?.filter((s) => s.status === 'SUBMITTED').length || 0;
    return acc + pendingInThis;
  }, 0);

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

  function processSelectedFile(file: File) {
    if (file.size > 2.5 * 1024 * 1024) {
      setCreateError(
        `Selected file exceeds 2.5 MB maximum quota. (Size: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)} MB)`
      );
      setMentorFile(null);
      return;
    }
    setCreateError(null);
    setMentorFile(file);
  }

  const resetCreateForm = () => {
    setTitle('');
    setDescription('');
    setSelectedModuleId('');
    setModuleNotes('');
    setMentorFile(null);
    setCreateStep(1);
    setCreateError(null);
    setCreateSuccess(null);
  };

  // Step 1 Validation -> Next Step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setCreateError('Please select a target cohort batch.');
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      setCreateError('Assignment title must be at least 3 characters long.');
      return;
    }
    setCreateError(null);
    setCreateStep(2);
  };

  // Final Form Submit Action
  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    if (mentorFile && mentorFile.size > 2.5 * 1024 * 1024) {
      setCreateLoading(false);
      setCreateError(
        `File size (${(mentorFile.size / (1024 * 1024)).toFixed(
          2
        )} MB) exceeds 2.5 MB maximum.`
      );
      return;
    }

    const formData = new FormData();
    formData.append('batchId', selectedBatchId);
    formData.append('title', title);
    formData.append('description', description);
    if (selectedModuleId) formData.append('moduleId', selectedModuleId);
    if (moduleNotes) formData.append('moduleNotes', moduleNotes);
    formData.append('scheduledAt', scheduledAt);
    formData.append('deadline', deadline);
    formData.append('gradingType', gradingType);
    if (gradingType === 'NUMBER') {
      formData.append('numberMaxScore', numberMaxScore.toString());
    }
    if (mentorFile) {
      formData.append('file', mentorFile);
    }

    const res = await createAssignmentAction(formData);
    setCreateLoading(false);

    if (!res.success) {
      setCreateError(res.error || 'Failed to publish assignment.');
    } else {
      setCreateSuccess(
        'Assignment dispatched successfully to all batch students!'
      );
      if (res.assignment) {
        setAssignments((prev) => [res.assignment, ...prev]);
      }
      setTimeout(() => {
        setIsCreateOpen(false);
        resetCreateForm();
        router.refresh();
      }, 1100);
    }
  }

  // Handle Grade Submission
  async function handleGradeSubmit(submissionId: string) {
    setGradeLoading(true);
    setGradeError(null);
    setGradeSuccess(null);

    const isNumber = activeReviewAssignment?.gradingType === 'NUMBER';

    const res = await gradeSubmissionAction({
      submissionId,
      grade: !isNumber ? gradeInput : undefined,
      score: isNumber ? Number(scoreInput) : undefined,
      remarks: remarksInput,
    });

    setGradeLoading(false);

    if (!res.success) {
      setGradeError(res.error || 'Failed to submit grade evaluation.');
    } else {
      setGradeSuccess('Evaluation and remarks recorded successfully!');

      if (activeReviewAssignment) {
        const updatedSubs = activeReviewAssignment.submissions.map((sub) => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              status: 'GRADED',
              grade: res.grade,
              score: res.score,
              isPassing: res.isPassing,
              remarks: remarksInput,
              gradedAt: new Date(),
            };
          }
          return sub;
        });
        const updatedAssignment = {
          ...activeReviewAssignment,
          submissions: updatedSubs,
        };
        setActiveReviewAssignment(updatedAssignment);
        setAssignments((prev) =>
          prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a))
        );
      }

      setTimeout(() => {
        setGradingStudentId(null);
        setGradeSuccess(null);
        router.refresh();
      }, 1000);
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-slate-200">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & METRICS HUB                               */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#050505] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6FF34]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                Faculty Mentor Assignment Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300 border border-white/10">
                Max 2.5 MB Quota
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Cohort Assignments & Evaluation Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Publish structured assignments to enrolled students, share selective module guidance in proper order, upload assets (up to 2.5 MB), and evaluate student submissions with strict deadline locks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Structured Dialog Trigger */}
            <Dialog
              open={isCreateOpen}
              onOpenChange={(val) => {
                setIsCreateOpen(val);
                if (!val) resetCreateForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="group bg-white hover:bg-slate-200 text-black font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs border border-white/20">
                  <Plus className="w-4 h-4 stroke-[3] text-emerald-600" />
                  <span>Assign New Task</span>
                  <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform text-slate-500" />
                </Button>
              </DialogTrigger>

              {/* ========================================================= */}
              {/* STRUCTURED TWO-COLUMN FORM MODAL (CAREER COUNSELLING STYLE)*/}
              {/* ========================================================= */}
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#0a0a0a] border border-white/20 sm:rounded-3xl shadow-2xl text-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[580px]">
                  {/* Left Column (Dark Tactical Brand & Guidance Card) */}
                  <div className="md:col-span-5 bg-gradient-to-br from-[#0e0e0e] via-[#121212] to-[#080808] p-8 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/10">
                    {/* Background Dot Pattern */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C6FF34_1px,transparent_1px)] [background-size:18px_18px]" />

                    {/* Header */}
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold tracking-wider text-base text-white">
                          THREAD SECURITY
                        </span>
                        <span className="text-[10px] bg-[#C6FF34]/20 text-[#C6FF34] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-[#C6FF34]/30">
                          MENTOR
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Standardized Assignment Architecture
                      </span>
                    </div>

                    {/* Middle Pitch */}
                    <div className="relative z-10 my-6 space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-white">
                        Dispatch task to<br />
                        <span className="italic font-serif font-light text-[#C6FF34]">
                          entire cohort batch.
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Provide clear problem statements, structured module sequence info, and challenge files (up to 2.5 MB). Every enrolled student will receive this task directly.
                      </p>
                    </div>

                    {/* Interactive Guidance Carousel Card */}
                    <div className="relative z-10 bg-white/[0.04] backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#C6FF34] uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Faculty Best Practices
                        </span>
                        <div className="flex gap-1">
                          {BRIEFING_TIPS.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveTipIndex(idx)}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === activeTipIndex
                                  ? 'w-4 bg-[#C6FF34]'
                                  : 'w-1.5 bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="min-h-[56px]">
                        <h4 className="text-xs font-bold text-white mb-1">
                          {BRIEFING_TIPS[activeTipIndex].title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                          {BRIEFING_TIPS[activeTipIndex].desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Tamper-proof Server Clock</span>
                        <span className="text-[#C6FF34] font-bold">2.5 MB Max</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (The Structured Multi-Step Form) */}
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-[#0c0c0c] text-xs">
                    {/* Error / Success Notifications */}
                    {createError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{createError}</span>
                      </div>
                    )}
                    {createSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{createSuccess}</span>
                      </div>
                    )}

                    {/* Step 1: Core Details & Module Guidance */}
                    {createStep === 1 && (
                      <form onSubmit={handleNextStep} className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-mono">
                                Step 1 of 2
                              </span>
                              <span className="text-slate-400 text-[11px]">Core Brief & Modules</span>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                              Assignment Specification
                            </h3>
                            <p className="text-slate-400 text-[11px]">
                              Define the challenge title, target cohort, and selective module info.
                            </p>
                          </div>

                          {/* Cohort Batch Selector */}
                          <div className="space-y-1">
                            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                              Target Cohort Batch *
                            </label>
                            <select
                              value={selectedBatchId}
                              onChange={(e) => setSelectedBatchId(e.target.value)}
                              className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C6FF34] text-xs"
                              required
                            >
                              {batches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.batchCode} — {b.title} ({b.students.length} Students)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Title */}
                          <div className="space-y-1">
                            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                              Assignment Title *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Wireshark PCAP Packet Forensics & SYN Flood Mitigation"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C6FF34] text-xs"
                            />
                          </div>

                          {/* Associated Module */}
                          <div className="space-y-1">
                            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                              Associated Course Module (Optional)
                            </label>
                            <select
                              value={selectedModuleId}
                              onChange={(e) => setSelectedModuleId(e.target.value)}
                              className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C6FF34] text-xs"
                            >
                              <option value="">-- No specific module --</option>
                              {batchModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                  Module {m.orderIndex}: {m.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Module Guidance in Proper & Selective Order */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                                Module Information & Guidance (Selective Order)
                              </label>
                              <span className="text-[9px] text-[#C6FF34]">Step-by-step guidance</span>
                            </div>
                            <textarea
                              rows={3}
                              value={moduleNotes}
                              onChange={(e) => setModuleNotes(e.target.value)}
                              placeholder="[Step 01] Review Section 3.2 on TCP Handshakes&#10;[Step 02] Download the attached attack capture PCAP&#10;[Step 03] Formulate Snort drop rules for attacker IPs"
                              className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C6FF34] text-xs leading-relaxed"
                            />
                          </div>

                          {/* Problem Description */}
                          <div className="space-y-1">
                            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                              Brief Instructions & Constraints
                            </label>
                            <textarea
                              rows={2}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Describe deliverables, required analysis tools, and expected output format..."
                              className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C6FF34] text-xs leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* Step 1 Footer */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF34]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          </div>

                          <Button
                            type="submit"
                            className="bg-white hover:bg-slate-200 text-black font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <span>Continue to Schedule & Upload</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 2: Scheduling, Grading & 2.5 MB File Upload */}
                    {createStep === 2 && (
                      <form onSubmit={handleCreateAssignment} className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-mono">
                                Step 2 of 2
                              </span>
                              <span className="text-slate-400 text-[11px]">Deadlines & Deliverable Asset</span>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                              Schedule, Grading & Files
                            </h3>
                            <p className="text-slate-400 text-[11px]">
                              Set the mentor-enforced deadline, grading model, and upload starter files (max 2.5 MB).
                            </p>
                          </div>

                          {/* Scheduling & Deadline */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                                Schedule Release *
                              </label>
                              <input
                                type="datetime-local"
                                required
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C6FF34] text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[#C6FF34] font-bold uppercase tracking-wider text-[10px]">
                                Submission Deadline *
                              </label>
                              <input
                                type="datetime-local"
                                required
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-[#141414] border border-[#C6FF34]/50 text-[#C6FF34] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C6FF34] text-xs font-bold"
                              />
                            </div>
                          </div>

                          {/* Anti-Tamper Notice */}
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                            <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                            <span>
                              Server UTC Lock: Submissions past deadline lock automatically and score 0.
                            </span>
                          </div>

                          {/* Grading Type & Range */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                                Grading Criteria *
                              </label>
                              <span className="text-[10px] text-amber-400 font-bold">
                                Score &lt; 25% is an automatic FAIL
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setGradingType('NUMBER')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                  gradingType === 'NUMBER'
                                    ? 'bg-[#C6FF34] text-slate-950 border-[#C6FF34]'
                                    : 'bg-[#141414] text-slate-300 border-white/15 hover:border-white/30'
                                }`}
                              >
                                Number-Based Score
                              </button>
                              <button
                                type="button"
                                onClick={() => setGradingType('GRADE')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                  gradingType === 'GRADE'
                                    ? 'bg-[#C6FF34] text-slate-950 border-[#C6FF34]'
                                    : 'bg-[#141414] text-slate-300 border-white/15 hover:border-white/30'
                                }`}
                              >
                                Letter Grade (S-F)
                              </button>
                            </div>

                            {gradingType === 'NUMBER' && (
                              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                                <span className="text-[10px] text-slate-400 block uppercase">
                                  Select Number Scale:
                                </span>
                                <div className="grid grid-cols-4 gap-2">
                                  {[5, 20, 50, 100].map((scale) => (
                                    <button
                                      key={scale}
                                      type="button"
                                      onClick={() => setNumberMaxScore(scale)}
                                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                        numberMaxScore === scale
                                          ? 'bg-[#C6FF34] text-slate-950 border-[#C6FF34]'
                                          : 'bg-[#141414] text-slate-300 border-white/15'
                                      }`}
                                    >
                                      0 - {scale}
                                    </button>
                                  ))}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Pass Threshold: <span className="text-[#C6FF34] font-bold">≥ {(numberMaxScore * 0.25).toFixed(1)} / {numberMaxScore} points</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* File Upload Dropzone (Max 2.5 MB) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                                Attach Starter Asset / File (Max 2.5 MB)
                              </label>
                              <span className="text-[10px] text-[#C6FF34]">PDF, ZIP, PCAP, PY, DOCX</span>
                            </div>

                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) processSelectedFile(f);
                              }}
                              className="hidden"
                            />

                            {mentorFile ? (
                              <div className="p-3 rounded-xl bg-[#141414] border border-[#C6FF34]/40 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {getFileIcon(mentorFile.name)}
                                  <div className="min-w-0">
                                    <span className="text-white text-xs font-bold truncate block">
                                      {mentorFile.name}
                                    </span>
                                    <span className="text-[10px] text-[#C6FF34]">
                                      {formatBytes(mentorFile.size)} / 2.50 MB • Ready
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMentorFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                  }}
                                  className="p-1 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-300"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingFile(true);
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  setIsDraggingFile(false);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingFile(false);
                                  const f = e.dataTransfer.files?.[0];
                                  if (f) processSelectedFile(f);
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                  isDraggingFile
                                    ? 'border-[#C6FF34] bg-[#C6FF34]/10'
                                    : 'border-white/20 bg-white/[0.02] hover:border-white/40'
                                }`}
                              >
                                <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                                <div className="text-xs text-white">
                                  Drag & Drop or <span className="text-[#C6FF34] underline">Browse</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Any file up to 2.5 MB strictly
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 2 Footer */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateStep(1)}
                            className="w-1/3 border-white/20 text-slate-300 text-xs"
                          >
                            Back
                          </Button>

                          <Button
                            type="submit"
                            disabled={createLoading}
                            className="w-2/3 bg-white hover:bg-slate-200 text-black font-bold py-2 rounded-xl text-xs shadow-lg transition-all"
                          >
                            {createLoading ? 'Publishing...' : 'Publish Assignment to Batch'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tactical Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Active Tasks</span>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {totalAssignmentsCount}
            </div>
            <div className="text-[10px] text-slate-400">Published across cohorts</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Submissions Received</span>
              <Users className="w-4 h-4 text-[#C6FF34]" />
            </div>
            <div className="text-2xl font-bold text-[#C6FF34] tracking-tight">
              {totalSubmissionsCount}
            </div>
            <div className="text-[10px] text-slate-400">Total student uploads</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pending Grading</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 tracking-tight">
              {pendingGradingCount}
            </div>
            <div className="text-[10px] text-slate-400">Awaiting mentor remarks</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Anti-Tamper Status</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight flex items-center gap-1.5">
              UTC Sync
            </div>
            <div className="text-[10px] text-slate-400">Client clock bypass immune</div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FILTER & CONTROLS TOOLBAR                              */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-white/10">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <Layers className="w-4 h-4 text-[#C6FF34] shrink-0" />
          <span className="text-xs text-slate-400 uppercase tracking-wider shrink-0">Batch:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full bg-[#141414] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C6FF34]"
          >
            <option value="">All Cohort Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} — {b.title} ({b.students.length} Students)
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-[#141414] border border-white/15 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C6FF34]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-white/10 shrink-0">
          {(['ALL', 'ACTIVE', 'GRADED', 'OVERDUE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === filter
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ASSIGNMENT CARDS GRID                                  */}
      {/* ========================================================= */}
      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Assignments Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No assignments match the current filter or search criteria.'
                : 'No assignments have been assigned to this cohort batch yet.'}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-white hover:bg-slate-200 text-black font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Create First Assignment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAssignments.map((assignment) => {
            const isDeadlinePassed = new Date() > new Date(assignment.deadline);
            const submissionCount = assignment.submissions?.length || 0;
            const gradedCount =
              assignment.submissions?.filter((s) => s.status === 'GRADED').length || 0;
            const batchStudentCount =
              batches.find((b) => b.id === assignment.batchId)?.students.length || 0;

            return (
              <div
                key={assignment.id}
                className="group relative rounded-2xl bg-gradient-to-b from-[#0e0e0e] to-[#050505] border border-white/10 hover:border-[#C6FF34]/50 transition-all duration-300 p-6 shadow-xl flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-white/10 text-white border-white/20 text-[10px]">
                        {assignment.batch?.batchCode}
                      </Badge>
                      {assignment.module && (
                        <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px]">
                          Module {assignment.module.orderIndex}: {assignment.module.title}
                        </Badge>
                      )}
                      {assignment.gradingType === 'NUMBER' ? (
                        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                          Score: 0-{assignment.numberMaxScore || 100} (Pass ≥25%)
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                          Grade: S, A, B, C, D, F
                        </Badge>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0 border ${
                        isDeadlinePassed
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-[#C6FF34]/15 text-[#C6FF34] border-[#C6FF34]/30'
                      }`}
                    >
                      {isDeadlinePassed ? 'Locked / Overdue' : 'Active & Accepting'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-[#C6FF34] transition-colors flex items-center gap-2">
                      {assignment.title}
                    </h3>
                    {assignment.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  {/* Module Sequential Instructions Callout */}
                  {assignment.moduleNotes && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" />
                        Selective Module Guidance & Order:
                      </div>
                      <div className="text-slate-300 text-[11px] whitespace-pre-line pl-2 border-l-2 border-purple-500/50 leading-relaxed font-mono">
                        {assignment.moduleNotes}
                      </div>
                    </div>
                  )}

                  {/* Mentor Attached Asset / Problem File */}
                  {assignment.fileUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(assignment.fileName)}
                        <div className="min-w-0">
                          <span className="text-xs text-white truncate block font-medium">
                            {assignment.fileName || 'Attached Problem File'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatBytes(assignment.fileSize)} • Starter Asset
                          </span>
                        </div>
                      </div>
                      <a
                        href={assignment.fileUrl}
                        download={assignment.fileName || 'problem-statement'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}

                  {/* Schedule & Deadline Bar */}
                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span>Assigned: {new Date(assignment.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className={isDeadlinePassed ? 'text-red-400 font-bold' : ''} suppressHydrationWarning>
                        Due: {new Date(assignment.deadline).toLocaleDateString()} {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-xs">
                      <span className="text-white font-bold">{submissionCount}</span>
                      <span className="text-slate-400">/{batchStudentCount} Submitted</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="text-xs">
                      <span className="text-[#C6FF34] font-bold">{gradedCount}</span>
                      <span className="text-slate-400"> Evaluated</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveReviewAssignment(assignment)}
                    className="bg-white hover:bg-slate-200 text-black font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Award className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600" />
                    Review Submissions ({submissionCount})
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: ROSTER EVALUATION & GRADING PANEL               */}
      {/* ========================================================= */}
      {activeReviewAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/10 text-white border-white/20 text-[10px]">
                    {activeReviewAssignment.batch?.batchCode}
                  </Badge>
                  <span className="text-slate-400 text-xs">
                    Due: {new Date(activeReviewAssignment.deadline).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C6FF34]" />
                  Submission Roster & Evaluation: {activeReviewAssignment.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveReviewAssignment(null);
                  setGradingStudentId(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 self-start sm:self-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gradeError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{gradeError}</span>
              </div>
            )}
            {gradeSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{gradeSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              {(() => {
                const batch = batches.find((b) => b.id === activeReviewAssignment.batchId);
                const students = batch?.students || [];

                if (students.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 rounded-xl bg-white/[0.02] border border-white/10">
                      No students enrolled in this batch yet.
                    </div>
                  );
                }

                return students.map((sp) => {
                  const student = sp.user;
                  const submission = activeReviewAssignment.submissions?.find(
                    (s) => s.studentId === student.id
                  );
                  const isSubmitted = !!submission;
                  const isGraded = submission?.status === 'GRADED';
                  const isOverdue =
                    !isSubmitted && new Date() > new Date(activeReviewAssignment.deadline);

                  const isBeingGraded = gradingStudentId === student.id;

                  return (
                    <div
                      key={student.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isBeingGraded
                          ? 'bg-[#141414] border-[#C6FF34] shadow-[0_0_20px_rgba(198,255,52,0.15)]'
                          : 'bg-[#0e0e0e] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C6FF34]/20 to-emerald-500/20 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                            {student.name ? student.name.substring(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{student.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">
                                {student.tsIdentity?.tsId || 'TS-STUDENT'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">{student.email}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {isGraded ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  submission?.isPassing
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                                }`}
                              >
                                {activeReviewAssignment.gradingType === 'NUMBER'
                                  ? `SCORE: ${submission?.score}/${activeReviewAssignment.numberMaxScore} (${
                                      submission?.isPassing ? 'PASS' : 'FAIL'
                                    })`
                                  : `GRADE: ${submission?.grade} (${
                                      submission?.isPassing ? 'PASS' : 'FAIL'
                                    })`}
                              </span>
                            </div>
                          ) : isSubmitted ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Submitted • Awaiting Review
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                              Locked / Overdue (Score 0)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/10 text-slate-400 border border-white/10">
                              Not Submitted Yet
                            </span>
                          )}

                          <Button
                            size="sm"
                            onClick={() => {
                              if (isBeingGraded) {
                                setGradingStudentId(null);
                              } else {
                                setGradingStudentId(student.id);
                                setGradeInput(submission?.grade || 'A');
                                setScoreInput(
                                  submission?.score ??
                                    (activeReviewAssignment.numberMaxScore
                                      ? activeReviewAssignment.numberMaxScore * 0.8
                                      : 80)
                                );
                                setRemarksInput(submission?.remarks || '');
                              }
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                              isBeingGraded
                                ? 'bg-white/20 text-white'
                                : 'bg-white hover:bg-slate-200 text-black shadow-md'
                            }`}
                          >
                            {isBeingGraded
                              ? 'Close Drawer'
                              : isGraded
                              ? 'Update Grade'
                              : 'Grade Submission'}
                          </Button>
                        </div>
                      </div>

                      {submission && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            {getFileIcon(submission.fileName)}
                            <span className="text-white font-medium">
                              {submission.fileName || 'Solution File'}
                            </span>
                            <span className="text-slate-500">• {formatBytes(submission.fileSize)}</span>
                            {submission.submittedAt && (
                              <span className="text-slate-500" suppressHydrationWarning>
                                • Submitted{' '}
                                {new Date(submission.submittedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          {submission.fileUrl && (
                            <a
                              href={submission.fileUrl}
                              download={submission.fileName || 'student-solution'}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#C6FF34] hover:underline flex items-center gap-1 shrink-0 font-semibold"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Solution Asset
                            </a>
                          )}
                        </div>
                      )}

                      {submission?.remarks && !isBeingGraded && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300">
                          <span className="text-[#C6FF34] font-bold">Mentor Remarks: </span>
                          {submission.remarks}
                        </div>
                      )}

                      {/* Grading Drawer */}
                      {isBeingGraded && (
                        <div className="mt-4 pt-4 border-t border-[#C6FF34]/30 space-y-4 bg-black/40 p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[#C6FF34] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4" />
                              Evaluation Form: {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Instant sync with Student Academic Portal
                            </span>
                          </div>

                          {activeReviewAssignment.gradingType === 'NUMBER' ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <label className="text-slate-300 font-bold">
                                  Score (0 - {activeReviewAssignment.numberMaxScore || 100} pts):
                                </label>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400">
                                    Percentage:{' '}
                                    {(
                                      ((scoreInput || 0) /
                                        (activeReviewAssignment.numberMaxScore || 100)) *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </span>
                                  {scoreInput <
                                  (activeReviewAssignment.numberMaxScore || 100) * 0.25 ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                      FAIL (&lt;25%)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                      PASS (≥25%)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Input
                                type="number"
                                min={0}
                                max={activeReviewAssignment.numberMaxScore || 100}
                                value={scoreInput}
                                onChange={(e) => setScoreInput(Number(e.target.value))}
                                className="bg-[#141414] border-white/20 text-white rounded-xl text-sm font-bold"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="text-slate-300 font-bold block text-xs">
                                Select Letter Grade:
                              </label>
                              <div className="grid grid-cols-6 gap-2">
                                {(['S', 'A', 'B', 'C', 'D', 'F'] as const).map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGradeInput(g)}
                                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                                      gradeInput === g
                                        ? g === 'F'
                                          ? 'bg-red-500 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                                          : 'bg-[#C6FF34] text-slate-950 border-[#C6FF34] shadow-[0_0_12px_rgba(198,255,52,0.4)]'
                                        : 'bg-[#141414] text-slate-300 border-white/15 hover:border-white/30'
                                    }`}
                                  >
                                    Grade {g} {g === 'F' ? '(Fail)' : ''}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-slate-300 font-bold block text-xs">
                              Faculty Remarks & Feedback:
                            </label>
                            <div className="flex flex-wrap gap-1.5 pb-1">
                              {[
                                'Outstanding forensic breakdown!',
                                'Solid execution. Accurate threat identification.',
                                'Good effort. Review Section 2 methodology.',
                                'Incomplete packet capture analysis. Resubmit required.',
                              ].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setRemarksInput(preset)}
                                  className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                                >
                                  + {preset}
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={remarksInput}
                              onChange={(e) => setRemarksInput(e.target.value)}
                              placeholder="Add personalized feedback, technical critique, and commendations..."
                              rows={3}
                              className="w-full bg-[#141414] border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C6FF34]"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setGradingStudentId(null)}
                              className="border-white/20 text-slate-300 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              disabled={gradeLoading}
                              onClick={() => {
                                if (submission) {
                                  handleGradeSubmit(submission.id);
                                } else {
                                  alert('Student has not submitted a solution yet.');
                                }
                              }}
                              className="bg-white hover:bg-slate-200 text-black font-bold text-xs shadow-md transition-all"
                            >
                              {gradeLoading ? 'Recording Grade...' : 'Save & Publish Evaluation'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
