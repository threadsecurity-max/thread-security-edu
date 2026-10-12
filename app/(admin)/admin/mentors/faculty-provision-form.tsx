'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Sparkles, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { createMentorAction, getSuggestedMentorIDAction } from '@/features/admin/actions/admin.actions';

interface FacultyProvisionFormProps {
  initialSuggestedId: string;
  allBatches?: { id: string; batchCode: string; title: string }[];
  allCourses?: { id: string; title: string }[];
}

export function FacultyProvisionForm({
  initialSuggestedId,
  allBatches = [],
  allCourses = [],
}: FacultyProvisionFormProps) {
  const [appointedId, setAppointedId] = useState(initialSuggestedId);
  const [isFetchingId, setIsFetchingId] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRefreshId = async () => {
    setIsFetchingId(true);
    try {
      const res = await getSuggestedMentorIDAction();
      if (res.success && res.mentorId) {
        setAppointedId(res.mentorId);
      }
    } finally {
      setIsFetchingId(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('customMentorId', appointedId);

    startTransition(async () => {
      const res = await createMentorAction(formData);
      if (res.success) {
        const isDispatched = (res as any).emailDispatched;
        setFeedback({
          type: 'success',
          message: isDispatched
            ? `Faculty account provisioned & credentials dispatched to inbox! ID: ${appointedId}`
            : `Faculty account provisioned successfully! ID: ${appointedId}`,
        });
        form.reset();
        // Refresh next sequential mentor ID
        const next = await getSuggestedMentorIDAction();
        if (next.success && next.mentorId) {
          setAppointedId(next.mentorId);
        }
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to provision faculty mentor.',
        });
      }
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold shrink-0 border border-violet-100">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              Provision Faculty &amp; Staff Account
            </h3>
            <p className="text-[11px] text-slate-500">
              Appoint faculty TS-ID, map cohort batch, and dispatch portal login credentials directly to instructor inbox.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top 6-column / responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700 block">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Dr. Sarah Chen"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-xs"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700 block">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. faculty@threadsecurity.in"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-xs"
            />
          </div>

          {/* Faculty Track / Specialization */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700 block">
              Role &amp; Specialization *
            </label>
            <select
              name="title"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-xs"
            >
              <option value="Lead Security Instructor">Offensive Security Lead</option>
              <option value="VAPT & Penetration Testing Specialist">VAPT &amp; Pen-Testing</option>
              <option value="SOC & Incident Response Faculty">SOC &amp; IR Specialist</option>
              <option value="Cloud Security Architect">Cloud Security Mentor</option>
              <option value="Academic Staff & Teaching Assistant">Teaching Staff / TA</option>
            </select>
          </div>

          {/* Appointed Faculty ID */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-700">
                Appointed TS-ID *
              </label>
              <button
                type="button"
                onClick={handleRefreshId}
                disabled={isFetchingId}
                className="text-[10px] text-violet-600 hover:text-violet-800 flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isFetchingId ? 'animate-spin' : ''}`} />
                <span>Next +1</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={appointedId}
                onChange={(e) => setAppointedId(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2 rounded-xl border border-violet-200 bg-violet-50/40 text-violet-700 font-mono font-bold focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-xs"
              />
              <Sparkles className="w-3.5 h-3.5 text-violet-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Assign Batch */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700 block">
              Assign Batch
            </label>
            <select
              name="batchId"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-xs"
            >
              <option value="">No Batch (Assign Later)</option>
              {allBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchCode} - {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Password / Passkey */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700 block">
              Initial Passkey
            </label>
            <input
              type="text"
              name="passkey"
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all text-xs font-mono"
            />
          </div>
        </div>

        {/* Hidden Defaults */}
        <input type="hidden" name="company" value="Thread Security Education" />
        <input type="hidden" name="expertise" value="Offensive Security, VAPT, Web Exploitation, SOC" />
        <input type="hidden" name="bio" value="Accredited instructor in offensive security and advanced cyber defense." />

        {/* Bottom Bar: Checkbox + Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="dispatchEmail"
              value="true"
              defaultChecked
              className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer accent-violet-600"
            />
            <span className="text-slate-600 text-xs font-medium">
              Automatically dispatch welcome email with login credentials &amp; passkey to faculty inbox
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Provisioning Faculty...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Provision Faculty Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
