import { getSession } from '@/lib/auth/session';
import { getMentorCalendarService, getMentorBatchesService } from '@/server/services/batch.service';
import { CalendarClient } from './calendar-client';
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
    <div className="space-y-6 text-slate-900 font-sans max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <CalendarIcon className="w-3.5 h-3.5" />
            Faculty Schedule & Cohorts
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Academic Calendar & Timetable
          </h1>
          <p className="text-sm text-slate-500">
            View upcoming lecture sessions, cohort class timings, and attendance completion windows across your assigned batches.
          </p>
        </div>
      </div>

      <CalendarClient events={events} batchesMap={batchesMap} />
    </div>
  );
}
