import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export const revalidate = 0;

export default async function StudentCoursesPage() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }

  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
                orderBy: { orderIndex: 'asc' },
              },
              labs: true,
              mentor: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  const enrolledCourseIds = student?.enrollments?.map((e) => e.courseId) || [];

  // Query other published courses created by Admin
  const otherCourses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      id: { notIn: enrolledCourseIds },
    },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { orderIndex: 'asc' },
      },
      labs: true,
      mentor: { include: { user: true } },
    },
  });

  const enrollments = student?.enrollments || [];

  return (
    <div className="space-y-8 text-white">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <Badge className="bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] tracking-wider font-bold">
              CURRICULUM ENROLLMENT
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              FACULTY-GUIDED LEARNING PATHS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            My Courses &amp; Specializations
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Faculty-conducted cybersecurity programs, tactical sandbox integrations, and milestone evaluations designed by industry practitioners.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[110px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">ACTIVE PROGRAMS</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">{enrollments.length}</span>
          </div>
        </div>
      </div>

      {/* ── ENROLLED COURSES SECTION ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C6FF34]" />
            Active Enrolled Programs ({enrollments.length})
          </h2>
          <span className="text-xs font-mono text-zinc-400">Mentor Directed</span>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-white">No active course enrollments</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Your instructor or administrator has not yet assigned a syllabus track to your student ID. Browse the published institute catalog below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {enrollments.map((enrollment) => {
              const { course, progressPercent } = enrollment;
              const totalLessons = (course.modules || []).reduce(
                (acc, m) => acc + (m.lessons?.length || 0),
                0
              );
              const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
              const learnUrl = firstLessonId
                ? `/student/courses/${course.id}/learn/${firstLessonId}`
                : `/courses/${course.slug}`;

              const mentorName = course.mentor?.user?.name || 'Faculty Lead';

              return (
                <div
                  key={course.id}
                  className="p-6 sm:p-7 rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 backdrop-blur-xl relative overflow-hidden group shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3.5 flex-1 min-w-0">
                      {/* Meta badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20">
                          {course.level || 'INTERMEDIATE'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-300 bg-white/[0.05] border border-white/[0.08]">
                          {course.category}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {course.durationHours} Hours Total
                        </span>
                        <span className="text-xs text-zinc-300 flex items-center gap-1 font-mono">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Mentor: <strong className="text-white">{mentorName}</strong>
                        </span>
                      </div>

                      {/* Course Title & Description */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors tracking-tight">
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                          {course.description}
                        </p>
                      </div>

                      {/* Modules & Labs Metrics */}
                      <div className="flex items-center gap-5 text-xs font-mono text-zinc-400 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-zinc-300" />
                          {course.modules?.length || 0} Modules ({totalLessons} Lessons)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-[#C6FF34]" />
                          {course.labs?.length || 0} Practical Labs
                        </span>
                      </div>

                      {/* Progress Bar with glowing indicator */}
                      <div className="space-y-1.5 pt-1 max-w-md">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-zinc-400">Curriculum Progress</span>
                          <span className="font-bold text-[#C6FF34]">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#C6FF34] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex sm:flex-row lg:flex-col items-stretch lg:items-end justify-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                      <Link href={learnUrl} className="flex-1 lg:flex-initial">
                        <button className="w-full lg:w-48 px-5 py-2.5 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(198,255,52,0.18)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                          <PlayCircle className="w-4 h-4 text-black shrink-0" />
                          <span>Continue Learning</span>
                        </button>
                      </Link>

                      <Link href={`/courses/${course.slug}`} className="flex-1 lg:flex-initial">
                        <button className="w-full lg:w-48 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/[0.08] font-mono font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                          <span>View Full Syllabus</span>
                        </button>
                      </Link>

                      <Link href="/student/assessments" className="flex-1 lg:flex-initial">
                        <button className="w-full lg:w-48 px-5 py-2 rounded-xl bg-transparent hover:bg-white/[0.03] text-zinc-400 hover:text-[#C6FF34] border border-dashed border-white/[0.15] font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                          <Cpu className="w-3.5 h-3.5 text-[#C6FF34]" />
                          <span>Linked Exams</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── OTHER PUBLISHED COURSES CREATED BY ADMIN ── */}
      {(otherCourses?.length || 0) > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Available Institute Programs ({otherCourses?.length || 0})
            </h2>
            <span className="text-xs font-mono text-zinc-400">Curated Catalog</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherCourses.map((course) => {
              const totalLessons = (course.modules || []).reduce(
                (acc, m) => acc + (m.lessons?.length || 0),
                0
              );

              return (
                <div
                  key={course.id}
                  className="p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.035] border border-white/[0.08] hover:border-white/[0.14] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                        {course.level || 'ALL LEVELS'}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {course.durationHours} Hours
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-white tracking-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 pt-2 border-t border-white/[0.06]">
                      <span>{course.modules?.length || 0} Modules</span>
                      <span>•</span>
                      <span>{totalLessons} Lessons</span>
                      <span>•</span>
                      <span className="text-[#C6FF34]">{course.labs?.length || 0} Labs</span>
                    </div>
                  </div>

                  <Link href={`/courses/${course.slug}`}>
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <span>Explore Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C6FF34]" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
