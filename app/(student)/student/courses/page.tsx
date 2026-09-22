import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';

export const revalidate = 60;

export default async function StudentCoursesPage() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
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

  const enrolledCourseIds = student?.enrollments.map((e) => e.courseId) || [];

  // Also query other available published courses
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <Badge variant="security" className="mb-2">CURRICULUM ENROLLMENT</Badge>
        <h1 className="tse-h1 text-primary font-sans">My Courses & Pathways</h1>
        <p className="tse-body-sm text-muted mt-1 max-w-2xl">
          Structured cybersecurity masterclasses, tactical lab environments, and industry-aligned qualification programs.
        </p>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-security-green" />
            Active Enrolled Programs ({enrollments.length})
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-border">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-primary">No active enrollments found</h3>
            <p className="text-sm text-muted mt-1">Explore our published course catalog below to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {enrollments.map((enrollment) => {
              const { course, progressPercent } = enrollment;
              const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
              const firstLessonId = course.modules[0]?.lessons[0]?.id;
              const learnUrl = firstLessonId
                ? `/student/courses/${course.id}/learn/${firstLessonId}`
                : `/courses/${course.slug}`;

              return (
                <Card key={course.id} className="p-6 bg-white border-l-4 border-l-security-green">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="security" className="font-mono text-xs">{course.level}</Badge>
                        <Badge variant="outline" className="font-mono text-xs">{course.category}</Badge>
                        <span className="text-xs text-muted flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {course.durationHours} Hours Total
                        </span>
                      </div>

                      <h3 className="tse-h3 text-primary">{course.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{course.description}</p>

                      {/* Modules Summary */}
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-security-blue" />
                          {course.modules.length} Modules ({totalLessons} Lessons)
                        </span>
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5 text-security-green" />
                          {course.labs.length} Hands-On Labs
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2 max-w-md">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted">Curriculum Progress</span>
                          <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center justify-end gap-3 shrink-0">
                      <Link href={learnUrl} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto font-bold bg-primary text-white hover:bg-slate-800 gap-2">
                          <PlayCircle className="w-4 h-4 text-security-green" />
                          Continue Learning
                        </Button>
                      </Link>
                      <Link href={`/courses/${course.slug}`} className="w-full md:w-auto">
                        <Button variant="outline" className="w-full md:w-auto text-xs font-mono">
                          View Syllabus
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Other Available Courses */}
      {otherCourses.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-security-blue" />
              Available Cybersecurity Programs ({otherCourses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherCourses.map((course) => {
              const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

              return (
                <Card key={course.id} className="p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-xs">{course.level}</Badge>
                      <span className="text-xs font-mono text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.durationHours} Hours
                      </span>
                    </div>

                    <h3 className="tse-h4 text-primary">{course.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{course.description}</p>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-border/60">
                      <span>{course.modules.length} Modules</span>
                      <span>•</span>
                      <span>{totalLessons} Lessons</span>
                      <span>•</span>
                      <span>{course.labs.length} Labs</span>
                    </div>
                  </div>

                  <Link href={`/courses/${course.slug}`} className="block">
                    <Button variant="outline" className="w-full justify-between font-bold">
                      Explore Curriculum
                      <ArrowRight className="w-4 h-4 text-security-green" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
