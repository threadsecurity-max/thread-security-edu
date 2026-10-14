import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminConversationsService } from '@/server/services/message.service';
import { getBroadcastAnalyticsService } from '@/server/services/notification.service';
import { AnnouncementsClient } from './announcements-client';

export const metadata = {
  title: 'Announcements & Direct Messaging | Thread Security Admin',
  description: 'Manage prior chats, send direct directives to mentors and students, and broadcast cohort announcements.',
};

export const revalidate = 0;

export default async function AdminAnnouncementsPage() {
  let user: any = null;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error('[Announcements Page] Failed to fetch current user:', err);
  }

  if (!user || !isAdminRole(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // 1. Get every conversation the admin had earlier (with mentors and students)
  let initialConversations: any[] = [];
  try {
    const rawConvs = await getAdminConversationsService(user.userId);
    initialConversations = JSON.parse(JSON.stringify(rawConvs || []));
  } catch (e) {
    console.error('[Announcements Page] Error fetching conversations:', e);
    initialConversations = [];
  }

  // 2. Get mentors roster
  let mentors: { id: string; name: string | null; email: string; role: string }[] = [];
  try {
    const rawMentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
      take: 100,
    });
    mentors = JSON.parse(JSON.stringify(rawMentors || []));
  } catch (e) {
    console.error('[Announcements Page] Error fetching mentors:', e);
    mentors = [];
  }

  // 3. Get students roster with TS-ID & Batch
  let students: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    tsId?: string | null;
    batchCode?: string | null;
  }[] = [];
  try {
    const rawStudents = await prisma.user.findMany({
      where: { role: { in: ['STUDENT', 'GUEST'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tsIdentity: { select: { tsId: true } },
        studentProfile: {
          select: {
            batch: { select: { batchCode: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    students = (rawStudents || []).map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      tsId: s.tsIdentity?.tsId || null,
      batchCode: s.studentProfile?.batch?.batchCode || null,
    }));
  } catch (e) {
    console.error('[Announcements Page] Error fetching students:', e);
    students = [];
  }

  // 4. Get active batches for targeting broadcast announcements
  let batches: { id: string; name: string; code: string }[] = [];
  try {
    const rawBatches = await prisma.batch.findMany({
      select: { id: true, title: true, batchCode: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    batches = (rawBatches || []).map((b) => ({ id: b.id, name: b.title, code: b.batchCode }));
  } catch {
    batches = [];
  }

  // 5. Get broadcast analytics
  let analytics: any = { totalSent: 0, readRate: 0, recentBroadcasts: [] };
  try {
    const rawAnalytics = await getBroadcastAnalyticsService();
    analytics = JSON.parse(JSON.stringify(rawAnalytics || { totalSent: 0, readRate: 0, recentBroadcasts: [] }));
  } catch {
    analytics = { totalSent: 0, readRate: 0, recentBroadcasts: [] };
  }

  return (
    <AnnouncementsClient
      currentUserId={user.userId}
      initialConversations={initialConversations}
      mentors={mentors}
      students={students}
      batches={batches}
      initialAnalytics={analytics}
    />
  );
}
