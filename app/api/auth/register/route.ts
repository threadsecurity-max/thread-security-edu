import { NextRequest, NextResponse } from 'next/server';
import { registerStudent } from '@/server/services/auth.service';
import { RegisterSchema } from '@/features/auth/schemas/auth.schema';
import {
  signSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || 'Invalid input data.' },
        { status: 400 }
      );
    }

    const user = await registerStudent(result.data);
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tsId: user.tsId,
      isDashboardAccessGranted: false,
    };

    const signedToken = signSessionToken(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user,
      redirectTo: '/?notice=registered-pending',
    });

    response.cookies.set(SESSION_COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Registration failed.';
    console.error('[API_AUTH_REGISTER_ERROR]', errorMessage, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
