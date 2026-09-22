'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { recordLectureAction } from '@/features/mentor/actions/mentor-workspace.actions';

export interface RecordLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any | null;
  batchId: string;
  modules?: any[];
  onSuccess?: () => void;
}

export function RecordLectureModal({
  isOpen,
  onClose,
  session,
  batchId,
  modules = [],
  onSuccess,
}: RecordLectureModalProps) {
  const [status, setStatus] = useState<'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'>(
    session?.status || 'COMPLETED'
  );
  const [topicsCovered, setTopicsCovered] = useState(session?.topicsCovered || '');
  const [importantNotes, setImportantNotes] = useState(session?.importantNotes || '');
  const [homework, setHomework] = useState(session?.homework || '');
  const [moduleId, setModuleId] = useState(session?.moduleId || '');
  const [durationMins, setDurationMins] = useState(session?.durationMins || 120);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await recordLectureAction(session.id, batchId, {
      status,
      topicsCovered,
      importantNotes,
      homework,
      moduleId: moduleId || undefined,
      durationMins: Number(durationMins),
    });

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to save lecture record.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
                SESSION {session.sessionNumber}
              </Badge>
              <DialogTitle className="text-lg font-mono font-bold text-white">
                Record Concluded Lecture
              </DialogTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] text-slate-400">
              {new Date(session.sessionDate).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lecture: <strong className="text-slate-200">{session.title}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Conduction Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-[#C6FF34] outline-none"
              >
                <option value="COMPLETED" className="bg-[#04111C]">Completed (Recorded & Published)</option>
                <option value="LIVE" className="bg-[#04111C]">Live Session In Progress</option>
                <option value="SCHEDULED" className="bg-[#04111C]">Scheduled / Upcoming</option>
                <option value="CANCELLED" className="bg-[#04111C]">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Mapped Module
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-[#C6FF34] outline-none"
              >
                <option value="" className="bg-[#04111C]">-- Select Curriculum Module --</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#04111C]">
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Topics Covered in Lecture *
            </label>
            <Textarea
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="e.g. • Port scanning with Nmap SYN stealth scan&#10;• Service banner grabbing & OS fingerprinting&#10;• NSE script vulnerability exploitation"
              rows={3}
              className="bg-white/5 border-white/10 text-white text-xs font-mono focus:border-[#C6FF34]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Important Teaching Notes & Key Takeaways
            </label>
            <Textarea
              value={importantNotes}
              onChange={(e) => setImportantNotes(e.target.value)}
              placeholder="Notes, key concepts, or warnings shared with the students..."
              rows={2}
              className="bg-white/5 border-white/10 text-white text-xs font-mono focus:border-[#C6FF34]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Homework / Lab Assignment for Students
            </label>
            <Input
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="e.g. Complete Lab 02 on Blind SQL Injection before Friday"
              className="bg-white/5 border-white/10 text-white text-xs font-mono focus:border-[#C6FF34]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-slate-200 font-mono text-xs font-bold gap-2 shadow-md transition-all"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {loading ? 'Saving Record...' : 'Save & Publish Lecture Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
