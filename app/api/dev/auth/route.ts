import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const role = (url.searchParams.get('role') || 'MENTOR').toUpperCase();
    const target = url.searchParams.get('target') || (role === 'MENTOR' ? '/mentor' : '/student');

    if (role === 'MENTOR') {
      const mentor = await prisma.user.findFirst({
        where: { role: 'MENTOR' },
        include: { tsIdentity: true },
      });
      if (mentor) {
        const res = NextResponse.redirect(new URL(target, req.url));
        const sessionData = JSON.stringify({
          userId: mentor.id,
          email: mentor.email,
          name: mentor.name,
          role: mentor.role,
          tsId: mentor.tsIdentity?.tsId || 'TSE-MENTOR',
          isDashboardAccessGranted: true,
          isMentorVerified: true,
        });
        const base64Data = Buffer.from(sessionData).toString('base64');
        res.cookies.set('tse_session', base64Data, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        res.cookies.set('tse_mentor_clearance', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      }
    } else if (role === 'STUDENT') {
      const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        include: { tsIdentity: true },
      });
      if (student) {
        const res = NextResponse.redirect(new URL(target, req.url));
        const sessionData = JSON.stringify({
          userId: student.id,
          email: student.email,
          name: student.name,
          role: student.role,
          tsId: student.tsIdentity?.tsId || 'TSE-STUDENT',
          isDashboardAccessGranted: true,
        });
        const base64Data = Buffer.from(sessionData).toString('base64');
        res.cookies.set('tse_session', base64Data, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      }
    }

    return NextResponse.redirect(new URL('/', req.url));
  } catch (err: any) {
    console.error('Error in dev auth route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
