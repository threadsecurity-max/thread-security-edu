import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getBroadcastAnalyticsService } from '@/server/services/notification.service';
import { AnnouncementsClient } from '@/app/(admin)/admin/announcements/announcements-client';

export const metadata = {
  title: 'Broadcasts & Announcements | Thread Security Admin',
  description: 'Targeted broadcast dispatch across platform, batches, and specific roles.',
};

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  // Get active batches for targeting
  let batches: { id: string; name: string; code: string }[] = [];
  try {
    const rawBatches = await prisma.batch.findMany({
      select: { id: true, title: true, batchCode: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    batches = rawBatches.map((b) => ({ id: b.id, name: b.title, code: b.batchCode }));
  } catch {
    batches = [];
  }

  // Get broadcast analytics
  let analytics: any = null;
  try {
    analytics = await getBroadcastAnalyticsService();
  } catch {
    analytics = { totalSent: 0, readRate: 0, recentBroadcasts: [] };
  }

  return <AnnouncementsClient batches={batches} initialAnalytics={analytics} />;
}
