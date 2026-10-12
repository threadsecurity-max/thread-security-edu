'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  Layers,
  BookOpen,
  Filter,
  X,
  Mail,
  Phone,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  tsId: string;
  batch: {
    id: string;
    code: string;
    title: string;
    mentorName?: string;
  } | null;
  course: {
    id: string;
    title: string;
    slug: string;
  } | null;
  attendancePercentage: number;
  totalSessionsAttended: number;
  totalSessionsLogged: number;
  averageProgress: number;
  certificatesCount: number;
  lastActivity: string | Date;
  createdAt: string | Date;
}

export interface BatchOption {
  id: string;
  batchCode: string;
  title: string;
}

export interface CourseOption {
  id: string;
  title: string;
}

export function MentorStudentDirectoryClient({
  initialStudents,
  batches,
  courses,
  showCreateInitial = false,
}: {
  initialStudents: StudentItem[];
  batches: BatchOption[];
  courses: CourseOption[];
  showCreateInitial?: boolean;
}) {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(showCreateInitial);
  const [moveModalStudent, setMoveModalStudent] = useState<StudentItem | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Student Form State
  const [createStep, setCreateStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    batchId: batches[0]?.id || '',
    courseId: courses[0]?.id || '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    if (selectedBatch !== 'all' && s.batch?.id !== selectedBatch) return false;
    if (selectedStatus === 'ACTIVE' && !s.isActive) return false;
    if (selectedStatus === 'INACTIVE' && s.isActive) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.tsId.toLowerCase().includes(q) ||
        (s.batch?.code || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Create Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.batchId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/mentor/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student account.');
      }

      showToast(`Student ${formData.firstName} created! Onboarding email dispatched.`, 'success');
      setCreateModalOpen(false);
      setCreateStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        batchId: batches[0]?.id || '',
        courseId: courses[0]?.id || '',
      });

      // Refetch or prepend
      const refreshed = await fetch('/api/mentor/students');
      const refreshedData = await refreshed.json();
      if (refreshedData.students) {
        setStudents(refreshedData.students);
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Move Student
  const handleMoveStudent = async () => {
    if (!moveModalStudent || !targetBatchId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/mentor/students/${moveModalStudent.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetBatchId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to move student.');
      }

      showToast(`Student moved to ${data.newBatchCode}! All history preserved.`, 'success');
      setMoveModalStudent(null);
      setTargetBatchId('');

      // Refresh list
      const refreshed = await fetch('/api/mentor/students');
      const refreshedData = await refreshed.json();
      if (refreshedData.students) {
        setStudents(refreshedData.students);
      }
    } catch (err: any) {
      showToast(err.message || 'Error moving student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Active Status
  const handleToggleStatus = async (student: StudentItem) => {
    const nextStatus = !student.isActive;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/mentor/students/${student.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update student status.');
      }

      showToast(`Student account ${nextStatus ? 'activated' : 'deactivated'}.`, 'success');
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isActive: nextStatus } : s))
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl font-mono text-xs flex items-center gap-2 border ${
            toastMessage.type === 'success'
              ? 'bg-white border-violet-300 text-violet-800'
              : 'bg-white border-rose-300 text-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200 uppercase">
              COHORT ROSTER MANAGEMENT
            </span>
            <span className="text-xs font-mono text-slate-500">
              STRICT BATCH-SCOPED VISIBILITY
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-mono">
            Student Directory &amp; Lifecycle
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Manage candidates across your assigned cohorts. Onboard students, move batch memberships seamlessly with full history preservation, and track live laboratory fidelity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Onboard New Student</span>
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, email, TS-ID, or batch code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 font-mono transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-mono focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Assigned Batches ({batches.length})</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchCode}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-mono focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active Candidates</option>
            <option value="INACTIVE">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* ── STUDENTS ROSTER TABLE (Desktop) & CARDS (Mobile) ── */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Student Name &amp; Email</th>
                <th className="p-4 font-bold">TS-ID</th>
                <th className="p-4 font-bold">Assigned Batch</th>
                <th className="p-4 font-bold">Curriculum Progress</th>
                <th className="p-4 font-bold">Attendance</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No candidates found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block text-sm font-sans">{student.name}</span>
                        <span className="text-[11px] text-slate-500 block">{student.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200 inline-block">
                        {student.tsId}
                      </span>
                    </td>

                    <td className="p-4">
                      {student.batch ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{student.batch.code}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                            {student.batch.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="space-y-1 min-w-[90px]">
                        <span className="text-xs font-bold text-slate-900">{student.averageProgress}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-600 rounded-full"
                            style={{ width: `${student.averageProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-xs font-bold ${
                          student.attendancePercentage >= 80 ? 'text-violet-700' : 'text-amber-600'
                        }`}
                      >
                        {student.attendancePercentage}% ({student.totalSessionsAttended}/{student.totalSessionsLogged})
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Move Batch Button */}
                        <button
                          onClick={() => {
                            setMoveModalStudent(student);
                            setTargetBatchId(student.batch?.id || batches[0]?.id || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Move student to another batch without losing history"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-violet-600" />
                          <span>Move Batch</span>
                        </button>

                        {/* Status Toggle */}
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            student.isActive
                              ? 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={student.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                        >
                          {student.isActive ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE STUDENT MULTI-STEP MODAL (Rule #10 & #11) ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-violet-600 uppercase tracking-widest font-bold">
                  STEP {createStep} OF 3
                </span>
                <h3 className="text-xl font-bold font-mono text-slate-900">
                  {createStep === 1
                    ? 'Student Personal Details'
                    : createStep === 2
                    ? 'Academic Cohort Placement'
                    : 'Credential Dispatch Preview'}
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              {createStep === 1 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 block text-[11px]">First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Kunal"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 block text-[11px]">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 block text-[11px]">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kunal@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 block text-[11px]">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.firstName || !formData.lastName || !formData.email}
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Next: Academic Cohort →
                    </button>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-600 block text-[11px]">Select Cohort Batch *</label>
                    <select
                      required
                      value={formData.batchId}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchCode} — {b.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {courses.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-slate-600 block text-[11px]">Curriculum Track</label>
                      <select
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="p-3 rounded-2xl bg-violet-50 border border-violet-150 text-[11px] text-violet-900 space-y-1">
                    <span className="text-violet-700 font-bold block">ACCESS CONTROL POLICY</span>
                    <span>Student will automatically receive access to labs and lectures belonging to this cohort.</span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={!formData.batchId}
                      onClick={() => setCreateStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs"
                    >
                      Next: Access &amp; Dispatch →
                    </button>
                  </div>
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 space-y-2">
                    <span className="text-violet-700 font-bold text-xs flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      AUTOMATIC CREDENTIAL DISPATCH
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Upon confirmation, an official onboarding email with temporary login credentials and a unique TS-ID will be dispatched to <strong className="text-slate-900">{formData.email}</strong> via verified sender <code className="text-violet-700 font-bold">edu@threadsecurity.in</code>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Candidate:</span>
                      <strong className="text-slate-900">{formData.firstName} {formData.lastName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <strong className="text-slate-900">{formData.email}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batch Code:</span>
                      <strong className="text-violet-700">{batches.find((b) => b.id === formData.batchId)?.batchCode}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(2)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? 'Creating Account & Dispatching...' : 'Create Account & Dispatch Email'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── MOVE STUDENT MODAL (Rule #14: History Intact Confirmation) ── */}
      {moveModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMoveModalStudent(null)}
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 font-mono text-xs text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-bold text-slate-900">Move Candidate Batch</h3>
              </div>
              <button
                onClick={() => setMoveModalStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <strong className="text-slate-900">{moveModalStudent.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TS-ID:</span>
                <strong className="text-violet-700">{moveModalStudent.tsId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Batch:</span>
                <strong className="text-slate-900">{moveModalStudent.batch?.code || 'None'}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 block text-[11px]">Select Destination Batch *</label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.id === moveModalStudent.batch?.id}>
                    {b.batchCode} — {b.title} {b.id === moveModalStudent.batch?.id ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* MANDATORY CONFIRMATION NOTICE (Rule #14) */}
            <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-800 text-[11px] leading-relaxed">
              <strong>Data Ownership Guarantee:</strong> Moving this student will change their active batch visibility. Their historical attendance, assessments, assignments, and certificates will remain 100% intact.
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setMoveModalStudent(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !targetBatchId || targetBatchId === moveModalStudent.batch?.id}
                onClick={handleMoveStudent}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {actionLoading ? 'Moving Student...' : 'Confirm Move Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
