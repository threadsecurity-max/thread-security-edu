'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassCard';
import { BookOpen, ArrowRight, User, Layers, CheckCircle2 } from 'lucide-react';

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  durationHours: number;
  progressPercent: number;
  modulesCount: number;
  mentorName: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  href: string;
}

export function CoursesGrid({ courses }: { courses: CourseItem[] }) {
  if (courses.length === 0) {
    return (
      <GlassCard level={1} className="p-8 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-zinc-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No courses enrolled</h3>
        <p className="text-xs text-zinc-400">
          Explore our defensive & offensive cybersecurity curriculum.
        </p>
        <Link href="/student/courses" className="inline-block">
          <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono">
            View All Courses
          </button>
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">My Courses</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Active curriculum and syllabus completion status
          </p>
        </div>
        <Link
          href="/student/courses"
          className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1"
        >
          <span>View All Courses</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const isComplete = course.status === 'COMPLETED';
          const isInProgress = course.status === 'IN_PROGRESS';

          return (
            <GlassCard
              key={course.id}
              level={1}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-white/[0.18] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300">
                    {course.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isComplete
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isInProgress
                        ? 'bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isComplete ? 'COMPLETED' : isInProgress ? 'IN PROGRESS' : 'NOT STARTED'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#C6FF34] transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-zinc-500" />
                      {course.modulesCount} Modules
                    </span>
                    {course.mentorName && (
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <User className="w-3 h-3 text-zinc-500" />
                        {course.mentorName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress & Navigation Link */}
              <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Progress</span>
                    <span className="text-white font-semibold">{course.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#C6FF34] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, Math.min(100, course.progressPercent))}%` }}
                    />
                  </div>
                </div>

                <Link href={course.href} className="block">
                  <button className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <span>{isComplete ? 'Review Syllabus' : 'Continue Course'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#C6FF34] transition-colors" />
                  </button>
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
