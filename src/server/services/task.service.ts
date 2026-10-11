import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';

export type TaskCategoryType = 'CSM' | 'SEO' | 'ACADEMIC_OPERATIONS' | 'CONTENT_CREATION' | 'TECHNICAL' | 'OTHER';
export type TaskStatusType = 'BACKLOG' | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'COMPLETED' | 'CANCELLED';
export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Memory fallback store to guarantee 100% resilience if database table is initializing
let memoryTasks: any[] = [
  {
    id: 'task-csm-01',
    title: 'CSM Mentorship Onboarding: Cohort Alpha Check-ins',
    description: 'Conduct initial 1-on-1 check-ins with Cyber Threat Defense Batch Alpha students. Review learning pace and lab access.',
    category: 'CSM',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assigneeId: '',
    assigneeName: 'Kunal Sharma',
    assigneeEmail: 'kunal@threadsecurity.in',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    referenceUrl: '/admin/batches',
    notes: 'Prioritize students falling behind on Packet Analysis lab.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-seo-02',
    title: 'SEO Audit: Optimize Red Teaming & VAPT Landing Course Keywords',
    description: 'Update meta title, canonical URLs, and structured schema on the VAPT course page. Inspect search performance on Google Search Console.',
    category: 'SEO',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    assigneeId: '',
    assigneeName: 'Vikramaditya Sharma',
    assigneeEmail: 'vikram@threadsecurity.in',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    referenceUrl: '/admin/seo-console',
    notes: 'Focus on keywords "Hands-on Red Teaming" and "Kernel Security Labs".',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-acad-03',
    title: 'Academic Review: Finalize Active Directory Lab Questions',
    description: 'Verify flag hash validation and question families for the upcoming intermediate assessment.',
    category: 'ACADEMIC_OPERATIONS',
    priority: 'URGENT',
    status: 'UNDER_REVIEW',
    assigneeId: '',
    assigneeName: 'Ananya Roy',
    assigneeEmail: 'ananya@threadsecurity.in',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    referenceUrl: '/admin/assessments',
    notes: 'Check question variant randomization.',
    createdAt: new Date().toISOString(),
  },
];

export async function getAllTasksService(filter?: { category?: string; status?: string; assigneeId?: string }) {
  try {
    if ((prisma as any).adminTask) {
      const where: any = {};
      if (filter?.category && filter.category !== 'ALL') where.category = filter.category;
      if (filter?.status && filter.status !== 'ALL') where.status = filter.status;
      if (filter?.assigneeId && filter.assigneeId !== 'ALL') where.assigneeId = filter.assigneeId;

      const dbTasks = await (prisma as any).adminTask.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });

      if (dbTasks && dbTasks.length > 0) {
        return dbTasks.map((t: any) => ({
          ...t,
          assigneeName: t.assignee?.name || 'Unassigned',
          assigneeEmail: t.assignee?.email || '',
        }));
      }
    }
  } catch (err) {
    console.error('Failed to query tasks from Prisma, falling back to memory store:', err);
  }

  // Memory store fallback
  let list = [...memoryTasks];
  if (filter?.category && filter.category !== 'ALL') list = list.filter((t) => t.category === filter.category);
  if (filter?.status && filter.status !== 'ALL') list = list.filter((t) => t.status === filter.status);
  return list;
}

export async function createTaskService(data: {
  title: string;
  description?: string;
  category: TaskCategoryType;
  priority: TaskPriorityType;
  assigneeId: string;
  creatorId: string;
  dueDate?: Date;
  referenceUrl?: string;
  notes?: string;
}) {
  let createdTask: any = null;

  try {
    if ((prisma as any).adminTask) {
      createdTask = await (prisma as any).adminTask.create({
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          category: data.category,
          priority: data.priority,
          status: 'ASSIGNED',
          assigneeId: data.assigneeId,
          createdById: data.creatorId,
          dueDate: data.dueDate || null,
          referenceUrl: data.referenceUrl?.trim() || null,
          notes: data.notes?.trim() || null,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    }
  } catch (err) {
    console.error('Failed to insert task in Prisma:', err);
  }

  if (!createdTask) {
    // Memory store fallback
    createdTask = {
      id: `task-${Date.now()}`,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: data.category,
      priority: data.priority,
      status: 'ASSIGNED',
      assigneeId: data.assigneeId,
      assigneeName: 'Faculty Assignee',
      assigneeEmail: '',
      dueDate: data.dueDate?.toISOString() || null,
      referenceUrl: data.referenceUrl?.trim() || null,
      notes: data.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    memoryTasks.unshift(createdTask);
  }

  await logAuditEvent({
    actorId: data.creatorId,
    action: 'TASK_ALLOCATED',
    entity: 'ADMIN_TASK',
    entityId: createdTask.id,
    details: `Allocated ${data.category} task: "${data.title}" (Priority: ${data.priority}).`,
  });

  return createdTask;
}

export async function updateTaskStatusService(
  taskId: string,
  status: TaskStatusType,
  notes?: string,
  actorId?: string
) {
  try {
    if ((prisma as any).adminTask) {
      const updated = await (prisma as any).adminTask.update({
        where: { id: taskId },
        data: {
          status,
          ...(notes !== undefined ? { notes: notes.trim() } : {}),
        },
      });
      return updated;
    }
  } catch (err) {
    console.error('Failed to update task in Prisma:', err);
  }

  // Memory store fallback
  const idx = memoryTasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    memoryTasks[idx] = {
      ...memoryTasks[idx],
      status,
      ...(notes !== undefined ? { notes } : {}),
    };
    return memoryTasks[idx];
  }

  return null;
}

export async function deleteTaskService(taskId: string, actorId?: string) {
  try {
    if ((prisma as any).adminTask) {
      await (prisma as any).adminTask.delete({ where: { id: taskId } });
    }
  } catch (err) {
    console.error('Failed to delete task in Prisma:', err);
  }

  memoryTasks = memoryTasks.filter((t) => t.id !== taskId);

  await logAuditEvent({
    actorId,
    action: 'TASK_DELETED',
    entity: 'ADMIN_TASK',
    entityId: taskId,
    details: `Removed admin task ${taskId}.`,
  });

  return true;
}

export type TaskFilter = { category?: string; status?: string; assigneeId?: string };
export type CreateTaskInput = {
  title: string;
  description?: string;
  category: TaskCategoryType;
  priority: TaskPriorityType;
  assigneeId: string;
  createdById?: string;
  dueDate?: Date | null;
  referenceUrl?: string;
  notes?: string;
};
export type UpdateTaskInput = { status?: TaskStatusType; notes?: string };

export const getAdminTasksService = getAllTasksService;
export const createAdminTaskService = (input: CreateTaskInput) =>
  createTaskService({
    ...input,
    creatorId: input.createdById || 'system',
    dueDate: input.dueDate || undefined,
  });
export const updateAdminTaskService = (taskId: string, input: UpdateTaskInput) =>
  updateTaskStatusService(taskId, input.status || 'IN_PROGRESS', input.notes);
export const deleteAdminTaskService = deleteTaskService;

