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
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit3,
  Sparkles,
  Save,
  MessageSquare,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  createBatchSessionAction,
  markBatchAttendanceAction,
} from '@/features/batch/actions/batch.actions';

export function MentorBatchAttendanceClient({
  batches,
}: {
  batches: any[];
}) {
  const [selectedBatch, setSelectedBatch] = useState<any>(batches[0] || null);
  const [activeSessionToMark, setActiveSessionToMark] = useState<any | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  // Form state for marking attendance
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const openAttendanceModal = (session: any) => {
    setActiveSessionToMark(session);
    setSaveSuccessMsg(false);

    // Prepopulate existing records or default to PRESENT
    const initial: Record<string, { status: any; remarks: string }> = {};
    const students = selectedBatch?.students || [];

    for (const st of students) {
      const existing = session.attendanceRecords?.find((r: any) => r.studentId === st.id);
      initial[st.id] = {
        status: existing?.status || 'PRESENT',
        remarks: existing?.remarks || '',
      };
    }

    setAttendanceRecords(initial);
  };

  const handleStatusChange = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  ) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, any> = {};
    for (const stId of Object.keys(attendanceRecords)) {
      updated[stId] = {
        ...attendanceRecords[stId],
        status,
      };
    }
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (!activeSessionToMark) return;
    setIsSaving(true);

    const payload = Object.entries(attendanceRecords).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
    }));

    const res = await markBatchAttendanceAction(activeSessionToMark.id, payload);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccessMsg(true);
      setTimeout(() => {
        setActiveSessionToMark(null);
      }, 1200);
    }
  };

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.set('batchId', selectedBatch.id);

    await createBatchSessionAction(formData);
    setIsSaving(false);
    setIsNewSessionModalOpen(false);
  };

  if (!selectedBatch) {
    return (
      <Card className="p-8 text-center bg-[#0d0d0d] border border-white/10">
        <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No active batches assigned to your faculty profile.</p>
      </Card>
    );
  }

  const batchStudents = selectedBatch.students || [];
  const batchSessions = selectedBatch.sessions || [];

  return (
    <div className="space-y-6">
      {/* Batch Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-white/10">
        {batches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBatch(b)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedBatch.id === b.id
                ? 'bg-white text-black shadow-md'
                : 'bg-[#141414] text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C6FF34]" />
            <span>{b.batchCode}</span>
            <span className="text-[10px] text-slate-400">({b.students?.length || 0} Students)</span>
          </button>
        ))}
      </div>

      {/* Active Batch Summary Banner */}
      <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[#C6FF34] border-[#C6FF34]/30 bg-[#C6FF34]/10 font-mono text-[10px]">
              {selectedBatch.batchCode}
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
              {selectedBatch.status}
            </Badge>
          </div>
          <h3 className="text-base font-bold font-sans text-white">
            {selectedBatch.title}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            📅 {selectedBatch.schedule || 'Regular Cohort'} • Course: {selectedBatch.course?.title || 'Cyber Defense Track'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="gap-2 font-mono text-xs font-bold bg-white hover:bg-slate-200 text-black shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            Conduct New Session
          </Button>
        </div>
      </div>

      {/* Main Grid: Student Roster vs. Conducted Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Segregated Student Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C6FF34]" />
              Batch Students Roster ({batchStudents.length})
            </h4>
            <span className="text-xs text-slate-400 font-mono">Segregated Cohort</span>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="p-3">TS-ID & Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Practice Hours</th>
                    <th className="p-3 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {batchStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No students assigned to this cohort yet.
                      </td>
                    </tr>
                  ) : (
                    batchStudents.map((st: any) => {
                      const totalConducted = batchSessions.length;
                      const attendedCount = (st.attendanceRecords || []).filter(
                        (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
                      ).length;
                      const rate = totalConducted > 0 ? Math.round((attendedCount / totalConducted) * 100) : 100;

                      return (
                        <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-white block">
                              {st.user?.name || 'Student'}
                            </span>
                            <span className="font-mono text-[10px] text-[#C6FF34]">
                              {st.user?.tsIdentity?.tsId || 'TS-STUDENT'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px] font-mono">
                            {st.user?.email}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-300">
                            {st.totalHours || 0} hrs
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`font-mono font-bold text-xs ${
                                rate >= 80
                                  ? 'text-[#C6FF34]'
                                  : rate >= 60
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sessions & Explicit Attendance Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C6FF34]" />
              Conducted Sessions ({batchSessions.length})
            </h4>
            <span className="text-xs text-slate-400 font-mono">Explicit Attendance</span>
          </div>

          <div className="space-y-3">
            {batchSessions.length === 0 ? (
              <Card className="p-6 text-center bg-[#0d0d0d] border border-white/10">
                <p className="text-xs text-slate-400">No sessions recorded yet for this batch.</p>
                <Button
                  size="sm"
                  onClick={() => setIsNewSessionModalOpen(true)}
                  className="mt-3 text-xs gap-1 font-mono bg-white hover:bg-slate-200 text-black font-bold"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> Conduct Session 1
                </Button>
              </Card>
            ) : (
              batchSessions.map((session: any) => {
                const totalRecords = session.attendanceRecords?.length || 0;
                const presentRecords = (session.attendanceRecords || []).filter(
                  (r: any) => r.status === 'PRESENT' || r.status === 'LATE'
                ).length;

                return (
                  <Card
                    key={session.id}
                    className="p-4 bg-[#0d0d0d] border border-white/10 shadow-sm hover:border-[#C6FF34]/40 transition-all rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs text-[#C6FF34]">
                            Session #{session.sessionNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(session.sessionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-white font-sans">
                          {session.title}
                        </h5>
                        {session.agenda && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {session.agenda}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                          <span>
                            Attendance: <strong className="text-white">{presentRecords} / {batchStudents.length} Present</strong>
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => openAttendanceModal(session)}
                        className="text-xs font-mono h-8 gap-1.5 shrink-0 bg-white hover:bg-slate-200 text-black font-bold shadow-sm"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-600" />
                        Mark Attendance
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 📝 CONDUCT NEW SESSION MODAL */}
      <Dialog open={isNewSessionModalOpen} onOpenChange={setIsNewSessionModalOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-sans text-white">
              Conduct Live Session for {selectedBatch.batchCode}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Session Topic / Title *</label>
              <Input
                name="title"
                placeholder="e.g. Session 3: Enterprise Threat Defense & Forensics"
                required
                className="text-xs bg-[#141414] border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Session Date *</label>
                <Input type="date" name="sessionDate" required className="text-xs bg-[#141414] border-white/10 text-white" />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Duration (Mins)</label>
                <Input type="number" name="durationMins" defaultValue="120" className="text-xs bg-[#141414] border-white/10 text-white" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Agenda / Lab Details</label>
              <textarea
                name="agenda"
                rows={2}
                placeholder="Key lab milestones and topics covered..."
                className="w-full p-2.5 rounded-lg border border-white/10 bg-[#141414] text-white text-xs focus:outline-none focus:border-[#C6FF34]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewSessionModalOpen(false)}
                className="border-white/10 text-slate-300"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving} className="bg-white hover:bg-slate-200 text-black font-bold">
                {isSaving ? 'Creating...' : 'Schedule & Start'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 📊 EXPLICIT ATTENDANCE MARKING MODAL */}
      {activeSessionToMark && (
        <Dialog
          open={!!activeSessionToMark}
          onOpenChange={(open) => !open && setActiveSessionToMark(null)}
        >
          <DialogContent className="max-w-3xl bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl max-h-[88vh] flex flex-col">
            <DialogHeader className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] mb-1">
                    {selectedBatch.batchCode} • Session #{activeSessionToMark.sessionNumber}
                  </Badge>
                  <DialogTitle className="text-lg font-bold font-sans text-white">
                    Explicit Session Attendance & Remarks
                  </DialogTitle>
                  <span className="text-xs text-slate-400 block font-sans">
                    {activeSessionToMark.title} ({new Date(activeSessionToMark.sessionDate).toLocaleDateString()})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAll('PRESENT')}
                    className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 h-7"
                  >
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAll('ABSENT')}
                    className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 h-7"
                  >
                    Mark All Absent
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {saveSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                Attendance & mentor remarks successfully logged into immutable ledger!
              </div>
            )}

            <div className="py-3 flex-1 overflow-y-auto space-y-3">
              {batchStudents.map((st: any) => {
                const currentStatus = attendanceRecords[st.id]?.status || 'PRESENT';
                const currentRemarks = attendanceRecords[st.id]?.remarks || '';
                const tsId = st.user?.tsIdentity?.tsId || 'TS-STUDENT';

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-xl border border-white/10 bg-[#121212] hover:bg-[#161616] space-y-2.5 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {st.user?.name || 'Student'}
                          </span>
                          <span className="font-mono text-[10px] text-[#C6FF34] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                            {tsId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                          {st.user?.email}
                        </span>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1">
                        {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const).map((stat) => (
                          <button
                            key={stat}
                            type="button"
                            onClick={() => handleStatusChange(st.id, stat)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                              currentStatus === stat
                                ? stat === 'PRESENT'
                                  ? 'bg-emerald-600 text-white'
                                  : stat === 'LATE'
                                  ? 'bg-amber-500 text-white'
                                  : stat === 'ABSENT'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-700 text-white'
                                : 'bg-[#181818] text-slate-400 border border-white/10 hover:text-white'
                            }`}
                          >
                            {stat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Explicit Mentor Remarks */}
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <Input
                        value={currentRemarks}
                        onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                        placeholder="Mentor notes / student activity progress during session..."
                        className="text-xs bg-[#181818] border-white/10 text-white h-7"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400 font-mono">
                Changes take effect immediately on student dashboards.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSessionToMark(null)}
                  className="border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSaveAttendance}
                  className="gap-1.5 text-xs font-mono font-bold bg-white hover:bg-slate-200 text-black shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  {isSaving ? 'Saving...' : 'Save & Publish Attendance'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
