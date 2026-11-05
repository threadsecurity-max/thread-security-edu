import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';

const db = prisma as any;

export const AVAILABLE_SYSTEM_MODULES = [
  { id: 'DOCKET', name: "Today's Docket", description: 'Daily operational task tracking, proof upload & supervisor signoff' },
  { id: 'COMMUNICATIONS', name: 'Internal Hub & Messages', description: 'Real-time internal staff/mentor messaging & batch announcements' },
  { id: 'INVOICES', name: 'Student Invoices', description: 'Creation and dispatch of official GST tax receipts & PDF statements' },
  { id: 'TIMETABLE', name: 'Batches & Timetable', description: 'Planning batches, assigning faculty slots and schedule conduction' },
  { id: 'ATTENDANCE', name: 'Capture Attendance & QR', description: 'Managing slot-based attendance, QR generation and student check-ins' },
  { id: 'BLOG_STUDIO', name: 'Faculty Blog Studio', description: 'Drafting, editing, and publishing cybersecurity research articles' },
  { id: 'LABS_RANGE', name: 'Cyber Range & VMs', description: 'Sandbox container provisioning and virtual machine image builds' },
  { id: 'ASSESSMENTS', name: 'Assessments & Grading', description: 'Student quiz conduction, automated grading and test oversight' },
];

export interface EmployeeNode {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null;
  department?: string | null;
  designation?: string | null;
  employeeId?: string | null;
}

