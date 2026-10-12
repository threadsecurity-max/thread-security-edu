'use client';

import React, { useState, useTransition } from 'react';
import {
  Search,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UserCog,
  Mail,
  Phone,
  UserPlus,
  Trash2,
  Edit3,
  Send,
  X,
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Crown,
  KeyRound,
  Layers,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RoleType } from '@prisma/client';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isDashboardAccessGranted: boolean;
  tsId: string | null;
  phone: string | null;
  batchId?: string | null;
  createdAt: string;
}

export interface UserMetrics {
  total: number;
  students: number;
  mentors: number;
  staff: number;
  securityAdmins: number;
  superAdmins: number;
}

interface BatchOption {
  id: string;
  batchCode: string;
  title: string;
}

export interface DefaultEnvKeys {
  adminSecretKey: string;
  adminPasskey: string;
  mentorSecretKey: string;
  mentorPasskey: string;
  securityAdminSecretKey: string;
  securityAdminPasskey: string;
}

interface UsersDirectoryClientProps {
  initialUsers: UserRecord[];
  metrics: UserMetrics;
  batches: BatchOption[];
  currentUserId: string;
  defaultEnvKeys?: DefaultEnvKeys;
}

type TabType = 'ALL' | 'STUDENT' | 'MENTOR' | 'STAFF' | 'SECURITY_ADMIN' | 'SUPER_ADMIN';

