import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, CheckCircle2, Award, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function StudentAssessmentsPage() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
  });

  const assessments = await prisma.assessment.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      course: true,
      questions: true,
      attempts: {
        where: { userId: student?.id },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <Badge variant="security" className="mb-2">ACADEMIC EVALUATION ENGINE</Badge>
        <h1 className="tse-h1 text-primary font-sans">Assessments & Exams</h1>
        <p className="tse-body-sm text-muted mt-1 max-w-2xl">
          Server-evaluated qualification exams testing vulnerability analysis, security headers, and protocol remediation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((a) => {
          const attempt = a.attempts[0];
          const passed = attempt?.passed || false;
          const score = attempt?.score || 0;

          return (
            <Card key={a.id} className="p-6 tse-glass-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="font-mono text-xs">{a.course.title}</Badge>
                  <Badge variant="outline" className="text-xs font-mono">Passing: {a.passingScore}%</Badge>
                </div>

                <h3 className="tse-h4 text-primary mb-1">{a.title}</h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{a.description}</p>

                <div className="mt-4 p-3 rounded-lg bg-[#F7F9FA] border border-border flex items-center justify-between text-xs font-mono">
                  <span>Questions: {a.questions.length}</span>
                  {attempt ? (
                    <span className={`font-bold ${passed ? 'text-security-green-dark' : 'text-red-600'}`}>
                      Score: {score}% ({passed ? 'PASSED ✓' : 'FAILED'})
                    </span>
                  ) : (
                    <span className="text-muted">Not Attempted</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="security" className="w-full font-bold justify-between">
                  {attempt ? 'Retake Exam' : 'Start Assessment Exam'}
                  <Cpu className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
