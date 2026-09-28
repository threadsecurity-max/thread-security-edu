import { NextRequest, NextResponse } from 'next/server';
import { requestOtpService } from '@/server/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrTsId } = body;

    if (!emailOrTsId || typeof emailOrTsId !== 'string' || emailOrTsId.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Email Address, TS-ID, or Security Secret Key.' },
        { status: 400 }
      );
    }

    const res = await requestOtpService(emailOrTsId);
    return NextResponse.json({
      success: true,
      isAdmin: res.isAdmin,
      isAdminSecretKey: (res as any).isAdminSecretKey || false,
      isMentor: (res as any).isMentor || false,
      isMentorSecretKey: (res as any).isMentorSecretKey || false,
      isSecurityAdminSecretKey: (res as any).isSecurityAdminSecretKey || false,
      maskedEmail: res.maskedEmail,
      email: res.email,
      tsId: res.tsId,
      warning: res.warning,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send MFA verification code.';
    console.error('[API_AUTH_REQUEST_OTP_ERROR]', errorMessage, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
