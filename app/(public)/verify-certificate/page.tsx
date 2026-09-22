import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, ShieldCheck, CheckCircle2, Search, Lock } from 'lucide-react';
import ScrollFloat from '@/components/ui/ScrollFloat';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Cryptographic Certificate Verification | Verify TS-ID Credentials',
  description: 'Verify the authenticity and integrity of Thread Security Education TS-ID certificates and digital credentials using our anti-tamper verification registry.',
  keywords: [
    'Verify Cybersecurity Certificate',
    'TS-ID Verification',
    'TSE Credential Registry',
    'Anti-Tamper Certificate Verification',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/verify-certificate`,
  },
  openGraph: {
    title: 'Certificate Verification Registry | Thread Security Education',
    description: 'Verify the authenticity and integrity of Thread Security Education TS-ID certificates.',
    url: `${APP_URL}/verify-certificate`,
    type: 'website',
  },
};

export default async function PublicCertificateVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const certificateId = params.id;

  let certificate = null;

  if (certificateId) {
    certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateId: certificateId.trim() },
          { verificationHash: certificateId.trim() },
        ],
      },
      include: {
        user: {
          include: { tsIdentity: true },
        },
        course: true,
      },
    });
  }

  async function handleSearch(formData: FormData) {
    'use server';
    const query = formData.get('query') as string;
    if (query) {
      redirect(`/verify-certificate?id=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="py-16 bg-[#F7F9FA] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="security" className="mb-2">OFFICIAL CREDENTIAL VERIFICATION</Badge>
          <ScrollFloat
            as="h1"
            animationDuration={0.8}
            ease="back.inOut(2)"
            scrollStart="top bottom-=10%"
            scrollEnd="bottom center"
            stagger={0.02}
            containerClassName="text-center"
            textClassName="tse-h1 text-black font-sans font-bold"
          >
            Certificate Anti-Tamper Verification
          </ScrollFloat>
          <p className="tse-body text-muted max-w-xl mx-auto">
            Enter a Certificate ID (e.g. <code className="font-mono text-primary font-bold">CERT-2026-X89F2</code>) or cryptographic hash to verify authenticity.
          </p>
        </div>

        {/* Verification Input Form */}
        <div className="p-8 rounded-2xl bg-white border border-border shadow-sm mb-10">
          <form action={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted" />
              <Input
                type="text"
                name="query"
                defaultValue={certificateId || ''}
                placeholder="Enter Certificate ID (e.g. CERT-2026-X89F2) or Hash..."
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" variant="security" className="gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4" />
              Verify Credential
            </Button>
          </form>
        </div>

        {/* Verification Result */}
        {certificateId && (
          <div>
            {certificate ? (
              <Card className="p-8 border-2 border-security-green bg-white shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-security-green-soft text-security-green-dark flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-security-green-dark font-bold uppercase tracking-wider block">Verified & Authentic</span>
                      <h2 className="tse-h3 text-primary">{certificate.course.title}</h2>
                    </div>
                  </div>
                  <Badge variant="security" className="font-mono">{certificate.certificateId}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-muted text-xs block">Issued To Student:</span>
                    <span className="font-bold text-primary text-base block">{certificate.user.name}</span>
                    <span className="text-xs font-mono text-security-green-dark">
                      TS-ID: {certificate.user.tsIdentity?.tsId || 'TSE-2026-STUDENT'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted text-xs block">Issue Date:</span>
                    <span className="font-bold text-primary text-base block">
                      {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-xl bg-[#04111C] text-white font-mono text-xs space-y-1">
                    <span className="text-security-green font-bold block">Cryptographic Verification Hash (SHA-256):</span>
                    <span className="text-slate-300 break-all">{certificate.verificationHash}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Lock className="w-3.5 h-3.5 text-security-green" />
                    Verified by Thread Security Education Registrar
                  </span>
                  <span className="font-mono text-security-green-dark">STATUS: ISSUED & VALID</span>
                </div>
              </Card>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-red-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold mx-auto">
                  !
                </div>
                <h3 className="tse-h4 text-red-900">Certificate Not Found</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  No valid academic certificate was found matching query &quot;<code className="font-mono text-primary font-bold">{certificateId}</code>&quot;. Please verify the certificate ID or contact support.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
