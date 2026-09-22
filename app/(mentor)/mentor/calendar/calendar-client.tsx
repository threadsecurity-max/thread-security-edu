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
    <div className="space-y-6">
      {/* Calendar Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToday}
              className="h-8 px-2.5 text-xs font-mono text-slate-200 hover:text-white"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl font-bold text-white font-mono">
            {monthName} {year}
          </h2>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'PENDING', label: 'Attendance Pending' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'LOCKED', label: 'Locked' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Month Calendar Grid */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl p-4 sm:p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-white/10">
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
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl bg-white/[0.01]" />
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
                className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl border flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-[#C6FF34]/5 border-[#C6FF34]/40 shadow-inner'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-lg ${
                      isToday
                        ? 'bg-white text-black'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-mono text-[#C6FF34]">
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
                      className="w-full text-left p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono truncate block border border-white/5 transition-all cursor-pointer"
                    >
                      <span className="text-[#C6FF34] font-bold">[{ev.batchCode}]</span>{' '}
                      <span className="text-slate-200">{ev.title}</span>
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
          <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl shadow-2xl font-mono">
            <DialogHeader className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] text-[10px]">
                  {selectedEvent.batchCode}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    selectedEvent.isLocked ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {selectedEvent.isLocked ? '🔒 Attendance Locked' : '● Editable Window'}
                </Badge>
              </div>

              <DialogTitle className="text-base font-bold text-white mt-1">
                {selectedEvent.title}
              </DialogTitle>

              <p className="text-xs text-slate-400">
                Batch: <strong className="text-white">{selectedEvent.batchTitle}</strong>
              </p>
            </DialogHeader>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Date & Time:</span>
                <strong className="text-white">
                  {new Date(selectedEvent.date).toLocaleString([], {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Curriculum Module:</span>
                <strong className="text-slate-200">{selectedEvent.moduleTitle}</strong>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <strong className="text-slate-200">{selectedEvent.durationMins} Minutes</strong>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Attendance Logged:</span>
                <strong className={selectedEvent.isMarked ? 'text-emerald-400' : 'text-amber-400'}>
                  {selectedEvent.isMarked ? `✓ Marked (${selectedEvent.presentCount} present)` : '● Unmarked'}
                </strong>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <Link href={`/mentor/batches/${selectedEvent.batchId}`}>
                <Button size="sm" variant="outline" className="border-white/15 text-xs text-slate-300">
                  Open Batch <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={() => {
                  setSelectedEventForAttendance(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="bg-white hover:bg-slate-200 text-black text-xs font-bold gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
