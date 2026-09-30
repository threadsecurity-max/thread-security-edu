import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { duplicateBankQuestion } from '@/server/services/assessment/question-bank.service';

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
    const duplicated = await duplicateBankQuestion(id);
    return NextResponse.json({ success: true, data: duplicated }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions/[id]/duplicate POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed duplicating question' },
      { status: 400 }
    );
  }
}
