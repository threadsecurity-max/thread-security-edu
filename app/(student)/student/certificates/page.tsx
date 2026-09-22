import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Lock, ExternalLink, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function StudentCertificatesPage() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: {
      tsIdentity: true,
      certificates: { include: { course: true } },
    },
  });

  const tsId = student?.tsIdentity?.tsId || 'TSE-2026-8F4K29';

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <Badge variant="security" className="mb-2">VERIFIED ACADEMIC CREDENTIALS</Badge>
        <h1 className="tse-h1 text-primary font-sans">Earned Certificates</h1>
        <p className="tse-body-sm text-muted mt-1 max-w-2xl">
          Cryptographically signed credentials bound to your student identifier (<code className="font-mono text-primary font-bold">{tsId}</code>).
        </p>
      </div>

      {student?.certificates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border">
          <Award className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="tse-h4 text-primary">No certificates issued yet</h3>
          <p className="text-sm text-muted mt-1 mb-4">
            Your certificates will appear here once you complete an eligible cybersecurity course and pass the qualification exam.
          </p>
          <Link href="/student/courses">
            <Button variant="security">Continue Active Program</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {student?.certificates.map((cert) => (
            <Card key={cert.id} className="p-6 bg-[#04111C] text-white border-2 border-security-green/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-security-green text-primary-dark flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <Badge variant="security" className="font-mono text-xs">{cert.certificateId}</Badge>
              </div>

              <div>
                <span className="text-xs font-mono text-security-green font-bold block uppercase">VERIFIED CREDENTIAL</span>
                <h3 className="tse-h3 text-white mt-1">{cert.course.title}</h3>
                <span className="text-xs font-mono text-slate-400 block mt-1">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] space-y-1">
                <span className="text-slate-400 block">SHA-256 Hash:</span>
                <span className="text-slate-300 break-all">{cert.verificationHash}</span>
              </div>

              <Link href={`/verify-certificate?id=${cert.certificateId}`} target="_blank">
                <Button variant="security" className="w-full gap-2 font-bold text-xs mt-2">
                  Open Public Verification Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
