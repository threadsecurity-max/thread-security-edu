'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Eye,
  Settings,
  Network,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MessageSquare,
  ClipboardList,
  Receipt,
  Calendar,
  BookOpen,
  Terminal,
  Cpu,
  ChevronDown,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getDelegationWorkspaceAction,
  createDelegationTeamAction,
  updateDelegationTeamAction,
  deleteDelegationTeamAction,
  assignMemberToTeamAction,
  removeMemberFromTeamAction,
  updateMemberGrantsAction,
  createDelegationEdgeAction,
  deleteDelegationEdgeAction,
} from '@/features/delegation/actions/delegation.actions';

export interface EmployeeNode {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export interface DelegationMemberItem {
  id: string;
  teamId: string;
  userId: string;
  roleInTeam: string;
  systemGrants: string[];
  canReport: boolean;
  canAssign: boolean;
  user: EmployeeNode;
}

export interface DelegationEdgeItem {
  id: string;
  teamId: string;
  sourceUserId: string;
  targetUserId: string;
  edgeType: string;
  label?: string | null;
}

export interface DelegationTeamItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
  leadId: string;
  lead: EmployeeNode;
  systemGrants: string[];
  positionX: number;
  positionY: number;
  members: DelegationMemberItem[];
  edges: DelegationEdgeItem[];
}

interface PrivilegeDelegationWorkspaceProps {
  initialEmployees: EmployeeNode[];
  initialTeams: DelegationTeamItem[];
  availableModules: Array<{ id: string; name: string; description: string }>;
}

