import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: { courses: [], modules: [], assessments: [], resources: [] } });
    }

    const [courses, modules, assessments, resources] = await Promise.all([
      prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
        },
      }),
      prisma.module.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: {
          course: { select: { id: true, title: true } },
          lessons: { take: 1, select: { id: true } },
        },
      }),
      prisma.assessment.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: {
          course: { select: { id: true, title: true } },
        },
      }),
      prisma.batchResource.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          url: true,
          resourceType: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      results: {
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          href: `/student/courses/${c.id}`,
        })),
        modules: modules.map((m) => ({
          id: m.id,
          title: m.title,
          courseTitle: m.course.title,
          href: m.lessons[0]
            ? `/student/courses/${m.course.id}/learn/${m.lessons[0].id}`
            : `/student/courses/${m.course.id}`,
        })),
        assessments: assessments.map((a) => ({
          id: a.id,
          title: a.title,
          courseTitle: a.course.title,
          href: `/student/assessments/${a.id}`,
        })),
        resources: resources.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.resourceType,
          href: r.url,
        })),
      },
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
