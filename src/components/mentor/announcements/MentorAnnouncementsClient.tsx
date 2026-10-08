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
              BATCH BROADCAST DISPATCHER
            </span>
            <span className="text-xs text-zinc-400">
              ISOLATED COHORT MESSAGING
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Batch Announcements &amp; Alerts
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Broadcast emergency schedule changes, assignment advisories, and lab deployment updates exclusively to your authorized cohort workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Broadcast Announcement</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & BATCH FILTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search broadcasts or topics..."
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

      {/* ── BROADCASTS TIMELINE ── */}
      {filteredBroadcasts.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
          <Radio className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-serif font-bold text-white">No announcements dispatched yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Transmit your first batch-scoped notification, lab announcement, or syllabus reminder to students.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBroadcasts.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-white/[0.025] hover:bg-white/[0.035] border border-white/[0.08] backdrop-blur-xl space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                    {b.batch.batchCode}
                  </span>
                  <span className="text-xs text-zinc-400 font-sans">{b.batch.title}</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Recipients: <strong className="text-white">{b.recipientsCount}</strong></span>
                  </span>
                  <span>
                    {new Date(b.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {b.deliveryStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
                  {b.message}
                </p>
              </div>

              {b.attachmentUrl && (
                <div className="pt-2">
                  <a
                    href={b.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#C6FF34] hover:text-black text-white text-xs border border-white/[0.1] transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C6FF34]" />
                    <span>Attached Resource</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── BROADCAST MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C6FF34]" />
                <h3 className="text-xl font-serif font-bold text-white">Broadcast Announcement</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
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
                <label className="text-zinc-400 block text-[11px]">Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule Revision: Tomorrow's VAPT Lab Starts at 3:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Broadcast Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Dear Students, please note that the upcoming hands-on session..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-white focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block text-[11px]">Optional Attachment URL</label>
                <input
                  type="url"
                  value={formData.attachmentUrl}
                  onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                  placeholder="https://... link to document or reference sheet"
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
                  className="px-6 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs disabled:opacity-50 cursor-pointer shadow-lg flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{submitting ? 'Dispatching...' : 'Dispatch to Cohort'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
