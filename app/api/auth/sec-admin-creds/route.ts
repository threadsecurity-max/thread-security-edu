import { NextRequest, NextResponse } from 'next/server';
import { verifySecurityAdminCredentials } from '@/server/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretKey, passkey } = body;

    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter the Security Admin Secret Key.' },
        { status: 400 }
      );
    }
    if (!passkey || typeof passkey !== 'string' || passkey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter the Security Admin Passkey.' },
        { status: 400 }
      );
    }

    const res = await verifySecurityAdminCredentials(secretKey, passkey);
    return NextResponse.json({
      success: true,
      maskedEmail: res.maskedEmail,
      warning: res.warning,
    });
  } catch (err: unknown) {
    let errorMessage = 'Security Admin verification failed.';
    if (err instanceof Error) {
      errorMessage = err.message;
      if ('errors' in err && Array.isArray((err as any).errors)) {
        errorMessage = (err as any).errors.map((e: any) => e.message || String(e)).join('; ');
      }
    }
    console.error('[API_SEC_ADMIN_AUTH_ERROR]', errorMessage, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
