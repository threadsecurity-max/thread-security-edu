import { NextRequest } from 'next/server';

/**
 * Validates state-changing HTTP requests against CSRF attacks
 * by verifying the Origin/Referer headers against trusted application domains.
 */
export function validateCsrfOrigin(request: NextRequest): { isValid: boolean; reason?: string } {
  const method = request.method.toUpperCase();

  // Safe HTTP methods do not require CSRF validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { isValid: true };
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  const targetOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!targetOrigin) {
    return { isValid: false, reason: 'Missing Origin and Referer headers' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || `http://${host || 'localhost:8080'}`;
  let expectedOrigin = '';
  try {
    expectedOrigin = new URL(appUrl).origin;
  } catch {
    expectedOrigin = targetOrigin;
  }

  const isTrusted =
    targetOrigin === expectedOrigin ||
    targetOrigin === request.nextUrl.origin ||
    targetOrigin.endsWith('.threadsecurity.in') ||
    targetOrigin.endsWith('.onrender.com') ||
    targetOrigin === 'https://threadsecurity.in';

  if (!isTrusted) {
    return { isValid: false, reason: `Origin mismatch: expected ${expectedOrigin}, got ${targetOrigin}` };
  }

  return { isValid: true };
}
