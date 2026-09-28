import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpService } from '@/server/services/auth.service';
import {
  signSessionToken,
  SESSION_COOKIE_NAME,
  MENTOR_CLEARANCE_COOKIE,
  SESSION_MAX_AGE,
  generateMentorClearanceToken,
} from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrTsId, code } = body;

    if (!code || typeof code !== 'string' || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter the 6-digit MFA code sent to your email.' },
        { status: 400 }
      );
    }

    if (!emailOrTsId || typeof emailOrTsId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identifier (Email or TS-ID) is required.' },
        { status: 400 }
      );
    }

    const user = await verifyOtpService(emailOrTsId, code);
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tsId: user.tsId,
      isDashboardAccessGranted: user.isDashboardAccessGranted,
      isMentorVerified: (user as any).isMentorVerified || false,
    };

    const signedToken = signSessionToken(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user,
      redirectTo: user.redirectTo,
    });

    const proto = req.headers.get('x-forwarded-proto') || (req.nextUrl.protocol === 'https:' ? 'https' : 'http');
    const isHttps = proto === 'https' || req.nextUrl.protocol === 'https:';
    const isLocalhost = req.headers.get('host')?.includes('localhost') || req.headers.get('host')?.includes('127.0.0.1');
    const isSecure = isHttps || (process.env.NODE_ENV === 'production' && !isLocalhost);

    // Set signed session cookie
    response.cookies.set(SESSION_COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    // If Mentor role, grant mentor clearance cookie
    if (user.role === 'MENTOR') {
      const clearanceToken = generateMentorClearanceToken();

      response.cookies.set(MENTOR_CLEARANCE_COOKIE, clearanceToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });
    }

    return response;
  } catch (err: unknown) {
    let errorMessage = 'Verification failed.';
    if (err instanceof Error) {
      errorMessage = err.message;
      if ('errors' in err && Array.isArray((err as any).errors)) {
        errorMessage = (err as any).errors.map((e: any) => e.message || String(e)).join('; ');
      }
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error('[API_AUTH_VERIFY_OTP_ERROR]', errorMessage, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
