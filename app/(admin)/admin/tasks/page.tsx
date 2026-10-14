import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getAdminTasksService } from '@/server/services/task.service';
import { TasksClient } from '@/app/(admin)/admin/tasks/tasks-client';

export const metadata = {
  title: 'Task Allocation | Thread Security Admin',
  description: 'Manage and dispatch CSM, SEO, Content, and Academic Operations tasks to faculty.',
};

export default async function AdminTasksPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    redirect('/login');
  }

  // Fetch initial tasks
  let initialTasks = [];
  try {
    initialTasks = await getAdminTasksService();
  } catch (e) {
    console.error('Error fetching admin tasks:', e);
  }

  // Fetch candidate assignees (Mentors and Admins)
  let assignees: { id: string; name: string | null; email: string; role: string }[] = [];
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['MENTOR', 'SUPER_ADMIN', 'ACADEMIC_ADMIN', 'STUDENT'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 100,
    });
    assignees = users;
  } catch {
    assignees = [
      { id: user.userId, name: 'System Admin', email: 'admin@threadsecurity.com', role: 'SUPER_ADMIN' },
    ];
  }

  return <TasksClient initialTasks={initialTasks} assignees={assignees} currentUserId={user.userId} />;
}
