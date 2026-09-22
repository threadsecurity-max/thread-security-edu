import { cookies } from 'next/headers';

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

export async function setSessionCookie(user: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(user);
  const base64Data = Buffer.from(sessionData).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, base64Data, {
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
  cookieStore.set(MENTOR_CLEARANCE_COOKIE, 'true', {
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
  return cookieStore.get(MENTOR_CLEARANCE_COOKIE)?.value === 'true';
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(decoded) as UserSession;
    return session;
  } catch (error) {
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