export function UsersDirectoryClient({
  initialUsers,
  metrics,
  batches,
  currentUserId,
  defaultEnvKeys,
}: UsersDirectoryClientProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [dispatchingUser, setDispatchingUser] = useState<UserRecord | null>(null);

  // Create User Form State
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STUDENT' as RoleType,
    department: '',
    batchId: batches[0]?.id || '',
    track: 'CYBER' as 'CYBER' | 'AI',
    customTsId: '',
    passkey: '',
    secretKey: '',
    dispatchEmail: true,
  });
  const [suggestingId, setSuggestingId] = useState(false);

  // Edit User Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STUDENT' as RoleType,
    isActive: true,
    isDashboardAccessGranted: true,
    newPasskey: '',
    newSecretKey: '',
    dispatchUpdatedCredentials: false,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (activeTab === 'STUDENT' && u.role !== 'STUDENT') return false;
    if (activeTab === 'MENTOR' && u.role !== 'MENTOR') return false;
    if (activeTab === 'STAFF' && !['ACADEMIC_ADMIN', 'CONTENT_MANAGER'].includes(u.role)) return false;
    if (activeTab === 'SECURITY_ADMIN' && u.role !== 'SECURITY_ADMIN') return false;
    if (activeTab === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchTsId = u.tsId?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      return matchName || matchEmail || matchTsId || matchRole;
    }
    return true;
  });

  // Fetch suggested ID based on role via REST API
  const refreshSuggestedId = async (targetRole: RoleType) => {
    setSuggestingId(true);
    try {
      const res = await fetch(
        `/api/admin/users?action=suggested-id&role=${targetRole}&track=${createFormData.track || 'CYBER'}`
      );
      const data = await res.json();
      if (data.success && data.tsId) {
        setCreateFormData((prev) => ({ ...prev, customTsId: data.tsId }));
      }
    } catch (err: any) {
      console.error('Failed to get suggested ID:', err);
    } finally {
      setSuggestingId(false);
    }
  };

  // Role default keys matching .env configuration
  const getDefaultKeysForRole = (targetRole: RoleType) => {
    if (targetRole === 'ACADEMIC_ADMIN' || targetRole === 'CONTENT_MANAGER' || targetRole === 'SUPER_ADMIN') {
      return {
        secretKey: defaultEnvKeys?.adminSecretKey || 'TSE-ADMIN-8080',
        passkey: defaultEnvKeys?.adminPasskey || 'ThreadSec@789',
      };
    }
    if (targetRole === 'MENTOR') {
      return {
        secretKey: defaultEnvKeys?.mentorSecretKey || 'TSE-MENTOR-78987',
        passkey: defaultEnvKeys?.mentorPasskey || 'MentorThreadSec@525',
      };
    }
    if (targetRole === 'SECURITY_ADMIN') {
      return {
        secretKey: defaultEnvKeys?.securityAdminSecretKey || 'TSE-SEC-ADMIN-789',
        passkey: defaultEnvKeys?.securityAdminPasskey || 'ThreadSec@789789789',
      };
    }
    return { secretKey: '', passkey: '' };
  };

  // Handle open create modal
  const handleOpenCreateModal = async (defaultRole: RoleType = 'STUDENT') => {
    const keys = getDefaultKeysForRole(defaultRole);
    setCreateFormData({
      name: '',
      email: '',
      phone: '',
      role: defaultRole,
      department: '',
      batchId: batches[0]?.id || '',
      track: 'CYBER',
      customTsId: '',
      passkey: keys.passkey,
      secretKey: keys.secretKey,
      dispatchEmail: true,
    });
    setIsCreateModalOpen(true);
    await refreshSuggestedId(defaultRole);
  };

  // Submit Create User via REST API
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.email) {
      showToast('Name and email are required.', 'error');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: createFormData.name,
            email: createFormData.email,
            phone: createFormData.phone || undefined,
            role: createFormData.role,
            department: createFormData.department || undefined,
            batchId:
              createFormData.role === 'STUDENT' || createFormData.role === 'MENTOR'
                ? createFormData.batchId
                : undefined,
            track: createFormData.track,
            customTsId: createFormData.customTsId || undefined,
            passkey: createFormData.passkey || undefined,
            secretKey: createFormData.secretKey || undefined,
            dispatchEmail: createFormData.dispatchEmail,
          }),
        });

        const data = await res.json();

        if (data.success && data.user) {
          const newUserRecord: UserRecord = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            isActive: data.user.isActive,
            isDashboardAccessGranted: data.user.isDashboardAccessGranted,
            tsId: data.tsId || null,
            phone: createFormData.phone || null,
            batchId: createFormData.batchId || null,
            createdAt: new Date().toISOString(),
          };

          setUsers((prev) => [newUserRecord, ...prev]);
          setIsCreateModalOpen(false);
          showToast(
            `User ${data.user.name} created as ${data.user.role} with TS-ID ${data.tsId}.${
              createFormData.dispatchEmail ? ' Credentials dispatched to email.' : ''
            }`,
            'success'
          );
        } else {
          showToast(data.error || 'Failed to create user.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error while creating user.', 'error');
      }
    });
  };

  // Open Edit User
  const handleOpenEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role as RoleType,
      isActive: user.isActive,
      isDashboardAccessGranted: user.isDashboardAccessGranted,
      newPasskey: '',
      newSecretKey: '',
      dispatchUpdatedCredentials: false,
    });
  };

  // Submit Edit User via REST API
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.id,
            name: editFormData.name,
            email: editFormData.email,
            phone: editFormData.phone,
            role: editFormData.role,
            isActive: editFormData.isActive,
            isDashboardAccessGranted: editFormData.isDashboardAccessGranted,
            newPasskey: editFormData.newPasskey || undefined,
            newSecretKey: editFormData.newSecretKey || undefined,
            dispatchUpdatedCredentials: editFormData.dispatchUpdatedCredentials,
          }),
        });

        const data = await res.json();

        if (data.success && data.user) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? {
                    ...u,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    isActive: data.user.isActive,
                    isDashboardAccessGranted: data.user.isDashboardAccessGranted,
                    phone: editFormData.phone || null,
                  }
                : u
            )
          );
          setEditingUser(null);
          showToast(`User ${data.user.name} updated successfully.`, 'success');
        } else {
          showToast(data.error || 'Failed to update user.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error while updating user.', 'error');
      }
    });
  };

  // Delete User via REST API
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users?id=${encodeURIComponent(deletingUser.id)}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
          setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
          setDeletingUser(null);
          showToast(`User ${deletingUser.name} deleted successfully.`, 'success');
        } else {
          showToast(data.error || 'Failed to delete user.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error while deleting user.', 'error');
      }
    });
  };

  // Toggle Dashboard Access via REST API
  const handleToggleAccess = async (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const nextStatus = !currentStatus;
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'toggle-access',
            userId,
            grant: nextStatus,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, isDashboardAccessGranted: nextStatus } : u))
          );
          showToast(`Dashboard access status updated.`, 'success');
        } else {
          showToast(data.error || 'Failed to update access status', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error while updating access status.', 'error');
      }
    });
  };

  // Dispatch Credentials via REST API
  const handleDispatchCredentials = async (user: UserRecord) => {
    setDispatchingUser(user);
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/users/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();

        if (data.success) {
          showToast(
            `Official ${user.role} login credentials & security keys dispatched to ${user.email}.`,
            'success'
          );
        } else {
          showToast(data.error || 'Failed to dispatch credentials email.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Network error while dispatching credentials email.', 'error');
      } finally {
        setDispatchingUser(null);
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SECURITY_ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ACADEMIC_ADMIN':
      case 'CONTENT_MANAGER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MENTOR':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STUDENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Top Action Bar & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 w-full sm:w-auto flex-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase opacity-80">All Users</div>
            <div className="text-xl font-bold mt-0.5">{metrics.total}</div>
          </button>

          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'STUDENT'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase opacity-80">Students</div>
            <div className="text-xl font-bold mt-0.5">{metrics.students}</div>
          </button>

          <button
            onClick={() => setActiveTab('MENTOR')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'MENTOR'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase opacity-80">Mentors</div>
            <div className="text-xl font-bold mt-0.5">{metrics.mentors}</div>
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'STAFF'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase opacity-80">Staff / Ops</div>
            <div className="text-xl font-bold mt-0.5">{metrics.staff}</div>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY_ADMIN')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'SECURITY_ADMIN'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase opacity-80">Security</div>
            <div className="text-xl font-bold mt-0.5">{metrics.securityAdmins}</div>
          </button>

          <button
            onClick={() => setActiveTab('SUPER_ADMIN')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'SUPER_ADMIN'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase opacity-80">Super Admins</div>
            <div className="text-xl font-bold mt-0.5">{metrics.superAdmins}</div>
          </button>
        </div>

        {/* Primary Action: Provision / Create New User */}
        <button
          onClick={() => handleOpenCreateModal('STUDENT')}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs shrink-0 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, TS-ID, or role..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
          Showing <strong className="text-slate-900">{filteredUsers.length}</strong> of {users.length} accounts
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email &amp; Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">TS-ID</th>
                <th className="p-4 text-center">Dashboard Access</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions &amp; Creds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No users matching the active filter or search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                  const isCurrentAdmin = u.id === currentUserId;
                  const isPrimaryRoot = u.email === 'threadsecuritydeveloper@gmail.com';

                  return (
                    <tr key={u.id} className="hover:bg-violet-50/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-100 text-violet-700 font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        {u.tsId ? (
                          <span className="px-2 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 font-mono font-semibold text-[11px]">
                            {u.tsId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleAccess(u.id, u.isDashboardAccessGranted)}
                          disabled={isPending}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                            u.isDashboardAccessGranted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {u.isDashboardAccessGranted ? (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-amber-600" /> Pending
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Dispatch Creds Button */}
                          <button
                            onClick={() => handleDispatchCredentials(u)}
                            disabled={isPending || dispatchingUser?.id === u.id}
                            title="Dispatch login credentials and access keys to user email"
                            className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            <Send className="w-3 h-3 text-violet-600" />
                            <span>{dispatchingUser?.id === u.id ? 'Sending...' : 'Creds'}</span>
                          </button>

                          {/* Edit User Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit user details and role"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          {!isCurrentAdmin && !isPrimaryRoot && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              title="Delete user account"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE USER MODAL (With 5 Roles & Non-Student Keys Provisioning) ── */}
      {isCreateModalOpen && (
        <Dialog open={isCreateModalOpen} onOpenChange={() => setIsCreateModalOpen(false)}>
          <DialogContent className="max-w-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-3xl p-6 sm:p-8 font-sans max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-violet-600" />
                Provision Platform User &amp; Assign Keys
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateUserSubmit} className="space-y-5 pt-3">
              {/* Step 1: Core User Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold text-[11px]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold text-[11px]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold text-[11px]">Contact Phone</label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    placeholder="+91 98765-43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-semibold text-[11px]">Appointed TS-ID *</label>
                    <button
                      type="button"
                      onClick={() => refreshSuggestedId(createFormData.role)}
                      disabled={suggestingId}
                      className="text-[10px] text-violet-600 hover:text-violet-800 flex items-center gap-1 font-mono"
                    >
                      <RefreshCw className={`w-3 h-3 ${suggestingId ? 'animate-spin' : ''}`} /> Next +1
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={createFormData.customTsId}
                    onChange={(e) => setCreateFormData({ ...createFormData, customTsId: e.target.value })}
                    placeholder="e.g. TS-C546 or TS-MNT-101"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Step 2: 5 Roles Selection */}
              <div className="space-y-2">
                <label className="text-slate-700 font-semibold text-[11px] block">
                  Select Role Assignment (5 Roles)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { role: 'STUDENT', label: 'Student', icon: GraduationCap, desc: 'Candidate learner' },
                    { role: 'MENTOR', label: 'Mentor', icon: Briefcase, desc: 'Faculty & instructor' },
                    { role: 'ACADEMIC_ADMIN', label: 'Staff / Ops', icon: Layers, desc: 'Academic operations' },
                    { role: 'SECURITY_ADMIN', label: 'Security Admin', icon: ShieldAlert, desc: 'SOC & security vault' },
                    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: Crown, desc: 'Master clearance' },
                  ].map(({ role, label, icon: Icon, desc }) => {
                    const isSelected = createFormData.role === role;
                    return (
                      <div
                        key={role}
                        onClick={async () => {
                          const r = role as RoleType;
                          const keys = getDefaultKeysForRole(r);
                          setCreateFormData((prev) => ({
                            ...prev,
                            role: r,
                            secretKey: keys.secretKey,
                            passkey: keys.passkey,
                          }));
                          await refreshSuggestedId(r);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                          isSelected
                            ? 'bg-violet-50/80 border-violet-500 text-violet-900 shadow-xs ring-1 ring-violet-500'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-violet-600' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">{label}</span>
                        <span className="text-[10px] text-slate-500 leading-tight">{desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Role-Specific Configurations */}
              {createFormData.role === 'STUDENT' ? (
                /* Student-Specific Fields */
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Student Enrollment Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 text-[11px]">Domain Track</label>
                      <select
                        value={createFormData.track}
                        onChange={(e) => setCreateFormData({ ...createFormData, track: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                      >
                        <option value="CYBER">Cybersecurity &amp; VAPT Track</option>
                        <option value="AI">Artificial Intelligence &amp; ML Track</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 text-[11px]">Assign Initial Cohort / Batch</label>
                      <select
                        value={createFormData.batchId}
                        onChange={(e) => setCreateFormData({ ...createFormData, batchId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                      >
                        <option value="">No Batch Assigned</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.batchCode} — {b.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 text-[11px]">Initial Password (optional)</label>
                    <input
                      type="text"
                      value={createFormData.passkey}
                      onChange={(e) => setCreateFormData({ ...createFormData, passkey: e.target.value })}
                      placeholder="Auto-generated if left empty"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              ) : (
                /* Non-Student Roles: Role Keys & Specialization */
                <div className="p-4 rounded-2xl bg-violet-50/40 border border-violet-100 space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-violet-900 font-bold text-xs">
                    <KeyRound className="w-4 h-4 text-violet-600" />
                    <span>Non-Student Role Keys &amp; Department Clearance</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    This user is being assigned as <strong>{createFormData.role}</strong>. Their designated Secret Key and Access Passkey will be securely dispatched to their inbox so they can complete clearance upon logging in.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium text-[11px]">Department / Title</label>
                      <input
                        type="text"
                        value={createFormData.department}
                        onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                        placeholder={
                          createFormData.role === 'MENTOR'
                            ? 'e.g. Lead Cybersecurity Mentor'
                            : createFormData.role === 'SECURITY_ADMIN'
                            ? 'e.g. SOC Lead & Incident Analyst'
                            : 'e.g. Academic Curriculum Coordinator'
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    {createFormData.role === 'MENTOR' && (
                      <div className="space-y-1">
                        <label className="text-slate-700 font-medium text-[11px]">Map Cohort Batch</label>
                        <select
                          value={createFormData.batchId}
                          onChange={(e) => setCreateFormData({ ...createFormData, batchId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                        >
                          <option value="">No Batch Assigned</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.batchCode} — {b.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-700 font-medium text-[11px]">
                          Assigned Secret Key
                        </label>
                        <span className="text-[10px] text-violet-600 font-mono">
                          .env Default: {createFormData.role === 'MENTOR' ? (defaultEnvKeys?.mentorSecretKey || 'TSE-MENTOR-78987') : createFormData.role === 'SECURITY_ADMIN' ? (defaultEnvKeys?.securityAdminSecretKey || 'TSE-SEC-ADMIN-789') : (defaultEnvKeys?.adminSecretKey || 'TSE-ADMIN-8080')}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={createFormData.secretKey}
                        onChange={(e) => setCreateFormData({ ...createFormData, secretKey: e.target.value })}
                        placeholder="e.g. TSE-ADMIN-8080 or custom key"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-700 font-medium text-[11px]">
                          Assigned Access Key / Passkey
                        </label>
                        <span className="text-[10px] text-violet-600 font-mono">
                          .env Default: {createFormData.role === 'MENTOR' ? (defaultEnvKeys?.mentorPasskey || 'MentorThreadSec@525') : createFormData.role === 'SECURITY_ADMIN' ? (defaultEnvKeys?.securityAdminPasskey || 'ThreadSec@789789789') : (defaultEnvKeys?.adminPasskey || 'ThreadSec@789')}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={createFormData.passkey}
                        onChange={(e) => setCreateFormData({ ...createFormData, passkey: e.target.value })}
                        placeholder="e.g. ThreadSec@789 or custom passkey"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Automatic Dispatch Option */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dispatchEmailCheckbox"
                  checked={createFormData.dispatchEmail}
                  onChange={(e) => setCreateFormData({ ...createFormData, dispatchEmail: e.target.checked })}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="dispatchEmailCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Automatically dispatch welcome email with credentials &amp; security keys to user inbox
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPending ? 'Provisioning Account...' : 'Provision User & Dispatch'}</span>
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="w-4 h-4 text-violet-600" />
                Edit User: {editingUser.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-semibold">Contact Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-semibold">Role Assignment</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as RoleType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500 font-medium"
                >
                  <option value="STUDENT">Student</option>
                  <option value="MENTOR">Mentor (Faculty)</option>
                  <option value="ACADEMIC_ADMIN">Academic Admin (Staff)</option>
                  <option value="SECURITY_ADMIN">Security Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-semibold">Reset Passkey / Key (optional)</label>
                <input
                  type="text"
                  value={editFormData.newPasskey}
                  onChange={(e) => setEditFormData({ ...editFormData, newPasskey: e.target.value })}
                  placeholder="Leave empty to keep unchanged"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="rounded text-violet-600 border-slate-300"
                  />
                  <span>Active Account</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={editFormData.isDashboardAccessGranted}
                    onChange={(e) => setEditFormData({ ...editFormData, isDashboardAccessGranted: e.target.checked })}
                    className="rounded text-violet-600 border-slate-300"
                  />
                  <span>Dashboard Access</span>
                </label>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={editFormData.dispatchUpdatedCredentials}
                    onChange={(e) => setEditFormData({ ...editFormData, dispatchUpdatedCredentials: e.target.checked })}
                    className="rounded text-violet-600 border-slate-300"
                  />
                  <span>Dispatch updated credentials to user inbox</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── DELETE USER CONFIRMATION MODAL ── */}
      {deletingUser && (
        <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Delete User Account
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <p className="text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete the account for{' '}
                <strong className="text-slate-900">{deletingUser.name}</strong> ({deletingUser.email})?
              </p>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-[11px]">
                <span className="font-bold block">Irreversible Security Action:</span>
                <p>
                  This will permanently delete this user’s identity records, profile data, and revoke their platform clearance immediately.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isPending ? 'Deleting Account...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
