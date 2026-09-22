import { NextResponse } from 'next/server';
import { fetchSearchConsolePerformance } from '@/lib/gcp/searchConsoleService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days') || '28';
    const days = parseInt(daysParam, 10) || 28;

    const data = await fetchSearchConsolePerformance(days);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Admin Search Console API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Search Console telemetry.' },
      { status: 500 }
    );
  }
}
