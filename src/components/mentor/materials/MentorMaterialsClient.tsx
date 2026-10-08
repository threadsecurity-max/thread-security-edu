'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ExternalLink,
  BookOpen,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Search,
  Filter,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

export interface ResourceItem {
  id: string;
  batchId: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  createdAt: string | Date;
  batch: {
    id: string;
    batchCode: string;
    title: string;
  };
}

export interface BatchItem {
  id: string;
  batchCode: string;
  title: string;
}

export function MentorMaterialsClient({
  initialResources,
  batches,
  showCreateInitial = false,
}: {
  initialResources: ResourceItem[];
  batches: BatchItem[];
  showCreateInitial?: boolean;
}) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [createModalOpen, setCreateModalOpen] = useState(showCreateInitial);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    batchId: batches[0]?.id || '',
    title: '',
    description: '',
    resourceType: 'PDF',
    url: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || !formData.title || !formData.url) {
      showToast('Please provide batch, title, and valid resource URL.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentor/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish study material.');
      }

      showToast(`Material "${data.resource.title}" attached to cohort!`, 'success');
      setCreateModalOpen(false);
      setFormData({
        batchId: batches[0]?.id || '',
        title: '',
        description: '',
        resourceType: 'PDF',
        url: '',
      });

      // Refresh list
      const refreshed = await fetch('/api/mentor/materials');
      const refreshedData = await refreshed.json();
      if (refreshedData.resources) {
        setResources(refreshedData.resources);
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating resource', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch =
      selectedBatchFilter === 'ALL' || r.batchId === selectedBatchFilter;

    return matchesSearch && matchesBatch;
  });

  const getResourceTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CODE':
      case 'SCRIPT':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'SPREADSHEET':
        return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      case 'CHEATSHEET':
      case 'SLIDES':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      default:
        return <FileText className="w-4 h-4 text-[#C6FF34]" />;
    }
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
              ACADEMIC REPOSITORY
            </span>
            <span className="text-xs text-zinc-400">
              SECURE MATERIAL DISTRIBUTION
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Study Materials &amp; Syllabi
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Distribute cybersecurity cheat-sheets, exploit walkthrough slides, reading modules, and PDF handbooks directly to your authorized cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Publish Material</span>
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
            placeholder="Search documents, cheatsheets, or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF34]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C6FF34]"
          >
            <option value="ALL">All Authorized Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode} — {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── RESOURCES GRID ── */}
      {filteredResources.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-serif font-bold text-white">No materials uploaded yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Upload PDFs, cheatsheets, lecture slides, or tool references to empower student learning.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-3xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                    {res.batch.batchCode}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    {getResourceTypeIcon(res.resourceType)}
                    <span className="uppercase text-[10px]">{res.resourceType}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors">
                    {res.title}
                  </h3>
                  <span className="text-[11px] text-zinc-500 block pt-0.5">
                    Published: {new Date(res.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {res.description && (
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 truncate max-w-[150px]">
                  {res.batch.title}
                </span>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#C6FF34] hover:text-black text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/[0.1]"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE RESOURCE MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C6FF34]" />
                <h3 className="text-xl font-serif font-bold text-white">Publish Study Material</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Target Cohort Batch *</label>
                <select
                  required
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Material Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Linux Privilege Escalation Cheatsheet & SUID Commands"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Resource Classification</label>
                <select
                  value={formData.resourceType}
                  onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                >
                  <option value="PDF">PDF Handbook / Documentation</option>
                  <option value="CHEATSHEET">Cybersecurity Cheatsheet</option>
                  <option value="SLIDES">Session Presentation Slides</option>
                  <option value="CODE">Script / Exploit PoC Archive</option>
                  <option value="NOTES">Instructor Notes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Resource URL / Document Link *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://drive.google.com/... or direct document URL"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Description / Read Instructions</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Important references for the upcoming practical assessment..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
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
                  {submitting ? 'Publishing...' : 'Publish to Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
