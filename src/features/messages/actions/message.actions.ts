'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import {
  getAdminConversationsService,
  getConversationMessagesService,
  sendAdminMessageService,
} from '@/server/services/message.service';

export async function getAdminConversationsAction() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminRole(user.role)) {
      return { success: false, error: 'Unauthorized: Admin access required', data: [] };
    }
    const conversations = await getAdminConversationsService(user.userId);
    return { success: true, data: conversations };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch conversations';
    return { success: false, error: msg, data: [] };
  }
}

export async function getConversationMessagesAction(conversationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }
    const messages = await getConversationMessagesService(conversationId);
    return { success: true, data: messages };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch messages';
    return { success: false, error: msg, data: [] };
  }
}

export async function sendAdminMessageAction(recipientId: string, content: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminRole(user.role)) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    if (!content.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    const res = await sendAdminMessageService(user.userId, recipientId, content);
    revalidatePath('/admin/messages');
    revalidatePath('/admin/announcements');
    return { success: true, data: res };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send message';
    return { success: false, error: msg };
  }
}
