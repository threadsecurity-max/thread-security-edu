import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updateCategory } from '@/server/services/assessment/category.service';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateCategory(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/categories/[id] PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed updating category' },
      { status: 400 }
    );
  }
}
