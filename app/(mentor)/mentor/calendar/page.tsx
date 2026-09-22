import { getSession } from '@/lib/auth/session';
import { getMentorCalendarService, getMentorBatchesService } from '@/server/services/batch.service';
import { CalendarClient } from './calendar-client';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';

export const revalidate = 0;

export default async function MentorCalendarPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  const [events, batches] = await Promise.all([
    getMentorCalendarService(userId),
    getMentorBatchesService(userId),
  ]);

  const batchesMap: Record<string, any> = {};
  batches.forEach((b: any) => {
    batchesMap[b.id] = b;
  });

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
              SCHEDULE CONDUCTION TIMELINE
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2.5 mt-1">
            <CalendarIcon className="w-7 h-7 text-[#C6FF34]" />
            Faculty Academic Calendar
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            Unified chronological schedule of lecture sessions, attendance locking deadlines, and curriculum deliveries across your assigned cohorts.
          </p>
        </div>
      </div>

      <CalendarClient events={events} batchesMap={batchesMap} />
    </div>
  );
}
