import { NextRequest, NextResponse } from 'next/server';
import { verifyMentorCredentials } from '@/server/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrTsId, secretKey, passkey } = body;

    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter the Mentor Secret Key.' },
        { status: 400 }
      );
    }
    if (!passkey || typeof passkey !== 'string' || passkey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter your Mentor Passkey.' },
        { status: 400 }
      );
    }

    const res = await verifyMentorCredentials(emailOrTsId || '', secretKey, passkey);
    return NextResponse.json({
      success: true,
      email: res.email || '',
      maskedEmail: res.maskedEmail || '',
      name: res.name || '',
      tsId: res.tsId || '',
      warning: res.warning,
      debugOtp: (res as any).debugOtp,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Mentor security verification failed.';
    console.error('[API_MENTOR_CREDS_ERROR]', errorMessage, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
