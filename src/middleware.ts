import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkIpRateLimit, extractIpFromHeaders } from '@/lib/security/ip-guard';
import { verifySessionToken, type UserSession } from '@/lib/auth/session-token';

// Define route access policies
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'],
  '/mentor': ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'MENTOR'],
  '/student': ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'STUDENT'],
};

function getSessionFromRequest(request: NextRequest): UserSession | null {
  try {
    let rawCookie = request.cookies.get('tse_session')?.value;
    if (!rawCookie) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|;\s*)tse_session=([^;]+)/);
      if (match) {
        rawCookie = match[1];
      }
    }
    if (!rawCookie) return null;
    return verifySessionToken(rawCookie);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  const { pathname } = request.nextUrl;

  // Canonical Domain Enforcement: Redirect apex threadsecurity.in to www.threadsecurity.in
  // Exempt crawler discovery endpoints (/sitemap.xml, /robots.txt) so Google Search Console can fetch directly without redirect failures
  if (host === 'threadsecurity.in' && pathname !== '/sitemap.xml' && pathname !== '/robots.txt') {
    return NextResponse.redirect(
      `https://www.threadsecurity.in${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }

  // 1. IP Rate Limiting for Authentication & Verification Endpoints
  if (pathname.startsWith('/api/auth') || pathname === '/login') {
    const clientIp = extractIpFromHeaders(request.headers);
    const isLocalDev =
      process.env.NODE_ENV === 'development' ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === 'localhost';

    const maxRequests = isLocalDev ? 500 : 60;
    const rateLimit = checkIpRateLimit(clientIp, maxRequests, 60);

    if (!rateLimit.allowed) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: `Too many authentication attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
            code: 'RATE_LIMIT_EXCEEDED',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimit.retryAfterSeconds),
            },
          }
        );
      }
    }
  }

  // Rate Limiting for Public High-Abuse Endpoints (Contact & Certificate Verification)
  if (pathname.startsWith('/api/contact') || pathname.startsWith('/api/verify') || pathname === '/contact') {
    const clientIp = extractIpFromHeaders(request.headers);
    const isLocalDev =
      process.env.NODE_ENV === 'development' ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === 'localhost';

    const maxRequests = isLocalDev ? 300 : 30;
    const rateLimit = checkIpRateLimit(clientIp, maxRequests, 60);

    if (!rateLimit.allowed) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
            code: 'RATE_LIMIT_EXCEEDED',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimit.retryAfterSeconds),
            },
          }
        );
      }
    }
  }

  // 2. Generate Nonce & Construct Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://upload-widget.cloudinary.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://res.cloudinary.com https://lh3.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.onrender.com https://api.cloudinary.com https://api.resend.com https://oauth2.googleapis.com https://www.googleapis.com;
    frame-src 'self' https://widget.cloudinary.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Apply Security Headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // CORS Verification for API Routes
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:8080';

    const isTrustedOrigin =
      !origin ||
      origin === request.nextUrl.origin ||
      origin === allowedOrigin ||
      origin.endsWith('.threadsecurity.in') ||
      origin.endsWith('.onrender.com') ||
      origin === 'https://threadsecurity.in';

    if (!isTrustedOrigin) {
      return new NextResponse(
        JSON.stringify({ success: false, error: { code: 'CORS_VIOLATION', message: 'Forbidden origin' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. Server-Authoritative Route Protection & RBAC
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      const session = getSessionFromRequest(request);

      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const userRole = (session.role || 'GUEST').toUpperCase();
      if (!allowedRoles.includes(userRole)) {
        if (pathname.startsWith('/api')) {
          return new NextResponse(
            JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' } }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