export function PrivilegeDelegationWorkspace({
  initialEmployees = [],
  initialTeams = [],
  availableModules = [],
}: PrivilegeDelegationWorkspaceProps) {
  const [teams, setTeams] = useState<DelegationTeamItem[]>(initialTeams);
  const [employees, setEmployees] = useState<EmployeeNode[]>(initialEmployees);
  const [viewMode, setViewMode] = useState<'ARCHITECTURE' | 'OBSERVER'>('ARCHITECTURE');
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Background fetch recovery if data is empty or refreshed
  const fetchWorkspaceData = React.useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await getDelegationWorkspaceAction();
      if (data?.employees && data.employees.length > 0) {
        setEmployees(data.employees);
      }
      if (data?.teams) {
        setTeams(data.teams as any);
      }
    } catch (err) {
      console.warn('[PrivilegeDelegation] Background fetch notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Sync state if initial props change
  React.useEffect(() => {
    if (initialEmployees && initialEmployees.length > 0) {
      setEmployees(initialEmployees);
    } else {
      fetchWorkspaceData();
    }
  }, [initialEmployees, fetchWorkspaceData]);

  React.useEffect(() => {
    if (initialTeams && initialTeams.length > 0) {
      setTeams(initialTeams);
    }
  }, [initialTeams]);

  // Modals
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [assignMemberModal, setAssignMemberModal] = useState<DelegationTeamItem | null>(null);
  const [grantsModalMember, setGrantsModalMember] = useState<{
    member: DelegationMemberItem;
    team: DelegationTeamItem;
  } | null>(null);
  const [teamGrantsModal, setTeamGrantsModal] = useState<DelegationTeamItem | null>(null);
  const [edgeModalTeam, setEdgeModalTeam] = useState<DelegationTeamItem | null>(null);

  // Eligible Team Leads (Mentors, Executives, Security Admins, Admins, Juniors)
  const eligibleLeads = React.useMemo(() => {
    const list = Array.isArray(employees) && employees.length > 0 ? employees : (Array.isArray(initialEmployees) ? initialEmployees : []);
    const leads = list.filter((e) => {
      const r = (e.role || '').toUpperCase();
      return ['MENTOR', 'STAFF_EXECUTIVE', 'STAFF_JUNIOR', 'SECURITY_ADMIN', 'SUPER_ADMIN', 'ACADEMIC_ADMIN', 'ADMIN'].includes(r);
    });
    return leads.length > 0 ? leads : list;
  }, [employees, initialEmployees]);

  // Form states
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    code: '',
    description: '',
    color: '#6366f1',
    leadId: eligibleLeads[0]?.id || '',
    systemGrants: ['DOCKET', 'COMMUNICATIONS', 'ATTENDANCE'],
  });

  // Keep createTeamForm.leadId populated
  React.useEffect(() => {
    if (eligibleLeads.length > 0) {
      if (!createTeamForm.leadId || !eligibleLeads.some((l) => l.id === createTeamForm.leadId)) {
        setCreateTeamForm((prev) => ({ ...prev, leadId: eligibleLeads[0].id }));
      }
    }
  }, [eligibleLeads, createTeamForm.leadId]);

  const [assignMemberForm, setAssignMemberForm] = useState({
    userId: '',
    roleInTeam: 'JUNIOR' as 'LEAD' | 'JUNIOR' | 'SPECIALIST' | 'OBSERVER',
    systemGrants: ['DOCKET'],
  });

  // Available staff members for assignment modal
  const availableMembers = React.useMemo(() => {
    if (!assignMemberModal) return [];
    const list = Array.isArray(employees) && employees.length > 0 ? employees : (Array.isArray(initialEmployees) ? initialEmployees : []);
    const existingMemberIds = new Set(assignMemberModal.members.map((m) => m.userId));
    return list.filter((e) => e.id !== assignMemberModal.leadId && !existingMemberIds.has(e.id));
  }, [assignMemberModal, employees, initialEmployees]);

  React.useEffect(() => {
    if (assignMemberModal && availableMembers.length > 0) {
      if (!assignMemberForm.userId || !availableMembers.some((m) => m.id === assignMemberForm.userId)) {
        setAssignMemberForm((prev) => ({ ...prev, userId: availableMembers[0].id }));
      }
    }
  }, [assignMemberModal, availableMembers, assignMemberForm.userId]);

  const [edgeForm, setEdgeForm] = useState({
    sourceUserId: '',
    targetUserId: '',
    edgeType: 'REPORTING' as 'REPORTING' | 'COMMUNICATION' | 'TASK_DELEGATION',
    label: 'Direct Reporting Pipeline',
  });

  React.useEffect(() => {
    if (edgeModalTeam && edgeModalTeam.members.length > 0) {
      const first = edgeModalTeam.members[0]?.userId;
      const second = edgeModalTeam.members[1]?.userId || first;
      setEdgeForm((prev) => ({
        ...prev,
        sourceUserId: prev.sourceUserId && edgeModalTeam.members.some((m) => m.userId === prev.sourceUserId) ? prev.sourceUserId : (first || ''),
        targetUserId: prev.targetUserId && edgeModalTeam.members.some((m) => m.userId === prev.targetUserId) ? prev.targetUserId : (second || ''),
      }));
    }
  }, [edgeModalTeam]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Find unassigned employees
  const assignedUserIds = new Set(teams.flatMap((t) => t.members.map((m) => m.userId)));
  const unassignedEmployees = employees.filter((e) => !assignedUserIds.has(e.id) && e.role !== 'SUPER_ADMIN');

  // Handle Team Creation
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamForm.name.trim() || !createTeamForm.code.trim() || !createTeamForm.leadId) return;

    startTransition(async () => {
      const res = await createDelegationTeamAction({
        name: createTeamForm.name.trim(),
        code: createTeamForm.code.trim().toUpperCase(),
        description: createTeamForm.description.trim() || undefined,
        color: createTeamForm.color,
        leadId: createTeamForm.leadId,
        systemGrants: createTeamForm.systemGrants,
      });

      if (res.success && res.team) {
        setTeams([...teams, res.team as any]);
        setCreateTeamOpen(false);
        setCreateTeamForm({
          name: '',
          code: '',
          description: '',
          color: '#6366f1',
          leadId: employees.find((em) => em.role === 'MENTOR' || em.role === 'STAFF_EXECUTIVE')?.id || employees[0]?.id || '',
          systemGrants: ['DOCKET', 'COMMUNICATIONS', 'ATTENDANCE'],
        });
        showToast(`Team Block "${res.team.name}" created with Lead and reporting pipeline.`, 'success');
      } else {
        showToast(res.error || 'Failed to create team block', 'error');
      }
    });
  };

  // Handle Member Assignment
  const handleAssignMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignMemberModal || !assignMemberForm.userId) return;

    startTransition(async () => {
      const res = await assignMemberToTeamAction({
        teamId: assignMemberModal.id,
        userId: assignMemberForm.userId,
        roleInTeam: assignMemberForm.roleInTeam,
        systemGrants: assignMemberForm.systemGrants,
      });

      if (res.success && res.member) {
        setTeams(
          teams.map((t) => {
            if (t.id === assignMemberModal.id) {
              return {
                ...t,
                members: [...t.members.filter((m) => m.userId !== res.member!.userId), res.member as any],
              };
            }
            return t;
          })
        );
        setAssignMemberModal(null);
        showToast(`Employee assigned to ${assignMemberModal.name} as ${assignMemberForm.roleInTeam}.`, 'success');
      } else {
        showToast(res.error || 'Failed to assign member', 'error');
      }
    });
  };

  // Handle Remove Member
  const handleRemoveMember = (teamId: string, memberId: string) => {
    startTransition(async () => {
      const res = await removeMemberFromTeamAction(memberId);
      if (res.success) {
        setTeams(
          teams.map((t) => {
            if (t.id === teamId) {
              return {
                ...t,
                members: t.members.filter((m) => m.id !== memberId),
              };
            }
            return t;
          })
        );
        showToast('Member removed from team block.', 'success');
      } else {
        showToast(res.error || 'Failed to remove member', 'error');
      }
    });
  };

  // Handle Team Deletion
  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete Team Block "${teamName}"? All team reporting edges will be cleared.`)) return;

    startTransition(async () => {
      const res = await deleteDelegationTeamAction(teamId);
      if (res.success) {
        setTeams(teams.filter((t) => t.id !== teamId));
        showToast(`Team Block "${teamName}" removed.`, 'success');
      } else {
        showToast(res.error || 'Failed to delete team', 'error');
      }
    });
  };

  // Handle Member Grants Save
  const handleSaveMemberGrants = (memberId: string, grants: string[]) => {
    startTransition(async () => {
      const res = await updateMemberGrantsAction({
        memberId,
        systemGrants: grants,
      });
      if (res.success && res.member) {
        setTeams(
          teams.map((t) => ({
            ...t,
            members: t.members.map((m) => (m.id === memberId ? { ...m, systemGrants: grants } : m)),
          }))
        );
        setGrantsModalMember(null);
        showToast('Individual system permissions updated successfully.', 'success');
      } else {
        showToast(res.error || 'Failed to update grants', 'error');
      }
    });
  };

  // Handle Team Grants Save
  const handleSaveTeamGrants = (teamId: string, grants: string[]) => {
    startTransition(async () => {
      const res = await updateDelegationTeamAction(teamId, { systemGrants: grants });
      if (res.success && res.team) {
        setTeams(teams.map((t) => (t.id === teamId ? { ...t, systemGrants: grants } : t)));
        setTeamGrantsModal(null);
        showToast('Team-wide system grants updated.', 'success');
      } else {
        showToast(res.error || 'Failed to update team grants', 'error');
      }
    });
  };

  // Handle Edge Creation
  const handleCreateEdgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edgeModalTeam || !edgeForm.sourceUserId || !edgeForm.targetUserId) return;

    startTransition(async () => {
      const res = await createDelegationEdgeAction({
        teamId: edgeModalTeam.id,
        sourceUserId: edgeForm.sourceUserId,
        targetUserId: edgeForm.targetUserId,
        edgeType: edgeForm.edgeType,
        label: edgeForm.label,
      });

      if (res.success && res.edge) {
        setTeams(
          teams.map((t) => {
            if (t.id === edgeModalTeam.id) {
              return {
                ...t,
                edges: [...t.edges, res.edge as any],
              };
            }
            return t;
          })
        );
        setEdgeModalTeam(null);
        showToast('Delegation connection edge established.', 'success');
      } else {
        showToast(res.error || 'Failed to establish edge', 'error');
      }
    });
  };

  // Handle Edge Deletion
  const handleDeleteEdge = (teamId: string, edgeId: string) => {
    startTransition(async () => {
      const res = await deleteDelegationEdgeAction(edgeId);
      if (res.success) {
        setTeams(
          teams.map((t) => {
            if (t.id === teamId) {
              return {
                ...t,
                edges: t.edges.filter((e) => e.id !== edgeId),
              };
            }
            return t;
          })
        );
        showToast('Delegation edge removed.', 'success');
      } else {
        showToast(res.error || 'Failed to remove edge', 'error');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-900 pb-16">
      {/* Toast Alert */}
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2 border transition-all ${
            notice.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-800'
              : 'bg-white border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-medium">{notice.text}</span>
        </div>
      )}

      {/* ── TOP HERO HEADER & CONTROLS ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
              SUPER ADMIN PRIVILEGE DELEGATION &bull; WORKSPACE ARCHITECTURE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2.5">
            <Network className="w-7 h-7 text-indigo-400" />
            <span>Team Blocks &amp; Privilege Delegation</span>
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Form dedicated operational teams, map tiered Leads and Juniors, build hierarchical reporting edges, and grant granular submodule permissions across the institute.
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="p-1 rounded-xl bg-white/10 border border-white/10 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('ARCHITECTURE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'ARCHITECTURE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Architecture Mode
            </button>
            <button
              type="button"
              onClick={() => setViewMode('OBSERVER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'OBSERVER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Observer Mode</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchWorkspaceData}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Roster and Teams"
          >
            <Clock className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Sync Roster'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateTeamOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C6FF34] hover:bg-[#b2ea2c] text-black font-bold font-mono text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team Block</span>
          </button>
        </div>
      </div>

      {/* ── UNASSIGNED EMPLOYEE NODE POOL (Dock) ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800">
              Employee Roster Pool ({unassignedEmployees.length} Unallocated / Ready to Assign)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Total Operational Staff: {employees.length}
          </span>
        </div>

        {unassignedEmployees.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-500 font-mono bg-slate-50 rounded-xl border border-dashed border-slate-200">
            All active mentors and staff members have been structured into operational Team Blocks.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unassignedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs font-mono transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="font-semibold text-slate-800">{emp.name || emp.email}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                  {emp.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── GRAPH WORKSPACE & TEAM BLOCKS CANVAS ── */}
      <div className="space-y-6">
        {teams.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <Network className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No Delegation Teams Assembled</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Create a Team Block to appoint Leads (Tier 2 Mentors / Executives), assign Junior members (Tier 3), and delegate subsystem privileges.
              </p>
            </div>
            <button
              onClick={() => setCreateTeamOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Team Block</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map((team) => {
              const leadMember = team.members.find((m) => m.roleInTeam === 'LEAD') || {
                user: team.lead,
                systemGrants: team.systemGrants,
              };
              const juniors = team.members.filter((m) => m.roleInTeam !== 'LEAD');

              return (
                <div
                  key={team.id}
                  className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  style={{ borderTop: `4px solid ${team.color}` }}
                >
                  {/* Team Block Header */}
                  <div className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            {team.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-slate-200/80 text-slate-700">
                            {team.code}
                          </span>
                        </div>
                        {team.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {team.description}
                          </p>
                        )}
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTeamGrantsModal(team)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                          title="Manage Team Subsystems"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Team Block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Team-wide System Grants Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                        Systems:
                      </span>
                      {team.systemGrants.map((modId) => (
                        <span
                          key={modId}
                          className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          {modId}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Team Hierarchy Visual: Lead -> Junior */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* ── TIER 2: TEAM LEAD NODE ── */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Team Lead &bull; Tier 2 (Directly Answerable to Super Admin)
                      </span>
                      <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold font-mono text-xs flex items-center justify-center shrink-0">
                            {team.lead?.name?.slice(0, 2).toUpperCase() || 'TL'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {team.lead?.name || team.lead?.email}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                              <span>Role: {team.lead?.role}</span>
                              <span>&bull;</span>
                              <span className="text-indigo-700 font-semibold">LEAD ACCESS</span>
                            </div>
                          </div>
                        </div>

                        {/* Top reporting indicator */}
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Reports to Super Admin</span>
                        </div>
                      </div>
                    </div>

                    {/* ── VERTICAL REPORTING PIPELINE ARROW ── */}
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="h-px bg-slate-200 flex-1" />
                      <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                        <span>DELEGATED JUNIOR REPORTING PIPELINE</span>
                      </div>
                      <div className="h-px bg-slate-200 flex-1" />
                    </div>

                    {/* ── TIER 3: JUNIOR NODES ── */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Juniors &amp; Specialists ({juniors.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignMemberModal(team);
                            setAssignMemberForm({
                              userId: unassignedEmployees[0]?.id || '',
                              roleInTeam: 'JUNIOR',
                              systemGrants: team.systemGrants.slice(0, 2),
                            });
                          }}
                          className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Assign Junior</span>
                        </button>
                      </div>

                      {juniors.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 font-mono">
                          No juniors currently assigned to this block. Click &quot;Assign Junior&quot; to attach staff.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {juniors.map((member) => (
                            <div
                              key={member.id}
                              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs text-slate-900 truncate">
                                    {member.user?.name || member.user?.email}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-slate-500">
                                    <span className="font-bold text-indigo-700">{member.roleInTeam}</span>
                                    <span>&bull;</span>
                                    <span>Grants:</span>
                                    {member.systemGrants.map((g) => (
                                      <span
                                        key={g}
                                        className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-semibold"
                                      >
                                        {g}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Member Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setGrantsModalMember({ member, team })}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                                  title="Configure Individual Subsystem Access"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(team.id, member.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Remove from Team"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── INTER-NODE COMMUNICATION & REPORTING EDGES ── */}
                    {team.edges && team.edges.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            Active Edges &amp; Channels ({team.edges.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEdgeModalTeam(team);
                              setEdgeForm({
                                sourceUserId: juniors[0]?.userId || '',
                                targetUserId: team.leadId,
                                edgeType: 'COMMUNICATION',
                                label: 'Peer Communication Channel',
                              });
                            }}
                            className="text-[10px] font-mono text-indigo-700 hover:underline"
                          >
                            + Link Edge
                          </button>
                        </div>

                        <div className="space-y-1">
                          {team.edges.map((edge) => {
                            const sourceUser = employees.find((e) => e.id === edge.sourceUserId);
                            const targetUser = employees.find((e) => e.id === edge.targetUserId);

                            return (
                              <div
                                key={edge.id}
                                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
                                  edge.edgeType === 'REPORTING'
                                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                    : 'bg-cyan-50/60 border-cyan-200 text-cyan-900'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Share2 className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span className="font-bold">{sourceUser?.name || 'Junior'}</span>
                                  <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                                  <span className="font-bold">{targetUser?.name || 'Lead'}</span>
                                  <span className="opacity-75">({edge.label || edge.edgeType})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEdge(team.id, edge.id)}
                                  className="text-slate-400 hover:text-rose-600 font-bold ml-2"
                                  title="Remove Edge"
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Block Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Hierarchy: Super Admin &rarr; Lead &rarr; Jr</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEdgeModalTeam(team);
                        setEdgeForm({
                          sourceUserId: juniors[0]?.userId || '',
                          targetUserId: team.leadId,
                          edgeType: 'COMMUNICATION',
                          label: 'Team Communication Edge',
                        });
                      }}
                      className="font-bold text-indigo-700 hover:underline flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Connect Edge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE TEAM BLOCK MODAL ── */}
      <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Create Operational Team Block</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTeamSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Team Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Active Directory Lab Conduction Team"
                value={createTeamForm.name}
                onChange={(e) => setCreateTeamForm({ ...createTeamForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Team Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TEAM-AD-LABS"
                  value={createTeamForm.code}
                  onChange={(e) => setCreateTeamForm({ ...createTeamForm, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={createTeamForm.color}
                    onChange={(e) => setCreateTeamForm({ ...createTeamForm, color: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-700">{createTeamForm.color}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Appoint Team Lead (Tier 2 Officer) *</label>
              <select
                required
                value={createTeamForm.leadId}
                onChange={(e) => setCreateTeamForm({ ...createTeamForm, leadId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="" disabled>-- Select Team Lead --</option>
                {eligibleLeads.length === 0 ? (
                  <option value="" disabled>No eligible team leads found (Click Sync Roster)</option>
                ) : (
                  eligibleLeads.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || e.email} ({e.role})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Default Subsystem Grants</label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                {availableModules.map((mod) => (
                  <label key={mod.id} className="flex items-center gap-2 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createTeamForm.systemGrants.includes(mod.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCreateTeamForm({
                            ...createTeamForm,
                            systemGrants: [...createTeamForm.systemGrants, mod.id],
                          });
                        } else {
                          setCreateTeamForm({
                            ...createTeamForm,
                            systemGrants: createTeamForm.systemGrants.filter((id) => id !== mod.id),
                          });
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">{mod.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateTeamOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
              >
                {isPending ? 'Assembling Team...' : 'Create Team Block'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── ASSIGN MEMBER TO TEAM MODAL ── */}
      {assignMemberModal && (
        <Dialog open={Boolean(assignMemberModal)} onOpenChange={() => setAssignMemberModal(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Assign Staff Member to {assignMemberModal.name}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAssignMemberSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Select Employee *</label>
                <select
                  required
                  value={assignMemberForm.userId}
                  onChange={(e) => setAssignMemberForm({ ...assignMemberForm, userId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>-- Select Staff Member --</option>
                  {availableMembers.length === 0 ? (
                    <option value="" disabled>No available staff members for this team</option>
                  ) : (
                    availableMembers.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name || e.email} ({e.role})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Role in Team Block</label>
                <select
                  value={assignMemberForm.roleInTeam}
                  onChange={(e) => setAssignMemberForm({ ...assignMemberForm, roleInTeam: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="JUNIOR">Junior Technical Associate (Tier 3)</option>
                  <option value="SPECIALIST">Domain Specialist</option>
                  <option value="OBSERVER">Observer / QA Trainee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Subsystem Grants for this Member</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {assignMemberModal.systemGrants.map((modId) => (
                    <label key={modId} className="flex items-center gap-2 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignMemberForm.systemGrants.includes(modId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignMemberForm({
                              ...assignMemberForm,
                              systemGrants: [...assignMemberForm.systemGrants, modId],
                            });
                          } else {
                            setAssignMemberForm({
                              ...assignMemberForm,
                              systemGrants: assignMemberForm.systemGrants.filter((id) => id !== modId),
                            });
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium">{modId}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignMemberModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
                >
                  {isPending ? 'Assigning...' : 'Assign to Team'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── CONFIGURE INDIVIDUAL MEMBER GRANTS MODAL ── */}
      {grantsModalMember && (
        <Dialog open={Boolean(grantsModalMember)} onOpenChange={() => setGrantsModalMember(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>
                  Privileges for {grantsModalMember.member.user?.name || grantsModalMember.member.user?.email}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-slate-600 text-[11px]">
                Grant or revoke specific system modules available to this team member ({grantsModalMember.team.name}):
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {availableModules.map((mod) => {
                  const isGranted = grantsModalMember.member.systemGrants.includes(mod.id);
                  return (
                    <label key={mod.id} className="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-100/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGranted}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...grantsModalMember.member.systemGrants, mod.id]
                            : grantsModalMember.member.systemGrants.filter((id) => id !== mod.id);
                          setGrantsModalMember({
                            ...grantsModalMember,
                            member: { ...grantsModalMember.member, systemGrants: next },
                          });
                        }}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{mod.name}</div>
                        <div className="text-[10px] text-slate-500">{mod.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGrantsModalMember(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMemberGrants(grantsModalMember.member.id, grantsModalMember.member.systemGrants)}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
                >
                  {isPending ? 'Saving...' : 'Save Privileges'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── CONFIGURE WHOLE TEAM SYSTEM GRANTS MODAL ── */}
      {teamGrantsModal && (
        <Dialog open={Boolean(teamGrantsModal)} onOpenChange={() => setTeamGrantsModal(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Team-Wide System Grants &bull; {teamGrantsModal.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-slate-600 text-[11px]">
                Define the macro system capabilities delegated to this entire Team Block:
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {availableModules.map((mod) => {
                  const isGranted = teamGrantsModal.systemGrants.includes(mod.id);
                  return (
                    <label key={mod.id} className="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-100/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGranted}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...teamGrantsModal.systemGrants, mod.id]
                            : teamGrantsModal.systemGrants.filter((id) => id !== mod.id);
                          setTeamGrantsModal({
                            ...teamGrantsModal,
                            systemGrants: next,
                          });
                        }}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{mod.name}</div>
                        <div className="text-[10px] text-slate-500">{mod.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTeamGrantsModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTeamGrants(teamGrantsModal.id, teamGrantsModal.systemGrants)}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
                >
                  {isPending ? 'Saving...' : 'Save Team Grants'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── CREATE DELEGATION EDGE MODAL ── */}
      {edgeModalTeam && (
        <Dialog open={Boolean(edgeModalTeam)} onOpenChange={() => setEdgeModalTeam(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Establish Delegation / Communication Edge</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateEdgeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Source Employee (From)</label>
                <select
                  required
                  value={edgeForm.sourceUserId}
                  onChange={(e) => setEdgeForm({ ...edgeForm, sourceUserId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                >
                  {edgeModalTeam.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.user?.email} ({m.roleInTeam})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Target Employee (To)</label>
                <select
                  required
                  value={edgeForm.targetUserId}
                  onChange={(e) => setEdgeForm({ ...edgeForm, targetUserId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                >
                  {edgeModalTeam.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.user?.email} ({m.roleInTeam})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Edge Channel Type</label>
                <select
                  value={edgeForm.edgeType}
                  onChange={(e) => setEdgeForm({ ...edgeForm, edgeType: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="REPORTING">Daily Task Reporting Channel</option>
                  <option value="COMMUNICATION">Peer Real-time Communication Edge</option>
                  <option value="TASK_DELEGATION">Hierarchical Task Assignment Edge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Channel Label</label>
                <input
                  type="text"
                  value={edgeForm.label}
                  onChange={(e) => setEdgeForm({ ...edgeForm, label: e.target.value })}
                  placeholder="e.g. Daily Incident Escalation Line"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEdgeModalTeam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
                >
                  {isPending ? 'Connecting...' : 'Establish Edge Link'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

