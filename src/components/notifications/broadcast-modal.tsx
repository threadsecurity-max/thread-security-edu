'use client';

import { useState, useEffect } from 'react';
import { Send, Megaphone, CheckCircle2, AlertCircle, Eye, BarChart2, Users, User, Shield, Layers, Clock } from 'lucide-react';
import { broadcastMessageAction, fetchBroadcastAnalyticsAction } from '@/features/notifications/actions/notification.actions';

export function BroadcastMessageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'READ_RECEIPTS'>('DISPATCH');
  const [targetType, setTargetType] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'READ_RECEIPTS') {
      loadAnalytics();
    }
  }, [isOpen, activeTab]);

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    const res = await fetchBroadcastAnalyticsAction();
    if (res.success && res.analytics) {
      setAnalytics(res.analytics);
    }
    setLoadingAnalytics(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await broadcastMessageAction(formData);
    setLoading(false);

    if (res.success) {
      setMsg(`✓ LMS System Broadcast successfully dispatched to ${res.targetCount || 1} active user(s)!`);
      setTimeout(() => {
        setMsg(null);
        setActiveTab('READ_RECEIPTS');
        loadAnalytics();
      }, 1800);
    } else {
      setMsg(res.error || 'Failed to send broadcast message.');
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_25px_rgba(220,38,38,0.6)] border border-white/20 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md"
      >
        <Megaphone className="w-3.5 h-3.5 text-white animate-pulse" />
        <span>Broadcasting LMS</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-[#120509]/95 border border-red-500/30 text-white rounded-3xl max-w-2xl w-full p-7 md:p-8 space-y-6 shadow-[0_25px_60px_rgba(220,38,38,0.3)] relative overflow-hidden font-sans">
        
        {/* Ambient Red Glass Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">LMS System Broadcasting & Analytics</h3>
              <p className="text-[11px] text-red-300/80 font-mono">Real-time Notification & Read Receipts Console</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-red-950/40 border border-red-500/20 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'DISPATCH'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Dispatch Broadcast</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('READ_RECEIPTS')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'READ_RECEIPTS'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Read Receipts & Analytics</span>
          </button>
        </div>

        {msg && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 font-mono shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* TAB 1: DISPATCH ANNOUNCEMENT */}
        {activeTab === 'DISPATCH' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold font-mono text-[11px] uppercase tracking-wider">
                ANNOUNCEMENT TITLE *
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Scheduled Maintenance & New Red Team Target Released"
                className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold font-mono text-[11px] uppercase tracking-wider">
                BROADCAST CONTENT *
              </label>
              <textarea
                name="message"
                rows={3}
                placeholder="e.g. Active Directory attack paths lab targets updated. All students obtain new flags."
                className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold font-mono text-[11px] uppercase tracking-wider">
                TARGET RECIPIENT AUDIENCE *
              </label>
              <select
                name="targetType"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full bg-[#1e0810] border border-red-500/30 text-white rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-red-500"
              >
                <option value="ALL">🌐 All Active LMS Users (Students + Mentors)</option>
                <option value="STUDENT">👨‍🎓 Students Only</option>
                <option value="MENTOR">👨‍🏫 Faculty Mentors Only</option>
                <option value="SINGLE_STUDENT">🎯 Single Student (Targeted by TS-ID / Email)</option>
                <option value="SINGLE_MENTOR">🛡️ Single Mentor (Targeted by Email)</option>
                <option value="SPECIFIC_BATCH">📚 Specific Academic Batch / Cohort</option>
              </select>
            </div>

            {targetType === 'SINGLE_STUDENT' && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-1.5">
                <label className="block text-slate-200 font-bold font-mono text-[11px]">
                  STUDENT IDENTIFIER (TS-ID or Email) *
                </label>
                <input
                  type="text"
                  name="targetStudentIdentifier"
                  placeholder="e.g. TS-C126 or student@gmail.com"
                  className="w-full bg-black/50 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs font-mono placeholder:text-slate-500"
                  required
                />
              </div>
            )}

            {targetType === 'SINGLE_MENTOR' && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-1.5">
                <label className="block text-slate-200 font-bold font-mono text-[11px]">
                  MENTOR EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  name="targetMentorUserId"
                  placeholder="e.g. threadsecuritymentor@gmail.com"
                  className="w-full bg-black/50 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs font-mono placeholder:text-slate-500"
                  required
                />
              </div>
            )}

            {targetType === 'SPECIFIC_BATCH' && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-1.5">
                <label className="block text-slate-200 font-bold font-mono text-[11px]">
                  BATCH CODE / ID *
                </label>
                <input
                  type="text"
                  name="targetBatchId"
                  placeholder="e.g. TSE-COHORT-2026-ALPHA"
                  className="w-full bg-black/50 border border-red-500/30 text-white px-3 py-2 rounded-xl text-xs font-mono placeholder:text-slate-500 uppercase"
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-white/20 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Dispatching...' : 'DISPATCH BROADCAST'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: READ RECEIPTS & ANALYTICS */}
        {activeTab === 'READ_RECEIPTS' && (
          <div className="space-y-4 text-xs font-mono relative z-10">
            {loadingAnalytics ? (
              <div className="p-8 text-center text-slate-400">Loading delivery & read receipt data...</div>
            ) : !analytics ? (
              <div className="p-8 text-center text-slate-500">No broadcast analytics available.</div>
            ) : (
              <>
                {/* Stats Summary Matrix */}
                <div className="grid grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/20">
                    <span className="text-[10px] text-slate-400 block uppercase">Delivered</span>
                    <span className="text-base font-bold text-white block mt-0.5">{analytics.totalDelivered}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">Read</span>
                    <span className="text-base font-bold text-emerald-300 block mt-0.5">{analytics.readCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 block uppercase font-bold">Unread</span>
                    <span className="text-base font-bold text-amber-300 block mt-0.5">{analytics.unreadCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 block uppercase font-bold">Read Rate</span>
                    <span className="text-base font-bold text-rose-300 block mt-0.5">{analytics.readRatePercent}%</span>
                  </div>
                </div>

                {/* Recipient Read Ledger */}
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-red-500/20 bg-black/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-red-500/20 text-slate-400 uppercase text-[10px]">
                        <th className="p-2.5">Recipient</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Read Status</th>
                        <th className="p-2.5 text-right">Dispatched</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-500/10 text-[11px]">
                      {analytics.records.map((r: any) => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-2.5">
                            <span className="font-bold text-white block">{r.recipientName}</span>
                            <span className="text-[10px] text-slate-400 block">{r.tsId} • {r.recipientEmail}</span>
                          </td>
                          <td className="p-2.5 text-red-300 font-bold">{r.recipientRole}</td>
                          <td className="p-2.5 text-slate-200 max-w-[140px] truncate">{r.title}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                r.isRead
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {r.isRead ? '✓ READ' : 'UNREAD'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right text-slate-400 whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={loadAnalytics}
                    className="text-xs text-red-400 hover:text-red-300 underline font-mono cursor-pointer"
                  >
                    Refresh Read Receipts
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 rounded-full bg-white/10 text-white font-mono text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
