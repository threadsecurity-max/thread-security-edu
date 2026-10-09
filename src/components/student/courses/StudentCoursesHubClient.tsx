'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  PlayCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Terminal,
  FileText,
  Cpu,
  UserCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Award,
} from 'lucide-react';

export interface StudentCoursesHubClientProps {
  enrollments: any[];
  otherCourses: any[];
  assessments: any[];
  attendance: {
    batch: any;
    attendancePercentage: number;
    totalSessions: number;
    presentSessions: number;
    records: any[];
  };
  initialTab?: 'courses' | 'assessments' | 'attendance';
}

export function StudentCoursesHubClient({
  enrollments,
  otherCourses,
  assessments,
  attendance,
  initialTab = 'courses',
}: StudentCoursesHubClientProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'assessments' | 'attendance'>(initialTab);

  return (
    <div className="space-y-8 text-white font-mono">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              ACADEMIC HUB
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              COHORT CURRICULUM, BENCHMARKS &amp; LEDGER
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Academic Programs &amp; Course Console
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Manage your enrolled cybersecurity tracks, track milestone benchmark assessments and scores, and verify live session attendance records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[110px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">PROGRAMS</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">{enrollments.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[110px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">ATTENDANCE</span>
            <span className="text-2xl font-extrabold text-white block mt-0.5">{attendance.attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* ── SUBNAV TABS ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090b0e] border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#C6FF34] text-black shadow-[0_2px_12px_rgba(198,255,52,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Courses ({enrollments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'assessments'
              ? 'bg-[#C6FF34] text-black shadow-[0_2px_12px_rgba(198,255,52,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Assessments &amp; Scores ({assessments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#C6FF34] text-black shadow-[0_2px_12px_rgba(198,255,52,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance Records ({attendance.attendancePercentage}%)</span>
        </button>
      </div>

      {/* ── TAB 1: MY COURSES ── */}
      {activeTab === 'courses' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
                <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-serif font-bold text-white">No active course enrollments</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                  You are not currently enrolled in any academic programs. Select an available course below to commence your training.
                </p>
              </div>
            ) : (
              enrollments.map((enr) => {
                const course = enr.course;
                const totalLessons = course.modules.reduce(
                  (acc: number, m: any) => acc + (m.lessons?.length || 0),
                  0
                );
                const progressPct = enr.progressPercent || 0;
                const firstLesson = course.modules[0]?.lessons[0];

                return (
                  <div
                    key={course.id}
                    className="p-6 rounded-3xl bg-[#0b0d12] hover:bg-[#10131a] border border-white/[0.08] hover:border-[#C6FF34]/30 transition-all backdrop-blur-xl flex flex-col justify-between space-y-5 group shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 uppercase">
                          {course.category || 'CYBERSECURITY'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">
                          {course.level || 'INTERMEDIATE'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-sans mt-1.5 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500 uppercase">Curriculum Progress</span>
                          <span className="text-[#C6FF34] font-bold">{progressPct}%</span>
                        </div>
                        <Progress value={progressPct} className="h-1.5 bg-white/10" />
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/[0.06]">
                        <span>{course.modules.length} Modules • {totalLessons} Lessons</span>
                        <span>{course.durationHours || 40}h Total</span>
                      </div>
                    </div>

                    <Link
                      href={
                        firstLesson
                          ? `/student/courses/${course.id}/learn/${firstLesson.id}`
                          : `/student/courses/${course.id}`
                      }
                      className="block pt-2"
                    >
                      <button className="w-full py-2.5 px-4 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-[0_2px_12px_rgba(198,255,52,0.2)]">
                        <span>{progressPct > 0 ? 'Continue Curriculum' : 'Start Course'}</span>
                        <PlayCircle className="w-4 h-4 fill-current" />
                      </button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Other Available Courses */}
          {otherCourses.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-xl font-serif font-bold text-white">Other Available Tracks</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {otherCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3"
                  >
                    <span className="text-[10px] text-zinc-500 uppercase">{c.category || 'Specialization'}</span>
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 font-sans">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ASSESSMENTS & SCORES ── */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          {assessments.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
              <Cpu className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-white">No assessments assigned yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                Milestone benchmarks and tests will appear here as your faculty mentor schedules them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((test) => {
                const latestAttempt = test.testAttempts?.[0] || test.attempts?.[0] || test.lastAttempt;
                const score = test.highestScore !== undefined && test.highestScore !== null
                  ? test.highestScore
                  : (latestAttempt ? (latestAttempt.percentage ?? latestAttempt.score ?? null) : null);
                const hasAttempted = score !== null || !!latestAttempt;
                const isPassed = test.status === 'Passed' || latestAttempt?.passed || (score !== null && score >= (test.passingScore || 70));
                const attemptId = latestAttempt?.id;
                const questionsCount = test.questions?.length ?? test.questionsPerAttempt ?? 0;

                return (
                  <div
                    key={test.id}
                    className="p-6 rounded-3xl bg-[#0b0d12] border border-white/[0.08] hover:border-[#C6FF34]/30 transition-all flex flex-col justify-between space-y-5 shadow-xl"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate max-w-[180px]">
                          {test.course?.title || test.courseTitle || 'Core Assessment'}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            hasAttempted
                              ? isPassed
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {hasAttempted ? (isPassed ? 'PASSED ✓' : 'FAILED') : 'PENDING'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-serif font-bold text-white leading-snug">
                          {test.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                          <span>{questionsCount} Questions</span>
                          <span>•</span>
                          <span>{test.durationMinutes || 45} mins</span>
                          <span>•</span>
                          <span>Pass: {test.passingScore || 70}%</span>
                        </div>
                      </div>

                      {/* Score Highlight Box */}
                      <div className="p-4 rounded-2xl bg-black/80 border border-white/10 space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                          Recorded Score:
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className={`text-xl font-extrabold ${score !== null ? (isPassed ? 'text-[#C6FF34]' : 'text-rose-400') : 'text-zinc-500'}`}>
                            {score !== null ? `${Math.round(score)}%` : 'Not Taken'}
                          </span>
                          {score !== null && (
                            <span className="text-xs text-zinc-400">
                              Passing Mark: {test.passingScore || 70}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={attemptId ? `/student/assessments/results/${attemptId}` : `/student/assessments/take/${test.id}`}
                      className="block pt-1"
                    >
                      <button className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-[#C6FF34] hover:text-black text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer border border-white/10">
                        <span>{hasAttempted ? 'Review Score & Answers' : 'Take Assessment'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ATTENDANCE RECORDS ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-[#0b0d12] border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 uppercase">Attendance Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#C6FF34]">
                  {attendance.attendancePercentage}%
                </span>
                <span className="text-xs text-zinc-500">
                  {attendance.attendancePercentage >= 75 ? 'ELIGIBLE' : 'ATTENTION'}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0b0d12] border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 uppercase">Sessions Attended</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {attendance.presentSessions} / {attendance.totalSessions}
                </span>
                <span className="text-xs text-zinc-500">Recorded</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0b0d12] border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 uppercase">Cohort Batch</span>
              <div className="truncate">
                <span className="text-xl font-extrabold text-white block truncate">
                  {attendance.batch?.title || 'Active Track'}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {attendance.batch?.batchCode || 'GENERAL'}
                </span>
              </div>
            </div>
          </div>

          {/* Session Ledger Table */}
          <div className="p-6 rounded-3xl bg-[#0b0d12] border border-white/10 space-y-4">
            <h3 className="text-base font-serif font-bold text-white">Live Session History</h3>
            {(!attendance.records || attendance.records.length === 0) ? (
              <p className="text-xs text-zinc-400 py-4 font-sans">No session attendance records logged yet.</p>
            ) : (
              <div className="divide-y divide-white/5 text-xs">
                {attendance.records.map((rec: any, idx: number) => {
                  const isPresent = rec.status === 'PRESENT';
                  return (
                    <div key={rec.id || idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">
                          {rec.session?.title || `Session ${rec.session?.sessionNumber || idx + 1}`}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {rec.session?.sessionDate ? new Date(rec.session.sessionDate).toLocaleDateString() : 'Recorded'}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isPresent
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
