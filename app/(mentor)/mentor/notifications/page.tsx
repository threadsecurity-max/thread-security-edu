import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { NotificationsClient } from './notifications-client';

export const revalidate = 0;

export default async function MentorNotificationsPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="text-slate-100 max-w-5xl mx-auto">
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
