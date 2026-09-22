import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 0;

export default async function BatchStudentsPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch } = await getBatchWorkspaceService(batchId, session?.userId || '');

  const totalSessionsCount = batch.sessions?.length || 0;

  const studentData = batch.students.map((st: any) => {
    const records = st.attendanceRecords || [];
    const presentCount = records.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const attendancePercent = totalSessionsCount > 0 ? Math.round((presentCount / totalSessionsCount) * 100) : 100;

    // Progress
    const totalLessons = (batch.course?.modules || []).reduce(
      (acc: number, m: any) => acc + (m.lessons?.length || 0),
      0
    );
    const completedLessons = st.user?.progress?.filter((p: any) => p.isCompleted)?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 55;

    // Risk indicator
    let riskTag: { label: string; color: string } = { label: 'On Track', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (attendancePercent < 75) {
      riskTag = { label: 'Attendance Below Threshold', color: 'bg-red-500/15 text-red-300 border-red-500/30' };
    } else if (progressPercent < 40) {
      riskTag = { label: 'Needs Attention', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    }

    return {
      ...st,
      attendancePercent,
      progressPercent,
      riskTag,
    };
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C6FF34]" />
            Batch Student Roster ({studentData.length})
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Isolated directory of students officially enrolled by Admin into <strong className="text-white">{batch.batchCode}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs">
            {studentData.filter((s: any) => s.attendancePercent >= 75).length} Students Meeting 75%+ Threshold
          </Badge>
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Student & TS-ID</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Attendance %</th>
                <th className="py-3.5 px-4">Module Mastery</th>
                <th className="py-3.5 px-4">Academic Risk Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {studentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    This batch currently has no enrolled students.
                  </td>
                </tr>
              ) : (
                studentData.map((st: any) => (
                  <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-sans text-sm">{st.user?.name}</div>
                      <Badge className="bg-white/10 text-slate-300 font-mono text-[9px] mt-0.5">
                        {st.user?.tsIdentity?.tsId || 'TS-STUDENT'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 truncate max-w-[200px]">
                      {st.user?.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${st.attendancePercent >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {st.attendancePercent}%
                        </span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${st.attendancePercent >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}
                            style={{ width: `${st.attendancePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#C6FF34] font-bold">{st.progressPercent}%</span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C6FF34]"
                            style={{ width: `${st.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge className={`font-mono text-[10px] border ${st.riskTag.color}`}>
                        {st.riskTag.label}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/mentor/batches/${batch.id}/students/${st.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 hover:border-white text-slate-200 hover:text-black hover:bg-white font-mono text-xs gap-1.5 transition-all"
                        >
                          View Dossier
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
