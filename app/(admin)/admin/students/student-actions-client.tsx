'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Eye,
  Edit3,
  Trash2,
  Phone,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  updateStudentAction,
  deleteStudentAction,
  logStudentViewAction,
  reassignStudentTrackAction,
  toggleStudentDashboardAccessAction,
  toggleStudentCourseEnrollmentAction,
  reassignStudentBatchAction,
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
      setFeedback(`✓ Successfully moved to batch ${res.newBatchCode}!`);
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
    <div className="flex items-center justify-end gap-1.5 font-mono">
      {/* ⚡ SINGLE-TOGGLE DASHBOARD ACCESS BUTTON */}
      <button
        disabled={toggleLoading}
        onClick={handleToggleAccess}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
          isGranted
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
        }`}
        title={isGranted ? 'Click to Revoke Dashboard Access' : 'Click to Grant Dashboard Access'}
      >
        {toggleLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : isGranted ? (
          <>
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active</span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Grant</span>
          </>
        )}
      </button>

      {/* DIRECT BATCH TRANSFER TRIGGER */}
      <button
        onClick={() => {
          setError(null);
          setFeedback(null);
          setTransferOpen(true);
        }}
        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
        title="Transfer / Assign Student to Batch"
      >
        <Layers className="w-3 h-3 text-cyan-400" />
        <span>Batch</span>
      </button>

      {/* INSPECT MODAL TRIGGER */}
      <button
        onClick={handleViewClick}
        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
        title="Inspect Student Profile"
      >
        <Eye className="w-3 h-3 text-emerald-400" />
        <span>View</span>
      </button>

      {/* EDIT MODAL TRIGGER */}
      <button
        onClick={() => {
          setError(null);
          setEditOpen(true);
        }}
        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
        title="Edit Student Account"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>

      {/* DELETE MODAL TRIGGER */}
      <button
        onClick={() => {
          setError(null);
          setDeleteOpen(true);
        }}
        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 transition-all cursor-pointer"
        title="Delete Student Account"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* ── BATCH TRANSFER MODAL ── */}
      {transferOpen && (
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogContent className="max-w-md bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Assign or Transfer Batch: {student.name}
              </DialogTitle>
            </DialogHeader>

            {feedback && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{feedback}</span>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleBatchTransferSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">
                  Target Academic Batch / Cohort *
                </label>
                <select
                  name="batchId"
                  defaultValue={currentBatchId || 'NONE'}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="NONE">-- No Batch (Unassigned) --</option>
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="text-white font-bold block">Historical Integrity:</span>
                <p>Transferring moves active cohort membership and updates batch attendance registers while fully preserving past grades and course completions.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchLoading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
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
          <DialogContent className="max-w-md bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                  {student.tsId}
                </span>
                <DialogTitle className="text-base font-bold text-white">
                  Student Identity Dossier
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">NAME:</span>
                  <span className="font-bold text-white text-sm">{student.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">EMAIL:</span>
                  <span className="text-slate-300">{student.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">PHONE:</span>
                  <span className="text-slate-300">{student.phone || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">BATCH:</span>
                  <span className="text-cyan-400 font-bold">{student.batchCode || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">CAREER OBJECTIVE:</span>
                  <span className="text-emerald-400">{student.careerGoal || 'Cybersecurity Specialist'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">ACCESS STATUS:</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                    isGranted ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {isGranted ? 'GRANTED / ACTIVE' : 'GUEST / PENDING'}
                  </span>
                </div>
              </div>

              {/* Specialization Track Reassignment */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Reassign Track TS-ID</span>
                <div className="flex gap-2">
                  <button
                    disabled={loading}
                    onClick={() => handleTrackReassign('CYBER')}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700"
                  >
                    🛡️ Cyber (TS-CXXX)
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleTrackReassign('AI')}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700"
                  >
                    🤖 AI Track (TS-AXXX)
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
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
          <DialogContent className="max-w-md bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white">Edit Student Account</DialogTitle>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold text-[10px]">Full Name</label>
                <input name="name" defaultValue={student.name} required className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold text-[10px]">Email Address</label>
                <input name="email" defaultValue={student.email} type="email" required className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold text-[10px]">Contact Phone</label>
                <input name="phone" defaultValue={student.phone || ''} className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 uppercase mb-1 font-bold text-[10px]">Career Goal</label>
                <input name="careerGoal" defaultValue={student.careerGoal || ''} className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md">
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
          <DialogContent className="max-w-sm bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Delete Account</span>
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              Are you sure you want to delete student <strong className="text-white">{student.name}</strong> ({student.tsId})?
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">
                Cancel
              </button>
              <button disabled={loading} onClick={handleDeleteConfirm} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md">
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
