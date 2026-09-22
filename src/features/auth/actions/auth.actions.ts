'use server';

import {
  requestOtpService,
  verifyOtpService,
  registerStudent,
  verifyAdminCredentials,
  verifySecurityAdminCredentials,
} from '@/server/services/auth.service';
import { RegisterSchema } from '../schemas/auth.schema';
import { setSessionCookie, clearSessionCookie } from '@/lib/auth/session';

/**
 * Handles 3-step Security Admin challenge:
 * 1. Secret Key validation
 * 2. Passkey verification
 * 3. Dispatches OTP to Super Admin Email
 */
export async function verifySecurityAdminChallengeAction(secretKey: string, passkey: string) {
  if (!secretKey || secretKey.trim().length === 0) {
    return { success: false, error: 'Please enter the Security Admin Secret Key.' };
  }
  if (!passkey || passkey.trim().length === 0) {
    return { success: false, error: 'Please enter the Security Admin Passkey.' };
  }

  try {
    const res = await verifySecurityAdminCredentials(secretKey, passkey);
    return {
      success: true,
      maskedEmail: res.maskedEmail,
      warning: res.warning,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Security Admin verification failed.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function verifyAdminCredentialsAction(
  emailOrTsId: string,
  secretKey: string,
  passkey: string
) {
  if (!secretKey || secretKey.trim().length === 0) {
    return { success: false, error: 'Please enter the Admin Secret Key (e.g. XXX-XXXX-XXX).' };
  }
  if (!passkey || passkey.trim().length === 0) {
    return { success: false, error: 'Please enter your Admin Passkey.' };
  }

  try {
    const res = (await verifyAdminCredentials(emailOrTsId, secretKey, passkey)) as any;
    return {
      success: true,
      email: res.email || '',
      name: res.name || '',
      tsId: res.tsId || '',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Admin security verification failed.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validates Mentor Faculty Secret Key and Passkey
 */
export async function verifyMentorCredentialsAction(
  emailOrTsId: string,
  secretKey: string,
  passkey: string
) {
  if (!secretKey || secretKey.trim().length === 0) {
    return { success: false, error: 'Please enter the Mentor Secret Key.' };
  }
  if (!passkey || passkey.trim().length === 0) {
    return { success: false, error: 'Please enter your Mentor Passkey.' };
  }

  try {
    const { verifyMentorCredentials } = await import('@/server/services/auth.service');
    const res = await verifyMentorCredentials(emailOrTsId, secretKey, passkey);
    return {
      success: true,
      email: res.email || '',
      name: res.name || '',
      tsId: res.tsId || '',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Mentor security verification failed.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validates Secret Key and Passkey challenge directly from the Mentor clearance page
 */
export async function verifyMentorClearanceAction(secretKey: string, passkey: string) {
  const { getSession, grantMentorClearance } = await import('@/lib/auth/session');
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: No active faculty mentor session found.' };
  }

  if (!secretKey || secretKey.trim().length === 0) {
    return { success: false, error: 'Please enter the Mentor Secret Key.' };
  }
  if (!passkey || passkey.trim().length === 0) {
    return { success: false, error: 'Please enter the Mentor Passkey.' };
  }

  const { verifyMentorSecretKey, verifyMentorPasskey } = await import('@/lib/security/crypto-vault');
  if (!verifyMentorSecretKey(secretKey)) {
    return { success: false, error: 'Invalid Mentor Secret Key.' };
  }
  if (!verifyMentorPasskey(passkey)) {
    return { success: false, error: 'Invalid Mentor Passkey.' };
  }

  await grantMentorClearance();

  const { logAuditEvent } = await import('@/server/security/audit');
  await logAuditEvent({
    actorId: session.userId,
    action: 'MENTOR_CLEARANCE_VERIFIED',
    entity: 'USER',
    entityId: session.userId,
    details: `Mentor ${session.email} successfully validated Secret Key and Passkey challenge.`,
  });

  return { success: true };
}

export async function requestOtpAction(emailOrTsId: string) {
  if (!emailOrTsId || emailOrTsId.trim().length < 3) {
    return {
      success: false,
      error: 'Please enter a valid Email Address, TS-ID, or Security Secret Key.',
    };
  }

  try {
    const res = await requestOtpService(emailOrTsId);
    return {
      success: true,
      isAdmin: res.isAdmin,
      isMentor: (res as any).isMentor || false,
      isMentorSecretKey: (res as any).isMentorSecretKey || false,
      isSecurityAdminSecretKey: (res as any).isSecurityAdminSecretKey || false,
      maskedEmail: res.maskedEmail,
      email: res.email,
      tsId: res.tsId,
      warning: res.warning,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send MFA verification code.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function verifyOtpAction(emailOrTsId: string, code: string) {
  if (!code || code.trim().length !== 6) {
    return {
      success: false,
      error: 'Please enter the 6-digit MFA code sent to your email.',
    };
  }

  try {
    const user = await verifyOtpService(emailOrTsId, code);
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tsId: user.tsId,
      isDashboardAccessGranted: user.isDashboardAccessGranted,
      isMentorVerified: (user as any).isMentorVerified || false,
    });

    if (user.role === 'MENTOR') {
      const { grantMentorClearance } = await import('@/lib/auth/session');
      await grantMentorClearance();
    }

    return {
      success: true,
      user,
      redirectTo: user.redirectTo,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Verification failed.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  return { success: true, redirectTo: '/login' };
}

export async function registerAction(formData: unknown) {
  const result = RegisterSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid input data.',
    };
  }

  try {
    const user = await registerStudent(result.data);
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tsId: user.tsId,
      isDashboardAccessGranted: false,
    });

    return {
      success: true,
      user,
      redirectTo: '/?notice=registered-pending',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Registration failed.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
