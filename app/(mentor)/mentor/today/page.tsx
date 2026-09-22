import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getMentorBatchesService } from '@/server/services/batch.service';
import { TodayClassroomClient } from './today-classroom-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function MentorTodayPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  const batches = await getMentorBatchesService(userId);

  // Extract all sessions across assigned batches
  const allSessions: any[] = [];
  const batchesMap: Record<string, any> = {};

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  batches.forEach((b: any) => {
    batchesMap[b.id] = b;
    (b.sessions || []).forEach((s: any) => {
      allSessions.push({
        ...s,
        batch: b,
      });
    });
  });

  // Filter today's sessions, or if none scheduled today, show active sessions sorted by date
  const todaySessions = allSessions.filter((s: any) => {
    const sDate = new Date(s.sessionDate);
    return sDate >= todayStart && sDate <= todayEnd;
  });

  const displaySessions =
    todaySessions.length > 0
      ? todaySessions
      : allSessions.filter((s: any) => s.status !== 'CANCELLED').slice(0, 4);

  return (
    <div className="space-y-6 text-slate-100 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/mentor">
              <Button variant="ghost" size="sm" className="text-xs font-mono text-slate-400 hover:text-white p-0 h-auto">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
              LIVE CLASSROOM COCKPIT
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-[#C6FF34]" />
            Today's Teaching View
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}{' '}
            • Low-friction operational view for live classroom attendance & lecture records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/mentor/calendar">
            <Button variant="outline" size="sm" className="border-white/15 text-slate-300 font-mono text-xs gap-1.5 bg-white/5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Calendar View
            </Button>
          </Link>
        </div>
      </div>

      {/* Classroom Client Component */}
      <TodayClassroomClient
        todaySessions={displaySessions}
        allBatches={batches}
        batchesMap={batchesMap}
      />
    </div>
  );
}
