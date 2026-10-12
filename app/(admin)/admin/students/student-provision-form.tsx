'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { createStudentAction, getSuggestedTSIDAction } from '@/features/admin/actions/admin.actions';
import { StudentTrack } from '@/lib/auth/ts-id';

interface StudentProvisionFormProps {
  initialSuggestedId: string;
}

export function StudentProvisionForm({ initialSuggestedId }: StudentProvisionFormProps) {
  const [track, setTrack] = useState<StudentTrack>('CYBER');
  const [appointedId, setAppointedId] = useState(initialSuggestedId);
  const [isFetchingId, setIsFetchingId] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTrackChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTrack = e.target.value as StudentTrack;
    setTrack(newTrack);
    setIsFetchingId(true);
    try {
      const res = await getSuggestedTSIDAction(newTrack);
      if (res.success && res.tsId) {
        setAppointedId(res.tsId);
      }
    } finally {
      setIsFetchingId(false);
    }
  };

  const handleRefreshId = async () => {
    setIsFetchingId(true);
    try {
      const res = await getSuggestedTSIDAction(track);
      if (res.success && res.tsId) {
        setAppointedId(res.tsId);
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
    formData.set('customTsId', appointedId);

    startTransition(async () => {
      const res = await createStudentAction(formData);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Student account created successfully with ID: ${res.tsId}`,
        });
        form.reset();
        // Refresh next ID
        const next = await getSuggestedTSIDAction(track);
        if (next.success && next.tsId) {
          setAppointedId(next.tsId);
        }
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to provision student.',
        });
      }
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Provision Student Account &amp; Appointed TS-ID
            </h3>
            <p className="text-[11px] text-slate-500">
              System auto-suggests the next unused sequential ID (+1) while allowing custom admin appointment.
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
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. student@threadsecurity.in"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Track Specialization *
            </label>
            <select
              name="track"
              value={track}
              onChange={handleTrackChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 focus:bg-white font-medium transition-colors"
            >
              <option value="CYBER">Cybersecurity Track (TS-C)</option>
              <option value="AI">AI &amp; ML Track (TS-A)</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-medium text-slate-600">
                Appointed TS-ID *
              </label>
              <button
                type="button"
                onClick={handleRefreshId}
                disabled={isFetchingId}
                className="text-[10px] text-violet-600 hover:text-violet-700 flex items-center gap-1 font-semibold cursor-pointer"
                title="Calculate next unused +1 ID"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isFetchingId ? 'animate-spin' : ''}`} />
                <span>Next +1</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                name="customTsId"
                value={appointedId}
                onChange={(e) => setAppointedId(e.target.value.toUpperCase())}
                placeholder="e.g. TS-C147"
                className="w-full bg-violet-50/60 border border-violet-200 text-violet-900 font-mono font-semibold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
                required
              />
              <Sparkles className="w-3.5 h-3.5 text-violet-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              name="phone"
              placeholder="+91 98765-43210"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Initial Password / Passkey
            </label>
            <input
              type="text"
              name="tempPassword"
              placeholder="Auto-generated if empty"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              name="dispatchEmail"
              defaultChecked
              value="true"
              className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
            />
            <span className="font-medium">
              Automatically dispatch welcome email with login credentials &amp; TS-ID to student inbox
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>Provision Student Account</span>
          </button>
        </div>
      </form>
    </div>
  );
}
