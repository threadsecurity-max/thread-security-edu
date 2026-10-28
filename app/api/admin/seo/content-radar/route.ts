import { NextResponse } from 'next/server';
import { getContentRadarSummary, executeOneClickContentBoost } from '@/lib/seo/contentRadarService';

export async function GET() {
  try {
    const summary = await getContentRadarSummary();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('[API Content Radar GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to scan content radar' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { items, boostAll, filter } = body;

    let targetsToBoost: Array<{
      url: string;
      metaTitle: string;
      metaDescription: string;
      focusKeyword?: string;
      keywords?: string[];
    }> = [];

    if (Array.isArray(items) && items.length > 0) {
      targetsToBoost = items;
    } else if (boostAll) {
      const summary = await getContentRadarSummary();
      let matchedItems = summary.items;

      if (filter === 'NEEDS_LIFT') {
        matchedItems = matchedItems.filter((i) => i.currentStatus === 'NEEDS_LIFT');
      } else if (filter === 'NEW') {
        matchedItems = matchedItems.filter((i) => i.isNew || i.currentStatus === 'NEW_UNINDEXED');
      } else if (filter === 'COURSES') {
        matchedItems = matchedItems.filter((i) => i.type === 'COURSE');
      } else if (filter === 'BLOGS') {
        matchedItems = matchedItems.filter((i) => i.type === 'BLOG');
      } else {
        // Boost all that are not optimal or need push
        matchedItems = matchedItems.filter(
          (i) => i.currentStatus === 'NEEDS_LIFT' || i.isNew || i.googlebotStatus !== 'INDEXED_200'
        );
      }

      targetsToBoost = matchedItems.map((item) => ({
        url: item.url,
        metaTitle: item.recommendedTitle,
        metaDescription: item.recommendedDescription,
        focusKeyword: item.focusKeyword,
        keywords: item.lsiKeywords,
      }));
    } else {
      return NextResponse.json(
        { error: 'Please provide either items array or boostAll: true' },
        { status: 400 }
      );
    }

    const executionResult = await executeOneClickContentBoost(targetsToBoost);

    return NextResponse.json({
      success: true,
      message: `Successfully optimized and submitted ${executionResult.successCount} of ${executionResult.totalProcessed} pages to Googlebot.`,
      data: executionResult,
    });
  } catch (error: any) {
    console.error('[API Content Radar POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute 1-click boost' },
      { status: 500 }
    );
  }
}
