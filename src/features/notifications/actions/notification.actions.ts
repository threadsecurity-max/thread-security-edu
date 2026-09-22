'use server';

import {
  getUserNotificationsService,
  markNotificationAsReadService,
  broadcastNotificationService,
  getBroadcastAnalyticsService,
  sendDirectMentorMessageService,
} from '../../../server/services/notification.service';
import { revalidatePath } from 'next/cache';

export async function fetchUserNotificationsAction(userId: string) {
  try {
    const notifications = await getUserNotificationsService(userId);
    return { success: true, notifications };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch notifications.';
    return { success: false, error: msg, notifications: [] };
  }
}

export async function markAsReadAction(notificationId: string) {
  try {
    await markNotificationAsReadService(notificationId);
    revalidatePath('/student');
    revalidatePath('/mentor');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update notification.';
    return { success: false, error: msg };
  }
}

export const markNotificationAsReadAction = markAsReadAction;

export async function broadcastMessageAction(formData: FormData) {
  const title = (formData.get('title') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();
  const targetType = (formData.get('targetType') as string) || 'ALL';
  const targetStudentIdentifier = (formData.get('targetStudentIdentifier') as string)?.trim();
  const targetMentorUserId = (formData.get('targetMentorUserId') as string)?.trim();
  const targetBatchId = (formData.get('targetBatchId') as string)?.trim();

  if (!title || !message) {
    return { success: false, error: 'Title and Message are required fields.' };
  }

  try {
    const result = await broadcastNotificationService({
      title,
      message,
      targetType: targetType as any,
      targetStudentIdentifier: targetStudentIdentifier || undefined,
      targetMentorUserId: targetMentorUserId || undefined,
      targetBatchId: targetBatchId || undefined,
    });

    revalidatePath('/student');
    revalidatePath('/mentor');
    revalidatePath('/admin');
    return { success: true, count: result.count, targetCount: result.targetCount };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send broadcast message.';
    return { success: false, error: msg };
  }
}

export async function fetchBroadcastAnalyticsAction() {
  try {
    const analytics = await getBroadcastAnalyticsService();
    return { success: true, analytics };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch broadcast analytics.';
    return { success: false, error: msg };
  }
}

export async function sendDirectMentorMessageAction(mentorUserId: string, title: string, message: string) {
  if (!title || !message) {
    return { success: false, error: 'Title and Message are required.' };
  }

  try {
    await sendDirectMentorMessageService(mentorUserId, title, message);
    revalidatePath('/mentor');
    revalidatePath('/admin/mentors');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send direct message to mentor.';
    return { success: false, error: msg };
  }
}
