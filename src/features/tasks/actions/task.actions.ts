'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/session';
import {
  createAdminTaskService,
  updateAdminTaskService,
  deleteAdminTaskService,
  getAdminTasksService,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/server/services/task.service';

export async function getAdminTasksAction(filter?: TaskFilter) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin access required', data: [] };
    }
    const tasks = await getAdminTasksService(filter);
    return { success: true, data: tasks };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch tasks';
    return { success: false, error: msg, data: [] };
  }
}

export async function createAdminTaskAction(input: CreateTaskInput) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const task = await createAdminTaskService({
      ...input,
      createdById: user.userId,
    });

    revalidatePath('/admin/tasks');
    return { success: true, data: task };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create task';
    return { success: false, error: msg };
  }
}

export async function updateAdminTaskAction(taskId: string, input: UpdateTaskInput) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const task = await updateAdminTaskService(taskId, input);
    revalidatePath('/admin/tasks');
    return { success: true, data: task };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update task';
    return { success: false, error: msg };
  }
}

export async function deleteAdminTaskAction(taskId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    await deleteAdminTaskService(taskId);
    revalidatePath('/admin/tasks');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete task';
    return { success: false, error: msg };
  }
}
