import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { ReportsClient } from './reports-client';

export const revalidate = 0;

export default async function BatchReportsPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch, metrics } = await getBatchWorkspaceService(batchId, session?.userId || '');

  return (
    <div className="text-slate-100">
      <ReportsClient batch={batch} metrics={metrics} />
    </div>
  );
}