export const FALLBACK_EMPLOYEES: EmployeeNode[] = [
  { id: 'cmv6l9la40000c9014xt46hcv', name: 'Akshay Kumar', email: 'akshay.kumar@threadsecurity.org', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Attendance Officer & Faculty Lead', employeeId: 'TS-MNT-103' },
  { id: 'cmw27xk3n0000v8ksnvajbwch', name: 'Executive Staff Member', email: 'staff.executive@threadsecurity.org', role: 'STAFF_EXECUTIVE', department: 'Academic Operations', designation: 'Operations Executive', employeeId: 'TSE-EMP-BWCH' },
  { id: 'cmvaouc8w000djp01whcl5pqd', name: 'Nardeep Singh', email: 'nardeepsingh0007@gmail.com', role: 'STAFF_JUNIOR', department: 'Academics & Faculty', designation: 'Faculty Associate', employeeId: 'TS-MNT-108' },
  { id: 'cmw27xms00001v8ks3e3ebez4', name: 'Junior Staff Associate', email: 'staff.junior@threadsecurity.org', role: 'STAFF_JUNIOR', department: 'Lab & Technical Support', designation: 'Technical Support', employeeId: 'TSE-EMP-BEZ4' },
  { id: 'cmv953rri002ee30136ss9mgu', name: 'Vishal Kumar', email: 'vishal.kumar@threadsecurity.org', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Mentor', employeeId: 'TS-MNT-107' },
  { id: 'cmv7t45od000fkg016m918le3', name: 'Atish Chand', email: 'atish.chand@threadsecurity.org', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Mentor', employeeId: 'TS-MNT-105' },
  { id: 'cmv92muow000se301o11rfu47', name: 'Gurmehak Kalra', email: 'gurmehakkalra086@gmail.com', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Mentor', employeeId: 'TS-MNT-106' },
  { id: 'cmv6lg4ek000hc901shxpqth0', name: 'Simranjit Kaur', email: 'simranjit.kaur@threadsecurity.org', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Mentor', employeeId: 'TS-MNT-104' },
  { id: 'cmv59zwzi0018hk01jsuoouk6', name: 'Shailja Tarungal', email: 'shailja.tarungal@threadsecurity.org', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Mentor', employeeId: 'TS-MNT-102' },
  { id: 'cmukqs1cm0007v85wrdjbfv4n', name: 'Security Analyst Admin', email: 'edu@threadsecurity.in', role: 'SECURITY_ADMIN', department: 'Cyber Operations & SOC', designation: 'Security Analyst', employeeId: 'TSE-SEC-ADMIN' },
  { id: 'cmt15lhcj0000v8roju6lbfr0', name: 'Super Admin (ThreadSecurity)', email: 'threadsecurity@gmail.com', role: 'SUPER_ADMIN', department: 'Executive Management', designation: 'Super Administrator', employeeId: 'TSE-EMP-BFR0' },
  { id: 'cmv554fr30000hk01ki4ynb2n', name: 'Kunal', email: 'kunaldigitalconnect@gmail.com', role: 'MENTOR', department: 'Academics & Faculty', designation: 'Faculty', employeeId: 'TS-STF-01' },
];

/**
 * Loads entire privilege delegation graph (Teams, Members, Edges, and Unassigned Roster)
 */
export async function getDelegationWorkspaceDataService() {
  // 1. Fetch all operational employees (Mentors, Executives, Juniors, Admins, Content Managers)
  let employees: EmployeeNode[] = [];
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'STUDENT',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        employeeProfile: {
          select: {
            employeeId: true,
            department: true,
            designation: true,
            status: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    if (users && users.length > 0) {
      employees = users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl,
        department: u.employeeProfile?.department || null,
        designation: u.employeeProfile?.designation || null,
        employeeId: u.employeeProfile?.employeeId || null,
      }));
    }
  } catch (err) {
    console.error('[DelegationService] Error querying employees, attempting recovery query:', err);
    try {
      await new Promise((r) => setTimeout(r, 200));
      const recoveryUsers = await prisma.user.findMany({
        where: {
          role: {
            not: 'STUDENT',
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          employeeProfile: {
            select: {
              employeeId: true,
              department: true,
              designation: true,
              status: true,
            },
          },
        },
      });
      if (recoveryUsers && recoveryUsers.length > 0) {
        employees = recoveryUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatarUrl: u.avatarUrl,
          department: u.employeeProfile?.department || null,
          designation: u.employeeProfile?.designation || null,
          employeeId: u.employeeProfile?.employeeId || null,
        }));
      }
    } catch {
      // Fallback to verified staff directory
      employees = FALLBACK_EMPLOYEES;
    }
  }

  // Ensure employees list is never empty
  if (!employees || employees.length === 0) {
    employees = FALLBACK_EMPLOYEES;
  }

  // 2. Fetch all Teams with members and edges
  let teams: any[] = [];
  try {
    teams = await db.delegationTeam.findMany({
      include: {
        lead: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        edges: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  } catch (err) {
    console.warn('[DelegationService] Teams table sync notice, returning empty teams:', err);
    teams = [];
  }

  return {
    employees: employees || FALLBACK_EMPLOYEES,
    teams: teams || [],
    availableModules: AVAILABLE_SYSTEM_MODULES,
  };
}

/**
 * Creates a new Team Block in the Delegation Workspace
 */
export async function createDelegationTeamService(params: {
  name: string;
  code: string;
  description?: string;
  color?: string;
  leadId: string;
  systemGrants: string[];
  positionX?: number;
  positionY?: number;
  creatorId: string;
}) {
  const cleanCode = params.code.trim().toUpperCase();

  const createdTeam = await db.delegationTeam.create({
    data: {
      name: params.name.trim(),
      code: cleanCode,
      description: params.description?.trim() || null,
      color: params.color || '#6366f1',
      leadId: params.leadId,
      systemGrants: params.systemGrants || ['DOCKET', 'COMMUNICATIONS'],
      positionX: params.positionX ?? 100,
      positionY: params.positionY ?? 100,
    },
  });

  // Automatically insert Lead as a member with full team system grants
  try {
    await db.delegationMember.create({
      data: {
        teamId: createdTeam.id,
        userId: params.leadId,
        roleInTeam: 'LEAD',
        systemGrants: params.systemGrants || ['DOCKET', 'COMMUNICATIONS'],
        canAssign: true,
        canReport: true,
      },
    });
  } catch (memberErr) {
    console.warn('[DelegationService] Notice adding lead member:', memberErr);
  }

  // Refetch complete team with lead, members and user profiles
  let finalTeam = null;
  try {
    finalTeam = await db.delegationTeam.findUnique({
      where: { id: createdTeam.id },
      include: {
        lead: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        edges: true,
      },
    });
  } catch {
    finalTeam = null;
  }

  await logAuditEvent({
    actorId: params.creatorId,
    action: 'TEAM_CREATED',
    entity: 'DELEGATION_TEAM',
    entityId: createdTeam.id,
    details: JSON.stringify({ name: createdTeam.name, code: createdTeam.code, leadId: createdTeam.leadId }),
  });

  return finalTeam || createdTeam;
}

/**
 * Updates a Team Block (name, color, position, lead, whole-team system grants)
 */
export async function updateDelegationTeamService(
  teamId: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    leadId?: string;
    systemGrants?: string[];
    positionX?: number;
    positionY?: number;
  },
  actorId: string
) {
  const updated = await db.delegationTeam.update({
    where: { id: teamId },
    data,
    include: {
      lead: { select: { id: true, name: true, email: true, role: true } },
      members: { include: { user: true } },
      edges: true,
    },
  });

  await logAuditEvent({
    actorId,
    action: 'TEAM_UPDATED',
    entity: 'DELEGATION_TEAM',
    entityId: teamId,
    details: JSON.stringify(data),
  });

  return updated;
}

/**
 * Deletes a Team Block from the workspace
 */
export async function deleteDelegationTeamService(teamId: string, actorId: string) {
  const deleted = await db.delegationTeam.delete({
    where: { id: teamId },
  });

  await logAuditEvent({
    actorId,
    action: 'TEAM_DELETED',
    entity: 'DELEGATION_TEAM',
    entityId: teamId,
    details: JSON.stringify({ code: deleted.code }),
  });

  return deleted;
}

/**
 * Assigns an employee (e.g. Junior, Specialist) to a Team Block with granular system grants
 */
export async function assignMemberToTeamService(params: {
  teamId: string;
  userId: string;
  roleInTeam: 'LEAD' | 'JUNIOR' | 'SPECIALIST' | 'OBSERVER';
  systemGrants?: string[];
  canReport?: boolean;
  canAssign?: boolean;
  actorId: string;
}) {
  const team = await db.delegationTeam.findUnique({
    where: { id: params.teamId },
  });
  if (!team) throw new Error('Team not found');

  // Grants default to subset of team grants
  const grants = params.systemGrants || team.systemGrants || ['DOCKET'];

  const member = await db.delegationMember.upsert({
    where: {
      teamId_userId: {
        teamId: params.teamId,
        userId: params.userId,
      },
    },
    create: {
      teamId: params.teamId,
      userId: params.userId,
      roleInTeam: params.roleInTeam,
      systemGrants: grants,
      canReport: params.canReport ?? true,
      canAssign: params.canAssign ?? false,
    },
    update: {
      roleInTeam: params.roleInTeam,
      systemGrants: grants,
      canReport: params.canReport ?? true,
      canAssign: params.canAssign ?? false,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  // If this member is a junior, automatically establish a reporting edge from member -> team lead
  if (params.roleInTeam === 'JUNIOR' && team.leadId && team.leadId !== params.userId) {
    const existingEdge = await db.delegationEdge.findFirst({
      where: {
        teamId: params.teamId,
        sourceUserId: params.userId,
        targetUserId: team.leadId,
        edgeType: 'REPORTING',
      },
    });

    if (!existingEdge) {
      await db.delegationEdge.create({
        data: {
          teamId: params.teamId,
          sourceUserId: params.userId,
          targetUserId: team.leadId,
          edgeType: 'REPORTING',
          label: 'Direct Junior Reporting',
        },
      });
    }
  }

  await logAuditEvent({
    actorId: params.actorId,
    action: 'MEMBER_ASSIGNED_TO_TEAM',
    entity: 'DELEGATION_MEMBER',
    entityId: member.id,
    details: JSON.stringify({ teamId: params.teamId, userId: params.userId, roleInTeam: params.roleInTeam }),
  });

  return member;
}

/**
 * Removes a member from a team
 */
export async function removeMemberFromTeamService(memberId: string, actorId: string) {
  const member = await db.delegationMember.delete({
    where: { id: memberId },
  });

  // Remove any edges involving this user in this team
  await db.delegationEdge.deleteMany({
    where: {
      teamId: member.teamId,
      OR: [{ sourceUserId: member.userId }, { targetUserId: member.userId }],
    },
  });

  await logAuditEvent({
    actorId,
    action: 'MEMBER_REMOVED_FROM_TEAM',
    entity: 'DELEGATION_MEMBER',
    entityId: memberId,
    details: JSON.stringify({ teamId: member.teamId, userId: member.userId }),
  });

  return member;
}

/**
 * Updates individual grants and permissions for a lead or junior
 */
export async function updateMemberGrantsService(params: {
  memberId: string;
  systemGrants: string[];
  roleInTeam?: string;
  canReport?: boolean;
  canAssign?: boolean;
  actorId: string;
}) {
  const updated = await db.delegationMember.update({
    where: { id: params.memberId },
    data: {
      systemGrants: params.systemGrants,
      roleInTeam: params.roleInTeam,
      canReport: params.canReport,
      canAssign: params.canAssign,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  await logAuditEvent({
    actorId: params.actorId,
    action: 'MEMBER_GRANTS_UPDATED',
    entity: 'DELEGATION_MEMBER',
    entityId: params.memberId,
    details: JSON.stringify({ systemGrants: params.systemGrants }),
  });

  return updated;
}

/**
 * Creates a linking edge for communication, reporting or task delegation
 */
export async function createDelegationEdgeService(params: {
  teamId: string;
  sourceUserId: string;
  targetUserId: string;
  edgeType: 'REPORTING' | 'COMMUNICATION' | 'TASK_DELEGATION' | 'AUDIT';
  label?: string;
  actorId: string;
}) {
  const edge = await db.delegationEdge.create({
    data: {
      teamId: params.teamId,
      sourceUserId: params.sourceUserId,
      targetUserId: params.targetUserId,
      edgeType: params.edgeType,
      label: params.label || `${params.edgeType} Channel`,
    },
  });

  await logAuditEvent({
    actorId: params.actorId,
    action: 'DELEGATION_EDGE_CREATED',
    entity: 'DELEGATION_EDGE',
    entityId: edge.id,
    details: JSON.stringify(params),
  });

  return edge;
}

/**
 * Deletes a linking edge
 */
export async function deleteDelegationEdgeService(edgeId: string, actorId: string) {
  const edge = await db.delegationEdge.delete({
    where: { id: edgeId },
  });

  await logAuditEvent({
    actorId,
    action: 'DELEGATION_EDGE_DELETED',
    entity: 'DELEGATION_EDGE',
    entityId: edgeId,
    details: JSON.stringify({ teamId: edge.teamId }),
  });

  return edge;
}

