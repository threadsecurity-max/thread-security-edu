import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getDocketItemsService } from '@/server/services/docket.service';
import { TodaysDocketClient } from '@/components/docket/TodaysDocketClient';

export const metadata = {
  title: "Today's Docket & Teaching Tracker | Thread Security Mentor",
  description: 'Track daily mentor tasks, upload syllabus and attendance proofs, and submit daily work reports.',
};

export const revalidate = 0;

export default async function MentorDocketPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'MENTOR' && user.role !== 'SUPER_ADMIN' && user.role !== 'ACADEMIC_ADMIN' && user.role !== 'STAFF_EXECUTIVE')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Fetch docket items where the mentor is assignee OR creator
  let allItems: any[] = [];
  try {
    allItems = await (prisma as any).todaysDocketItem.findMany({
      where: {
        OR: [{ assigneeId: user.userId }, { assignerId: user.userId }],
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[MentorDocketPage] Error querying docket items:', err);
    allItems = [];
  }

  // Mentors (Tier 2) can delegate specific junior lab support tasks to Junior Staff (Tier 3) or collaborate
  let assignableUsers: any[] = [];
  try {
    assignableUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['STAFF_JUNIOR', 'STAFF_EXECUTIVE', 'MENTOR'],
        },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  } catch (err) {
    console.error('[MentorDocketPage] Failed to fetch assignable staff:', err);
    assignableUsers = [];
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TodaysDocketClient
        currentUser={user}
        initialItems={JSON.parse(JSON.stringify(allItems || []))}
        assignableUsers={JSON.parse(JSON.stringify(assignableUsers || []))}
        portalType="mentor"
      />
    </div>
  );
}

