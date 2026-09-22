import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/server/database/transaction-manager';
import { MfaVerifySchema } from '@/lib/security/validation.schemas';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import timingSafeCompare from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 1. Schema Validation
    const body = await req.json();
    const parseResult = MfaVerifySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', details: parseResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { identifier, code } = parseResult.data;

    // 2. Strict Rate Limiting (3 attempts per 5 minutes per identifier)
    const rateLimit = checkRateLimit(`mfa:${identifier}`, { windowMs: 5 * 60 * 1000, max: 3 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: 'TOO_MANY_ATTEMPTS', message: 'Maximum MFA verification attempts exceeded. Please request a new code in 5 minutes.' } },
        { status: 429 }
      );
    }

    // 3. Retrieve Latest Unused OTP Record
    const otpRecord = await (prisma as any).otpVerification.findFirst({
      where: {
        emailOrTsId: identifier,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OR_EXPIRED_OTP', message: 'The MFA OTP code is invalid or has expired.' } },
        { status: 400 }
      );
    }

    // Check Max Attempts on Record
    if (otpRecord.attempts >= 3) {
      // Invalidate record due to brute force
      await (prisma as any).otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      return NextResponse.json(
        { success: false, error: { code: 'OTP_LOCKED', message: 'Maximum attempt threshold reached. OTP invalidated.' } },
        { status: 400 }
      );
    }

    // 4. Constant-Time Timing Safe Code Comparison
    const isValidCode = timingSafeCompare.timingSafeEqual(
      Buffer.from(otpRecord.code.padEnd(6, ' ')),
      Buffer.from(code.padEnd(6, ' '))
    );

    if (!isValidCode) {
      // Increment attempt counter
      await (prisma as any).otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: 'Invalid MFA verification code.' } },
        { status: 400 }
      );
    }

    // 5. Invalidate OTP Immediately (Single-Use Guarantee)
    await (prisma as any).otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // 6. Record Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'MFA_VERIFIED_SUCCESS',
        entity: 'User',
        entityId: identifier,
        details: `Successful MFA OTP verification for ${identifier}`,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'MFA verification successful.',
    });
  } catch (error: any) {
    console.error('[MFA Verification API Error]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred during MFA verification.' } },
      { status: 500 }
    );
  }
}
