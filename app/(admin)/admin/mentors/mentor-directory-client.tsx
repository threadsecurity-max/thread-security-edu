'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  Layers,
  Key,
  Copy,
} from 'lucide-react';
import {
  createMentorAction,
  updateMentorAction,
  deleteMentorAction,
  toggleMentorAccessAction,
} from '@/features/admin/actions/admin.actions';
import { sendDirectMentorMessageAction } from '@/features/notifications/actions/notification.actions';

export function MentorDirectoryClient({ mentors }: { mentors: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [inspectingMentor, setInspectingMentor] = useState<any | null>(null);
  const [messagingMentor, setMessagingMentor] = useState<any | null>(null);
  const [scheduleMentor, setScheduleMentor] = useState<any | null>(null);
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
      setFeedbackMsg('✓ Academic Mentor provisioned successfully in database!');
      if ((res as any).mentorId) {
        setCreatedInviteInfo({
          mentorId: (res as any).mentorId,
          inviteToken: (res as any).inviteToken,
        });
      }
    } else {
      setFeedbackMsg(res.error || 'Failed to create mentor.');
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
      setFeedbackMsg('✓ Mentor profile updated successfully!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setEditingMentor(null);
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to update mentor.');
    }
  };

  const handleToggleStatus = async (mentor: any, status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') => {
    setLoading(true);
    const res = await toggleMentorAccessAction(mentor.id, status);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg(`✓ Mentor access state updated to ${status}.`);
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messagingMentor) return;
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const title = (formData.get('title') as string) || 'Admin Notice';
    const message = (formData.get('message') as string) || '';

    const res = await sendDirectMentorMessageAction(messagingMentor.userId, title, message);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg(`✓ Direct notice sent to ${messagingMentor.user?.name || 'mentor'}!`);
      setTimeout(() => {
        setFeedbackMsg(null);
        setMessagingMentor(null);
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to send message.');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scheduleMentor) return;
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateMentorAction(scheduleMentor.id, formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('✓ Faculty availability schedule updated in database!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setScheduleMentor(null);
      }, 1200);
    } else {
      setFeedbackMsg(res.error || 'Failed to save schedule.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-mono text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Faculty Roster &amp; Mentor Management ({mentors.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Server-generated Mentor IDs, lifecycle authorization, batch allocations, and profile inspection.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedInviteInfo(null);
            setFeedbackMsg(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Mentor Account</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map((m) => {
          const taughtCoursesCount = m.courses?.length || 0;
          const assignedMenteesCount = m.students?.length || 0;
          const assignedBatchesCount = m.batches?.length || 0;
          const mentorId = m.user?.mentorIdentity?.mentorId || m.user?.tsIdentity?.tsId || `TS-MNT-${m.id.slice(-4).toUpperCase()}`;
          const isUserActive = m.user?.isActive !== false;
          const isDashboardGranted = m.user?.isDashboardAccessGranted !== false;

          let statusBadge = (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
              ACTIVE
            </span>
          );
          if (!isUserActive) {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-bold">
                ARCHIVED
              </span>
            );
          } else if (!isDashboardGranted) {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                SUSPENDED
              </span>
            );
          }

          return (
            <Card
              key={m.id}
              className="bg-[#0B0F19]/90 border border-slate-850 text-slate-100 hover:border-emerald-500/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all rounded-2xl flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 text-slate-950 font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/40 shrink-0">
                        {m.user?.name ? m.user.name[0].toUpperCase() : 'M'}
                      </div>
                      <div className="truncate">
                        <CardTitle className="text-sm font-bold font-mono text-white truncate">
                          {m.user?.name || 'Mentor'}
                        </CardTitle>
                        <span className="text-[11px] text-emerald-400 font-mono block">
                          {mentorId}
                        </span>
                      </div>
                    </div>

                    {statusBadge}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Title:</span>
                      <strong className="text-white text-right truncate max-w-[170px]">
                        {m.title || 'Security Lead'} ({m.company || 'ThreadSec'})
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-300 truncate max-w-[170px] text-[10px]">
                        {m.user?.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expertise:</span>
                      <span className="text-emerald-400 font-bold truncate max-w-[170px]">
                        {m.expertise || 'Offensive Security'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Availability:</span>
                      <span className="text-slate-300 text-[10px] truncate max-w-[170px]">
                        {m.officeHours || 'Mon/Wed/Fri 7-9 PM'}
                      </span>
                    </div>
                  </div>

                  {/* Workload Metric Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Batches</span>
                      <span className="text-xs font-bold text-cyan-400 block mt-0.5">{assignedBatchesCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Courses</span>
                      <span className="text-xs font-bold text-white block mt-0.5">{taughtCoursesCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Mentees</span>
                      <span className="text-xs font-bold text-emerald-400 block mt-0.5">{assignedMenteesCount}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  onClick={() => setInspectingMentor(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Inspect Assigned Batches, Courses & Profile"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setMessagingMentor(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Send Direct Notice"
                >
                  <Send className="w-3 h-3 text-emerald-400" />
                  <span>Notice</span>
                </button>

                <button
                  onClick={() => setScheduleMentor(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Edit Availability"
                >
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Hours</span>
                </button>

                <button
                  onClick={() => setEditingMentor(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Edit Faculty Details"
                >
                  <Edit3 className="w-3 h-3 text-slate-400" />
                  <span>Edit</span>
                </button>

                {isUserActive && (
                  <button
                    onClick={() => handleToggleStatus(m, isDashboardGranted ? 'SUSPENDED' : 'ACTIVE')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono cursor-pointer transition-all"
                    title={isDashboardGranted ? 'Suspend Dashboard Access' : 'Restore Dashboard Access'}
                  >
                    {isDashboardGranted ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (confirm(`Archive and revoke access for mentor ${m.user?.name}? (Historical batch, attendance, and course records will be safely preserved).`)) {
                      await deleteMentorAction(m.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 cursor-pointer transition-all"
                  title="Archive Account & Revoke Access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── DETAIL PROFILE INSPECTION DRAWER ── */}
      {inspectingMentor && (
        <Dialog open={!!inspectingMentor} onOpenChange={(open) => !open && setInspectingMentor(null)}>
          <DialogContent className="max-w-2xl bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Mentor Dossier: {inspectingMentor.user?.name}</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  {inspectingMentor.user?.mentorIdentity?.mentorId || inspectingMentor.user?.tsIdentity?.tsId || 'TS-MNT-ACTIVE'}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Official Email</span>
                  <span className="text-slate-200 font-bold">{inspectingMentor.user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Title &amp; Company</span>
                  <span className="text-slate-200 font-bold">{inspectingMentor.title} • {inspectingMentor.company}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Expertise</span>
                  <span className="text-emerald-400 font-bold">{inspectingMentor.expertise}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Office Hours</span>
                  <span className="text-slate-200 font-bold">{inspectingMentor.officeHours || 'Not specified'}</span>
                </div>
              </div>

              {/* Assigned Batches */}
              <div className="space-y-2">
                <span className="text-slate-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Assigned Cohorts &amp; Batches ({inspectingMentor.batches?.length || 0})
                </span>
                {(!inspectingMentor.batches || inspectingMentor.batches.length === 0) ? (
                  <p className="text-slate-500 text-[11px] p-3 rounded-lg bg-slate-900/60 border border-slate-800">No batches currently assigned to this mentor.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {inspectingMentor.batches.map((b: any) => (
                      <div key={b.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-cyan-400 font-bold mr-2">{b.batchCode}</span>
                          <span className="text-white">{b.title}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{b.sessions?.length || 0} Sessions</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Taught Courses */}
              <div className="space-y-2">
                <span className="text-slate-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Course Curriculum ({inspectingMentor.courses?.length || 0})
                </span>
                {(!inspectingMentor.courses || inspectingMentor.courses.length === 0) ? (
                  <p className="text-slate-500 text-[11px] p-3 rounded-lg bg-slate-900/60 border border-slate-800">No courses linked.</p>
                ) : (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {inspectingMentor.courses.map((c: any) => (
                      <div key={c.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-white">{c.title}</span>
                        <span className="text-emerald-400 font-bold">{c.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setInspectingMentor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── PROVISION NEW MENTOR DIALOG ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Provision Academic Mentor &amp; Atomic ID
            </DialogTitle>
          </DialogHeader>

          {createdInviteInfo ? (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Mentor Account Created!</span>
                </div>
                <div className="text-xs text-slate-300">
                  Assigned Mentor ID: <strong className="text-emerald-400 text-sm font-bold">{createdInviteInfo.mentorId}</strong>
                </div>
                {createdInviteInfo.inviteToken && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-1">
                    <span className="text-slate-400 block font-bold">Secure Activation Token:</span>
                    <span className="text-slate-200 break-all select-all font-mono">{createdInviteInfo.inviteToken}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setCreatedInviteInfo(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateMentor} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Mentor Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. Alex Mercer"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Official Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. alex.mercer@threadsecurity.in"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Designation / Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Principal Security Architect"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Organization</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Thread Security"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Expertise Areas</label>
                <input
                  type="text"
                  name="expertise"
                  placeholder="e.g. VAPT, Cloud Security, Red Teaming"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Faculty Biography</label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="Brief background in cybersecurity..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
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
          <DialogContent className="max-w-lg bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                Edit Faculty Details: {editingMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateMentor} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMentor.user?.name}
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingMentor.title}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Company</label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={editingMentor.company}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Expertise</label>
                <input
                  type="text"
                  name="expertise"
                  defaultValue={editingMentor.expertise}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Faculty Bio</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingMentor.bio}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMentor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── SCHEDULE / OFFICE HOURS DIALOG ── */}
      {scheduleMentor && (
        <Dialog open={!!scheduleMentor} onOpenChange={(open) => !open && setScheduleMentor(null)}>
          <DialogContent className="max-w-md bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Faculty Availability: {scheduleMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveSchedule} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Weekly Teaching Window *</label>
                <input
                  type="text"
                  name="officeHours"
                  defaultValue={scheduleMentor.officeHours || 'Mon / Wed / Fri • 7:00 PM - 9:00 PM IST'}
                  required
                  placeholder="e.g. Tue & Thu • 6:30 PM - 8:30 PM IST"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleMentor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {loading ? 'Saving...' : 'Save Availability'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── DIRECT NOTICE MODAL ── */}
      {messagingMentor && (
        <Dialog open={!!messagingMentor} onOpenChange={(open) => !open && setMessagingMentor(null)}>
          <DialogContent className="max-w-md bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                Administrative Notice to {messagingMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSendMessage} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Notice Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Cohort Attendance Verification Required"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Message Details *</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="e.g. Please verify attendance submission for Batch Cyber Alpha by 8 PM..."
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMessagingMentor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {loading ? 'Sending...' : 'Dispatch Notice'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
