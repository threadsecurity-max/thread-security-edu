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
  Edit3,
  Trash2,
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
  const [createStep, setCreateStep] = useState(1);
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
      setCreateStep(1);
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

  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    batchId: '',
    title: '',
    description: '',
    resourceType: 'PDF',
    url: '',
  });

  const handleStartEdit = (res: ResourceItem) => {
    setEditingResource(res);
    setEditFormData({
      batchId: res.batchId,
      title: res.title,
      description: res.description || '',
      resourceType: res.resourceType,
      url: res.url,
    });
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    if (!editFormData.title || !editFormData.url) {
      showToast('Title and URL are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentor/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResource.id,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update study material.');
      }

      showToast(`Material "${data.resource.title}" updated successfully!`, 'success');
      setEditingResource(null);

      // Refresh list
      const refreshed = await fetch('/api/mentor/materials');
      const refreshedData = await refreshed.json();
      if (refreshedData.resources) {
        setResources(refreshedData.resources);
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating resource', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/mentor/materials?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete resource.');
      }

      showToast(`Material "${title}" removed.`, 'success');
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Error deleting material', 'error');
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
        return <FileCode className="w-4 h-4 text-emerald-600" />;
      case 'SPREADSHEET':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      case 'CHEATSHEET':
      case 'SLIDES':
        return <BookOpen className="w-4 h-4 text-violet-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
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
              Course Library
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Study Guides &amp; Handouts
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Study Materials &amp; Resources
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Distribute cheat-sheets, lecture slides, reading modules, reference links, and PDF handbooks directly to your authorized cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Material</span>
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
            placeholder="Search documents, cheatsheets, or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xs cursor-pointer font-medium"
          >
            <option value="ALL">All Cohort Batches</option>
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
        <div className="p-16 text-center rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No materials uploaded yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload PDFs, cheatsheets, lecture slides, or tool references to share with your students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-2xl md:rounded-3xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                    {res.batch.batchCode}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    {getResourceTypeIcon(res.resourceType)}
                    <span className="uppercase text-[11px]">{res.resourceType}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                    {res.title}
                  </h3>
                  <span className="text-xs text-slate-400 block pt-0.5 font-medium">
                    Published: {new Date(res.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {res.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 truncate max-w-[130px] font-medium">
                  {res.batch.title}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(res)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Edit Material"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteResource(res.id, res.title)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Delete Material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 border border-violet-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <span>Open ↗</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE RESOURCE MODAL (PAGINATED MULTI-STEP WIZARD) ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => {
              setCreateModalOpen(false);
              setCreateStep(1);
            }}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs text-slate-900">
            {/* Modal Header & Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Upload Study Material</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-violet-700">
                      Step {createStep} of 2:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {createStep === 1 && 'Document Info & Classification'}
                      {createStep === 2 && 'Link & Context Notes'}
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
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    step <= createStep ? 'bg-violet-600' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">
              {/* ── STEP 1: DOCUMENT INFO (3 Fields) ── */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Target Cohort Batch *</label>
                    <select
                      required
                      value={formData.batchId}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchCode} — {b.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Material Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Linux Privilege Escalation Cheatsheet & SUID Commands"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Resource Classification</label>
                    <select
                      value={formData.resourceType}
                      onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    >
                      <option value="PDF">PDF Handbook / Documentation</option>
                      <option value="CHEATSHEET">Cybersecurity Cheatsheet</option>
                      <option value="SLIDES">Session Presentation Slides</option>
                      <option value="CODE">Script / Exploit PoC Archive</option>
                      <option value="NOTES">Instructor Notes</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.batchId || !formData.title}
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next: Resource Access</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: LINK & CONTEXT (2 Fields + Summary) ── */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">1. Resource URL / Direct Document Link *</label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://drive.google.com/... or direct document link"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">2. Description &amp; Context Notes</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Key notes, prerequisite reading, or instructions for students..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cohort:</span>
                      <strong className="text-slate-900">
                        {batches.find((b) => b.id === formData.batchId)?.batchCode}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document:</span>
                      <strong className="text-slate-900 truncate max-w-[240px]">{formData.title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type:</span>
                      <strong className="text-violet-700 font-semibold">{formData.resourceType}</strong>
                    </div>
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
                      type="submit"
                      disabled={submitting || !formData.url}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs disabled:opacity-50 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                    >
                      {submitting ? 'Uploading...' : 'Confirm & Publish Material'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT RESOURCE MODAL ── */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setEditingResource(null)}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Edit Study Material</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateResource} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium block text-xs">Target Cohort Batch</label>
                <select
                  value={editFormData.batchId}
                  onChange={(e) => setEditFormData({ ...editFormData, batchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium block text-xs">Material Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium block text-xs">Resource Classification</label>
                <select
                  value={editFormData.resourceType}
                  onChange={(e) => setEditFormData({ ...editFormData, resourceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                >
                  <option value="PDF">PDF Document / Cheatsheet</option>
                  <option value="SLIDES">Lecture Presentation Slides</option>
                  <option value="CODE">Script / Source Code Repo</option>
                  <option value="CHEATSHEET">Tactical Exploit Cheatsheet</option>
                  <option value="SPREADSHEET">Matrix / Vulnerability Checklist</option>
                  <option value="LINK">External Documentation Link</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium block text-xs">Resource Link *</label>
                <input
                  type="url"
                  required
                  value={editFormData.url}
                  onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium block text-xs">Material Brief / Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
