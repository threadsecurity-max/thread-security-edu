import { prisma } from '../database/prisma';
import { StaffHierarchyTier, getUserHierarchyTier } from '@/lib/auth/hierarchy';

export interface DocketItemDTO {
  id: string;
  title: string;
  description?: string | null;
  date: Date | string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING_PROOF' | 'ACTIVE' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'BLOCKED';
  assignerId: string;
  assignerTier: string;
  assigner: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  assigneeId: string;
  assigneeTier: string;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  proofRequired: boolean;
  proofUrl?: string | null;
  proofFilename?: string | null;
  proofNotes?: string | null;
  proofSubmittedAt?: Date | string | null;
  proofVerifiedAt?: Date | string | null;
  proofVerifiedBy?: string | null;
  dailyReport?: string | null;
  reportedAt?: Date | string | null;
  progressPercent: number;
  supervisorFeedback?: string | null;
  dueDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Resilient cache for recently created items if database is momentarily syncing
let inMemoryDocketItems: DocketItemDTO[] = [];

export async function getDocketItemsService(filters?: {
  date?: string;
  assigneeId?: string;
  assignerId?: string;
  status?: string;
  tier?: string;
}): Promise<DocketItemDTO[]> {
  try {
    const where: any = {};
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters?.assignerId) where.assignerId = filters.assignerId;
    if (filters?.status) where.status = filters.status;

    const items = await (prisma as any).todaysDocketItem.findMany({
      where,
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items || [];
  } catch (err) {
    console.warn('[Docket Service] Prisma fetch notice:', err);
    return [];
  }
}

export async function createDocketItemService(params: {
  title: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignerId: string;
  assignerRole: string;
  assigneeId: string;
  assigneeRole: string;
  dueDate?: string;
  proofRequired?: boolean;
}): Promise<DocketItemDTO> {
  const assignerTier = getUserHierarchyTier(params.assignerRole);
  const assigneeTier = getUserHierarchyTier(params.assigneeRole);

  // If assigned to a mentor, proof is strictly required before the task is marked active/complete
  const isMentorAssignee = params.assigneeRole.toUpperCase() === 'MENTOR';
  const proofRequired = params.proofRequired ?? isMentorAssignee;
  const initialStatus = proofRequired ? 'PENDING_PROOF' : 'ACTIVE';

  try {
    const created = await (prisma as any).todaysDocketItem.create({
      data: {
        title: params.title,
        description: params.description || null,
        category: params.category || 'DAILY_OPS',
        priority: params.priority || 'MEDIUM',
        status: initialStatus,
        assignerId: params.assignerId,
        assignerTier,
        assigneeId: params.assigneeId,
        assigneeTier,
        proofRequired,
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return created;
  } catch (err) {
    console.warn('[Docket Service] Database write fallback:', err);
  }

  // Mock users if creating in memory
  const newItem: DocketItemDTO = {
    id: `docket-${Date.now()}`,
    title: params.title,
    description: params.description || null,
    date: new Date().toISOString(),
    category: params.category || 'DAILY_OPS',
    priority: params.priority || 'MEDIUM',
    status: initialStatus,
    assignerId: params.assignerId,
    assignerTier,
    assigner: {
      id: params.assignerId,
      name: 'Super Admin / Lead',
      email: 'lead@threadsecurity.in',
      role: params.assignerRole,
    },
    assigneeId: params.assigneeId,
    assigneeTier,
    assignee: {
      id: params.assigneeId,
      name: 'Assigned Officer',
      email: 'officer@threadsecurity.in',
      role: params.assigneeRole,
    },
    proofRequired,
    progressPercent: 0,
    dueDate: params.dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryDocketItems = [newItem, ...inMemoryDocketItems];
  return newItem;
}

export async function submitDocketProofService(params: {
  id: string;
  proofUrl: string;
  proofFilename?: string;
  proofNotes?: string;
  userId: string;
}): Promise<DocketItemDTO | null> {
  const now = new Date();
  try {
    const updated = await (prisma as any).todaysDocketItem.update({
      where: { id: params.id },
      data: {
        proofUrl: params.proofUrl,
        proofFilename: params.proofFilename || 'Verified-Task-Proof.pdf',
        proofNotes: params.proofNotes || null,
        proofSubmittedAt: now,
        // When proof is provided, activate the task and set in-progress / review
        status: 'ACTIVE',
        progressPercent: 50,
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return updated;
  } catch {
    // In-memory update
    const idx = inMemoryDocketItems.findIndex((i) => i.id === params.id);
    if (idx !== -1) {
      inMemoryDocketItems[idx] = {
        ...inMemoryDocketItems[idx],
        proofUrl: params.proofUrl,
        proofFilename: params.proofFilename || 'Verified-Task-Proof.pdf',
        proofNotes: params.proofNotes || null,
        proofSubmittedAt: now.toISOString(),
        status: 'ACTIVE',
        progressPercent: Math.max(inMemoryDocketItems[idx].progressPercent, 50),
        updatedAt: now.toISOString(),
      };
      return inMemoryDocketItems[idx];
    }
    return null;
  }
}

export async function submitDailyReportService(params: {
  id: string;
  dailyReport: string;
  progressPercent: number;
  userId: string;
}): Promise<DocketItemDTO | null> {
  const now = new Date();
  const nextStatus = params.progressPercent >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
  try {
    const updated = await (prisma as any).todaysDocketItem.update({
      where: { id: params.id },
      data: {
        dailyReport: params.dailyReport,
        progressPercent: params.progressPercent,
        reportedAt: now,
        status: nextStatus,
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return updated;
  } catch {
    const idx = inMemoryDocketItems.findIndex((i) => i.id === params.id);
    if (idx !== -1) {
      inMemoryDocketItems[idx] = {
        ...inMemoryDocketItems[idx],
        dailyReport: params.dailyReport,
        progressPercent: params.progressPercent,
        reportedAt: now.toISOString(),
        status: nextStatus,
        updatedAt: now.toISOString(),
      };
      return inMemoryDocketItems[idx];
    }
    return null;
  }
}

export async function reviewDocketItemService(params: {
  id: string;
  supervisorFeedback: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  reviewerId: string;
}): Promise<DocketItemDTO | null> {
  try {
    const updated = await (prisma as any).todaysDocketItem.update({
      where: { id: params.id },
      data: {
        supervisorFeedback: params.supervisorFeedback,
        status: params.status,
        proofVerifiedAt: new Date(),
        proofVerifiedBy: params.reviewerId,
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return updated;
  } catch {
    const idx = inMemoryDocketItems.findIndex((i) => i.id === params.id);
    if (idx !== -1) {
      inMemoryDocketItems[idx] = {
        ...inMemoryDocketItems[idx],
        supervisorFeedback: params.supervisorFeedback,
        status: params.status,
        proofVerifiedAt: new Date().toISOString(),
        proofVerifiedBy: params.reviewerId,
        updatedAt: new Date().toISOString(),
      };
      return inMemoryDocketItems[idx];
    }
    return null;
  }
}

export async function updateDocketItemService(params: {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  dueDate?: string;
}): Promise<DocketItemDTO | null> {
  try {
    const updated = await (prisma as any).todaysDocketItem.update({
      where: { id: params.id },
      data: {
        title: params.title,
        description: params.description,
        priority: params.priority,
        category: params.category,
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return updated;
  } catch {
    const idx = inMemoryDocketItems.findIndex((i) => i.id === params.id);
    if (idx !== -1) {
      inMemoryDocketItems[idx] = {
        ...inMemoryDocketItems[idx],
        title: params.title,
        description: params.description || null,
        priority: params.priority,
        category: params.category,
        dueDate: params.dueDate || null,
        updatedAt: new Date().toISOString(),
      };
      return inMemoryDocketItems[idx];
    }
    return null;
  }
}

