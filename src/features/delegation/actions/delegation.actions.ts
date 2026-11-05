'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  getDelegationWorkspaceDataService,
  createDelegationTeamService,
  updateDelegationTeamService,
  deleteDelegationTeamService,
  assignMemberToTeamService,
  removeMemberFromTeamService,
  updateMemberGrantsService,
  createDelegationEdgeService,
  deleteDelegationEdgeService,
} from '@/server/services/delegation.service';

function checkSuperAdminAccess(session: any) {
  if (!session || (!['SUPER_ADMIN', 'SECURITY_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN'].includes(session.role))) {
    throw new Error('Unauthorized: Super Admin or Admin clearance required.');
  }
}

export async function getDelegationWorkspaceAction() {
  const session = await getSession();
  checkSuperAdminAccess(session);
  return await getDelegationWorkspaceDataService();
}

export async function createDelegationTeamAction(data: {
  name: string;
  code: string;
  description?: string;
  color?: string;
  leadId: string;
  systemGrants: string[];
  positionX?: number;
  positionY?: number;
}) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const team = await createDelegationTeamService({
      ...data,
      creatorId: session!.userId,
    });
    revalidatePath('/admin/delegation');
    return { success: true, team };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create team block.' };
  }
}

export async function updateDelegationTeamAction(
  teamId: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    leadId?: string;
    systemGrants?: string[];
    positionX?: number;
    positionY?: number;
  }
) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const updated = await updateDelegationTeamService(teamId, data, session!.userId);
    revalidatePath('/admin/delegation');
    return { success: true, team: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update team block.' };
  }
}

export async function deleteDelegationTeamAction(teamId: string) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const deleted = await deleteDelegationTeamService(teamId, session!.userId);
    revalidatePath('/admin/delegation');
    return { success: true, team: deleted };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete team block.' };
  }
}

export async function assignMemberToTeamAction(params: {
  teamId: string;
  userId: string;
  roleInTeam: 'LEAD' | 'JUNIOR' | 'SPECIALIST' | 'OBSERVER';
  systemGrants?: string[];
  canReport?: boolean;
  canAssign?: boolean;
}) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const member = await assignMemberToTeamService({
      ...params,
      actorId: session!.userId,
    });
    revalidatePath('/admin/delegation');
    return { success: true, member };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign member to team.' };
  }
}

export async function removeMemberFromTeamAction(memberId: string) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const removed = await removeMemberFromTeamService(memberId, session!.userId);
    revalidatePath('/admin/delegation');
    return { success: true, member: removed };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove member from team.' };
  }
}

export async function updateMemberGrantsAction(params: {
  memberId: string;
  systemGrants: string[];
  roleInTeam?: string;
  canReport?: boolean;
  canAssign?: boolean;
}) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const updated = await updateMemberGrantsService({
      ...params,
      actorId: session!.userId,
    });
    revalidatePath('/admin/delegation');
    return { success: true, member: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update member permissions.' };
  }
}

export async function createDelegationEdgeAction(params: {
  teamId: string;
  sourceUserId: string;
  targetUserId: string;
  edgeType: 'REPORTING' | 'COMMUNICATION' | 'TASK_DELEGATION' | 'AUDIT';
  label?: string;
}) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const edge = await createDelegationEdgeService({
      ...params,
      actorId: session!.userId,
    });
    revalidatePath('/admin/delegation');
    return { success: true, edge };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to establish delegation edge.' };
  }
}

export async function deleteDelegationEdgeAction(edgeId: string) {
  const session = await getSession();
  checkSuperAdminAccess(session);

  try {
    const deleted = await deleteDelegationEdgeService(edgeId, session!.userId);
    revalidatePath('/admin/delegation');
    return { success: true, edge: deleted };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove edge link.' };
  }
}

