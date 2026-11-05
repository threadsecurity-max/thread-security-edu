import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock, ArrowRight, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function MentorCoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      modules: { include: { lessons: true } },
      labs: true,
      enrollments: true,
      batches: {
        include: {
          sessions: true,
          students: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <Badge variant="security" className="mb-2">CURRICULUM OVERSIGHT</Badge>
        <h1 className="tse-h1 text-primary font-sans">Taught Courses & Academic Tracks ({courses.length})</h1>
        <p className="tse-body-sm text-muted">
          Inspect modules, practical labs, enrolled students, and lesson syllabi under your instruction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="border border-border flex flex-col justify-between">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="security">{course.category}</Badge>
                <Badge variant="outline" className="font-mono text-xs">{course.level}</Badge>
              </div>
              <CardTitle className="tse-h3 text-primary">{course.title}</CardTitle>
              <p className="tse-body-sm text-muted line-clamp-2">{course.subtitle}</p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Modules</span>
                  <span className="font-bold text-sm text-primary">{course.modules.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Labs</span>
                  <span className="font-bold text-sm text-security-green-dark">{course.labs.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Enrolled</span>
                  <span className="font-bold text-sm text-primary">{course.enrollments.length}</span>
                </div>
              </div>

              {/* Associated Batches & Slot Attendance Management */}
              {course.batches && course.batches.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Active Batches ({course.batches.length})
                  </span>
                  <div className="space-y-1.5">
                    {course.batches.map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-violet-700">{b.batchCode}</span>
                          <span className="text-slate-500 text-[11px] ml-2 font-mono">
                            ({b.students?.length || 0} Students &bull; {b.sessions?.length || 0} Slots)
                          </span>
                        </div>
                        <Link href={`/mentor/attendance?batchId=${b.id}`}>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-[11px] h-7 px-2.5 rounded-lg font-bold">
                            Capture Slot Attendance
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 italic">No batches currently mapped</span>
                  <Link href="/mentor/attendance">
                    <Button size="sm" variant="outline" className="text-[11px] h-7">
                      Open Attendance Center
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {course.durationHours} Hours Duration
                </span>

                <Link href={`/courses/${course.slug}`}>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    Syllabus Preview <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
