import { NextResponse } from 'next/server';
import { syncAllContentToVector, getUpstashVectorIndex } from '@/lib/vector/upstashVectorService';

export async function GET() {
  try {
    const client = getUpstashVectorIndex();
    if (!client) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'Upstash Vector credentials not configured.',
      });
    }

    const info = await client.info();

    return NextResponse.json({
      success: true,
      configured: true,
      info,
    });
  } catch (error: any) {
    console.error('[Vector Sync GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch vector index info' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const syncResult = await syncAllContentToVector();

    return NextResponse.json({
      success: syncResult.success,
      data: syncResult,
      message: `Successfully indexed ${syncResult.indexedCount} assets (${syncResult.totalCourses} courses, ${syncResult.totalBlogs} blogs) into Upstash Vector.`,
    });
  } catch (error: any) {
    console.error('[Vector Sync POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync content to vector' },
      { status: 500 }
    );
  }
}
