import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { BatchAttendanceClient } from './batch-attendance-client';

export const revalidate = 0;

export default async function BatchAttendancePage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  const { batchId } = await params;

  const { batch } = await getBatchWorkspaceService(batchId, session?.userId || '');

  return (
    <div className="text-slate-100">
      <BatchAttendanceClient
        batch={batch}
        sessions={batch.sessions || []}
        students={batch.students || []}
      />
    </div>
  );
}
