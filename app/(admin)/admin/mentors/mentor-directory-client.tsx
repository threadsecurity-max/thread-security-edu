'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Trash2,
  Edit3,
  ShieldCheck,
  Mail,
  Building,
  Briefcase,
  BookOpen,
  Users,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Key,
} from 'lucide-react';
import {
  createMentorAction,
  updateMentorAction,
  deleteMentorAction,
  toggleMentorAccessAction,
  assignBatchToMentorAction,
  dispatchMentorCredentialsAction,
} from '@/features/admin/actions/admin.actions';
import { createBatchSessionAction } from '@/features/batch/actions/batch.actions';
import { sendDirectMentorMessageAction } from '@/features/notifications/actions/notification.actions';

interface MentorDirectoryClientProps {
  mentors: any[];
  allBatches?: any[];
  allCourses?: any[];
}

export function MentorDirectoryClient({ mentors, allBatches = [], allCourses = [] }: MentorDirectoryClientProps) {
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [inspectingMentor, setInspectingMentor] = useState<any | null>(null);
  const [messagingMentor, setMessagingMentor] = useState<any | null>(null);
  const [scheduleMentor, setScheduleMentor] = useState<any | null>(null);
  const [assignBatchMentor, setAssignBatchMentor] = useState<any | null>(null);
  const [calendarViewOpen, setCalendarViewOpen] = useState(false);
  const [dispatchCredsModalMentor, setDispatchCredsModalMentor] = useState<any | null>(null);
  const [customPasskey, setCustomPasskey] = useState<string>('');
  const [dispatchingMentorId, setDispatchingMentorId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(mentors.length / pageSize));
  const paginatedMentors = mentors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Scheduling Form state
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [durationMins, setDurationMins] = useState(120);
  const [sessionAgenda, setSessionAgenda] = useState('');

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [createdInviteInfo, setCreatedInviteInfo] = useState<{ mentorId: string; inviteToken?: string } | null>(null);

  const handleCreateMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);
    setCreatedInviteInfo(null);

    const formData = new FormData(e.currentTarget);
    const res = await createMentorAction(formData);
    setLoading(false);

    if (res.success) {
      const isDispatched = (res as any).emailDispatched;
      setFeedbackMsg(
        isDispatched
          ? 'Faculty mentor provisioned and login credentials dispatched to email.'
          : 'Faculty mentor provisioned successfully.'
      );
      if ((res as any).mentor) {
        setCreatedInviteInfo({
          mentorId: (res as any).mentor.user?.mentorIdentity?.mentorId || (res as any).mentor.user?.tsIdentity?.tsId || 'TS-MNT-ACTIVE',
        });
      }
    } else {
      setFeedbackMsg(res.error || 'Failed to create mentor.');
    }
  };

  const handleDispatchMentorCreds = async (mentor: any, passkey?: string) => {
    setDispatchingMentorId(mentor.id);
    try {
      const res = await dispatchMentorCredentialsAction(mentor.id, passkey);
      if (res.success) {
        setFeedbackMsg(`Credentials dispatched successfully to ${res.email} (${res.mentorId}).`);
        setDispatchCredsModalMentor(null);
        setCustomPasskey('');
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg(res.error || 'Failed to dispatch credentials.');
      }
    } catch (e: any) {
      setFeedbackMsg(e.message || 'Error sending credentials.');
    } finally {
      setDispatchingMentorId(null);
    }
  };

  const handleUpdateMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMentor) return;
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateMentorAction(editingMentor.id, formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('Mentor profile updated successfully.');
      setTimeout(() => {
        setFeedbackMsg(null);
        setEditingMentor(null);
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to update mentor.');
    }
  };

  const handleAssignBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assignBatchMentor) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const batchId = formData.get('batchId') as string;
    if (!batchId) return;

    const res = await assignBatchToMentorAction(assignBatchMentor.id, batchId);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('Batch successfully assigned to faculty mentor.');
      setTimeout(() => {
        setFeedbackMsg(null);
        setAssignBatchMentor(null);
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to assign batch.');
    }
  };

  const handleScheduleClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scheduleMentor) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('batchId', selectedBatchId);
    formData.append('title', sessionTitle);
    formData.append('sessionDate', sessionDate);
    formData.append('durationMins', String(durationMins));
    formData.append('agenda', sessionAgenda);

    const res = await createBatchSessionAction(formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('Lecture session scheduled successfully.');
      setTimeout(() => {
        setFeedbackMsg(null);
        setScheduleMentor(null);
        setSessionTitle('');
        setSessionDate('');
        setSessionAgenda('');
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to schedule class.');
    }
  };

  const handleToggleStatus = async (mentor: any, status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') => {
    setLoading(true);
    const res = await toggleMentorAccessAction(mentor.id, status);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg(`Mentor access state updated to ${status}.`);
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messagingMentor) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = (formData.get('title') as string) || 'Admin Notice';
    const message = (formData.get('message') as string) || '';

    const res = await sendDirectMentorMessageAction(messagingMentor.userId, title, message);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg(`Direct notice sent to ${messagingMentor.user?.name || 'mentor'}.`);
      setTimeout(() => {
        setFeedbackMsg(null);
        setMessagingMentor(null);
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to send message.');
    }
  };

  // Collect all sessions for faculty calendar view
  const allFacultySessions = mentors.flatMap((m) =>
    (m.batches || []).flatMap((b: any) =>
      (b.sessions || []).map((s: any) => ({
        ...s,
        batchCode: b.batchCode,
        batchTitle: b.title,
        mentorName: m.user?.name || 'Mentor',
      }))
    )
  ).sort((a: any, b: any) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            Faculty Roster &amp; Mentor Management ({mentors.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision mentor accounts with batch assignments, schedule classes, and inspect workload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalendarViewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Calendar className="w-4 h-4 text-violet-600" />
            <span>Faculty Calendar</span>
          </button>

          <button
            onClick={() => {
              setCreatedInviteInfo(null);
              setFeedbackMsg(null);
              setIsAddOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Mentor</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedMentors.map((m) => {
          const taughtCoursesCount = m.courses?.length || 0;
          const assignedMenteesCount = m.students?.length || 0;
          const assignedBatches = m.batches || [];
          const assignedBatchesCount = assignedBatches.length;
          const mentorId = m.user?.mentorIdentity?.mentorId || m.user?.tsIdentity?.tsId || `TS-MNT-${m.id.slice(-4).toUpperCase()}`;
          const isUserActive = m.user?.isActive !== false;
          const isDashboardGranted = m.user?.isDashboardAccessGranted !== false;
          const isTeaching = assignedBatchesCount > 0;

          return (
            <Card
              key={m.id}
              className="bg-white border border-slate-200 text-slate-900 hover:border-violet-300 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between shadow-xs"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm shrink-0 border border-violet-200">
                        {m.user?.name ? m.user.name[0].toUpperCase() : 'M'}
                      </div>
                      <div className="truncate">
                        <CardTitle className="text-sm font-bold text-slate-900 truncate">
                          {m.user?.name || 'Mentor'}
                        </CardTitle>
                        <span className="text-[11px] text-violet-600 font-mono font-medium block">
                          {mentorId}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      !isUserActive
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : !isDashboardGranted
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {!isUserActive ? 'Archived' : !isDashboardGranted ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Designation:</span>
                      <strong className="text-slate-900 text-right truncate max-w-[170px]">
                        {m.title || 'Security Lead'} ({m.company || 'ThreadSec'})
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-700 truncate max-w-[170px] text-[10px]">
                        {m.user?.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Expertise:</span>
                      <span className="text-violet-700 font-semibold truncate max-w-[170px]">
                        {m.expertise || 'Offensive Security'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Schedule:</span>
                      <span className="text-slate-700 font-medium truncate max-w-[170px]" title={m.officeHours || 'Flexible'}>
                        {m.officeHours || 'Flexible'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Batches:</span>
                      <span className="text-slate-800 font-semibold truncate max-w-[170px]">
                        {assignedBatchesCount > 0
                          ? assignedBatches.map((b: any) => b.batchCode).join(', ')
                          : 'None (Unassigned)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Courses:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[170px]" title={m.courses?.map((c: any) => c.title).join(', ') || 'None'}>
                        {m.courses && m.courses.length > 0
                          ? m.courses.map((c: any) => c.title).join(', ')
                          : 'None assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Workload Metric Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Batches</span>
                      <span className="text-xs font-bold text-violet-700 block mt-0.5">{assignedBatchesCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Courses</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{taughtCoursesCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Mentees</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{assignedMenteesCount}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap bg-slate-50/50 rounded-b-2xl">
                <button
                  onClick={() => {
                    setCustomPasskey('');
                    setDispatchCredsModalMentor(m);
                  }}
                  disabled={dispatchingMentorId === m.id}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  title="Dispatch Login Credentials Email to Faculty"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{dispatchingMentorId === m.id ? 'Sending...' : 'Creds'}</span>
                </button>

                {/* Schedule class only if teaching a lecture / has assigned batch */}
                <button
                  onClick={() => {
                    if (isTeaching) {
                      setSelectedBatchId(assignedBatches[0].id);
                      setScheduleMentor(m);
                    }
                  }}
                  disabled={!isTeaching}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    isTeaching
                      ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title={isTeaching ? 'Schedule Lecture for this Mentor' : 'Assign a batch first to schedule lectures'}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Class</span>
                </button>

                <button
                  onClick={() => setAssignBatchMentor(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all"
                  title="Assign Academic Batch"
                >
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
                  <span>Assign Batch</span>
                </button>

                <button
                  onClick={() => setInspectingMentor(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all"
                  title="View Profile Dossier"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setEditingMentor(m)}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-all cursor-pointer"
                  title="Edit Faculty Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {isUserActive && (
                  <button
                    onClick={() => handleToggleStatus(m, isDashboardGranted ? 'SUSPENDED' : 'ACTIVE')}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-all cursor-pointer"
                    title={isDashboardGranted ? 'Suspend Access' : 'Restore Access'}
                  >
                    {isDashboardGranted ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (confirm(`Archive mentor ${m.user?.name}? (Historical records will be preserved).`)) {
                      await deleteMentorAction(m.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                  title="Archive Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 text-xs">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, mentors.length)} of {mentors.length} faculty members
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === pg
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── SCHEDULE LECTURE / CLASS MODAL (Task 1) ── */}
      {scheduleMentor && (
        <Dialog open={!!scheduleMentor} onOpenChange={(open) => !open && setScheduleMentor(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Schedule Lecture: {scheduleMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleScheduleClass} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Teaching Batch *
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600"
                  required
                >
                  {scheduleMentor.batches?.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} - {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Threat Hunting &amp; Log Forensics"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(parseInt(e.target.value) || 120)}
                    min={30}
                    max={360}
                    step={15}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Agenda &amp; Notes
                </label>
                <textarea
                  value={sessionAgenda}
                  onChange={(e) => setSessionAgenda(e.target.value)}
                  rows={2}
                  placeholder="Topics, lab preparation, or materials needed"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleMentor(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Scheduling...' : 'Schedule Lecture'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── ASSIGN BATCH MODAL (Task 1) ── */}
      {assignBatchMentor && (
        <Dialog open={!!assignBatchMentor} onOpenChange={(open) => !open && setAssignBatchMentor(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" />
                Assign Cohort Batch to {assignBatchMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAssignBatch} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Available Batch *
                </label>
                <select
                  name="batchId"
                  defaultValue={allBatches[0]?.id || ''}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600"
                  required
                >
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} - {b.title} {b.mentorId === assignBatchMentor.id ? '(Currently Assigned)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selecting a batch links this faculty mentor to conduct its lectures and take attendance.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignBatchMentor(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Confirm Batch Assignment'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── FACULTY CALENDAR VIEW MODAL (Task 1) ── */}
      {calendarViewOpen && (
        <Dialog open={calendarViewOpen} onOpenChange={setCalendarViewOpen}>
          <DialogContent className="max-w-3xl bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <span>Faculty Academic Calendar &amp; Conduction Schedule</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  {allFacultySessions.length} Scheduled Sessions
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-3">
              {allFacultySessions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No scheduled lecture sessions across faculty cohorts.
                </div>
              ) : (
                allFacultySessions.map((s: any) => {
                  const d = new Date(s.sessionDate);
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-300 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold text-[10px] border border-violet-200">
                            {s.batchCode}
                          </span>
                          <span className="font-semibold text-slate-900 text-xs">{s.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Faculty: <strong className="text-slate-700">{s.mentorName}</strong></span>
                          <span>Duration: {s.durationMins || 120} mins</span>
                          {s.agenda && <span className="truncate max-w-xs text-slate-400">Agenda: {s.agenda}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-violet-700 block">
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── PROVISION NEW MENTOR DIALOG (Task 1: Batch from provision) ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-violet-600" />
              Provision Academic Mentor &amp; ID
            </DialogTitle>
          </DialogHeader>

          {createdInviteInfo ? (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  <span>Mentor Account Created</span>
                </div>
                <div className="text-xs text-slate-600">
                  Assigned Mentor ID: <strong className="text-violet-700 text-sm font-bold">{createdInviteInfo.mentorId}</strong>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setCreatedInviteInfo(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateMentor} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mentor Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. Alex Mercer"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. alex.mercer@threadsecurity.in"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Designation / Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Principal Security Architect"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Organization</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Thread Security"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expertise Areas</label>
                <input
                  type="text"
                  name="expertise"
                  placeholder="e.g. VAPT, Cloud Security, Red Teaming"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                />
              </div>

              {/* Schedule & Office Hours */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Weekly Schedule &amp; Lecture Timings
                </label>
                <input
                  type="text"
                  name="schedule"
                  placeholder="e.g. Mon, Wed, Fri • 7:00 PM - 9:00 PM IST"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                />
              </div>

              {/* Batch Allocation */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Cohort Batch</label>
                <select
                  name="batchId"
                  defaultValue=""
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                >
                  <option value="">-- No initial batch (assign later) --</option>
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} - {b.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Connects the instructor to lead lectures and manage students of this batch.
                </p>
              </div>

              {/* Course Curriculum Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assigned Course Curriculums
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto space-y-1">
                  {allCourses.length === 0 ? (
                    <p className="text-slate-400 text-[11px]">No courses configured yet.</p>
                  ) : (
                    allCourses.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          name="courseIds"
                          value={c.id}
                          className="w-3.5 h-3.5 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                        />
                        <span className="text-slate-800 text-xs font-medium">{c.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Passkey & Dispatch Email */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Initial Security Passkey / Temporary Password
                  </label>
                  <input
                    type="text"
                    name="passkey"
                    placeholder="Leave blank to auto-generate a secure passkey"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600 font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="dispatchEmail"
                    value="true"
                    defaultChecked
                    className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                  />
                  <span className="text-slate-700 text-xs font-medium">
                    Dispatch login credentials email immediately to faculty inbox
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Faculty Biography</label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="Brief background in cybersecurity..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Provisioning...' : 'Provision Mentor & Generate ID'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── EDIT MENTOR DIALOG ── */}
      {editingMentor && (
        <Dialog open={!!editingMentor} onOpenChange={(open) => !open && setEditingMentor(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-600" />
                Edit Mentor: {editingMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateMentor} className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMentor.user?.name || ''}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingMentor.title || ''}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  defaultValue={editingMentor.company || ''}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expertise</label>
                <input
                  type="text"
                  name="expertise"
                  defaultValue={editingMentor.expertise || ''}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMentor(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── PROFILE INSPECTION DOSSIER ── */}
      {inspectingMentor && (
        <Dialog open={!!inspectingMentor} onOpenChange={(open) => !open && setInspectingMentor(null)}>
          <DialogContent className="max-w-xl bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Faculty Dossier: {inspectingMentor.user?.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 font-mono font-semibold">
                  {inspectingMentor.user?.mentorIdentity?.mentorId || inspectingMentor.user?.tsIdentity?.tsId || 'TS-MNT-ACTIVE'}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Official Email</span>
                  <span className="text-slate-900 font-semibold">{inspectingMentor.user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Title &amp; Company</span>
                  <span className="text-slate-900 font-semibold">{inspectingMentor.title} • {inspectingMentor.company}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Expertise</span>
                  <span className="text-violet-700 font-semibold">{inspectingMentor.expertise}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Office Hours</span>
                  <span className="text-slate-900 font-semibold">{inspectingMentor.officeHours || 'Not specified'}</span>
                </div>
              </div>

              {/* Assigned Batches */}
              <div className="space-y-2">
                <span className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
                  Assigned Batches &amp; Cohorts ({inspectingMentor.batches?.length || 0})
                </span>
                {(!inspectingMentor.batches || inspectingMentor.batches.length === 0) ? (
                  <p className="text-slate-400 text-xs p-3 rounded-lg bg-slate-50 border border-slate-200">No batches currently assigned.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {inspectingMentor.batches.map((b: any) => (
                      <div key={b.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-violet-700 font-semibold mr-2">{b.batchCode}</span>
                          <span className="text-slate-900 font-medium">{b.title}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{b.sessions?.length || 0} Sessions</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setInspectingMentor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── DISPATCH CREDENTIALS MODAL ── */}
      {dispatchCredsModalMentor && (
        <Dialog open={!!dispatchCredsModalMentor} onOpenChange={(open) => !open && setDispatchCredsModalMentor(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                Dispatch Credentials: {dispatchCredsModalMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Email:</span>
                  <span className="font-semibold text-slate-800">{dispatchCredsModalMentor.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Faculty ID:</span>
                  <span className="font-mono font-bold text-violet-700">
                    {dispatchCredsModalMentor.user?.mentorIdentity?.mentorId || dispatchCredsModalMentor.user?.tsIdentity?.tsId || 'TS-MNT-ACTIVE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Batches:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {dispatchCredsModalMentor.batches?.map((b: any) => b.batchCode).join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Courses:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {dispatchCredsModalMentor.courses?.map((c: any) => c.title).join(', ') || 'None'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Custom Security Passkey / Temporary Password (Optional)
                </label>
                <input
                  type="text"
                  value={customPasskey}
                  onChange={(e) => setCustomPasskey(e.target.value)}
                  placeholder="Leave empty to generate a secure random passkey"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-600 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Sends official onboarding email with Faculty ID, assigned curriculum, schedule, portal login URL, and credentials.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchCredsModalMentor(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || dispatchingMentorId === dispatchCredsModalMentor.id}
                  onClick={() => handleDispatchMentorCreds(dispatchCredsModalMentor, customPasskey)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{dispatchingMentorId === dispatchCredsModalMentor.id ? 'Dispatching...' : 'Dispatch Credentials'}</span>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
