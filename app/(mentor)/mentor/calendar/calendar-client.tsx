'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { QuickAttendanceModal } from '@/components/mentor/quick-attendance-modal';

export interface CalendarClientProps {
  events: any[];
  batchesMap: Record<string, any>;
}

export function CalendarClient({ events, batchesMap }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<any | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterType === 'ALL') return true;
      if (filterType === 'PENDING') return !e.isMarked;
      if (filterType === 'COMPLETED') return e.status === 'COMPLETED';
      if (filterType === 'LOCKED') return e.isLocked;
      return true;
    });
  }, [events, filterType]);

  // Group events by day of current month
  const eventsByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = [];
    }

    filteredEvents.forEach((ev) => {
      const evDate = new Date(ev.date);
      if (evDate.getFullYear() === year && evDate.getMonth() === month) {
        const day = evDate.getDate();
        if (map[day]) {
          map[day].push(ev);
        }
      }
    });

    return map;
  }, [filteredEvents, year, month, daysInMonth]);

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 font-sans">
      {/* Calendar Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToday}
              className="h-8 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg cursor-pointer"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {monthName} {year}
          </h2>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'PENDING', label: 'Attendance Pending' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'LOCKED', label: 'Locked' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-white text-violet-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Month Calendar Grid */}
      <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs p-4 sm:p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-200">
          {weekDayLabels.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-3">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] p-2 rounded-xl bg-slate-50/50" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = eventsByDay[dayNum] || [];
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-violet-50/60 border-violet-300 ring-2 ring-violet-500/20 shadow-xs'
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                      isToday
                        ? 'bg-violet-600 text-white font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-semibold text-violet-700">
                      {dayEvents.length} {dayEvents.length === 1 ? 'class' : 'classes'}
                    </span>
                  )}
                </div>

                {/* Event Tags */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px] scrollbar-none">
                  {dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full text-left p-1.5 rounded-lg bg-violet-50/70 hover:bg-violet-100 text-[11px] truncate block border border-violet-200/50 transition-all cursor-pointer group"
                    >
                      <span className="text-violet-700 font-semibold">[{ev.batchCode}]</span>{' '}
                      <span className="text-slate-700 group-hover:text-slate-900 font-medium">{ev.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={true} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl md:rounded-3xl shadow-xl font-sans">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs font-semibold">
                  {selectedEvent.batchCode}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    selectedEvent.isLocked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {selectedEvent.isLocked ? '🔒 Attendance Locked' : '● Open for Attendance'}
                </Badge>
              </div>

              <DialogTitle className="text-lg font-bold text-slate-900 mt-2">
                {selectedEvent.title}
              </DialogTitle>

              <p className="text-xs text-slate-500">
                Batch: <strong className="text-slate-800">{selectedEvent.batchTitle}</strong>
              </p>
            </DialogHeader>

            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Date & Time:</span>
                <strong className="text-slate-900 font-semibold">
                  {new Date(selectedEvent.date).toLocaleString([], {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Curriculum Module:</span>
                <strong className="text-slate-800 font-semibold">{selectedEvent.moduleTitle}</strong>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Duration:</span>
                <strong className="text-slate-800 font-semibold">{selectedEvent.durationMins} Minutes</strong>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Attendance Logged:</span>
                <strong className={selectedEvent.isMarked ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {selectedEvent.isMarked ? `✓ Marked (${selectedEvent.presentCount} present)` : '● Unmarked'}
                </strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link href={`/mentor/batches/${selectedEvent.batchId}`}>
                <Button size="sm" variant="outline" className="border-slate-200 text-xs text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer">
                  Open Batch <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={() => {
                  setSelectedEventForAttendance(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium gap-1.5 shadow-xs rounded-xl cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Attendance
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Attendance Modal triggered from Calendar */}
      {selectedEventForAttendance && (
        <QuickAttendanceModal
          isOpen={true}
          onClose={() => setSelectedEventForAttendance(null)}
          session={selectedEventForAttendance}
          batch={batchesMap[selectedEventForAttendance.batchId] || { id: selectedEventForAttendance.batchId, batchCode: selectedEventForAttendance.batchCode }}
          onSuccess={() => setSelectedEventForAttendance(null)}
        />
      )}
    </div>
  );
}

