import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminConversationsService } from '@/server/services/message.service';
import { MessagesClient } from '@/app/(admin)/admin/messages/messages-client';

export const metadata = {
  title: 'Faculty Communications & Staff Messaging | Thread Security Mentor',
  description: 'Two-way internal communications and operational directives between faculty, mentors, and administrative staff.',
};

export const revalidate = 0;

export default async function MentorMessagesPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'MENTOR' && user.role !== 'SUPER_ADMIN' && user.role !== 'ACADEMIC_ADMIN' && user.role !== 'STAFF_EXECUTIVE')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Get conversations for this mentor
  let initialConversations: any[] = [];
  try {
    const rawConvs = await getAdminConversationsService(user.userId);
    initialConversations = JSON.parse(JSON.stringify(rawConvs || []));
  } catch (e) {
    console.error('Error fetching conversations for mentor:', e);
    initialConversations = [];
  }

  // Get all administrative staff & other mentors for the "Start Chat" roster
  let staffList: { id: string; name: string | null; email: string; role: string }[] = [];
  try {
    staffList = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN', 'STAFF_EXECUTIVE', 'STAFF_JUNIOR', 'MENTOR'],
        },
        id: { not: user.userId },
      },
      select: { id: true, name: true, email: true, role: true },
      take: 50,
    });
  } catch {
    staffList = [];
  }

  // Get students assigned to this mentor or active
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
      take: 100,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-md">
            Internal Communications &amp; Directives
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Faculty &amp; Staff Direct Messaging
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time, two-way communication between Mentors, Staff Executives, and Super Admins.
          </p>
        </div>
      </div>

      <MessagesClient
        currentUserId={user.userId}
        initialConversations={initialConversations}
        mentors={staffList}
        students={students}
      />
    </div>
  );
}

