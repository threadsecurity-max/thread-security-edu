import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminConversationsService } from '@/server/services/message.service';
import { MessagesClient } from '@/app/(admin)/admin/messages/messages-client';

export const metadata = {
  title: 'Faculty Messaging | Thread Security Admin',
  description: 'Two-way internal communications and operational directives with mentors and faculty.',
};

export default async function AdminMessagesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  // Get conversations
  let initialConversations = [];
  try {
    initialConversations = await getAdminConversationsService(user.userId);
  } catch (e) {
    console.error('Error fetching conversations:', e);
  }

  // Get all mentors for the "Start Chat" roster
  let mentors: { id: string; name: string | null; email: string }[] = [];
  try {
    mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: { id: true, name: true, email: true },
      take: 50,
    });
  } catch {
    mentors = [];
  }

  return (
    <MessagesClient
      currentUserId={user.userId}
      initialConversations={initialConversations}
      mentors={mentors}
    />
  );
}
