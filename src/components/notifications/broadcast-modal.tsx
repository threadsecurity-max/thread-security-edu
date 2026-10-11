'use client';

import { useState, useEffect } from 'react';
import { Send, Megaphone, CheckCircle2, Eye, Radio, X } from 'lucide-react';
import { broadcastMessageAction, fetchBroadcastAnalyticsAction } from '@/features/notifications/actions/notification.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      setMsg(`Broadcast dispatched successfully to ${res.targetCount || 1} active recipient(s).`);
      setTimeout(() => {
        setMsg(null);
        setActiveTab('READ_RECEIPTS');
        loadAnalytics();
      }, 1500);
    } else {
      setMsg(res.error || 'Failed to send broadcast message.');
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
      >
        <Megaphone className="w-3.5 h-3.5" />
        <span>Broadcast</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl w-full bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    LMS System Broadcast
                  </DialogTitle>
                  <p className="text-xs text-slate-500">
                    Real-time announcements and delivery receipts
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('DISPATCH')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'DISPATCH'
                  ? 'bg-white text-violet-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Dispatch Message</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('READ_RECEIPTS')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'READ_RECEIPTS'
                  ? 'bg-white text-violet-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Receipts &amp; Analytics</span>
            </button>
          </div>

          {msg && (
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {activeTab === 'DISPATCH' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Scheduled Maintenance &amp; Lab Updates"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Broadcast Content *
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="e.g. Active Directory attack paths lab targets updated. All students obtain new flags."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Recipient Audience *
                </label>
                <select
                  name="targetType"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="ALL">All Active Users (Students and Mentors)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="MENTOR">Faculty Mentors Only</option>
                  <option value="SINGLE_STUDENT">Single Student (by TS-ID or Email)</option>
                  <option value="SINGLE_MENTOR">Single Mentor (by Email)</option>
                  <option value="SPECIFIC_BATCH">Specific Academic Batch</option>
                </select>
              </div>

              {targetType === 'SINGLE_STUDENT' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold">
                    Student Identifier (TS-ID or Email) *
                  </label>
                  <input
                    type="text"
                    name="targetStudentIdentifier"
                    placeholder="e.g. TS-C126 or student@gmail.com"
                    className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-600"
                    required
                  />
                </div>
              )}

              {targetType === 'SINGLE_MENTOR' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold">
                    Mentor Email Address *
                  </label>
                  <input
                    type="email"
                    name="targetMentorUserId"
                    placeholder="e.g. mentor@threadsecurity.in"
                    className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-600"
                    required
                  />
                </div>
              )}

              {targetType === 'SPECIFIC_BATCH' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold">
                    Batch Code / ID *
                  </label>
                  <input
                    type="text"
                    name="targetBatchId"
                    placeholder="e.g. TSE-COHORT-2026-ALPHA"
                    className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-xs placeholder:text-slate-400 uppercase focus:outline-none focus:border-violet-600"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Dispatching...' : 'Dispatch Broadcast'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'READ_RECEIPTS' && (
            <div className="space-y-4 text-xs">
              {loadingAnalytics ? (
                <div className="p-8 text-center text-slate-500">Loading delivery &amp; receipt data...</div>
              ) : !analytics ? (
                <div className="p-8 text-center text-slate-500">No broadcast analytics available.</div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Total</span>
                      <strong className="text-sm font-bold text-slate-900 mt-0.5 block">{analytics.totalDispatches || 0}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Recipients</span>
                      <strong className="text-sm font-bold text-slate-900 mt-0.5 block">{analytics.totalRecipients || 0}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Opened</span>
                      <strong className="text-sm font-bold text-violet-700 mt-0.5 block">{analytics.totalRead || 0}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Read Rate</span>
                      <strong className="text-sm font-bold text-emerald-600 mt-0.5 block">{analytics.readRate || '0%'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800 text-xs">Recent Broadcast Dispatches</h4>
                    {(!analytics.recentBroadcasts || analytics.recentBroadcasts.length === 0) ? (
                      <p className="text-slate-400 text-center py-4">No recent broadcasts recorded.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {analytics.recentBroadcasts.map((b: any) => (
                          <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900">{b.title}</strong>
                              <span className="text-[10px] text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate">{b.message}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                              <span>Target: <strong className="text-slate-700">{b.targetType}</strong></span>
                              <span>Read: <strong className="text-violet-700">{b.readCount || 0}</strong> / {b.recipientCount || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
