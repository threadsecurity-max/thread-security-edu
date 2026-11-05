import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getDocketItemsService } from '@/server/services/docket.service';
import { TodaysDocketClient } from '@/components/docket/TodaysDocketClient';

export const metadata = {
  title: "Today's Docket & Workflows | Thread Security Admin",
  description: 'Operational daily task tracking, hierarchical delegation, and mentor progress verification.',
};

export const revalidate = 0;

export default async function AdminDocketPage() {
  const user = await getCurrentUser();

  if (!user || !isAdminRole(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Fetch today's docket items
  const items = await getDocketItemsService();

  // Fetch assignable users (Mentors, Executives, Juniors, Security Admins) from live database
  let assignableUsers: any[] = [];
  try {
    assignableUsers = await prisma.user.findMany({
      where: {
        role: {
          not: 'STUDENT',
        },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  } catch (err) {
    console.error('[AdminDocketPage] Failed to fetch assignable users:', err);
    assignableUsers = [];
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TodaysDocketClient
        currentUser={user}
        initialItems={JSON.parse(JSON.stringify(items || []))}
        assignableUsers={JSON.parse(JSON.stringify(assignableUsers || []))}
        portalType="admin"
      />
    </div>
  );
}

