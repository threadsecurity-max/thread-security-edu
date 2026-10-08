import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const batches = await getMentorAuthorizedBatches(session.userId);
    const batchIds = batches.map((b: any) => b.id);

    const resources = await (prisma as any).batchResource.findMany({
      where: { batchId: { in: batchIds } },
      include: {
        batch: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, resources });
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
    const { batchId, title, description, resourceType, url } = body;

    if (!batchId || !title || !url) {
      return NextResponse.json({ error: 'Batch, title, and file URL are required.' }, { status: 400 });
    }

    const resource = await (prisma as any).batchResource.create({
      data: {
        batchId,
        title: title.trim(),
        description: description?.trim() || null,
        resourceType: resourceType || 'PDF',
        url: url.trim(),
        createdById: session.userId,
      },
      include: { batch: true },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
