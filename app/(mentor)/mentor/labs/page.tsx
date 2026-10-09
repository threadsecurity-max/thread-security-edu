import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/database/prisma';
import { MentorLabsClient } from '@/components/mentor/labs/MentorLabsClient';

export const revalidate = 0;

export default async function MentorLabsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=Unauthorized');
  }

  const params = await searchParams;
  const showCreate = params.create === 'true';

  const [labs, courses] = await Promise.all([
    prisma.lab.findMany({
      include: {
        course: {
          select: { id: true, title: true, category: true },
        },
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
      take: 60,
    }),
    prisma.course.findMany({
      select: { id: true, title: true, category: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  return (
    <MentorLabsClient
      initialLabs={labs as any}
      courses={courses}
      showCreateInitial={showCreate}
    />
  );
}
