'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, isAdminRole, getUserHierarchyTier, StaffHierarchyTier, canAssignTask } from '@/lib/auth/session';
import {
  getDocketItemsService,
  createDocketItemService,
  submitDocketProofService,
  submitDailyReportService,
  reviewDocketItemService,
  updateDocketItemService,
} from '@/server/services/docket.service';

export async function getDocketItemsAction(filters?: {
  assigneeId?: string;
  assignerId?: string;
  status?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required', data: [] };
    }

    const tier = getUserHierarchyTier(user.role);

    // Hierarchy based data scope:
    // Tier 1 (Super Admin): Sees all docket items across the organization
    // Tier 2 (Mentor, Executive, Security Admin): Sees items assigned to them OR created by them (e.g. for Juniors)
    // Tier 3 (Junior Staff): Sees items assigned to them
    let queryFilters = { ...filters };

    if (tier === StaffHierarchyTier.TIER_3_JUNIOR) {
      queryFilters.assigneeId = user.userId;
    }

    const items = await getDocketItemsService(queryFilters);
    return { success: true, data: items };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch docket items';
    return { success: false, error: msg, data: [] };
  }
}

export async function createDocketItemAction(params: {
  title: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId: string;
  assigneeRole: string;
  dueDate?: string;
  proofRequired?: boolean;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required' };
    }

    // Enforce Hierarchy Rules:
    // Mentor / Executive / Security Admin are answerable for tasks given by Super Admin
    // Junior are responsible and answerable for Mentor / Executive / Security Admin
    if (!canAssignTask(user.role, params.assigneeRole)) {
      return {
        success: false,
        error: `Hierarchy violation: ${user.role} is not permitted to delegate tasks to ${params.assigneeRole}. Only Super Admin can assign to Tier 2, and Tier 2 can assign to Tier 3 Juniors.`,
      };
    }

    const item = await createDocketItemService({
      ...params,
      assignerId: user.userId,
      assignerRole: user.role,
    });

    revalidatePath('/admin/docket');
    revalidatePath('/mentor/docket');
    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create docket item';
    return { success: false, error: msg };
  }
}

export async function submitDocketProofAction(params: {
  id: string;
  proofUrl: string;
  proofFilename?: string;
  proofNotes?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required' };
    }

    if (!params.proofUrl.trim()) {
      return { success: false, error: 'Proof document (PDF or link) is required to activate and progress this docket task.' };
    }

    const item = await submitDocketProofService({
      ...params,
      userId: user.userId,
    });

    revalidatePath('/admin/docket');
    revalidatePath('/mentor/docket');
    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit proof';
    return { success: false, error: msg };
  }
}

export async function submitDailyReportAction(params: {
  id: string;
  dailyReport: string;
  progressPercent: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required' };
    }

    const item = await submitDailyReportService({
      ...params,
      userId: user.userId,
    });

    revalidatePath('/admin/docket');
    revalidatePath('/mentor/docket');
    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit report';
    return { success: false, error: msg };
  }
}

export async function reviewDocketItemAction(params: {
  id: string;
  supervisorFeedback: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
}) {
  try {
    const user = await getCurrentUser();
    if (!user || (!isAdminRole(user.role) && user.role !== 'MENTOR')) {
      return { success: false, error: 'Unauthorized: Reviewer permissions required' };
    }

    const item = await reviewDocketItemService({
      ...params,
      reviewerId: user.userId,
    });

    revalidatePath('/admin/docket');
    revalidatePath('/mentor/docket');
    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to review docket item';
    return { success: false, error: msg };
  }
}

export async function updateDocketItemAction(params: {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  dueDate?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required' };
    }

    const item = await updateDocketItemService(params);
    revalidatePath('/admin/docket');
    revalidatePath('/mentor/docket');
    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update docket item';
    return { success: false, error: msg };
  }
}

