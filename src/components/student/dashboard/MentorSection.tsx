'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import {
  User,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
} from 'lucide-react';

export interface MentorSectionProps {
  mentor: {
    name: string;
    title: string;
    company: string;
    expertise: string;
    officeHours: string | null;
    email: string;
  } | null;
}

export function MentorSection({ mentor }: MentorSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!mentor) {
    return (
      <GlassCard level={1} className="p-5 text-center space-y-2">
        <User className="w-6 h-6 text-zinc-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">Faculty Mentor</h4>
        <p className="text-xs text-zinc-400">Mentor allocation in progress for your cohort.</p>
      </GlassCard>
    );
  }

  const initial = mentor.name ? mentor.name[0].toUpperCase() : 'M';

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/student/mentor-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorEmail: mentor.email,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ text: 'Query dispatched directly to faculty mentor!', type: 'success' });
        setMessage('');
        setSubject('');
        setModalOpen(false);
      } else {
        setToastMessage({ text: data.error || 'Failed to dispatch query.', type: 'error' });
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || 'Error sending query.', type: 'error' });
    } finally {
      setSending(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <>
      <GlassCard level={1} className="p-5 space-y-4">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border font-mono ${
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

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
            YOUR FACULTY MENTOR
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C6FF34]/10 text-[#C6FF34]">
            Live Faculty
          </span>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white font-mono font-bold text-base shrink-0">
            {initial}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <h4 className="text-sm font-serif font-bold text-white tracking-tight truncate">
              {mentor.name}
            </h4>
            <p className="text-xs text-zinc-400 truncate">
              {mentor.title} • {mentor.company}
            </p>
            <p className="text-[11px] font-mono text-[#C6FF34] truncate mt-1">
              Expertise: {mentor.expertise}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{mentor.officeHours || 'Cohort Sessions'}</span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black text-xs font-mono font-bold transition-all shadow-[0_2px_10px_rgba(198,255,52,0.2)] cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Mentor</span>
          </button>
        </div>
      </GlassCard>

      {/* In-App Mentor Query Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0c0e] border border-white/10 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C6FF34]" />
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">
                    Ask Faculty Mentor: {mentor.name}
                  </h3>
                  <span className="text-[10px] text-zinc-400">{mentor.email}</span>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuery} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Subject / Topic:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lab Payload Query / Session Clarification"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/70 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Your Question or Doubt:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question, hurdle, or doubt in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/70 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C6FF34]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${mentor.email}`}
                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>Send via email client instead</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-zinc-300 text-xs cursor-pointer hover:bg-white/[0.08]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-4 py-1.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Sending...' : 'Send to Faculty'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
