import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, TSIDBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  BookOpen,
  User,
  Mail,
  FileCheck,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default async function StudentPendingApprovalPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch full user record from database to check real-time grant status
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tsIdentity: true,
      studentProfile: true,
      enrollments: { include: { course: true } },
    },
  });

  // If admin has already granted dashboard access, redirect to main student dashboard
  if ((user as any)?.isDashboardAccessGranted) {
    redirect('/student');
  }

  const tsId = user?.tsIdentity?.tsId || session.tsId || 'TSE-PENDING';
  const name = user?.name || session.name;
  const email = user?.email || session.email;
  const careerGoal = user?.studentProfile?.careerGoal || 'Cybersecurity Practitioner';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04111C] via-[#071A2B] to-[#04111C] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logos/TSE Logo Nav.svg" alt="Thread Security Education Logo" className="h-12 w-auto object-contain" />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>ACADEMIC DASHBOARD CLEARANCE PENDING</span>
          </div>
          <h1 className="tse-h2 text-white">Student Registration & Credentials Verified</h1>
          <p className="tse-body-sm text-slate-300 max-w-xl mx-auto">
            Your unique Thread Security Identity (TS-ID) has been provisioned. Academic registrar approval is required before the full training environment and course labs unlock.
          </p>
        </div>

        {/* Credentials & Identity Card */}
        <Card className="bg-black/60 border border-white/15 shadow-2xl backdrop-blur-md overflow-hidden text-white">
          <CardHeader className="bg-white/5 border-b border-white/10 p-5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-security-green/20 border border-security-green/40 flex items-center justify-center text-security-green">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Student Credential Verification Card
                </CardTitle>
                <span className="text-xs text-slate-400 font-mono">
                  Review your registered details and TS-ID primary key
                </span>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-400/50 text-amber-300 bg-amber-500/10 font-mono text-xs">
              Status: GUEST / PENDING
            </Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Thread Security ID (TS-ID)
                </span>
                <span className="text-xl font-bold font-mono text-security-green block">
                  {tsId}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Unique database primary key identity
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Registered Full Name
                </span>
                <span className="text-lg font-bold text-white block">
                  {name}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Official student name for certifications
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-sm font-mono text-cyan-300 block truncate">
                  {email}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  MFA OTP verification destination
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Target Career Track
                </span>
                <span className="text-sm font-bold text-white block">
                  {careerGoal}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Assigned curriculum pathway
                </span>
              </div>
            </div>

            {/* Approval Notice */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Lock className="w-4 h-4" />
                <span>Dashboard Access Gated by Academic Admin</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                To maintain high integrity across live cybersecurity ranges and practical labs, students are segregated into a verification pool until an Administrator reviews and toggles dashboard and course access.
              </p>
              <p className="text-[11px] text-slate-400">
                Once granted, refreshing this page will instantly launch your full Student Dashboard with interactive labs, assessments, and learning paths.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <form action="/student/pending-approval">
                <Button
                  type="submit"
                  variant="security"
                  className="w-full sm:w-auto font-bold gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Approval Status
                </Button>
              </form>

              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 text-slate-300 hover:bg-white/10 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
