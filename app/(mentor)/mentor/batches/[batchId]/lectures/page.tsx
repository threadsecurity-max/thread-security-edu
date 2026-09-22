import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { LecturesManagementClient } from './lectures-management-client';

export const revalidate = 0;

export default async function BatchLecturesPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch } = await getBatchWorkspaceService(batchId, session?.userId || '');

  return (
    <div className="text-slate-100">
      <LecturesManagementClient
        batch={batch}
        sessions={batch.sessions || []}
        modules={batch.course?.modules || []}
      />
    </div>
  );
}
