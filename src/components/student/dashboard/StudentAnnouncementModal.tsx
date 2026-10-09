'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Bell,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  priority: 'HIGH' | 'NORMAL';
}

export function StudentAnnouncementModal({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementItem | null>(null);
  const [ackMessage, setAckMessage] = useState('Acknowledged and confirmed receipt.');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check localStorage for previously dismissed announcements, show latest unacknowledged
  useEffect(() => {
    if (!announcements || announcements.length === 0) return;

    try {
      const acknowledgedIds = JSON.parse(localStorage.getItem('tse_acked_announcements') || '[]');
      const unacked = announcements.find((a) => !acknowledgedIds.includes(a.id));
      if (unacked) {
        setActiveAnnouncement(unacked);
      }
    } catch {
      setActiveAnnouncement(announcements[0]);
    }
  }, [announcements]);

  const handleAcknowledge = async () => {
    if (!activeAnnouncement) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/announcements/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcastId: activeAnnouncement.id,
          message: ackMessage.trim(),
        }),
      });

      // Save to localStorage so it doesn't pop up again
      try {
        const acknowledgedIds = JSON.parse(localStorage.getItem('tse_acked_announcements') || '[]');
        localStorage.setItem(
          'tse_acked_announcements',
          JSON.stringify([...acknowledgedIds, activeAnnouncement.id])
        );
      } catch (e) {
        console.error(e);
      }

      setToastMessage('Acknowledgement sent! Your mentor has been notified.');
      setTimeout(() => {
        setActiveAnnouncement(null);
        setToastMessage(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setActiveAnnouncement(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeAnnouncement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setActiveAnnouncement(null)}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-lg bg-[#0a0c10] border border-[#C6FF34]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(198,255,52,0.15)] z-10 space-y-5 text-xs font-mono text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 uppercase tracking-wider">
                FACULTY BROADCAST // ACADEMIC COHORT
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-extrabold text-white pt-1">
              {activeAnnouncement.title}
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono block">
              Dispatched: {activeAnnouncement.timeAgo}
            </span>
          </div>

          <button
            onClick={() => setActiveAnnouncement(null)}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="p-4 rounded-2xl bg-black/80 border border-white/10 text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
          {activeAnnouncement.message}
        </div>

        {/* Acknowledgement Message Input */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <label className="text-[11px] font-bold text-[#C6FF34] uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Send Acknowledgement to Faculty Mentor:
          </label>
          <textarea
            rows={2}
            value={ackMessage}
            onChange={(e) => setAckMessage(e.target.value)}
            placeholder="Type your confirmation note to faculty..."
            className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-zinc-200 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#C6FF34]"
          />
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveAnnouncement(null)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer text-center"
          >
            Review Later
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleAcknowledge}
            className="px-6 py-3 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_2px_16px_rgba(198,255,52,0.25)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <span>Notifying Mentor...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Confirm &amp; Send Acknowledgement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
