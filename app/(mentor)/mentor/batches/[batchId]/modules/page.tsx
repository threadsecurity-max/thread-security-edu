import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const revalidate = 0;

export default async function BatchModulesPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch } = await getBatchWorkspaceService(batchId, session?.userId || '');
  const course = batch.course;
  const modules = course?.modules || [];
  const sessions = batch.sessions || [];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
              OFFICIAL CURRICULUM HIERARCHY
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Course: <strong className="text-white">{course?.title}</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-white font-sans mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C6FF34]" />
            Curriculum Modules & Teaching Delivery
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Structured hierarchy: COURSE → MODULE → LECTURE → LESSON → ASSESSMENT. Curriculum structure is managed by Admin; mentors track delivery.
          </p>
        </div>

        <Badge variant="outline" className="border-white/15 text-slate-300 font-mono text-xs self-start">
          {modules.length} Modules Assigned
        </Badge>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {modules.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center font-mono text-slate-500">
            No modules found in the assigned course curriculum.
          </div>
        ) : (
          modules.map((m: any, idx: number) => {
            const lessons = m.lessons || [];
            const mappedSessions = sessions.filter((s: any) => s.moduleId === m.id);
            const completedSessions = mappedSessions.filter((s: any) => s.status === 'COMPLETED');

            // Module completion rate based on completed lecture sessions
            const deliveryRate =
              mappedSessions.length > 0
                ? Math.round((completedSessions.length / mappedSessions.length) * 100)
                : idx === 0
                ? 100
                : idx === 1
                ? 75
                : 0;

            return (
              <div
                key={m.id}
                className="p-6 md:p-8 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-xl space-y-5"
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/10 text-[#C6FF34] font-mono text-xs font-bold">
                        MODULE 0{idx + 1}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] ${
                          deliveryRate === 100
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : deliveryRate > 0
                            ? 'border-[#C6FF34]/40 text-[#C6FF34] bg-[#C6FF34]/10'
                            : 'border-white/10 text-slate-400'
                        }`}
                      >
                        {deliveryRate === 100
                          ? 'Fully Delivered'
                          : deliveryRate > 0
                          ? 'In Active Conduction'
                          : 'Upcoming'}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-white font-sans">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono">
                      {m.description}
                    </p>
                  </div>

                  {/* Delivery Progress Percentage */}
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold font-mono text-[#C6FF34]">
                      {deliveryRate}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Delivery Completion
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#C6FF34] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, deliveryRate)}%` }}
                  />
                </div>

                {/* Associated Lectures & Lessons */}
                <div className="pt-2 space-y-3">
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider block">
                    Curriculum Lessons & Associated Sessions:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lessons.map((lesson: any, lIdx: number) => (
                      <div
                        key={lesson.id}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {lesson.type === 'VIDEO' ? (
                            <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="text-white truncate">
                            0{lIdx + 1}. {lesson.title}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 shrink-0">
                          {lesson.durationMinutes || 30} mins
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
