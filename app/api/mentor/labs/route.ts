import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createCybersecurityLab } from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const labs = await prisma.lab.findMany({
      include: {
        course: true,
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                tsIdentity: { select: { tsId: true } },
              },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, labs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, objective, courseId, difficulty, estimatedMinutes, skills, instructions, labUrl } = body;

    if (!title || !objective || !courseId) {
      return NextResponse.json({ error: 'Title, objective, and course are required.' }, { status: 400 });
    }

    const lab = await createCybersecurityLab(session.userId, {
      title,
      objective,
      courseId,
      difficulty: difficulty || 'INTERMEDIATE',
      estimatedMinutes: parseInt(estimatedMinutes || '60', 10),
      skills: skills || 'Hands-on Security Analysis',
      instructions: instructions || 'Execute terminal exploitation and extract flag.',
      labUrl,
    });

    return NextResponse.json({ success: true, lab });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
