'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import {
  createMentorAction,
  updateMentorAction,
  deleteMentorAction,
} from '@/features/admin/actions/admin.actions';
import { sendDirectMentorMessageAction } from '@/features/notifications/actions/notification.actions';

export function MentorDirectoryClient({ mentors }: { mentors: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [messagingMentor, setMessagingMentor] = useState<any | null>(null);
  const [scheduleMentor, setScheduleMentor] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleCreateMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createMentorAction(formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('✓ New Academic Mentor Account created and provisioned successfully!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setIsAddOpen(false);
      }, 1500);
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
      }, 1500);
    } else {
      setFeedbackMsg(res.error || 'Failed to update mentor.');
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
      setFeedbackMsg(`✓ Direct notice sent to mentor ${messagingMentor.user?.name || ''}!`);
      setTimeout(() => {
        setFeedbackMsg(null);
        setMessagingMentor(null);
      }, 1500);
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
    const officeHours = (formData.get('officeHours') as string) || '';

    const res = await updateMentorAction(scheduleMentor.id, formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg('✓ Faculty availability schedule saved & drafted to batch timetable!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setScheduleMentor(null);
      }, 1500);
    } else {
      setFeedbackMsg(res.error || 'Failed to save schedule.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-red-950/30 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)]">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            Faculty Roster & Mentor Network ({mentors.length})
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage academic mentors, update faculty bios, assign batch schedules, and send direct one-way notices.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.3)] border border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Mentor Account</span>
        </button>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((m) => {
          const taughtCoursesCount = m.courses?.length || 0;
          const assignedMenteesCount = m.students?.length || 0;

          return (
            <Card
              key={m.id}
              className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white hover:border-red-500/40 transition-all rounded-2xl flex flex-col justify-between shadow-[0_4px_25px_rgba(220,38,38,0.05)]"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
                        {m.user?.name ? m.user.name[0] : 'M'}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold font-sans text-white">
                          {m.user?.name || 'Mentor'}
                        </CardTitle>
                        <span className="text-[11px] text-red-300 font-mono block">
                          {m.user?.email}
                        </span>
                      </div>
                    </div>

                    <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px]">
                      INSTRUCTOR
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Title & Org:</span>
                      <strong className="text-white text-right truncate max-w-[170px]">
                        {m.title || 'Security Lead'} ({m.company || 'ThreadSec'})
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expertise:</span>
                      <span className="text-red-300 font-bold truncate max-w-[170px]">
                        {m.expertise || 'VAPT, Cyber Security'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Schedule / Availability:</span>
                      <span className="text-slate-300 text-[10px] truncate max-w-[170px]">
                        {m.officeHours || 'Mon/Wed/Fri 7-9 PM'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-slate-400 block uppercase">Courses</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{taughtCoursesCount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-slate-400 block uppercase">Assigned Mentees</span>
                      <span className="text-sm font-bold text-red-300 block mt-0.5">{assignedMenteesCount}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-red-500/10 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  onClick={() => setMessagingMentor(m)}
                  className="px-3 py-1.5 rounded-full bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Send Direct One-Way Message from Admin to Mentor"
                >
                  <Send className="w-3 h-3 text-red-400" />
                  <span>Send Notice</span>
                </button>

                <button
                  onClick={() => setScheduleMentor(m)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Manage Faculty Availability & Draft to Batch Timetable"
                >
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Schedule</span>
                </button>

                <button
                  onClick={() => setEditingMentor(m)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Edit Mentor Profile"
                >
                  <Edit3 className="w-3 h-3 text-slate-400" />
                  <span>Edit</span>
                </button>

                <form
                  action={async () => {
                    await deleteMentorAction(m.id);
                  }}
                  className="inline-block"
                >
                  <button
                    type="submit"
                    className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer transition-all active:scale-95"
                    title="Remove Mentor Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ➕ ADD NEW MENTOR DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 font-sans">
          <DialogHeader className="border-b border-red-500/20 pb-3">
            <DialogTitle className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-400" />
              Provision New Academic Mentor Account
            </DialogTitle>
          </DialogHeader>

          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
              {feedbackMsg}
            </div>
          )}

          <form onSubmit={handleCreateMentor} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-bold mb-1">MENTOR FULL NAME *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Dr. Alex Mercer"
                required
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">EMAIL ADDRESS *</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. alex.mercer@threadsecurity.org"
                required
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">PROFESSIONAL TITLE</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Principal Lead"
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">COMPANY / ORG</label>
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. Thread Security"
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">EXPERTISE AREAS</label>
              <input
                type="text"
                name="expertise"
                placeholder="e.g. VAPT, Cloud Security, Red Teaming"
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">FACULTY BIO</label>
              <textarea
                name="bio"
                rows={2}
                placeholder="e.g. 10+ years experience in VAPT and threat hunting."
                className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-red-500/20">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(220,38,38,0.3)]"
              >
                {loading ? 'Provisioning...' : 'Provision Mentor'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✏️ EDIT MENTOR DIALOG */}
      {editingMentor && (
        <Dialog open={!!editingMentor} onOpenChange={(open) => !open && setEditingMentor(null)}>
          <DialogContent className="max-w-lg bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <DialogTitle className="text-lg font-bold font-mono text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-400" />
                Edit Faculty Profile: {editingMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleUpdateMentor} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">MENTOR NAME</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMentor.user?.name}
                  required
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">TITLE</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingMentor.title}
                    className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">COMPANY</label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={editingMentor.company}
                    className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">EXPERTISE</label>
                <input
                  type="text"
                  name="expertise"
                  defaultValue={editingMentor.expertise}
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">FACULTY BIO</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingMentor.bio}
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-red-500/20">
                <button
                  type="button"
                  onClick={() => setEditingMentor(null)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 📩 DIRECT ONE-WAY MESSAGE TO MENTOR DIALOG */}
      {messagingMentor && (
        <Dialog open={!!messagingMentor} onOpenChange={(open) => !open && setMessagingMentor(null)}>
          <DialogContent className="max-w-md bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <DialogTitle className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-red-400" />
                Direct One-Way Notice to {messagingMentor.user?.name}
              </DialogTitle>
            </DialogHeader>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">NOTICE TITLE *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Schedule Update & Cohort Attendance Review"
                  required
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">MESSAGE CONTENT *</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="e.g. Please submit lab evaluation reports for Cohort Alpha by Friday 6 PM."
                  required
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-red-500/20">
                <button
                  type="button"
                  onClick={() => setMessagingMentor(null)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                >
                  {loading ? 'Sending...' : 'Send Notice'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 📅 FACULTY SCHEDULE & TIMETABLE DRAFTING DIALOG */}
      {scheduleMentor && (
        <Dialog open={!!scheduleMentor} onOpenChange={(open) => !open && setScheduleMentor(null)}>
          <DialogContent className="max-w-md bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <DialogTitle className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-400" />
                Faculty Schedule & Batch Timetable Drafting
              </DialogTitle>
            </DialogHeader>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleSaveSchedule} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  FACULTY AVAILABILITY / OFFICE HOURS *
                </label>
                <input
                  type="text"
                  name="officeHours"
                  defaultValue={scheduleMentor.officeHours || 'Mon / Wed / Fri • 7:00 PM - 9:00 PM IST'}
                  required
                  placeholder="e.g. Tue & Thu • 6:30 PM - 8:30 PM IST"
                  className="w-full bg-black/50 border border-red-500/30 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-white block">Auto-Draft Timetable Sync:</span>
                <p>
                  Saving this schedule will automatically draft the availability slots into all academic batches assigned to <strong>{scheduleMentor.user?.name}</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-red-500/20">
                <button
                  type="button"
                  onClick={() => setScheduleMentor(null)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(220,38,38,0.3)]"
                >
                  {loading ? 'Drafting...' : 'Save & Draft to Timetable'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
