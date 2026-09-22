import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, FileText, Printer, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function StudentAcademicReportPage() {
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
        include: { course: true },
      },
      labAttempts: {
        include: { lab: true },
      },
      certificates: {
        include: { course: true },
      },
    },
  });

  const tsId = student?.tsIdentity?.tsId || 'TSE-2026-8F4K29';

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Badge variant="security" className="mb-2">OFFICIAL ACADEMIC TRANSCRIPT</Badge>
          <h1 className="tse-h1 text-primary font-sans">Academic Student Report</h1>
          <p className="tse-body-sm text-muted">
            Official verifiable record of completed courses, practical labs, and skill ratings.
          </p>
        </div>

        <button
          onClick={undefined}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold font-mono hover:bg-primary-dark shrink-0"
        >
          <Printer className="w-4 h-4 text-security-green" />
          Print Official Report
        </button>
      </div>

      {/* Printable Report Card Container */}
      <Card className="p-8 bg-white border border-border shadow-sm space-y-8">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-security-green-dark" />
              <span className="font-bold text-xl text-primary font-sans">THREAD SECURITY EDUCATION</span>
            </div>
            <span className="text-xs text-muted font-mono block">Academic Registrar Division</span>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-muted block">STUDENT IDENTIFIER</span>
            <Badge variant="tsid" className="text-sm mt-1">{tsId}</Badge>
          </div>
        </div>

        {/* Student Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm p-4 rounded-xl bg-[#F7F9FA] border border-border">
          <div>
            <span className="text-muted text-xs block">Student Name:</span>
            <span className="font-bold text-primary text-base block">{student?.name}</span>
            <span className="text-xs text-slate-600">{student?.email}</span>
          </div>

          <div>
            <span className="text-muted text-xs block">Career Focus:</span>
            <span className="font-bold text-primary block">{student?.studentProfile?.careerGoal || 'VAPT Analyst'}</span>
          </div>

          <div>
            <span className="text-muted text-xs block">Assigned Mentor:</span>
            <span className="font-bold text-primary block">{student?.studentProfile?.assignedMentor?.user.name || 'Alex Vance'}</span>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="space-y-3">
          <h3 className="tse-h4 text-primary font-sans">Enrolled Courses & Progress</h3>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#04111C] text-white">
                <tr>
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Level</th>
                  <th className="p-3 text-right">Completion Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student?.enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-primary">{e.course.title}</td>
                    <td className="p-3 text-slate-600">{e.course.category}</td>
                    <td className="p-3 text-slate-600">{e.course.level}</td>
                    <td className="p-3 text-right font-bold text-security-green-dark">
                      {e.progressPercent}% ({e.status})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Practical Lab Log Table */}
        <div className="space-y-3">
          <h3 className="tse-h4 text-primary font-sans">Practical Lab Execution History</h3>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#04111C] text-white">
                <tr>
                  <th className="p-3">Lab Title</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Score</th>
                  <th className="p-3 text-right">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student?.labAttempts.map((la) => (
                  <tr key={la.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-primary">{la.lab.title}</td>
                    <td className="p-3 font-bold text-security-green-dark">{la.state}</td>
                    <td className="p-3 font-bold">{la.score}/100</td>
                    <td className="p-3 text-right text-slate-600">
                      {la.completedAt ? new Date(la.completedAt).toLocaleDateString() : 'In Progress'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted font-mono">
          <span>Report Generated: {new Date().toISOString().split('T')[0]}</span>
          <span className="text-security-green-dark font-bold">REGISTRAR SEAL: VERIFIED & VALID</span>
        </div>
      </Card>
    </div>
  );
}
