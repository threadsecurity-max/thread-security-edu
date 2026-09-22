import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Terminal,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Lock,
} from 'lucide-react';

export default async function StudentLessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
  });

  if (!student) {
    redirect('/login');
  }

  // Fetch Course, Modules, Lessons, Labs
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: { orderBy: { orderIndex: 'asc' } } },
        orderBy: { orderIndex: 'asc' },
      },
      labs: true,
      assessments: true,
    },
  });

  if (!course) {
    notFound();
  }

  // Find active lesson
  let activeLesson: any = null;
  for (const mod of course.modules) {
    const found = mod.lessons.find((l) => l.id === lessonId);
    if (found) {
      activeLesson = found;
      break;
    }
  }

  if (!activeLesson && course.modules[0]?.lessons[0]) {
    activeLesson = course.modules[0].lessons[0];
  }

  if (!activeLesson) {
    notFound();
  }

  // Check progress
  const progressRecord = await prisma.progress.findUnique({
    where: {
      userId_lessonId: {
        userId: student.id,
        lessonId: activeLesson.id,
      },
    },
  });

  const isCompleted = progressRecord?.isCompleted || false;

  // Server action to mark lesson complete
  async function toggleLessonCompletion() {
    'use server';
    if (!student || !course || !activeLesson) return;

    if (isCompleted) {
      await prisma.progress.delete({
        where: {
          userId_lessonId: {
            userId: student.id,
            lessonId: activeLesson.id,
          },
        },
      });
    } else {
      await prisma.progress.create({
        data: {
          userId: student.id,
          lessonId: activeLesson.id,
          isCompleted: true,
        },
      });
    }

    // Recalculate enrollment progress
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedCount = await prisma.progress.count({
      where: {
        userId: student.id,
        lesson: { module: { courseId: course.id } },
      },
    });

    const newPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
      data: {
        progressPercent: newPercent,
        ...(newPercent >= 100 ? { completedAt: new Date(), status: 'COMPLETED' } : {}),
      },
    });
  }

  // Find associated lab for this lesson
  const associatedLab = course.labs.find((l) => l.lessonId === activeLesson.id) || course.labs[0];

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[85vh]">
      {/* LEFT MODULE NAVIGATION SIDEBAR */}
      <aside className="w-full lg:w-80 bg-white border border-border rounded-2xl p-5 shrink-0 space-y-6 h-fit">
        <div className="border-b border-border pb-4">
          <Link href="/student/courses" className="text-xs text-muted flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Courses
          </Link>
          <h2 className="font-bold text-primary text-base line-clamp-1">{course.title}</h2>
          <span className="text-xs text-security-green-dark font-mono font-bold block mt-1">
            {course.category} • {course.modules.length} Modules
          </span>
        </div>

        {/* Modules Accordion Tree */}
        <div className="space-y-4">
          {course.modules.map((mod, idx) => (
            <div key={mod.id} className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-muted font-bold block">
                Module {idx + 1}: {mod.title}
              </span>
              <div className="space-y-1">
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLesson.id;
                  return (
                    <Link
                      key={lesson.id}
                      href={`/student/courses/${course.id}/learn/${lesson.id}`}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white font-bold shadow-sm'
                          : 'bg-[#F7F9FA] text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {lesson.type === 'VIDEO' ? (
                          <PlayCircle className={`w-3.5 h-3.5 ${isActive ? 'text-security-green' : 'text-slate-500'}`} />
                        ) : (
                          <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-security-green' : 'text-slate-500'}`} />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <span className="font-mono text-[10px] opacity-80">{lesson.durationMinutes}m</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN LESSON CONTAINER */}
      <main className="flex-1 space-y-6">
        {/* Lesson Header */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="security" className="font-mono text-xs">{activeLesson.type}</Badge>
              <span className="text-xs font-mono text-muted">{activeLesson.durationMinutes} minutes</span>
            </div>
            <h1 className="tse-h2 text-primary font-sans">{activeLesson.title}</h1>
          </div>

          <form action={toggleLessonCompletion}>
            <Button
              type="submit"
              variant={isCompleted ? 'security' : 'outline'}
              className="gap-2 shrink-0 font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
            </Button>
          </form>
        </div>

        {/* Video Player or Technical Documentation Container */}
        {activeLesson.type === 'VIDEO' && activeLesson.videoUrl ? (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-lg relative">
            <iframe
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {/* Lesson Written Content */}
        <div className="p-8 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <h3 className="tse-h3 text-primary">Technical Documentation & Protocol Analysis</h3>
          <p className="tse-body text-slate-700 leading-relaxed whitespace-pre-line">
            {activeLesson.content}
          </p>
        </div>

        {/* Practical Lab Sandbox Launcher Integration */}
        {associatedLab && (
          <Card className="p-6 bg-[#04111C] text-white border-2 border-security-green/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-security-green text-primary-dark flex items-center justify-center font-bold">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-security-green font-bold uppercase block">PRACTICAL SANDBOX LAB</span>
                  <h3 className="tse-h4 text-white">{associatedLab.title}</h3>
                </div>
              </div>
              <Badge variant="security" className="font-mono">{associatedLab.estimatedMinutes} mins</Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Objective: {associatedLab.objective}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Target Skills: {associatedLab.skills}</span>
              <Link href={`/student/labs/${associatedLab.id}`}>
                <Button variant="security" size="sm" className="font-bold gap-2">
                  Launch Sandbox Target
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
