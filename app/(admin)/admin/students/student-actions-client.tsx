'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Mail,
  Send,
} from 'lucide-react';
import {
  updateStudentAction,
  deleteStudentAction,
  logStudentViewAction,
  reassignStudentTrackAction,
  toggleStudentDashboardAccessAction,
  reassignStudentBatchAction,
  dispatchStudentCredentialsAction,
} from '@/features/admin/actions/admin.actions';

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  tsId: string;
  phone: string | null;
  careerGoal: string | null;
  batchId?: string | null;
  batchCode?: string | null;
  enrollmentsCount: number;
  certificatesCount: number;
  isDashboardAccessGranted: boolean;
  createdAt: string;
}

export function StudentActionsClient({
  student,
  allCourses = [],
  allBatches = [],
}: {
  student: StudentItem;
  allCourses?: { id: string; title: string }[];
  allBatches?: { id: string; batchCode: string; title: string }[];
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [isGranted, setIsGranted] = useState(student.isDashboardAccessGranted);
  const [currentBatchId, setCurrentBatchId] = useState(student.batchId || '');
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Dispatch Credentials state
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [customPassword, setCustomPassword] = useState('');

  async function handleDispatchCredentials(e: React.FormEvent) {
    e.preventDefault();
    setDispatchLoading(true);
    setDispatchFeedback(null);

    const res = await dispatchStudentCredentialsAction(student.id, customPassword || undefined);
    setDispatchLoading(false);

    if (res.success) {
      setDispatchFeedback({
        type: 'success',
        message: `Credentials email dispatched successfully to ${student.email}!`,
      });
      setCustomPassword('');
      setTimeout(() => {
        setDispatchOpen(false);
        setDispatchFeedback(null);
      }, 2000);
    } else {
      setDispatchFeedback({
        type: 'error',
        message: res.error || 'Failed to dispatch credentials email.',
      });
    }
  }

  async function handleViewClick() {
    setViewOpen(true);
    await logStudentViewAction(student.id);
  }

  // Single-Toggle Instant Dashboard Access Switch
  async function handleToggleAccess() {
    setToggleLoading(true);
    const newStatus = !isGranted;
    const res = await toggleStudentDashboardAccessAction(student.id, newStatus);
    setToggleLoading(false);

    if (res.success) {
      setIsGranted(newStatus);
    } else {
      setError(res.error || 'Failed to update access state.');
    }
  }

  async function handleBatchTransferSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBatchLoading(true);
    setError(null);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const targetBatchId = (formData.get('batchId') as string) || null;

    const res = await reassignStudentBatchAction(student.id, targetBatchId === 'NONE' ? null : targetBatchId);
    setBatchLoading(false);

    if (res.success && 'newBatchCode' in res) {
      setCurrentBatchId(targetBatchId === 'NONE' ? '' : (targetBatchId || ''));
      setFeedback(`Successfully moved to batch ${res.newBatchCode}`);
      setTimeout(() => {
        setFeedback(null);
        setTransferOpen(false);
      }, 1200);
    } else {
      setError((res as { error?: string }).error || 'Failed to transfer batch.');
    }
  }

  async function handleTrackReassign(targetTrack: 'AI' | 'CYBER') {
    setLoading(true);
    await reassignStudentTrackAction(student.id, targetTrack);
    setLoading(false);
    setViewOpen(false);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateStudentAction(student.id, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to update student details.');
    } else {
      setEditOpen(false);
    }
  }

  async function handleDeleteConfirm() {
    setLoading(true);
    setError(null);

    const res = await deleteStudentAction(student.id);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to delete student.');
    } else {
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5 font-sans">
      {/* ACCESS TOGGLE BUTTON */}
      <button
        disabled={toggleLoading}
        onClick={handleToggleAccess}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border shadow-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
          isGranted
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60'
        }`}
        title={isGranted ? 'Click to Revoke Dashboard Access' : 'Click to Grant Dashboard Access'}
      >
        {toggleLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : isGranted ? (
          <>
            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active</span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Grant</span>
          </>
        )}
      </button>

      {/* BATCH ASSIGN BUTTON */}
      <button
        onClick={() => {
          setError(null);
          setFeedback(null);
          setTransferOpen(true);
        }}
        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 border border-indigo-200 text-xs font-medium transition-all inline-flex items-center gap-1 cursor-pointer"
        title="Assign or Transfer Batch"
      >
        <Layers className="w-3 h-3 text-indigo-600" />
        <span>Batch</span>
      </button>

      {/* DISPATCH CREDENTIALS BUTTON */}
      <button
        onClick={() => {
          setDispatchFeedback(null);
          setCustomPassword('');
          setDispatchOpen(true);
        }}
        className="px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-medium transition-all inline-flex items-center gap-1 cursor-pointer"
        title="Dispatch Login Credentials Email"
      >
        <Mail className="w-3.5 h-3.5 text-violet-600" />
        <span>Creds</span>
      </button>

      {/* INSPECT VIEW BUTTON */}
      <button
        onClick={handleViewClick}
        className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all inline-flex items-center gap-1 cursor-pointer"
        title="View Student Profile"
      >
        <Eye className="w-3 h-3 text-slate-500" />
        <span>View</span>
      </button>

      {/* EDIT BUTTON */}
      <button
        onClick={() => {
          setError(null);
          setEditOpen(true);
        }}
        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
        title="Edit Student Account"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>

      {/* DELETE BUTTON */}
      <button
        onClick={() => {
          setError(null);
          setDeleteOpen(true);
        }}
        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
        title="Delete Student Account"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* ── DISPATCH CREDENTIALS MODAL ── */}
      {dispatchOpen && (
        <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-violet-600" />
                Dispatch Credentials: {student.name}
              </DialogTitle>
            </DialogHeader>

            {dispatchFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  dispatchFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {dispatchFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{dispatchFeedback.message}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-700">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Student TS-ID:</span>
                <span className="font-mono font-bold text-violet-700 bg-violet-100/60 px-2 py-0.5 rounded border border-violet-200">
                  {student.tsId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Target Email:</span>
                <span className="font-medium text-slate-900">{student.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Cohort:</span>
                <span className="font-medium text-slate-800">
                  {student.batchCode || 'Unassigned (General Cadets)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleDispatchCredentials} className="space-y-4 pt-1">
              <div>
                <label className="block text-slate-700 text-[11px] font-medium mb-1">
                  Temporary Passkey (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The email will include the student portal login link, TS-ID, password, and OTP login details.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {dispatchLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Credentials Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── BATCH TRANSFER MODAL ── */}
      {transferOpen && (
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Assign or Transfer Batch: {student.name}
              </DialogTitle>
            </DialogHeader>

            {feedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{feedback}</span>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleBatchTransferSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">
                  Target Academic Batch / Cohort *
                </label>
                <select
                  name="batchId"
                  defaultValue={currentBatchId || 'NONE'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="NONE">-- No Batch (Unassigned) --</option>
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <span className="text-slate-700 font-semibold block">Batch Transfer Notice:</span>
                <p>Transferring updates student cohort membership and timetable registers while preserving completed courses and records.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs cursor-pointer"
                >
                  {batchLoading ? 'Transferring...' : 'Apply Batch Transfer'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── VIEW PROFILE OVERVIEW MODAL ── */}
      {viewOpen && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md bg-violet-50 border border-violet-200 text-violet-700 font-mono font-bold text-[11px]">
                  {student.tsId}
                </span>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Student Identity Dossier
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-medium">Full Name</span>
                  <span className="font-semibold text-slate-900">{student.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-medium">Email Address</span>
                  <span className="text-slate-800">{student.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-medium">Phone</span>
                  <span className="text-slate-800">{student.phone || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-medium">Active Batch</span>
                  <span className="text-indigo-600 font-semibold">{student.batchCode || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-medium">Career Goal</span>
                  <span className="text-slate-800 font-medium">{student.careerGoal || 'Security Specialist'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-medium">Access Status</span>
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                    isGranted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {isGranted ? 'Active Access' : 'Guest / Pending'}
                  </span>
                </div>
              </div>

              {/* Specialization Track Reassignment */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-violet-50/40 space-y-2">
                <span className="text-slate-700 font-semibold block text-[11px]">Reassign Track TS-ID</span>
                <div className="flex gap-2">
                  <button
                    disabled={loading}
                    onClick={() => handleTrackReassign('CYBER')}
                    className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 shadow-xs cursor-pointer"
                  >
                    Cybersecurity Track (TS-C)
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleTrackReassign('AI')}
                    className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 shadow-xs cursor-pointer"
                  >
                    AI &amp; ML Track (TS-A)
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── EDIT MODAL ── */}
      {editOpen && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900">Edit Student Account</DialogTitle>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-600 mb-1 font-medium text-[11px]">Full Name</label>
                <input name="name" defaultValue={student.name} required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium text-[11px]">Email Address</label>
                <input name="email" defaultValue={student.email} type="email" required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium text-[11px]">Contact Phone</label>
                <input name="phone" defaultValue={student.phone || ''} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium text-[11px]">Career Goal</label>
                <input name="careerGoal" defaultValue={student.careerGoal || ''} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer">
                  {loading ? 'Saving...' : 'Update Account'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteOpen && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Delete Account</span>
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Are you sure you want to delete student <strong className="text-slate-900">{student.name}</strong> ({student.tsId})?
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer">
                Cancel
              </button>
              <button disabled={loading} onClick={handleDeleteConfirm} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs cursor-pointer">
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
