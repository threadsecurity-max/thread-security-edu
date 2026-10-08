import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getMentorAuthorizedBatches } from '@/server/services/mentor-command-center.service';
import { MentorAttendanceCenterClient } from '@/components/mentor/attendance/MentorAttendanceCenterClient';

export const revalidate = 0;

export default async function MentorAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; sessionId?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login?error=Unauthorized');
  }

  const params = await searchParams;
  const initialBatchId = params.batchId;
  const initialSessionId = params.sessionId;

  // Strict Scoping: Only loads mentor's authorized cohorts
  const batches = await getMentorAuthorizedBatches(session.userId);

  return (
    <MentorAttendanceCenterClient
      batches={batches as any}
      initialBatchId={initialBatchId}
      initialSessionId={initialSessionId}
    />
  );
}
