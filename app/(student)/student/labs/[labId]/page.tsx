import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Terminal, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Play, Lock } from 'lucide-react';
import { logAuditEvent } from '@/server/security/audit';

export default async function StudentLabTargetPage({
  params,
  searchParams,
}: {
  params: Promise<{ labId: string }>;
  searchParams: Promise<{ flagResult?: string }>;
}) {
  const { labId } = await params;
  const { flagResult } = await searchParams;

  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
  });

  if (!student) {
    redirect('/login');
  }

  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: { course: true },
  });

  if (!lab) {
    notFound();
  }

  // Get or create lab attempt
  let attempt = await prisma.labAttempt.findFirst({
    where: {
      labId: lab.id,
      userId: student.id,
    },
  });

  if (!attempt) {
    attempt = await prisma.labAttempt.create({
      data: {
        labId: lab.id,
        userId: student.id,
        state: 'IN_PROGRESS',
      },
    });
  }

  // Server Action for flag submission
  async function submitFlagAction(formData: FormData) {
    'use server';
    const submittedFlag = formData.get('flag') as string;
    if (!submittedFlag || !student || !lab || !attempt) return;

    const isValid = lab.flagHash ? submittedFlag.trim() === lab.flagHash.trim() : true;

    if (isValid) {
      await prisma.labAttempt.update({
        where: { id: attempt.id },
        data: {
          state: 'COMPLETED',
          score: 100.0,
          submittedFlag,
          feedback: 'Flag verified successfully! 100/100 points awarded.',
          completedAt: new Date(),
        },
      });

      await logAuditEvent({
        actorId: student.id,
        action: 'LAB_COMPLETED_SUCCESS',
        entity: 'LAB',
        entityId: lab.id,
        details: { flag: submittedFlag, score: 100 },
      });

      redirect(`/student/labs/${lab.id}?flagResult=success`);
    } else {
      await prisma.labAttempt.update({
        where: { id: attempt.id },
        data: {
          submittedFlag,
          feedback: 'Incorrect flag submitted. Please re-examine the target payload output.',
        },
      });

      redirect(`/student/labs/${lab.id}?flagResult=error`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <Link href="/student/labs" className="text-xs text-muted flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sandbox Labs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="tse-h2 text-primary font-sans">{lab.title}</h1>
            <Badge variant="security" className="font-mono">{attempt.state}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span>Est. Time: {lab.estimatedMinutes} mins</span>
        </div>
      </div>

      {/* Flag Result Alert */}
      {flagResult === 'success' && (
        <div className="p-4 rounded-xl bg-security-green-soft border border-security-green text-security-green-dark flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-security-green-dark" />
          <div>
            <span className="font-bold block">FLAG VERIFIED SUCCESSFULLY!</span>
            <span className="text-xs">Congratulations! You earned 100/100 points for completing this lab scenario.</span>
          </div>
        </div>
      )}

      {flagResult === 'error' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 text-red-600" />
          <div>
            <span className="font-bold block">INCORRECT FLAG</span>
            <span className="text-xs">The flag you submitted did not match the expected hash. Please re-run your extraction payload.</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scenario Instructions */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="tse-h3 text-primary">Lab Objective & Scenario</h3>
            <p className="tse-body text-slate-700 leading-relaxed">{lab.objective}</p>

            <div className="p-4 rounded-xl bg-[#F7F9FA] border border-border space-y-2 text-sm text-slate-700">
              <span className="font-bold text-primary font-mono block">Instructions & Target Endpoint:</span>
              <p className="font-mono text-xs text-primary leading-relaxed">{lab.instructions}</p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-mono text-muted uppercase block mb-1">Skills Assessed:</span>
              <span className="text-xs font-mono font-bold text-security-green-dark">{lab.skills}</span>
            </div>
          </Card>
        </div>

        {/* Flag Submission Terminal */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-[#04111C] text-white border-2 border-security-green/40 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-lg bg-security-green text-primary-dark flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono text-security-green font-bold block">FLAG SUBMISSION TERMINAL</span>
                <span className="text-[11px] text-slate-400 font-mono">Format: TSE{"{..."}</span>
              </div>
            </div>

            <form action={submitFlagAction} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Extracted Capture The Flag Value:
                </label>
                <Input
                  type="text"
                  name="flag"
                  defaultValue={attempt.submittedFlag || ''}
                  placeholder="e.g. TSE{5q1_1nj3c710n_m4573r_2026}"
                  className="bg-black/60 border-white/20 text-white font-mono text-xs placeholder:text-slate-600"
                  required
                />
              </div>

              <Button type="submit" variant="security" className="w-full font-bold gap-2">
                Submit Flag For Scoring
              </Button>
            </form>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-mono space-y-1">
              <span className="text-slate-400 block">CURRENT ATTEMPT STATUS:</span>
              <span className="text-security-green font-bold block">{attempt.state} (Score: {attempt.score}/100)</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
