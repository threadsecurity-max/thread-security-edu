import { NextResponse } from 'next/server';
import { requestGoogleInstantIndexing } from '@/lib/gcp/indexingService';
import { prisma } from '@/server/database/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, action = 'URL_UPDATED' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const result = await requestGoogleInstantIndexing(url, action, 'ADMIN_USER');

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error('[Admin Index Now API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit URL to Google Indexing API.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const logs = await (prisma as any).indexingLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[Admin Index Now API] Error fetching logs:', error);
    return NextResponse.json({ success: true, logs: [] });
  }
}
