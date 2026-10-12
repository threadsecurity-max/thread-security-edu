'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Plus,
  ExternalLink,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Users,
  Search,
  Filter,
  Send,
  Copy,
  Check,
  Mail,
  User,
  Award,
  Sparkles,
} from 'lucide-react';
import { gradeLabAttemptAction } from '@/features/mentor/actions/mentor.actions';

export interface LabAttemptDetail {
  id: string;
  labId: string;
  userId: string;
  state: string;
  score: number;
  submittedFlag: string | null;
  feedback: string | null;
  startedAt: string | Date;
  completedAt: string | Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    tsIdentity?: {
      tsId: string;
    } | null;
  };
}

export interface LabItem {
  id: string;
  title: string;
  objective: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  estimatedMinutes: number;
  skills: string;
  instructions: string;
  flagHash: string | null;
  course: {
    id: string;
    title: string;
    category?: string | null;
  };
  attempts?: LabAttemptDetail[];
  createdAt: string | Date;
}

export interface CourseOption {
  id: string;
  title: string;
  category?: string | null;
}

export function MentorLabsClient({
  initialLabs,
  courses,
  showCreateInitial = false,
}: {
  initialLabs: LabItem[];
  courses: CourseOption[];
  showCreateInitial?: boolean;
}) {
  const [labs, setLabs] = useState<LabItem[]>(initialLabs);
  const [createModalOpen, setCreateModalOpen] = useState(showCreateInitial);
  const [createStep, setCreateStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter courses to only cybersecurity-related for the selector (Rule #23)
  const allowedCategories = [
    'cybersecurity',
    'web security',
    'network security',
    'vapt',
    'soc',
    'cloud security',
    'devsecops',
    'ethical hacking',
    'offensive security',
    'defensive security',
  ];

  const cyberCourses = courses.filter((c) => {
    const cat = (c.category || '').toLowerCase();
    const title = c.title.toLowerCase();
    return allowedCategories.some((allowed) => cat.includes(allowed) || title.includes(allowed));
  });

  const availableCourses = cyberCourses.length > 0 ? cyberCourses : courses;

  const [selectedLabForSubmissions, setSelectedLabForSubmissions] = useState<LabItem | null>(null);
  const [gradingAttemptId, setGradingAttemptId] = useState<string | null>(null);
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingFeedback, setGradingFeedback] = useState<Record<string, string>>({});
  const [copiedFlagId, setCopiedFlagId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    courseId: availableCourses[0]?.id || '',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 60,
    skills: 'Web Pentesting, Payload Injection, Privilege Escalation',
    instructions: '1. Launch virtual terminal.\n2. Scan open ports and enumerate services.\n3. Identify injectable endpoints and retrieve flag.',
    labUrl: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenSubmissionsModal = (lab: LabItem) => {
    setSelectedLabForSubmissions(lab);
    const scores: Record<string, number> = {};
    const feedbacks: Record<string, string> = {};
    lab.attempts?.forEach((att) => {
      scores[att.id] = typeof att.score === 'number' && att.score > 0 ? att.score : (att.state === 'COMPLETED' ? 100 : 80);
      feedbacks[att.id] = att.feedback || 'Exploit execution verified and offensive payload analysis evaluated.';
    });
    setGradingScores(scores);
    setGradingFeedback(feedbacks);
  };

  const handleGradeAttempt = async (attemptId: string) => {
    const score = Number(gradingScores[attemptId] ?? 100);
    const feedback = gradingFeedback[attemptId] || 'Exploit verified successfully.';

    if (isNaN(score) || score < 0 || score > 100) {
      showToast('Score must be a number between 0 and 100.', 'error');
      return;
    }

    setGradingAttemptId(attemptId);
    try {
      const res = await gradeLabAttemptAction(attemptId, score, feedback);
      if (res.success) {
        showToast('Evaluation & acknowledgement email dispatched to student!', 'success');

        // Update local labs state
        setLabs((prev) =>
          prev.map((l) => {
            if (l.id !== selectedLabForSubmissions?.id) return l;
            return {
              ...l,
              attempts: l.attempts?.map((a) =>
                a.id === attemptId
                  ? { ...a, score, feedback, state: 'COMPLETED', completedAt: new Date().toISOString() }
                  : a
              ),
            };
          })
        );

        // Also update modal selectedLab
        setSelectedLabForSubmissions((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            attempts: prev.attempts?.map((a) =>
              a.id === attemptId
                ? { ...a, score, feedback, state: 'COMPLETED', completedAt: new Date().toISOString() }
                : a
            ),
          };
        });
      } else {
        showToast(res.error || 'Failed to grade submission.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving grade.', 'error');
    } finally {
      setGradingAttemptId(null);
    }
  };

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.objective || !formData.courseId) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentor/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lab environment.');
      }

      showToast(`Cybersecurity Lab "${data.lab.title}" deployed successfully!`, 'success');
      setCreateModalOpen(false);
      setCreateStep(1);
      setFormData({
        title: '',
        objective: '',
        courseId: availableCourses[0]?.id || '',
        difficulty: 'INTERMEDIATE',
        estimatedMinutes: 60,
        skills: 'Web Pentesting, Payload Injection, Privilege Escalation',
        instructions: '',
        labUrl: '',
      });

      // Refresh labs list
      const refreshed = await fetch('/api/mentor/labs');
      const refreshedData = await refreshed.json();
      if (refreshedData.labs) {
        setLabs(refreshedData.labs);
      }
    } catch (err: any) {
      showToast(err.message || 'Error deploying lab', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.course?.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === 'ALL' || lab.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ADVANCED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EXPERT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const extractLabUrl = (flagHash: string | null) => {
    if (!flagHash) return null;
    if (flagHash.startsWith('URL:')) {
      return flagHash.replace('URL:', '');
    }
    return null;
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Toast Alert */}
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

      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              Hands-on Training
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Practical Security Range
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Practical Labs &amp; Exercises
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Configure hands-on cybersecurity target labs, set challenge objectives, review student flag submissions, and grade practical execution.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Lab</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search labs by title, topic, or track..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* ── LABS ROSTER ── */}
      {filteredLabs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No cybersecurity labs found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click &quot;Create New Lab&quot; to design a practical challenge or assign an exercise to your cohort.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLabs
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((lab) => {
                const externalUrl = extractLabUrl(lab.flagHash);
                const totalAttempts = lab.attempts?.length || 0;
                const completedAttempts =
                  lab.attempts?.filter((a) => a.completedAt || a.state === 'COMPLETED').length || 0;

                return (
                  <div
                    key={lab.id}
                    onClick={() => handleOpenSubmissionsModal(lab)}
                    className="p-6 rounded-2xl md:rounded-3xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                    title="Click to view student submissions and grade attempts"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyBadge(
                            lab.difficulty
                          )}`}
                        >
                          {lab.difficulty}
                        </span>

                        <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {lab.estimatedMinutes}m
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-snug">
                          {lab.title}
                        </h3>
                        <span className="text-xs text-slate-500 block pt-0.5 font-medium">
                          {lab.course?.title}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {lab.objective}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target Competencies:</span>
                        <p className="text-slate-800 font-medium truncate">{lab.skills}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSubmissionsModal(lab);
                        }}
                        className="text-xs text-slate-600 flex items-center gap-1.5 transition-all cursor-pointer py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-violet-50 hover:text-violet-700 font-medium"
                      >
                        <Users className="w-3.5 h-3.5 text-violet-600" />
                        <span>Submissions: <strong className="text-slate-900 font-bold">{completedAttempts}/{totalAttempts}</strong></span>
                        <span className="text-violet-700 font-bold ml-1">Grade ↗</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {externalUrl ? (
                          <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border border-violet-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Launch</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast('Built-in terminal sandbox linked.', 'success');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5"
                          >
                            <Terminal className="w-3 h-3 text-violet-600" />
                            <span>Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* ── PAGINATION CONTROLS ── */}
          {filteredLabs.length > pageSize && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Showing{' '}
                <strong className="text-slate-900 font-bold">
                  {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filteredLabs.length)}
                </strong>{' '}
                of <strong className="text-violet-700 font-bold">{filteredLabs.length}</strong> Labs
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  &larr; Previous
                </button>

                {Array.from(
                  { length: Math.ceil(filteredLabs.length / pageSize) },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={currentPage >= Math.ceil(filteredLabs.length / pageSize)}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(Math.ceil(filteredLabs.length / pageSize), p + 1)
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CREATE CYBERSECURITY LAB MODAL (PAGINATED MULTI-STEP WIZARD) ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => {
              setCreateModalOpen(false);
              setCreateStep(1);
            }}
          />

          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs text-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Modal Header & Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Configure New Lab</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-violet-700">
                      Step {createStep} of 3:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {createStep === 1 && 'Lab Overview & Course'}
                      {createStep === 2 && 'Environment & Skills'}
                      {createStep === 3 && 'Objective & Instructions'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateStep(1);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    step <= createStep ? 'bg-violet-600' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleCreateLab} className="space-y-4">
              {/* ── STEP 1: LAB OVERVIEW (3 Fields) ── */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Lab Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Broken Object Level Authorization (BOLA) Exploitation"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Target Course *</label>
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    >
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Difficulty Tier</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    >
                      <option value="BEGINNER">BEGINNER</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                      <option value="ADVANCED">ADVANCED</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.title || !formData.courseId}
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Sandbox Config</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: ENVIRONMENT & SKILLS (3 Fields) ── */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Estimated Duration (Minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="360"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Target / Terminal URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.labUrl}
                      onChange={(e) => setFormData({ ...formData, labUrl: e.target.value })}
                      placeholder="https://labs.threadsecurity.in/targets/bola-01 or port"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Skills &amp; Vulnerabilities Targeted *</label>
                    <input
                      type="text"
                      required
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g. Burp Suite, REST API Insecurity, IDOR, Token Tampering"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      disabled={!formData.skills}
                      onClick={() => setCreateStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Objective &amp; Details</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: OBJECTIVES & INSTRUCTIONS (2 Fields + Summary) ── */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Lab Objective &amp; Scenario *</label>
                    <textarea
                      rows={2}
                      required
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      placeholder="Identify insecure direct references in the profile API and extract administrative flag..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Step-by-Step Instructions</label>
                    <textarea
                      rows={3}
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Guide students on tools to run, test parameters, and expected flag format..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Course Track:</span>
                      <strong className="text-slate-900 truncate max-w-[240px]">
                        {availableCourses.find((c) => c.id === formData.courseId)?.title}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tier &amp; Duration:</span>
                      <strong className="text-violet-700">
                        {formData.difficulty} • {formData.estimatedMinutes} Mins
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs disabled:opacity-50 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      {submitting ? 'Creating Lab...' : 'Confirm & Deploy Lab'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── STUDENT SUBMISSIONS & GRADING MODAL ── */}
      {selectedLabForSubmissions && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 max-w-4xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col text-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full">
                    Student Submissions
                  </span>
                  <span className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full ${getDifficultyBadge(selectedLabForSubmissions.difficulty)}`}>
                    {selectedLabForSubmissions.difficulty}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedLabForSubmissions.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Course: <strong className="text-slate-800">{selectedLabForSubmissions.course?.title}</strong> • Total Attempts: <strong className="text-violet-700">{selectedLabForSubmissions.attempts?.length || 0}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLabForSubmissions(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submissions List */}
            <div className="overflow-y-auto space-y-6 pr-1 flex-1">
              {(!selectedLabForSubmissions.attempts || selectedLabForSubmissions.attempts.length === 0) ? (
                <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <Users className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">No Student Attempts Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Students enrolled in this course track have not started or submitted their flags for this lab yet.
                  </p>
                </div>
              ) : (
                selectedLabForSubmissions.attempts.map((attempt) => {
                  const studentName = attempt.user?.name || 'Enrolled Student';
                  const studentEmail = attempt.user?.email || 'N/A';
                  const tsId = attempt.user?.tsIdentity?.tsId || `TSE-${attempt.userId.slice(-6).toUpperCase()}`;
                  const isGradingThis = gradingAttemptId === attempt.id;

                  return (
                    <div
                      key={attempt.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-200 transition-all space-y-5"
                    >
                      {/* Student Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-sm shrink-0">
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{studentName}</h4>
                              <span className="text-xs font-semibold font-mono text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">
                                {tsId}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 block">{studentEmail}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              attempt.state === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : attempt.state === 'SUBMITTED'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {attempt.state}
                          </span>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">Score</span>
                            <span className="text-sm font-bold text-violet-700">
                              {attempt.score || 0} / 100
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flag and Writeup Proof */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Submitted Flag */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 uppercase font-semibold">
                              Captured Flag:
                            </span>
                            {attempt.submittedFlag && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(attempt.submittedFlag || '');
                                  setCopiedFlagId(attempt.id);
                                  setTimeout(() => setCopiedFlagId(null), 2000);
                                }}
                                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedFlagId === attempt.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600 font-medium">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-violet-700 font-mono font-semibold break-all">
                            {attempt.submittedFlag || <span className="text-slate-400 italic font-sans">No flag captured yet</span>}
                          </p>
                        </div>

                        {/* Submission Timing */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-slate-600">
                          <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                            Timeline:
                          </span>
                          <p className="text-xs text-slate-600">
                            Started: {attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-xs text-slate-600">
                            Completed: {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'In Progress'}
                          </p>
                        </div>
                      </div>

                      {/* Student Writeup / Exploit Proof */}
                      {attempt.feedback && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                            Student Notes &amp; Methodology:
                          </span>
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto">
                            {attempt.feedback}
                          </div>
                        </div>
                      )}

                      {/* Mentor Grading & Feedback Section */}
                      <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-violet-100 pb-2.5">
                          <span className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-600" />
                            Instructor Evaluation &amp; Feedback
                          </span>
                          <span className="text-xs text-violet-700 font-medium">Dispatches Email to Student</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                          {/* Score Input */}
                          <div className="sm:col-span-4 space-y-2">
                            <label className="text-xs text-slate-700 block font-medium">
                              Grade Score (0 - 100):
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={gradingScores[attempt.id] ?? (attempt.score || 100)}
                              onChange={(e) =>
                                setGradingScores({
                                  ...gradingScores,
                                  [attempt.id]: Math.min(100, Math.max(0, Number(e.target.value))),
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-base focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                            {/* Score Presets */}
                            <div className="flex items-center gap-1.5">
                              {[100, 85, 70, 50].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() =>
                                    setGradingScores({
                                      ...gradingScores,
                                      [attempt.id]: preset,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Message / Feedback */}
                          <div className="sm:col-span-8 space-y-2">
                            <label className="text-xs text-slate-700 block font-medium">
                              Faculty Remarks &amp; Feedback Message:
                            </label>
                            <textarea
                              rows={2}
                              value={gradingFeedback[attempt.id] ?? ''}
                              onChange={(e) =>
                                setGradingFeedback({
                                  ...gradingFeedback,
                                  [attempt.id]: e.target.value,
                                })
                              }
                              placeholder="Type acknowledgement note and feedback to be dispatched to student via email..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                          </div>
                        </div>

                        {/* Dispatch Button */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={isGradingThis}
                            onClick={() => handleGradeAttempt(attempt.id)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                          >
                            {isGradingThis ? (
                              <span>Dispatching Evaluation...</span>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Save &amp; Dispatch Evaluation Email</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">
                Evaluation results are automatically dispatched to the student&apos;s email address.
              </span>
              <button
                type="button"
                onClick={() => setSelectedLabForSubmissions(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
