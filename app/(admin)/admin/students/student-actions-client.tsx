'use client';

import { useState } from 'react';
import { Button, Input, Badge, TSIDBadge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import {
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  Mail,
  Phone,
  Award,
  BookOpen,
  AlertTriangle,
  Cpu,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';
import {
  updateStudentAction,
  deleteStudentAction,
  logStudentViewAction,
  reassignStudentTrackAction,
  toggleStudentDashboardAccessAction,
  toggleStudentCourseEnrollmentAction,
} from '@/features/admin/actions/admin.actions';

export interface CourseSummary {
  id: string;
  title: string;
  isEnrolled: boolean;
}

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  tsId: string;
  phone: string | null;
  careerGoal: string | null;
  enrollmentsCount: number;
  certificatesCount: number;
  isDashboardAccessGranted: boolean;
  createdAt: string;
  courses?: CourseSummary[];
}

export function StudentActionsClient({
  student,
  allCourses = [],
}: {
  student: StudentItem;
  allCourses?: { id: string; title: string }[];
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const [isGranted, setIsGranted] = useState(student.isDashboardAccessGranted);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleCourseToggle(courseId: string, currentEnrolled: boolean) {
    setCourseLoading(courseId);
    await toggleStudentCourseEnrollmentAction(student.id, courseId, !currentEnrolled);
    setCourseLoading(null);
  }

  async function handleTrackReassign(targetTrack: 'AI' | 'CYBER') {
    setTrackLoading(true);
    await reassignStudentTrackAction(student.id, targetTrack);
    setTrackLoading(false);
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

  const upperTsId = student.tsId.toUpperCase();
  const isAiStudent = upperTsId.startsWith('TS-A') || upperTsId.includes('-AI-');

  return (
    <div className="flex items-center justify-end gap-2 font-mono">
      {/* ⚡ SINGLE-TOGGLE DASHBOARD ACCESS BUTTON */}
      <button
        disabled={toggleLoading}
        onClick={handleToggleAccess}
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
          isGranted
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
            : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
        }`}
        title={isGranted ? 'Click to Revoke Dashboard Access' : 'Click to Grant Dashboard Access'}
      >
        {toggleLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : isGranted ? (
          <>
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved</span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Grant Access</span>
          </>
        )}
      </button>

      {/* 1. VIEW PROFILE & DASHBOARD MODAL */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTrigger asChild>
          <button
            onClick={handleViewClick}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold border border-white/15 transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span>Inspect</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#120408]/95 border border-red-500/30 text-white backdrop-blur-2xl rounded-3xl p-6">
          <DialogHeader className="border-b border-red-500/20 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold text-[11px]">
                {student.tsId}
              </span>
              <DialogTitle className="text-base font-bold text-white">
                Student Profile Overview
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs font-mono">
            {/* Identity Details */}
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-red-300/70 font-bold">FULL NAME:</span>
                <span className="font-bold text-white text-sm">{student.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-300/70 font-bold">EMAIL ADDRESS:</span>
                <span className="text-slate-200">{student.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-300/70 font-bold">PHONE NUMBER:</span>
                <span className="text-slate-200">{student.phone || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-300/70 font-bold">CAREER OBJECTIVE:</span>
                <span className="text-slate-200">{student.careerGoal || 'Cybersecurity'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-300/70 font-bold">DASHBOARD ACCESS:</span>
                <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-bold">
                  {isGranted ? 'GRANTED / ACTIVE' : 'GUEST / PENDING'}
                </span>
              </div>
            </div>

            {/* Quick Access Toggle inside Inspect */}
            <div className="p-3.5 rounded-2xl border border-red-500/20 flex items-center justify-between bg-red-950/20">
              <div>
                <span className="font-bold text-white block text-xs">Dashboard Access Switch</span>
                <span className="text-[11px] text-slate-400 block">Single-click grant/revoke clearance</span>
              </div>
              <button
                disabled={toggleLoading}
                onClick={handleToggleAccess}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs shadow-md border border-white/20 active:scale-95 transition-all cursor-pointer"
              >
                {isGranted ? 'Revoke Access' : 'Grant Clearance'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <button className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold border border-white/10 transition-all inline-flex items-center gap-1 cursor-pointer">
            <Edit3 className="w-3.5 h-3.5 text-rose-400" />
            <span>Edit</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#120408]/95 border border-red-500/30 text-white backdrop-blur-2xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Edit Student Account</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-red-300/80 uppercase mb-1 font-bold text-[11px]">Full Name</label>
              <input name="name" defaultValue={student.name} required className="w-full bg-red-950/30 border border-red-500/30 text-white rounded-2xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-xs font-mono" />
            </div>
            <div>
              <label className="block text-red-300/80 uppercase mb-1 font-bold text-[11px]">Email Address</label>
              <input name="email" defaultValue={student.email} type="email" required className="w-full bg-red-950/30 border border-red-500/30 text-white rounded-2xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-xs font-mono" />
            </div>
            <div>
              <label className="block text-red-300/80 uppercase mb-1 font-bold text-[11px]">Contact Phone</label>
              <input name="phone" defaultValue={student.phone || ''} className="w-full bg-red-950/30 border border-red-500/30 text-white rounded-2xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-xs font-mono" />
            </div>
            <div>
              <label className="block text-red-300/80 uppercase mb-1 font-bold text-[11px]">Career Objective</label>
              <input name="careerGoal" defaultValue={student.careerGoal || ''} className="w-full bg-red-950/30 border border-red-500/30 text-white rounded-2xl px-4 py-2.5 focus:outline-none focus:border-red-500 text-xs font-mono" />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-full bg-white/5 text-slate-300 text-xs font-mono font-bold">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs shadow-md border border-white/20 active:scale-95 transition-all">
                {loading ? 'Saving...' : 'Update Account'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. DELETE MODAL */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <button className="p-2 rounded-full bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-all cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-sm bg-[#120408]/95 border border-red-500/30 text-white backdrop-blur-2xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Delete Account</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Are you sure you want to delete student <strong className="text-white">{student.name}</strong> ({student.tsId})? This action will permanently remove all associated progress and certificates.
          </p>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-full bg-white/5 text-slate-300 text-xs font-mono font-bold">
              Cancel
            </button>
            <button disabled={loading} onClick={handleDeleteConfirm} className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs shadow-md border border-white/20 active:scale-95 transition-all">
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
