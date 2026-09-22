import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/transaction-manager';

export async function GET() {
  try {
    // Ping database query
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'READY',
      database: 'HEALTHY',
      timestamp: new Date().toISOString(),
      service: 'threads-edu-lms',
    });
  } catch (error: any) {
    console.error('[Health Readiness Check Failed]:', error);
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        database: 'DISCONNECTED',
        timestamp: new Date().toISOString(),
        error: 'Database ping failed',
      },
      { status: 503 }
    );
  }
}
