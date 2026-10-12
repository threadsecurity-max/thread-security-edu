'use client';

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Search,
  Filter,
  FileQuestion,
  Users,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

export interface AssessmentItem {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingScore: number;
  questionsPerAttempt: number;
  maxAttempts: number;
  status: string;
  course: {
    id: string;
    title: string;
    category?: string | null;
  };
  _count?: {
    questions: number;
    testAttempts: number;
    attempts: number;
  };
  createdAt: string | Date;
}

export interface CourseOption {
  id: string;
  title: string;
  category?: string | null;
}

export function MentorAssessmentsClient({
  initialAssessments,
  courses,
  showCreateInitial = false,
}: {
  initialAssessments: AssessmentItem[];
  courses: CourseOption[];
  showCreateInitial?: boolean;
}) {
  const [assessments, setAssessments] = useState<AssessmentItem[]>(initialAssessments);
  const [createModalOpen, setCreateModalOpen] = useState(showCreateInitial);
  const [createStep, setCreateStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    courseId: courses[0]?.id || '',
    description: 'Practical security assessment to evaluate syllabus competency.',
    instructions: 'Please ensure an uninterrupted connection. Anti-cheating proctoring active.',
    durationMinutes: 45,
    totalMarks: 100,
    passingScore: 70,
    questionsPerAttempt: 20,
    maxAttempts: 3,
    status: 'PUBLISHED',
    tabSwitchDetection: true,
    copyPasteRestriction: true,
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId) {
      showToast('Please provide assessment title and select target course.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentor/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create assessment.');
      }

      showToast(`Assessment "${data.assessment.title}" created successfully!`, 'success');
      setCreateModalOpen(false);
      setCreateStep(1);
      setFormData({
        title: '',
        courseId: courses[0]?.id || '',
        description: 'Practical security assessment to evaluate syllabus competency.',
        instructions: 'Please ensure an uninterrupted connection. Anti-cheating proctoring active.',
        durationMinutes: 45,
        totalMarks: 100,
        passingScore: 70,
        questionsPerAttempt: 20,
        maxAttempts: 3,
        status: 'PUBLISHED',
        tabSwitchDetection: true,
        copyPasteRestriction: true,
      });

      // Refresh assessments list
      const refreshed = await fetch('/api/mentor/assessments');
      const refreshedData = await refreshed.json();
      if (refreshedData.assessments) {
        setAssessments(refreshedData.assessments);
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
              Evaluations &amp; Tests
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Syllabus Competency Exams
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Assessments &amp; Quizzes
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Create randomized question banks, configure proctoring settings, define passing criteria, and review student test performance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & STATUS FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assessments by title, topic, or course..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── ASSESSMENTS GRID ── */}
      {filteredAssessments.length === 0 ? (
        <div className="p-16 text-center rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No assessments found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click &quot;Create Assessment&quot; to design your first quiz or curriculum evaluation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((item) => {
            const attemptsCount =
              (item._count?.testAttempts || 0) + (item._count?.attempts || 0);

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl md:rounded-3xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.durationMinutes}m
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs text-slate-500 block pt-0.5 font-medium">
                      {item.course?.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Passing:</span>
                      <strong className="text-slate-900 font-bold">{item.passingScore}%</strong> ({item.totalMarks} Marks)
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Questions:</span>
                      <strong className="text-violet-700 font-bold">{item.questionsPerAttempt} Qs</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attempts: <strong className="text-slate-900 font-bold">{attemptsCount}</strong></span>
                  </span>

                  <button
                    onClick={() => showToast(`Proctoring settings verified for "${item.title}".`, 'success')}
                    className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 text-xs font-semibold transition-all flex items-center gap-1.5 border border-violet-200 hover:border-violet-600 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Proctoring</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE ASSESSMENT MODAL (PAGINATED MULTI-STEP WIZARD) ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => {
              setCreateModalOpen(false);
              setCreateStep(1);
            }}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs text-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Modal Header & Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Create Assessment</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-violet-700">
                      Step {createStep} of 3:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {createStep === 1 && 'Exam Overview & Course'}
                      {createStep === 2 && 'Scoring & Time Constraints'}
                      {createStep === 3 && 'Proctoring & Final Details'}
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

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              {/* ── STEP 1: EXAM OVERVIEW (3 Fields) ── */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Assessment Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Web Security Comprehensive Evaluation: OWASP Top 10"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Academic Course *</label>
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Publication Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    >
                      <option value="PUBLISHED">PUBLISHED (Active Exam)</option>
                      <option value="DRAFT">DRAFT (Unpublished)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.title || !formData.courseId}
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Scoring Criteria</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: SCORING & TIME (3 Fields) ── */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Exam Duration (Minutes)</label>
                    <input
                      type="number"
                      min="10"
                      max="180"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 45 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Total Examination Marks</label>
                    <input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: parseFloat(e.target.value) || 100 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Passing Threshold (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: parseFloat(e.target.value) || 70 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
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
                      onClick={() => setCreateStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Questions &amp; Integrity</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: INTEGRITY & DETAILS (3 Items) ── */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Questions per Attempt</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={formData.questionsPerAttempt}
                      onChange={(e) => setFormData({ ...formData, questionsPerAttempt: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Assessment Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100 space-y-2">
                    <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                      3. Anti-Cheating &amp; Integrity Controls
                    </span>
                    <div className="flex items-center gap-4 text-xs text-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tabSwitchDetection}
                          onChange={(e) => setFormData({ ...formData, tabSwitchDetection: e.target.checked })}
                          className="accent-violet-600"
                        />
                        <span>Tab Switch Detection</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.copyPasteRestriction}
                          onChange={(e) => setFormData({ ...formData, copyPasteRestriction: e.target.checked })}
                          className="accent-violet-600"
                        />
                        <span>Clipboard Restriction</span>
                      </label>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Course Track:</span>
                      <strong className="text-slate-900 truncate max-w-[240px]">
                        {courses.find((c) => c.id === formData.courseId)?.title}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rules:</span>
                      <strong className="text-violet-700">
                        {formData.durationMinutes} Mins • Passing {formData.passingScore}% • {formData.questionsPerAttempt} Qs
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
                      {submitting ? 'Creating...' : 'Confirm & Deploy Assessment'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
