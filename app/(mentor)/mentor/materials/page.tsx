import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { prisma } from '@/server/database/prisma';
import { MentorMaterialsClient } from '@/components/mentor/materials/MentorMaterialsClient';

export const revalidate = 0;

export default async function MentorMaterialsPage({
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

  const batches = await getMentorAuthorizedBatches(session.userId);
  const authorizedBatchIds = batches.map((b: any) => b.id);

  // Strict backend scoping: only fetch study materials belonging to mentor's authorized batches
  const resources = await (prisma as any).batchResource.findMany({
    where: {
      batchId: { in: authorizedBatchIds },
    },
    include: {
      batch: {
        select: { id: true, batchCode: true, title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const mappedBatches = batches.map((b: any) => ({
    id: b.id,
    batchCode: b.batchCode,
    title: b.title,
  }));

  return (
    <MentorMaterialsClient
      initialResources={resources as any}
      batches={mappedBatches}
      showCreateInitial={showCreate}
    />
  );
}
