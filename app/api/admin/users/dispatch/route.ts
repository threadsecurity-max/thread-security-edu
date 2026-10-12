import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { dispatchUserCredentialsService } from '@/server/services/admin.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required to dispatch credentials.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, customPasskey, customSecretKey } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const res = await dispatchUserCredentialsService(userId, customPasskey, customSecretKey);
    const identifier = ('tsId' in res ? res.tsId : (res as any).mentorId) || '';

    return NextResponse.json({
      success: true,
      email: res.email,
      identifier,
    });
  } catch (error: any) {
    console.error('[API /api/admin/users/dispatch POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed dispatching credentials.' },
      { status: 500 }
    );
  }
}
