import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { bulkImportQuestions } from '@/server/services/assessment/question-bank.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const records = Array.isArray(body?.records) ? body.records : Array.isArray(body) ? body : [];

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No records provided for import' }, { status: 400 });
    }

    const report = await bulkImportQuestions(records);
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/questions/import POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed importing questions' },
      { status: 400 }
    );
  }
}
