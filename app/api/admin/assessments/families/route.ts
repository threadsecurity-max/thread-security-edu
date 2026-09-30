import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listQuestionFamilies, createQuestionFamily } from '@/server/services/assessment/question-bank.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const families = await listQuestionFamilies();
    return NextResponse.json({ success: true, data: families });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/families GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed listing question families' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.code || !body.name) {
      return NextResponse.json({ success: false, error: 'Family code and name are required' }, { status: 400 });
    }

    const family = await createQuestionFamily({
      code: body.code,
      name: body.name,
      topic: body.topic,
      description: body.description,
    });

    return NextResponse.json({ success: true, data: family }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/families POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed creating question family' },
      { status: 400 }
    );
  }
}
