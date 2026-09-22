import { NextResponse } from 'next/server';
import { runFullSiteSeoAudit } from '@/lib/seo/seoAuditEngine';

export async function GET() {
  try {
    const auditData = await runFullSiteSeoAudit();

    return NextResponse.json({
      success: true,
      data: auditData,
    });
  } catch (error: any) {
    console.error('[Admin SEO Audit API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run Technical SEO audit.' },
      { status: 500 }
    );
  }
}
