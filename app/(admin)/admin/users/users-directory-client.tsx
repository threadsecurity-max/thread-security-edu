'use client';

import React, { useState, useTransition } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  UserCog,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  toggleStudentDashboardAccessAction,
  updateUserRoleAction,
} from '@/features/admin/actions/admin.actions';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isDashboardAccessGranted: boolean;
  tsId: string | null;
  phone: string | null;
  createdAt: string;
}

interface UsersDirectoryClientProps {
  initialUsers: UserRecord[];
  metrics: {
    total: number;
    students: number;
    guests: number;
    mentors: number;
    admins: number;
  };
}

export function UsersDirectoryClient({
  initialUsers,
  metrics,
}: UsersDirectoryClientProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENT' | 'GUEST' | 'MENTOR' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleModalUser, setRoleModalUser] = useState<UserRecord | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (activeTab === 'STUDENT' && u.role !== 'STUDENT') return false;
    if (activeTab === 'GUEST' && u.role !== 'GUEST') return false;
    if (activeTab === 'MENTOR' && u.role !== 'MENTOR') return false;
    if (
      activeTab === 'ADMIN' &&
      !['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'SECURITY_ADMIN', 'CONTENT_MANAGER'].includes(u.role)
    )
      return false;

    // Search query filter
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

  const handleToggleAccess = async (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const nextStatus = !currentStatus;
      const res = await toggleStudentDashboardAccessAction(userId, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isDashboardAccessGranted: nextStatus } : u))
        );
        setFeedback({
          type: 'success',
          message: `Updated dashboard access status for user.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update access status',
        });
      }
    });
  };

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser || !selectedNewRole) return;

    startTransition(async () => {
      const res = await updateUserRoleAction(roleModalUser.id, selectedNewRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: selectedNewRole } : u))
        );
        setFeedback({
          type: 'success',
          message: `Role changed to ${selectedNewRole} for ${roleModalUser.name}.`,
        });
        setRoleModalUser(null);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update role',
        });
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ACADEMIC_ADMIN':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'SECURITY_ADMIN':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MENTOR':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'STUDENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'GUEST':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONTENT_MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">All Users</div>
          <div className="text-2xl font-bold mt-1">{metrics.total}</div>
        </div>

        <div
          onClick={() => setActiveTab('STUDENT')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'STUDENT'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Students</div>
          <div className="text-2xl font-bold mt-1">{metrics.students}</div>
        </div>

        <div
          onClick={() => setActiveTab('GUEST')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'GUEST'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Guests</div>
          <div className="text-2xl font-bold mt-1">{metrics.guests}</div>
        </div>

        <div
          onClick={() => setActiveTab('MENTOR')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'MENTOR'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Faculty &amp; Mentors</div>
          <div className="text-2xl font-bold mt-1">{metrics.mentors}</div>
        </div>

        <div
          onClick={() => setActiveTab('ADMIN')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ADMIN'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Admins &amp; Staff</div>
          <div className="text-2xl font-bold mt-1">{metrics.admins}</div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
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
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">
            Showing <strong className="text-slate-900">{filteredUsers.length}</strong> of {users.length} users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs">
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
                <th className="p-4 text-right">Actions</th>
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

                  return (
                    <tr key={u.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{u.name}</div>
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
                          <span className="text-slate-400 italic text-[11px]">None</span>
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
                        <button
                          onClick={() => {
                            setRoleModalUser(u);
                            setSelectedNewRole(u.role);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 hover:border-violet-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserCog className="w-3.5 h-3.5 text-violet-600" />
                          <span>Change Role</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {roleModalUser && (
        <Dialog open={!!roleModalUser} onOpenChange={() => setRoleModalUser(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="w-4 h-4 text-violet-600" />
                Change Role: {roleModalUser.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-600 font-medium mb-1.5 text-[11px]">
                  Select New Role
                </label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 font-medium"
                >
                  <option value="STUDENT">Student</option>
                  <option value="GUEST">Guest</option>
                  <option value="MENTOR">Mentor (Faculty)</option>
                  <option value="CONTENT_MANAGER">Content Manager</option>
                  <option value="ACADEMIC_ADMIN">Academic Admin</option>
                  <option value="SECURITY_ADMIN">Security Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-violet-900 block">Access Policy Note:</span>
                <p>
                  Changing a user's role updates their dashboard permissions immediately. Ensure mentors have corresponding faculty profiles provisioned.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
