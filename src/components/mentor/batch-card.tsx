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
    <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group text-slate-900">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-violet-50 text-violet-700 border border-violet-200 font-mono text-[10px] tracking-wider font-semibold">
            {batch.batchCode}
          </Badge>
          <Badge
            variant="outline"
            className={`font-mono text-[10px] ${
              batch.status === 'ACTIVE'
                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                : 'border-slate-200 text-slate-500 bg-slate-50'
            }`}
          >
            {batch.status}
          </Badge>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-snug font-sans">
            {batch.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-1.5 truncate">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {batch.course?.title || 'Cybersecurity Curriculum'}
          </p>
        </div>

        {/* Key Batch Metrics */}
        <div className="grid grid-cols-2 gap-2.5 py-2.5 border-y border-slate-100 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3 text-violet-600" /> Students
            </span>
            <strong className="text-slate-900 text-sm block">{studentsCount} Enrolled</strong>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-violet-600" /> Attendance
            </span>
            <strong className="text-slate-900 text-sm block">{attendancePercent}% Avg</strong>
          </div>
        </div>

        {/* Progress Visualizer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Module Conduction</span>
            <span className="text-violet-700 font-bold">{moduleCompletionPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.max(5, moduleCompletionPercent)}%` }}
            />
          </div>
        </div>

        {batch.schedule && (
          <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 pt-1 truncate">
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
            className="w-full bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border-violet-200 hover:border-violet-600 font-mono text-xs font-bold justify-between group-hover:bg-violet-600 group-hover:text-white transition-all shadow-xs cursor-pointer"
          >
            <span>Enter Batch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
