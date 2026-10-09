'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
  Layers,
  Send,
} from 'lucide-react';
import { adminReviewCorrectionRequestAction } from '@/features/mentor/actions/mentor-workspace.actions';

export interface CorrectionRequestItem {
  id: string;
  batchId: string;
  sessionId: string;
  studentId: string;
  requestedStatus: string;
  reason: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string | Date;
  batch?: {
    batchCode: string;
    title: string;
  } | null;
  session?: {
    title: string;
    sessionNumber: number;
    sessionDate: string | Date;
  } | null;
  student?: {
    user?: {
      name: string;
      email: string;
      tsIdentity?: { tsId: string } | null;
    } | null;
  } | null;
  mentor?: {
    user?: {
      name: string;
      email: string;
    } | null;
  } | null;
}

export function AdminAttendanceCorrectionQueue({
  initialRequests,
}: {
  initialRequests: CorrectionRequestItem[];
}) {
  const [requests, setRequests] = useState<CorrectionRequestItem[]>(initialRequests);
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDecision = async (
    requestId: string,
    decision: 'APPROVED' | 'REJECTED',
    batchId?: string
  ) => {
    setProcessingId(requestId);
    const notes = adminNotesMap[requestId] || (decision === 'APPROVED' ? 'Approved upon verification.' : 'Rejected per policy.');

    try {
      const res = await adminReviewCorrectionRequestAction(requestId, decision, notes, batchId);
      if (res.success) {
        showToast(`Correction request ${decision.toLowerCase()} successfully.`, 'success');
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        showToast(res.error || 'Failed to review request.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing request.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-amber-500/[0.03] border border-amber-500/20 backdrop-blur-xl space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2 border font-mono ${
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

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              Pending Attendance Correction Approvals
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px]">
                {requests.length} Awaiting Review
              </Badge>
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Faculty requested retroactive modifications to 24-hour locked attendance records.
            </p>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="space-y-4 font-mono">
        {requests.map((req) => {
          const studentName = req.student?.user?.name || 'Student';
          const studentTsId = req.student?.user?.tsIdentity?.tsId || 'TSE-STUDENT';
          const mentorName = req.mentor?.user?.name || 'Faculty Mentor';
          const sessionTitle = req.session?.title || `Session #${req.session?.sessionNumber || 'X'}`;
          const batchCode = req.batch?.batchCode || 'COHORT';

          return (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
                    {batchCode}
                  </span>
                  <span className="text-xs font-bold text-white font-sans">
                    {studentName} ({studentTsId})
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Requested by: <strong>{mentorName}</strong>
                  </span>
                </div>

                <div className="text-xs text-zinc-300 space-y-1 font-sans">
                  <p>
                    Session: <strong className="text-white font-mono">{sessionTitle}</strong>
                  </p>
                  <p className="text-amber-300 font-mono text-[11px]">
                    Requested Status: <strong>{req.requestedStatus}</strong>
                  </p>
                  <p className="text-zinc-400 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    &ldquo;{req.reason}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Buttons & Note */}
              <div className="space-y-2 md:w-80 shrink-0">
                <input
                  type="text"
                  placeholder="Optional admin review note..."
                  value={adminNotesMap[req.id] || ''}
                  onChange={(e) =>
                    setAdminNotesMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center gap-2">
                  <button
                    disabled={processingId === req.id}
                    onClick={() => handleDecision(req.id, 'APPROVED', req.batchId)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    disabled={processingId === req.id}
                    onClick={() => handleDecision(req.id, 'REJECTED', req.batchId)}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
