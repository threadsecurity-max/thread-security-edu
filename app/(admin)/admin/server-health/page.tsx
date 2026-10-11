import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { ServerHealthClient } from '@/app/(admin)/admin/server-health/server-health-client';

export const metadata = {
  title: 'System Telemetry & Server Health | Thread Security Admin',
  description: 'Live infrastructure telemetry, PostgreSQL connection latency, memory usage, and operational status.',
};

export const revalidate = 0;

export default async function AdminServerHealthPage() {
  const session = await getSession();
  if (
    !session ||
    (session.role !== 'SUPER_ADMIN' &&
      session.role !== 'ACADEMIC_ADMIN' &&
      session.role !== 'SECURITY_ADMIN')
  ) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // 1. Measure PostgreSQL DB ping
  const startPing = Date.now();
  let dbStatus: 'CONNECTED' | 'DISCONNECTED' = 'DISCONNECTED';
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - startPing;
    dbStatus = 'CONNECTED';
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : 'Database ping failure';
    dbLatencyMs = Date.now() - startPing;
  }

  // 2. Node Runtime Metrics
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // 3. Database counts
  let userCount = 0;
  let auditCount = 0;
  try {
    [userCount, auditCount] = await Promise.all([
      prisma.user.count(),
      prisma.auditLog.count(),
    ]);
  } catch {
    // fallback
  }

  const telemetryData = {
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      error: dbError,
      engine: 'PostgreSQL (Prisma Accelerate)',
      userCount,
      auditCount,
    },
    runtime: {
      uptimeSeconds,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV || 'development',
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
    },
    services: {
      emailDispatch: process.env.RESEND_API_KEY ? 'CONFIGURED (Resend)' : 'SANDBOX_MODE',
      authSecret: process.env.AUTH_SECRET ? 'CONFIGURED' : 'DEV_DEFAULT',
      databaseUrl: process.env.DATABASE_URL ? 'CONFIGURED (TLS)' : 'MISSING',
    },
  };

  return <ServerHealthClient initialData={telemetryData} />;
}
