import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getBankQuestionById,
  updateBankQuestion,
  archiveBankQuestion,
} from '@/server/services/assessment/question-bank.service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const question = await getBankQuestionById(id);
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions/[id] GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching question' },
      { status: 500 }
    );
  }
}

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

    const updated = await updateBankQuestion(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions/[id] PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed updating question' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const archived = await archiveBankQuestion(id);
    return NextResponse.json({ success: true, data: archived });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions/[id] DELETE Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed archiving question' },
      { status: 400 }
    );
  }
}
