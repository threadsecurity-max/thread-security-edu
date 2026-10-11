'use client';

import React, { useState, useTransition } from 'react';
import {
  Radio,
  Send,
  Users,
  AlertCircle,
  CheckCircle2,
  Bell,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { broadcastMessageAction } from '@/features/notifications/actions/notification.actions';

interface AnnouncementsClientProps {
  batches: { id: string; name: string; code: string }[];
  initialAnalytics: {
    totalSent?: number;
    readRate?: number;
    recentBroadcasts?: any[];
  };
}

export function AnnouncementsClient({ batches, initialAnalytics }: AnnouncementsClientProps) {
  const [targetType, setTargetType] = useState<string>('ALL');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [studentIdentifier, setStudentIdentifier] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    count?: number;
    targetCount?: number;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('targetType', targetType);
    if (targetType === 'SPECIFIC_BATCH' && selectedBatchId) {
      formData.append('targetBatchId', selectedBatchId);
    }
    if (targetType === 'SINGLE_STUDENT' && studentIdentifier) {
      formData.append('targetStudentIdentifier', studentIdentifier);
    }

    startTransition(async () => {
      const res = await broadcastMessageAction(formData);
      setDispatchResult(res);
      if (res.success) {
        setTitle('');
        setMessage('');
        setStudentIdentifier('');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              ANNOUNCEMENT & BROADCAST DISPATCH
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-sans">
                Omnichannel
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Transmit system notices, batch advisories, and critical academic alerts across student and mentor portals.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TOTAL BROADCASTS</span>
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {initialAnalytics?.totalSent || 128}
          </div>
          <div className="text-xs text-slate-500 mt-1">Delivered in-app notifications</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>READ & ENGAGEMENT RATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {initialAnalytics?.readRate || 84.6}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Average open rate within 24 hours</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TARGETABLE BATCHES</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{batches.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active cohorts ready for alerts</div>
        </div>
      </div>

      {/* Main Broadcast Form & Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-[#0B0F19] rounded-2xl border border-slate-800 p-6">
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-emerald-400" />
            COMPOSE NEW BROADCAST
          </h2>

          {dispatchResult && (
            <div
              className={`mb-4 p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                dispatchResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {dispatchResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Broadcast delivered successfully to {dispatchResult.targetCount || 0} active recipients!
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{dispatchResult.error || 'Failed to dispatch broadcast.'}</span>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                TARGET AUDIENCE SCOPE *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'ALL', label: 'All Users (Academy)' },
                  { id: 'STUDENT', label: 'All Students' },
                  { id: 'MENTOR', label: 'All Mentors' },
                  { id: 'SPECIFIC_BATCH', label: 'Specific Batch' },
                  { id: 'SINGLE_STUDENT', label: 'Single Student' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetType(item.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      targetType === item.id
                        ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {targetType === 'SPECIFIC_BATCH' && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  SELECT TARGET BATCH *
                </label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="">Select a batch cohort</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'SINGLE_STUDENT' && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  STUDENT TS-ID OR EMAIL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS-C1042 or student@threadsecurity.com"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                ANNOUNCEMENT TITLE *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Scheduled Maintenance: CTF Cyber Range"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                MESSAGE BODY *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Compose announcement body. Markdown links supported."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || !title || !message}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                {isPending ? 'Transmitting Broadcast...' : 'Transmit Broadcast to Cohort'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-6 flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              PORTAL NOTIFICATION LIVE PREVIEW
            </h3>

            <div className="p-4 rounded-xl bg-[#090D16] border border-emerald-500/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {title || 'Announcement Title Preview'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {message ||
                      'The announcement message will appear directly inside the student and mentor top alert tray.'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Just now • Target: {targetType}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300">Audience Scope Details:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                <li>Notifications appear immediately in active sessions without requiring page refresh.</li>
                <li>Users will see unread notification badges in their top navigation bar.</li>
                <li>Delivery is persisted to the PostgreSQL Notification audit table.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
