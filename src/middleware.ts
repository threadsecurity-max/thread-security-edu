import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define route access policies
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'],
  '/mentor': ['SUPER_ADMIN', 'MENTOR'],
  '/student': ['SUPER_ADMIN', 'STUDENT'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Generate Nonce & Construct Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://upload-widget.cloudinary.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://res.cloudinary.com https://lh3.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.cloudinary.com https://api.resend.com https://oauth2.googleapis.com https://www.googleapis.com;
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
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

    if (origin && origin !== allowedOrigin && !origin.endsWith('.threadsecurity.in')) {
      return new NextResponse(
        JSON.stringify({ success: false, error: { code: 'CORS_VIOLATION', message: 'Forbidden origin' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. Server-Authoritative Route Protection & RBAC
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'tse-lms-super-secret-jwt-key-2026' });

      if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
        return NextResponse.redirect(loginUrl);
      }

      const userRole = (token.role as string) || 'GUEST';
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
