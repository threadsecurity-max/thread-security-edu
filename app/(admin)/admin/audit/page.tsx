import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Lock, Clock, Search, Terminal, User, FileJson, ShieldCheck, RefreshCw } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAuditLogMonitorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();

  // Strict anti-IDOR role validation: allow SUPER_ADMIN, ACADEMIC_ADMIN, and SECURITY_ADMIN
  if (
    !session ||
    (session.role !== 'SUPER_ADMIN' &&
      session.role !== 'ACADEMIC_ADMIN' &&
      session.role !== 'SECURITY_ADMIN')
  ) {
    redirect('/login');
  }

  const params = await searchParams;
  const query = params.q || '';

  const auditLogs = await prisma.auditLog.findMany({
    where: query
      ? {
          OR: [
            { action: { contains: query } },
            { entity: { contains: query } },
            { details: { contains: query } },
          ],
        }
      : {},
    include: {
      actor: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Cross-Module Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-red-950/40 border border-red-500/20 backdrop-blur-xl w-fit">
        <Link
          href="/admin/security-analyst"
          className="px-5 py-2 rounded-full text-slate-300 hover:text-white font-mono font-bold text-xs hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <Terminal className="w-3.5 h-3.5 text-red-400" />
          <span>SOC Operations Telemetry</span>
        </Link>
        <Link
          href="/admin/audit"
          className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-2"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security Audit Logs</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              SECURITY & AUDIT MONITOR
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
              IMMUTABLE AUDIT TRAIL
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 font-mono">
            Append-Only Audit Directory ({auditLogs.length} Records)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1">
            Immutable system ledgers capturing administrative actions, MFA authentication events, mentor creations, and lab evaluations across PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/security-analyst">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/60 text-white font-mono font-bold text-xs border border-red-500/30 active:scale-95 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_12px_rgba(220,38,38,0.15)]">
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              <span>SOC Telemetry Console</span>
            </button>
          </Link>
          <Link href="/admin/audit">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs border border-white/15 active:scale-95 transition-all cursor-pointer backdrop-blur-md">
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span>Refresh Audit Logs</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-red-950/30 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)]">
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search audit logs by Action (e.g. MFA_OTP_LOGIN_SUCCESS), Entity, or details..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-black/50 border border-red-500/30 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(220,38,38,0.3)] transition-all"
          >
            Filter Logs
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white overflow-hidden shadow-2xl rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black/60 border-b border-red-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Formatted Event Payload</th>
                <th className="p-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10 text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No security audit logs found matching query.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  let parsedDetails = log.details;
                  try {
                    if (log.details && log.details.startsWith('{')) {
                      parsedDetails = JSON.stringify(JSON.parse(log.details), null, 2);
                    }
                  } catch (e) {
                    // Keep raw details string
                  }

                  return (
                    <tr key={log.id} className="hover:bg-red-950/30 transition-colors">
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {log.actor ? (
                          <div>
                            <span className="font-bold text-white block">{log.actor.name}</span>
                            <span className="text-[10px] text-red-300 block">{log.actor.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">System (Automated)</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono text-[11px] bg-red-500/20 text-red-300 border-red-500/40 font-bold">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-white">{log.entity}</td>
                      <td className="p-4 text-slate-300 max-w-lg">
                        <div className="p-2.5 rounded-xl bg-black/60 border border-red-500/20 text-red-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-24 shadow-inner">
                          {parsedDetails || `Entity ID: ${log.entityId || 'N/A'}`}
                        </div>
                      </td>
                      <td className="p-4 text-right text-slate-400 font-mono">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
