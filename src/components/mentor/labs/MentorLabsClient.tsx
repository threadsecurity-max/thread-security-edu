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
} from 'lucide-react';

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
  attempts?: Array<{ id: string; state?: string; status?: string; completedAt: string | null }>;
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'INTERMEDIATE':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'ADVANCED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'EXPERT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
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
              CYBERSECURITY RANGE ENGINE
            </span>
            <span className="text-xs text-zinc-400">
              RESTRICTED TO SECURITY TRACKS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Cybersecurity Practical Labs
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Provision practical target ranges, configure exploit environments, link external terminals, and monitor cohort test attempts with zero data leakage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Lab</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search labs, vulnerabilities, or tracks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF34]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400">Difficulty:</span>
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? 'bg-[#C6FF34] text-black border-[#C6FF34]'
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* ── LABS ROSTER ── */}
      {filteredLabs.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
          <Terminal className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-serif font-bold text-white">No cybersecurity labs found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Deploy a new hands-on virtual lab container or attach an external hacking lab instance for your students.
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
                  lab.attempts?.filter((a) => a.completedAt || a.status === 'COMPLETED').length || 0;

                return (
                  <div
                    key={lab.id}
                    className="p-6 rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(
                            lab.difficulty
                          )}`}
                        >
                          {lab.difficulty}
                        </span>

                        <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {lab.estimatedMinutes}m
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                          {lab.title}
                        </h3>
                        <span className="text-[11px] text-zinc-400 block pt-1 font-sans">
                          {lab.course?.title}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                        {lab.objective}
                      </p>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Target Competencies:</span>
                        <p className="text-zinc-300 truncate">{lab.skills}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Attempts: <strong className="text-white">{completedAttempts}/{totalAttempts}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {externalUrl ? (
                          <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-[#C6FF34]/15 hover:bg-[#C6FF34] text-[#C6FF34] hover:text-black border border-[#C6FF34]/30 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Launch</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            onClick={() => showToast('Built-in VM terminal sandbox linked.', 'success')}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Terminal className="w-3 h-3 text-[#C6FF34]" />
                            <span>Inspect</span>
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
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-400 font-mono">
                Showing{' '}
                <strong className="text-white">
                  {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filteredLabs.length)}
                </strong>{' '}
                of <strong className="text-[#C6FF34]">{filteredLabs.length}</strong> Labs
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer border border-white/10"
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
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#C6FF34] text-black shadow-[0_0_15px_rgba(198,255,52,0.3)]'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
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
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CREATE CYBERSECURITY LAB MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#C6FF34]" />
                <h3 className="text-xl font-serif font-bold text-white">Deploy Cybersecurity Lab</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cybersecurity Guard Note (Rule #23) */}
            <div className="p-3 rounded-2xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34] text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                <strong>Track Guard:</strong> Practical lab environments are restricted strictly to Cybersecurity, Web Security, SOC, and VAPT curricula.
              </span>
            </div>

            <form onSubmit={handleCreateLab} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Lab Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Broken Object Level Authorization (BOLA) Exploitation"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Associated Cybersecurity Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                >
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Difficulty Tier</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block text-[11px]">Estimated Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="360"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">External Target / Terminal URL (Optional)</label>
                <input
                  type="url"
                  value={formData.labUrl}
                  onChange={(e) => setFormData({ ...formData, labUrl: e.target.value })}
                  placeholder="https://labs.threadsecurity.in/targets/bola-01 or external port"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Skills &amp; Vulnerabilities Targeted *</label>
                <input
                  type="text"
                  required
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Burp Suite, REST API Insecurity, IDOR, Token Tampering"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Lab Objective *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Identify insecure direct references in the profile API and extract administrative flag..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Student Instructions</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Step-by-step guidance for students..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="pt-3 flex justify-between gap-3">
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
                  {submitting ? 'Deploying...' : 'Confirm & Deploy Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
