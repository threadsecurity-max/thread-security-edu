import { prisma } from '../database/prisma';

export async function createNotificationService({
  userId,
  title,
  message,
  type = 'INFO',
  linkUrl,
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  linkUrl?: string;
}) {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      linkUrl,
    },
  });
}

export async function getUserNotificationsService(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function markNotificationAsReadService(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function broadcastNotificationService({
  title,
  message,
  targetType = 'ALL',
  targetRole,
  targetStudentIdentifier,
  targetMentorUserId,
  targetBatchId,
  type = 'ANNOUNCEMENT',
}: {
  title: string;
  message: string;
  targetType?: 'ALL' | 'STUDENT' | 'MENTOR' | 'SINGLE_STUDENT' | 'SINGLE_MENTOR' | 'SPECIFIC_BATCH';
  targetRole?: 'STUDENT' | 'MENTOR';
  targetStudentIdentifier?: string; // TS-ID or Email or User ID
  targetMentorUserId?: string;
  targetBatchId?: string;
  type?: string;
}) {
  let targetUserIds: string[] = [];

  if (targetType === 'SINGLE_STUDENT' && targetStudentIdentifier) {
    const query = targetStudentIdentifier.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: query },
          { email: query.toLowerCase() },
          { tsIdentity: { tsId: query } },
        ],
      },
      select: { id: true },
    });
    if (user) targetUserIds.push(user.id);
  } else if (targetType === 'SINGLE_MENTOR' && targetMentorUserId) {
    targetUserIds.push(targetMentorUserId);
  } else if (targetType === 'SPECIFIC_BATCH' && targetBatchId) {
    const batch = await (prisma as any).batch.findUnique({
      where: { id: targetBatchId },
      include: {
        students: { select: { userId: true } },
        mentor: { select: { userId: true } },
      },
    });
    if (batch) {
      if (batch.mentor?.userId) targetUserIds.push(batch.mentor.userId);
      batch.students.forEach((s: any) => targetUserIds.push(s.userId));
    }
  } else if (targetRole || targetType === 'STUDENT' || targetType === 'MENTOR') {
    const role = targetRole || (targetType as 'STUDENT' | 'MENTOR');
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });
    targetUserIds = users.map((u) => u.id);
  } else {
    const users = await prisma.user.findMany({ select: { id: true } });
    targetUserIds = users.map((u) => u.id);
  }

  // Remove duplicates
  targetUserIds = Array.from(new Set(targetUserIds));

  if (targetUserIds.length === 0) {
    throw new Error('No valid recipients found for specified target criteria.');
  }

  const notificationsData = targetUserIds.map((userId) => ({
    userId,
    title,
    message,
    type,
  }));

  const created = await prisma.notification.createMany({
    data: notificationsData,
  });

  return { count: created.count, targetCount: targetUserIds.length };
}

export async function getBroadcastAnalyticsService() {
  const notifications = await prisma.notification.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: {
          tsIdentity: true,
        },
      },
    },
  });

  const totalDelivered = notifications.length;
  const readCount = notifications.filter((n) => n.isRead).length;
  const unreadCount = totalDelivered - readCount;
  const readRatePercent = totalDelivered > 0 ? Math.round((readCount / totalDelivered) * 100) : 0;

  return {
    totalDelivered,
    readCount,
    unreadCount,
    readRatePercent,
    records: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      recipientName: n.user.name,
      recipientEmail: n.user.email,
      recipientRole: n.user.role,
      tsId: n.user.tsIdentity?.tsId || 'N/A',
    })),
  };
}

export async function sendDirectMentorMessageService(mentorUserId: string, title: string, message: string) {
  const mentor = await prisma.user.findUnique({
    where: { id: mentorUserId },
  });

  if (!mentor || mentor.role !== 'MENTOR') {
    throw new Error('Mentor user account not found.');
  }

  return await prisma.notification.create({
    data: {
      userId: mentorUserId,
      title: `[DIRECT ADMIN NOTICE] ${title}`,
      message,
      type: 'DIRECT_MENTOR_NOTICE',
    },
  });
}
