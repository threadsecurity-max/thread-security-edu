import { cookies } from 'next/headers';
import {
  type UserSession,
  SESSION_COOKIE_NAME,
  MENTOR_CLEARANCE_COOKIE,
  SESSION_MAX_AGE,
  getAuthSecrets,
  getAuthSecret,
  constantTimeCompare,
  signSessionToken,
  verifySessionToken,
  generateMentorClearanceToken,
  verifyMentorClearanceToken,
  toBase64Url,
  fromBase64Url,
} from './session-token';

export type { UserSession };
export {
  SESSION_COOKIE_NAME,
  MENTOR_CLEARANCE_COOKIE,
  SESSION_MAX_AGE,
  getAuthSecrets,
  getAuthSecret,
  constantTimeCompare,
  signSessionToken,
  verifySessionToken,
  generateMentorClearanceToken,
  verifyMentorClearanceToken,
  toBase64Url,
  fromBase64Url,
};

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
  const clearanceToken = generateMentorClearanceToken();

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

  return verifyMentorClearanceToken(cookieVal);
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
