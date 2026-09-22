import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Verify live database connection via raw count query
    const [userCount, batchCount] = await Promise.all([
      prisma.user.count(),
      (prisma as any).batch.count(),
    ]);

    const latencyMs = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();

    return NextResponse.json(
      {
        status: 'HEALTHY',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
        database: {
          status: 'CONNECTED',
          engine: 'Prisma PostgreSQL',
          latencyMs,
          totalUsers: userCount,
          totalBatches: batchCount,
        },
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          memory: {
            rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        error: error.message || 'Database connection error',
      },
      { status: 503 }
    );
  }
}
