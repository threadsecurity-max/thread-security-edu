import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Terminal, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function StudentLabsListPage() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
  });

  const labs = await prisma.lab.findMany({
    include: {
      course: true,
      attempts: {
        where: { userId: student?.id },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <Badge variant="security" className="mb-2">PRACTICAL CYBERSECURITY SANDBOX</Badge>
        <h1 className="tse-h1 text-primary font-sans">Hands-On Practical Labs</h1>
        <p className="tse-body-sm text-muted mt-1 max-w-2xl">
          Deploy dedicated virtual targets, execute vulnerability exploitation methodologies, and extract capture-the-flag proofs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map((lab) => {
          const attempt = lab.attempts[0];
          const state = attempt?.state || 'AVAILABLE';

          return (
            <Card key={lab.id} className="p-6 border-l-4 border-l-security-green flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="security" className="font-mono text-xs">{state}</Badge>
                  <span className="text-xs font-mono text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {lab.estimatedMinutes} mins
                  </span>
                </div>

                <h3 className="tse-h4 text-primary mb-1">{lab.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{lab.objective}</p>

                <div className="mt-3 pt-3 border-t border-border/60">
                  <span className="text-[11px] font-mono text-security-green-dark font-bold block">
                    Target Skills: {lab.skills}
                  </span>
                </div>
              </div>

              <Link href={`/student/labs/${lab.id}`} className="block">
                <Button variant="default" className="w-full justify-between font-bold">
                  Launch Sandbox Scenario
                  <Terminal className="w-4 h-4 text-security-green" />
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
