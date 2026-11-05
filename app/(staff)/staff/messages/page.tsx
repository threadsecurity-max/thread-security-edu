import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminConversationsService } from '@/server/services/message.service';
import { MessagesClient } from '@/app/(admin)/admin/messages/messages-client';

export const metadata = {
  title: 'Staff Communications Hub | Thread Security',
  description: 'Two-way internal messaging with Team Leads, faculty mentors, students, and administration.',
};

export const revalidate = 0;

export default async function StaffMessagesPage() {
  let user: any = null;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error('[StaffMessagesPage] Error fetching user:', err);
  }

  const allowedRoles = [
    'STAFF_EXECUTIVE',
    'STAFF_JUNIOR',
    'SUPER_ADMIN',
    'ADMIN',
    'ACADEMIC_ADMIN',
    'SECURITY_ADMIN',
    'MENTOR',
  ];

  if (!user || !allowedRoles.includes(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Fetch initial conversations for this staff member
  let initialConversations: any[] = [];
  try {
    const rawConvs = await getAdminConversationsService(user.userId);
    initialConversations = JSON.parse(JSON.stringify(rawConvs || []));
  } catch (e) {
    console.error('[StaffMessagesPage] Error querying conversations:', e);
    initialConversations = [];
  }

  // Mentors, Team Leads, and Admins available to chat with
  let operationalRoster: { id: string; name: string | null; email: string; role: string }[] = [];
  try {
    operationalRoster = await prisma.user.findMany({
      where: {
        role: {
          in: ['MENTOR', 'SUPER_ADMIN', 'ACADEMIC_ADMIN', 'STAFF_EXECUTIVE', 'STAFF_JUNIOR', 'SECURITY_ADMIN'],
        },
        id: { not: user.userId },
      },
      select: { id: true, name: true, email: true, role: true },
      take: 100,
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  } catch {
    operationalRoster = [];
  }

  // Student directory available to chat with
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
      take: 150,
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
      mentors={operationalRoster}
      students={students}
    />
  );
}
