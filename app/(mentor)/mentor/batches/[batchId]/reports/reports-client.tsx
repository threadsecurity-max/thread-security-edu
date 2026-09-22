'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Users,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export interface ReportsClientProps {
  batch: any;
  metrics: any;
}

export function ReportsClient({ batch, metrics }: ReportsClientProps) {
  const students = batch.students || [];
  const sessions = batch.sessions || [];

  // Export Attendance CSV
  const handleExportAttendanceCsv = () => {
    const headers = ['TS-ID', 'Student Name', 'Email', 'Total Sessions', 'Attended', 'Attendance %', 'Status'];
    const rows = students.map((st: any) => {
      const records = st.attendanceRecords || [];
      const presentCount = records.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const totalSessions = sessions.length || 1;
      const attPercent = Math.round((presentCount / totalSessions) * 100);
      const status = attPercent >= 75 ? 'GOOD' : 'ATTENDANCE_WARNING';

      return [
        st.user?.tsIdentity?.tsId || 'TS-STUDENT',
        `"${st.user?.name || ''}"`,
        st.user?.email || '',
        totalSessions,
        presentCount,
        `${attPercent}%`,
        status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${batch.batchCode}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Progress CSV
  const handleExportProgressCsv = () => {
    const headers = ['TS-ID', 'Student Name', 'Email', 'Completed Lessons', 'Progress %', 'Academic Standing'];
    const totalLessons = (batch.course?.modules || []).reduce(
      (acc: number, m: any) => acc + (m.lessons?.length || 0),
      0
    ) || 1;

    const rows = students.map((st: any) => {
      const completedCount = st.user?.progress?.filter((p: any) => p.isCompleted)?.length || 0;
      const progPercent = Math.round((completedCount / totalLessons) * 100);
      const standing = progPercent >= 50 ? 'SATISFACTORY' : 'NEEDS_ATTENTION';

      return [
        st.user?.tsIdentity?.tsId || 'TS-STUDENT',
        `"${st.user?.name || ''}"`,
        st.user?.email || '',
        completedCount,
        `${progPercent}%`,
        standing,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${batch.batchCode}_Progress_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C6FF34]" />
            Batch Academic Reports & Data Export
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Export official attendance ledgers and student learning progress for <strong className="text-white">{batch.batchCode}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-white/10 hover:bg-white/15 text-white font-mono text-xs gap-1.5 border border-white/15"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Report Card */}
        <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#C6FF34]" />
              <h3 className="text-base font-bold text-white font-sans">
                Official Attendance Ledger Report
              </h3>
            </div>
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] font-mono text-[10px]">
              {metrics.averageAttendance}% Batch Rate
            </Badge>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Detailed breakdown of classroom presence, excused absences, and total attendance rates per student across all {sessions.length} recorded sessions.
          </p>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Total Enrolled:</span>
              <strong className="text-white">{students.length} Students</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Meeting 75% Requirement:</span>
              <strong className="text-emerald-400">
                {students.filter((st: any) => {
                  const present = (st.attendanceRecords || []).filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
                  return Math.round((present / (sessions.length || 1)) * 100) >= 75;
                }).length} Students
              </strong>
            </div>
          </div>

          <Button
            onClick={handleExportAttendanceCsv}
            className="w-full bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-2 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Attendance CSV
          </Button>
        </div>

        {/* Progress & Mastery Report Card */}
        <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C6FF34]" />
              <h3 className="text-base font-bold text-white font-sans">
                Student Learning Mastery Report
              </h3>
            </div>
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] font-mono text-[10px]">
              {metrics.averageStudentLearning}% Average
            </Badge>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Evaluates individual curriculum lesson completion and assessment passing rates. Identifies students requiring remediation.
          </p>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Module Delivery Conduction:</span>
              <strong className="text-white">{metrics.moduleDeliveryPercent}%</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Completed Sessions:</span>
              <strong className="text-emerald-400">{metrics.completedSessions} Sessions</strong>
            </div>
          </div>

          <Button
            onClick={handleExportProgressCsv}
            className="w-full bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-2 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Progress CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
