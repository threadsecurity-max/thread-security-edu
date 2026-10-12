'use client';

import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  FileText,
  Calendar,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';

export interface BroadcastItem {
  id: string;
  batchId: string;
  title: string;
  message: string;
  attachmentUrl: string | null;
  recipientsCount: number;
  deliveryStatus: string;
  createdAt: string | Date;
  batch: {
    id: string;
    batchCode: string;
    title: string;
  };
  recipients?: Array<{ id: string; isRead: boolean }>;
}

export interface BatchItem {
  id: string;
  batchCode: string;
  title: string;
}

export function MentorAnnouncementsClient({
  initialBroadcasts,
  batches,
  showCreateInitial = false,
}: {
  initialBroadcasts: BroadcastItem[];
  batches: BatchItem[];
  showCreateInitial?: boolean;
}) {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>(initialBroadcasts);
  const [createModalOpen, setCreateModalOpen] = useState(showCreateInitial);
  const [createStep, setCreateStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    batchId: batches[0]?.id || '',
    title: '',
    message: '',
    attachmentUrl: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || !formData.title || !formData.message) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentor/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch broadcast.');
      }

      showToast(`Announcement dispatched to ${data.broadcast?.batch?.batchCode || 'batch'}!`, 'success');
      setCreateModalOpen(false);
      setCreateStep(1);
      setFormData({
        batchId: batches[0]?.id || '',
        title: '',
        message: '',
        attachmentUrl: '',
      });

      // Refresh broadcasts
      const refreshed = await fetch('/api/mentor/announcements');
      const refreshedData = await refreshed.json();
      if (refreshedData.broadcasts) {
        setBroadcasts(refreshedData.broadcasts);
      }
    } catch (err: any) {
      showToast(err.message || 'Error sending announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch =
      selectedBatchFilter === 'ALL' || b.batchId === selectedBatchFilter;

    return matchesSearch && matchesBatch;
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
              Class Broadcasts
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Student Communication Feed
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Cohort Announcements &amp; Updates
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Post timetable updates, assignment advisories, curriculum notices, and lab announcements directly to your students&apos; dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & BATCH FILTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements by title or topic..."
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

      {/* ── BROADCASTS TIMELINE ── */}
      {filteredBroadcasts.length === 0 ? (
        <div className="p-16 text-center rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No announcements posted yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Post your first announcement or notice to communicate with your enrolled cohort students.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBroadcasts.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl md:rounded-3xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs hover:shadow-md space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                    {b.batch.batchCode}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{b.batch.title}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recipients: <strong className="text-slate-900">{b.recipientsCount}</strong></span>
                  </span>
                  <span>
                    {new Date(b.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {b.deliveryStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {b.message}
                </p>
              </div>

              {b.attachmentUrl && (
                <div className="pt-2">
                  <a
                    href={b.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 text-xs font-semibold border border-violet-200 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached Document ↗</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── BROADCAST MODAL (PAGINATED MULTI-STEP WIZARD) ── */}
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
            {/* Header with Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Post Announcement</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-violet-700">
                      Step {createStep} of 2:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {createStep === 1 && 'Cohort Audience & Headline'}
                      {createStep === 2 && 'Broadcast Message & Link'}
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

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              {/* ── STEP 1: AUDIENCE & HEADLINE (2 fields) ── */}
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
                    <label className="text-slate-700 font-medium block text-xs">2. Subject / Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Schedule Revision: Tomorrow's Lab Starts at 3:00 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-violet-50/60 border border-violet-100 rounded-xl text-slate-600 space-y-1">
                    <p className="font-semibold text-violet-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Instant Notification Alert
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      All enrolled students in this cohort will receive an instant dashboard alert and push notification with this announcement.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateModalOpen(false);
                        setCreateStep(1);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.batchId || !formData.title.trim()) {
                          showToast('Please select a batch and enter a title.', 'error');
                          return;
                        }
                        setCreateStep(2);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1"
                    >
                      Next Step &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: MESSAGE & ATTACHMENT (2 fields) ── */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">3. Announcement Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Dear Students, please note that the upcoming session will cover..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium block text-xs">4. Resource / Reference Link (Optional)</label>
                    <input
                      type="url"
                      value={formData.attachmentUrl}
                      onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                      placeholder="https://drive.google.com/... or slides link"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs"
                    />
                  </div>

                  {/* Summary preview */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Broadcast Summary</p>
                    <p className="text-xs text-slate-900 font-medium line-clamp-1">{formData.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Cohort: <span className="font-semibold text-slate-700">{batches.find(b => b.id === formData.batchId)?.batchCode}</span>
                    </p>
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
                      disabled={submitting || !formData.message.trim()}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs disabled:opacity-50 cursor-pointer shadow-xs transition-all flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Dispatching...' : 'Dispatch Announcement'}</span>
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
