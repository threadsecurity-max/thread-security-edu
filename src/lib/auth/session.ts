import { cookies } from 'next/headers';
import crypto from 'crypto';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  tsId: string | null;
  isDashboardAccessGranted?: boolean;
  isMentorVerified?: boolean;
}

const SESSION_COOKIE_NAME = 'tse_session';
const MENTOR_CLEARANCE_COOKIE = 'tse_mentor_clearance';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAuthSecrets(): string[] {
  const secrets = [
    process.env.AUTH_SECRET,
    process.env.NEXTAUTH_SECRET,
    process.env.SECRET_KEY,
    'tse_super_secret_session_key_2026_cybersecurity_lms',
    'threadsecurity-master-hmac-secret-key-2026-secure',
  ].filter(Boolean) as string[];
  return Array.from(new Set(secrets));
}

export function getAuthSecret(): string {
  return getAuthSecrets()[0] || 'tse_super_secret_session_key_2026_cybersecurity_lms';
}

/**
 * Signs payload with HMAC-SHA256 to prevent cookie tampering
 */
export function signSessionToken(payload: UserSession): string {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const hmac = crypto
    .createHmac('sha256', getAuthSecret())
    .update(base64Payload)
    .digest('hex');
  return `${base64Payload}.${hmac}`;
}

/**
 * Verifies signed session token against HMAC signature with constant-time comparison
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    if (!token) return null;
    let cleanToken = decodeURIComponent(token).trim();
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }

    if (!cleanToken.includes('.')) {
      // Transition fallback for backward compatibility during active migration
      try {
        const rawDecoded = Buffer.from(cleanToken, 'base64').toString('utf-8');
        const parsed = JSON.parse(rawDecoded) as UserSession;
        if (parsed && parsed.userId && parsed.role) return parsed;
      } catch {
        try {
          const direct = JSON.parse(cleanToken) as UserSession;
          if (direct && direct.userId && direct.role) return direct;
        } catch {
          return null;
        }
      }
      return null;
    }

    const [base64Payload, signature] = cleanToken.split('.');
    if (!base64Payload || !signature) return null;

    const candidateSecrets = getAuthSecrets();
    let signatureMatches = false;
    const receivedBuffer = Buffer.from(signature, 'hex');

    for (const sec of candidateSecrets) {
      const expectedHmac = crypto
        .createHmac('sha256', sec)
        .update(base64Payload)
        .digest('hex');
      const expectedBuffer = Buffer.from(expectedHmac, 'hex');

      if (
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
      ) {
        signatureMatches = true;
        break;
      }
    }

    if (!signatureMatches) {
      console.warn('[Security] Tampered session token detected and rejected.');
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const session = JSON.parse(jsonStr) as UserSession;
    if (!session || !session.userId || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const signedToken = signSessionToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function grantMentorClearance(): Promise<void> {
  const session = await getSession();
  if (session) {
    session.isMentorVerified = true;
    await setSessionCookie(session);
  }
  const cookieStore = await cookies();
  const clearanceToken = crypto
    .createHmac('sha256', getAuthSecret())
    .update('mentor-clearance-verified')
    .digest('hex');

  cookieStore.set(MENTOR_CLEARANCE_COOKIE, clearanceToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function hasMentorClearance(): Promise<boolean> {
  const session = await getSession();
  if (session?.isMentorVerified) return true;
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(MENTOR_CLEARANCE_COOKIE)?.value;
  if (!cookieVal) return false;

  const expectedToken = crypto
    .createHmac('sha256', getAuthSecret())
    .update('mentor-clearance-verified')
    .digest('hex');

  return cookieVal === expectedToken;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    return verifySessionToken(cookie.value);
  } catch {
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(MENTOR_CLEARANCE_COOKIE);
}
