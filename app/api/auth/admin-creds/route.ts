import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/server/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrTsId, secretKey, passkey } = body;

    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter the Admin Secret Key (e.g. TSE-HIER-DUMMY).' },
        { status: 400 }
      );
    }
    if (!passkey || typeof passkey !== 'string' || passkey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter your Admin Passkey.' },
        { status: 400 }
      );
    }

    const res = (await verifyAdminCredentials(emailOrTsId || '', secretKey, passkey)) as any;
    return NextResponse.json({
      success: true,
      email: res.email || '',
      maskedEmail: res.maskedEmail || '',
      name: res.name || '',
      tsId: res.tsId || '',
      warning: res.warning,
      debugOtp: res.debugOtp,
    });
  } catch (err: unknown) {
    let errorMessage = 'Admin security verification failed.';
    if (err instanceof Error) {
      errorMessage = err.message;
      if ('errors' in err && Array.isArray((err as any).errors)) {
        errorMessage = (err as any).errors.map((e: any) => e.message || String(e)).join('; ');
      }
    }
    console.error('[API_ADMIN_CREDS_ERROR]', errorMessage, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
