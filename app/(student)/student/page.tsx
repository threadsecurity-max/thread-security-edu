import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Terminal,
  Cpu,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const revalidate = 60; // ISR caching for 60 seconds

export default async function StudentDashboardPage() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: {
      tsIdentity: true,
      studentProfile: {
        include: {
          skills: true,
          assignedMentor: { include: { user: true } },
        },
      },
      enrollments: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
                orderBy: { orderIndex: 'asc' },
              },
              labs: true,
            },
          },
        },
      },
      labAttempts: { include: { lab: true } },
      certificates: { include: { course: true } },
    },
  });

  const studentName = student?.name || 'Kunal Verma';
  const tsId = student?.tsIdentity?.tsId || 'TSE-2026-8F4K29';
  const activeEnrollment = student?.enrollments[0];
  const currentCourse = activeEnrollment?.course;
  const currentModule = currentCourse?.modules[0];
  const currentLesson = currentModule?.lessons[0];

  return (
    <div className="space-y-8">
      {/* ABOVE THE FOLD GREETING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono text-muted uppercase tracking-wider">ACADEMIC DASHBOARD</span>
            <Badge variant="tsid">{tsId}</Badge>
          </div>
          <h1 className="tse-h1 text-primary font-sans">
            Good morning, <span className="text-primary">{studentName}</span>
          </h1>
          <p className="tse-body-sm text-muted">
            Track your security progression, active sandbox labs, and upcoming qualification exams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-white border border-border shadow-sm flex items-center gap-3 text-xs font-mono">
            <Zap className="w-4 h-4 text-security-green-dark" />
            <div>
              <span className="text-muted block">CURRENT STREAK</span>
              <span className="font-bold text-primary text-sm">{student?.studentProfile?.currentStreak || 12} Days</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-border shadow-sm flex items-center gap-3 text-xs font-mono">
            <Clock className="w-4 h-4 text-security-green-dark" />
            <div>
              <span className="text-muted block">HOURS LEARNED</span>
              <span className="font-bold text-primary text-sm">{student?.studentProfile?.totalHours || 34.5} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTINUE LEARNING HERO CARD */}
      {currentCourse && currentLesson && (
        <Card className="p-8 bg-gradient-to-r from-[#04111C] via-[#071A2B] to-[#04111C] text-white border-2 border-security-green/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-security-green" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="security" className="font-mono">CONTINUE LEARNING</Badge>
              <span className="text-xs font-mono text-security-green">Progress: 50%</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                {currentCourse.title}
              </span>
              <h2 className="tse-h2 text-white">{currentLesson.title}</h2>
              <p className="tse-body-sm text-slate-300 max-w-2xl line-clamp-2">
                {currentLesson.content}
              </p>
            </div>

            <div className="space-y-2 max-w-xl">
              <Progress value={50} className="h-2.5 bg-slate-800" />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{currentModule?.title}</span>
                <span>Lesson 1 of {currentModule?.lessons.length}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/student/courses/${currentCourse.id}/learn/${currentLesson.id}`}>
                <Button variant="security" size="lg" className="font-bold gap-2 text-base">
                  <PlayCircle className="w-5 h-5" />
                  Resume Lesson & Launch Lab
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* GRID: ENROLLED COURSES & LAB STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Enrolled Courses */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="tse-h3 text-primary">Active Enrolled Courses</h2>
            <Link href="/student/courses" className="text-xs font-mono text-security-green-dark hover:underline">
              View All Enrolled
            </Link>
          </div>

          <div className="space-y-4">
            {student?.enrollments.map((e) => (
              <Card key={e.id} className="p-6 tse-glass-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="font-mono text-[11px]">{e.course.category}</Badge>
                      <Badge variant="outline" className="text-[11px]">{e.course.level}</Badge>
                    </div>
                    <h3 className="tse-h4 text-primary">{e.course.title}</h3>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{e.course.subtitle}</p>
                  </div>
                  <Link href={`/student/courses/${e.course.id}/learn/${e.course.modules[0]?.lessons[0]?.id || ''}`}>
                    <Button variant="default" size="sm" className="shrink-0 gap-2">
                      Enter Player
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs font-mono text-muted">
                    <span>Course Progress</span>
                    <span className="font-bold text-security-green-dark">{e.progressPercent}%</span>
                  </div>
                  <Progress value={e.progressPercent} className="h-2" />
                </div>
              </Card>
            ))}
          </div>

          {/* Active Practical Labs */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="tse-h3 text-primary">Active Practical Labs</h2>
              <Link href="/student/labs" className="text-xs font-mono text-security-green-dark hover:underline">
                View All Sandbox Labs
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student?.labAttempts.map((la) => (
                <Card key={la.id} className="p-5 border-l-4 border-l-security-green">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="security" className="text-[10px] font-mono">{la.state}</Badge>
                    <span className="text-xs font-mono text-muted">{la.lab.estimatedMinutes} mins</span>
                  </div>
                  <h4 className="font-bold text-primary text-sm mb-1">{la.lab.title}</h4>
                  <p className="text-xs text-muted line-clamp-2 mb-3">{la.lab.objective}</p>
                  <Link href={`/student/labs/${la.lab.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                      Launch Sandbox Target
                      <Terminal className="w-3.5 h-3.5 text-security-green-dark" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Skills, Mentor, Certificate */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill Radar */}
          <Card className="p-6">
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">Verified Skill Metrics</h3>
            <div className="space-y-3">
              {student?.studentProfile?.skills.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-primary font-medium">{s.skillName}</span>
                    <span className="font-bold text-security-green-dark">{s.score}%</span>
                  </div>
                  <Progress value={s.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>

          {/* Assigned Mentor Card */}
          {student?.studentProfile?.assignedMentor && (
            <Card className="p-6 bg-white border border-border space-y-4">
              <span className="text-xs font-mono text-muted uppercase tracking-wider block">Assigned Academic Mentor</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-security-green flex items-center justify-center font-bold">
                  {student.studentProfile.assignedMentor.user.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">{student.studentProfile.assignedMentor.user.name}</h4>
                  <span className="text-xs text-muted block">{student.studentProfile.assignedMentor.title}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Next Office Hours: <span className="font-mono text-primary font-bold">{student.studentProfile.assignedMentor.officeHours}</span>
              </p>
            </Card>
          )}

          {/* Certificate Card */}
          {student?.certificates[0] && (
            <Card className="p-6 bg-[#04111C] text-white border border-security-green/30 space-y-3">
              <Award className="w-7 h-7 text-security-green" />
              <div>
                <span className="text-xs font-mono text-security-green font-bold block">EARNED CREDENTIAL</span>
                <h4 className="font-bold text-white text-sm mt-0.5">{student.certificates[0].course.title}</h4>
                <span className="text-xs font-mono text-slate-400 block mt-1">ID: {student.certificates[0].certificateId}</span>
              </div>
              <Link href={`/verify-certificate?id=${student.certificates[0].certificateId}`}>
                <Button variant="security" size="sm" className="w-full text-xs mt-2">
                  Verify Public Credential
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
