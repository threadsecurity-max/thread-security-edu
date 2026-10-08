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
    <div className="space-y-6 text-white font-mono">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2 border ${
            toastMessage.type === 'success'
              ? 'bg-[#050706] border-[#C6FF34]/40 text-[#C6FF34]'
              : 'bg-[#050706] border-rose-500/40 text-rose-400'
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

      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 uppercase">
              COGNITIVE EVALUATION ENGINE
            </span>
            <span className="text-xs text-zinc-400">
              ANTI-CHEAT EXAM CONDUCTION
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Assessments &amp; Certification Tests
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Author randomized question banks, configure proctored anti-cheat parameters, define passing thresholds, and review student attempt scores.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & STATUS FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assessments, syllabi, or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF34]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400">Status:</span>
          {['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#C6FF34] text-black border-[#C6FF34]'
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── ASSESSMENTS GRID ── */}
      {filteredAssessments.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
          <Award className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-serif font-bold text-white">No assessments found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Build your first proctored multiple-choice or theoretical test with automated evaluation.
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
                className="p-6 rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {item.durationMinutes}m
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-zinc-400 block pt-0.5 font-sans">
                      {item.course?.title}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-zinc-400">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Passing Score:</span>
                      <strong className="text-white">{item.passingScore}%</strong> ({item.totalMarks} Marks)
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Question Pool:</span>
                      <strong className="text-[#C6FF34]">{item.questionsPerAttempt} Questions</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Attempts: <strong className="text-white">{attemptsCount}</strong></span>
                  </span>

                  <button
                    onClick={() => showToast(`Proctoring settings active for "${item.title}".`, 'success')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#C6FF34] hover:text-black text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/[0.1] cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit Proctor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE ASSESSMENT MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C6FF34]" />
                <h3 className="text-xl font-serif font-bold text-white">Create Proctored Assessment</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Web Security Comprehensive Evaluation: OWASP Top 10"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Associated Academic Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Duration (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 45 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseFloat(e.target.value) || 100 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Passing (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseFloat(e.target.value) || 70 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Questions per Attempt</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.questionsPerAttempt}
                    onChange={(e) => setFormData({ ...formData, questionsPerAttempt: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Publication State</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  >
                    <option value="PUBLISHED">PUBLISHED (Active Exam)</option>
                    <option value="DRAFT">DRAFT (Unpublished)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Assessment Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
                  Anti-Cheating &amp; Integrity Controls
                </span>
                <div className="flex items-center gap-4 text-[11px] text-zinc-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tabSwitchDetection}
                      onChange={(e) => setFormData({ ...formData, tabSwitchDetection: e.target.checked })}
                      className="accent-[#C6FF34]"
                    />
                    <span>Tab Switch Flagging</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.copyPasteRestriction}
                      onChange={(e) => setFormData({ ...formData, copyPasteRestriction: e.target.checked })}
                      className="accent-[#C6FF34]"
                    />
                    <span>Clipboard Blocking</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {submitting ? 'Creating...' : 'Deploy Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
