import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminConversationsService } from '@/server/services/message.service';
import { MessagesClient } from '@/app/(admin)/admin/messages/messages-client';

export const metadata = {
  title: 'Faculty & Student Messaging | Thread Security Admin',
  description: 'Two-way internal communications and operational directives with mentors and students.',
};

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Get conversations
  let initialConversations = [];
  try {
    initialConversations = await getAdminConversationsService(user.userId);
  } catch (e) {
    console.error('Error fetching conversations:', e);
  }

  // Get all mentors for the "Start Chat" roster
  let mentors: { id: string; name: string | null; email: string; role: string }[] = [];
  try {
    mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: { id: true, name: true, email: true, role: true },
      take: 100,
    });
  } catch {
    mentors = [];
  }

  // Get all students for the "Start Chat" roster
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
    students = rawStudents.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      tsId: s.tsIdentity?.tsId || null,
      batchCode: s.studentProfile?.batch?.batchCode || null,
    }));
  } catch {
    students = [];
  }

  return (
    <MessagesClient
      currentUserId={user.userId}
      initialConversations={initialConversations}
      mentors={mentors}
      students={students}
    />
  );
}
