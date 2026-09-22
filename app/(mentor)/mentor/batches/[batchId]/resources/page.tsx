import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { ResourcesClient } from './resources-client';

export const revalidate = 0;

export default async function BatchResourcesPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch } = await getBatchWorkspaceService(batchId, session?.userId || '');

  return (
    <div className="text-slate-100">
      <ResourcesClient
        batch={batch}
        resources={batch.resources || []}
        modules={batch.course?.modules || []}
        sessions={batch.sessions || []}
      />
    </div>
  );
}
