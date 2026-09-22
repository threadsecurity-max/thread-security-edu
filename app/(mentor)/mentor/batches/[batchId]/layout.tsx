import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getBatchWorkspaceService } from '@/server/services/batch.service';
import { BatchWorkspaceHeader } from '@/components/mentor/batch-workspace-header';

export const revalidate = 0;

export default async function BatchWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ batchId: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const { batchId } = await params;

  try {
    const { batch } = await getBatchWorkspaceService(batchId, session.userId);

    // Pick latest or upcoming session for quick actions
    const sessions = batch.sessions || [];
    const latestSession =
      sessions.find((s: any) => s.status !== 'COMPLETED') ||
      sessions[sessions.length - 1] ||
      null;

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <BatchWorkspaceHeader batch={batch} latestSession={latestSession} />
        <div>{children}</div>
      </div>
    );
  } catch (err: any) {
    if (err.message?.includes('Unauthorized')) {
      redirect('/mentor?error=UnauthorizedBatchAccess');
    }
    notFound();
  }
}
