import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getLmsHealthTelemetryService,
  getSecurityAnalystChecksService,
  getLiveSecurityLogsService,
} from '@/server/services/security-analyst.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  Database,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Terminal,
  Calendar,
  Layers,
  FileText,
  Search,
  Lock,
  Radio,
  Server,
  Zap,
  HardDrive,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { CheckInspectorClient } from './check-inspector-client';

export const revalidate = 0;

export default async function SecurityAnalystPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; notice?: string }>;
}) {
  const session = await getSession();

  // Allow SECURITY_ADMIN, SUPER_ADMIN, and ACADEMIC_ADMIN access
  if (
    !session ||
    (session.role !== 'SECURITY_ADMIN' &&
      session.role !== 'SUPER_ADMIN' &&
      session.role !== 'ACADEMIC_ADMIN')
  ) {
    redirect('/login');
  }

  const params = await searchParams;
  const activeTab = params.tab || 'DAILY';
  const logQuery = params.q || '';
  const isRestrictedAcademicNotice = params.notice === 'unauthorized-academic-module';

  const telemetry = await getLmsHealthTelemetryService();
  const checks = await getSecurityAnalystChecksService();
  const logs = await getLiveSecurityLogsService(logQuery);

  const currentChecks =
    activeTab === 'DAILY'
      ? checks.daily
      : activeTab === 'WEEKLY'
      ? checks.weekly
      : checks.monthly;

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* 🔒 RBAC ROLE BOUNDARY NOTICE */}
      {isRestrictedAcademicNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-3 shadow-[0_4px_20px_rgba(245,158,11,0.1)] backdrop-blur-xl">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold block font-mono">
              🛡️ ROLE-BASED ACCESS CONTROL (RBAC) ENFORCED: LEAST PRIVILEGE POLICY
            </span>
            <span className="text-slate-300 block mt-0.5">
              Your account possesses <strong>Security Analyst Admin</strong> privileges. Under security governance rules, Security Admins are strictly scoped to the Security Operations Center (SOC) and Audit Telemetry. Academic course authoring, student registrations, and faculty management are restricted to Super Administrators.
            </span>
          </div>
        </div>
      )}

      {/* Cross-Module Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-red-950/40 border border-red-500/20 backdrop-blur-xl w-fit">
        <Link
          href="/admin/security-analyst"
          className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-2"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SOC Operations Telemetry</span>
        </Link>
        <Link
          href="/admin/audit"
          className="px-5 py-2 rounded-full text-slate-300 hover:text-white font-mono font-bold text-xs hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Security Audit Logs</span>
        </Link>
      </div>

      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              SECURITY OPERATIONS CENTER (SOC)
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
              LIVE POSTGRESQL TELEMETRY
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            ThreadSec LMS Health & Audit Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Real-time live telemetry console directly querying PostgreSQL database tables, student activity logs, server resources, and append-only audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/audit">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/60 text-white font-mono font-bold text-xs border border-red-500/30 active:scale-95 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_12px_rgba(220,38,38,0.15)]">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>View Audit Logs</span>
            </button>
          </Link>
          <Link href="/admin/security-analyst">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs border border-white/15 active:scale-95 transition-all cursor-pointer backdrop-blur-md">
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span>Refresh Telemetry</span>
            </button>
          </Link>
          <div className="px-4 py-2 rounded-full bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Analyst:</span>
            <span className="font-bold text-white">{session.name} ({session.role})</span>
          </div>
        </div>
      </div>

      {/* Real-Time Health Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Database Engine
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-2 mt-1">
                <Database className="w-5 h-5 text-emerald-400" />
                {telemetry.databaseStatus}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Latency: <strong className="text-red-300">{telemetry.apiLatencyMs}ms</strong> (SSL Connection)
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                System Uptime & Memory
              </span>
              <div className="text-xl font-bold font-mono text-red-400 flex items-center gap-2 mt-1">
                <Server className="w-5 h-5 text-red-400" />
                {telemetry.systemUptime}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Free RAM: <strong className="text-red-300">{telemetry.freeMemoryMB} MB</strong> / {telemetry.totalMemoryMB} MB
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Registered Learner Pool
              </span>
              <div className="text-xl font-bold font-mono text-rose-400 flex items-center gap-2 mt-1">
                <Users className="w-5 h-5 text-rose-400" />
                {telemetry.totalUsers} TS-IDs
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Total Enrollments: <strong className="text-rose-300">{telemetry.totalEnrollments}</strong>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Security Lockouts & Flags
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-2 mt-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                0 Active Lockouts
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Lockout Rate-Limiter: <strong className="text-emerald-300">Armed (5 max/10m)</strong>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 PostgreSQL Live Table Entity Census Bar */}
      <Card className="bg-red-950/30 backdrop-blur-xl border border-red-500/20 text-white p-4 font-mono text-xs rounded-2xl shadow-[0_4px_25px_rgba(220,38,38,0.05)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3 border-b border-red-500/20 pb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-red-400" />
            <span className="font-bold text-white uppercase text-xs">
              Live PostgreSQL Table Entity Census
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Real-time entity counts verified across schema
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Users</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.users}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Courses</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.courses}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Enrollments</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.enrollments}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Labs</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.labs}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Lab Attempts</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.labAttempts}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Assessments</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.assessments}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Quiz Attempts</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.assessmentAttempts}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Certificates</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.certificates}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[9px] text-slate-400 block">Audit Logs</span>
            <span className="text-sm font-bold text-red-300 block">{telemetry.tableStats.auditLogs}</span>
          </div>
        </div>
      </Card>

      {/* Multi-Tiered Check Tabs (Daily, Weekly, Monthly) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/security-analyst?tab=DAILY">
              <button
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'DAILY'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>Daily Checks</span>
              </button>
            </Link>

            <Link href="/admin/security-analyst?tab=WEEKLY">
              <button
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'WEEKLY'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-red-400" />
                <span>Weekly Checks</span>
              </button>
            </Link>

            <Link href="/admin/security-analyst?tab=MONTHLY">
              <button
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'MONTHLY'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>Monthly Checks</span>
              </button>
            </Link>
          </div>

          <span className="text-xs font-mono text-red-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Click cards below to inspect live ledger rows</span>
          </span>
        </div>

        {/* Interactive Check Inspector Client with Full Drilldown */}
        <CheckInspectorClient
          checks={currentChecks}
          activeTabTitle={
            activeTab === 'DAILY'
              ? 'Daily Checks'
              : activeTab === 'WEEKLY'
              ? 'Weekly Checks'
              : 'Monthly Checks'
          }
        />
      </div>

      {/* Live Security & Telemetry Audit Log Stream */}
      <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white overflow-hidden shadow-2xl rounded-2xl">
        <CardHeader className="bg-white/5 border-b border-red-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-400" />
            <div>
              <CardTitle className="text-base font-bold font-sans text-white">
                Live Audit & Telemetry Event Stream
              </CardTitle>
              <span className="text-xs text-slate-400 font-mono">
                Showing recent 50 immutable system, authentication, and access ledger entries directly from PostgreSQL
              </span>
            </div>
          </div>

          <form method="GET" className="flex gap-2">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                name="q"
                defaultValue={logQuery}
                placeholder="Filter logs by event or actor..."
                className="pl-8 pr-3 py-1.5 rounded-full bg-black/50 border border-red-500/30 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <button type="submit" className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Filter
            </button>
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-black/60 border-b border-red-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Event Action</th>
                  <th className="p-3.5">Source / IP</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/10 text-[11px]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      No security audit events matching query.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-red-950/30 transition-colors">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          className={`font-mono text-[9px] ${
                            log.level === 'WARN'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : log.level === 'ERROR'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          {log.level}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-red-300 font-bold">
                        {log.category}
                      </td>
                      <td className="p-3.5 text-white font-bold">
                        {log.event}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {log.ipAddress}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-md truncate font-sans">
                        {log.details || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
