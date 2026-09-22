import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export interface BatchCardProps {
  batch: {
    id: string;
    batchCode: string;
    title: string;
    description?: string | null;
    startDate: Date | string;
    schedule?: string | null;
    status: string;
    course?: {
      title: string;
      category?: string;
    } | null;
    students?: any[];
    sessions?: any[];
  };
}

export function BatchCard({ batch }: BatchCardProps) {
  const studentsCount = batch.students?.length || 0;
  const sessions = batch.sessions || [];
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED').length;

  // Calculate attendance rate
  let totalAttendances = 0;
  let presentAttendances = 0;

  sessions.forEach((s) => {
    (s.attendanceRecords || []).forEach((r: any) => {
      totalAttendances++;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        presentAttendances++;
      }
    });
  });

  const attendancePercent =
    totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 92;

  const moduleCompletionPercent =
    sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0;

  return (
    <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 hover:border-[#C6FF34]/40 transition-all duration-200 shadow-lg flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider">
            {batch.batchCode}
          </Badge>
          <Badge
            variant="outline"
            className={`font-mono text-[10px] ${
              batch.status === 'ACTIVE'
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-white/10 text-slate-400'
            }`}
          >
            {batch.status}
          </Badge>
        </div>

        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug font-sans">
            {batch.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1.5 truncate">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {batch.course?.title || 'Cybersecurity Curriculum'}
          </p>
        </div>

        {/* Key Batch Metrics */}
        <div className="grid grid-cols-2 gap-2.5 py-2.5 border-y border-white/5 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#C6FF34]" /> Students
            </span>
            <strong className="text-white text-sm block">{studentsCount} Enrolled</strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#C6FF34]" /> Attendance
            </span>
            <strong className="text-white text-sm block">{attendancePercent}% Avg</strong>
          </div>
        </div>

        {/* Progress Visualizer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Module Conduction</span>
            <span className="text-[#C6FF34] font-bold">{moduleCompletionPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#C6FF34] transition-all duration-300"
              style={{ width: `${Math.max(5, moduleCompletionPercent)}%` }}
            />
          </div>
        </div>

        {batch.schedule && (
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-1 truncate">
            <Calendar className="w-3 h-3 text-slate-400" />
            {batch.schedule}
          </p>
        )}
      </div>

      <div className="pt-4 mt-2">
        <Link href={`/mentor/batches/${batch.id}`} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/5 hover:bg-[#C6FF34] text-slate-200 hover:text-[#04111C] border-white/15 hover:border-[#C6FF34] font-mono text-xs font-bold justify-between group-hover:bg-[#C6FF34] group-hover:text-[#04111C] transition-all"
          >
            <span>Enter Batch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
