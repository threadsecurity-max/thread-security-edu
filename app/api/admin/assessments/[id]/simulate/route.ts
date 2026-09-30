import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { simulateBlueprint } from '@/server/services/assessment/blueprint.service';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;

    const simulation = await simulateBlueprint(id);

    return NextResponse.json({
      success: true,
      data: simulation,
    });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/[id]/simulate POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed simulating blueprint' },
      { status: 500 }
    );
  }
}
