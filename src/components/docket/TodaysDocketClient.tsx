'use client';

import React, { useState, useTransition } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  UserCheck,
  Send,
  Eye,
  Edit3,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Lock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createDocketItemAction,
  submitDocketProofAction,
  submitDailyReportAction,
  reviewDocketItemAction,
  updateDocketItemAction,
} from '@/features/docket/actions/docket.actions';
import { StaffHierarchyTier, getUserHierarchyTier } from '@/lib/auth/hierarchy';
import { SpeedometerProgress } from './SpeedometerProgress';

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface TodaysDocketClientProps {
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
  initialItems: any[];
  assignableUsers: UserItem[];
  portalType: 'admin' | 'mentor';
}

export function TodaysDocketClient({
  currentUser,
  initialItems = [],
  assignableUsers = [],
  portalType,
}: TodaysDocketClientProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [proofModalItem, setProofModalItem] = useState<any | null>(null);
  const [reportModalItem, setReportModalItem] = useState<any | null>(null);
  const [reviewModalItem, setReviewModalItem] = useState<any | null>(null);
  const [editModalItem, setEditModalItem] = useState<any | null>(null);

  const userTier = getUserHierarchyTier(currentUser.role);
  const isSuperAdmin = userTier === StaffHierarchyTier.TIER_1_SUPER_ADMIN;
  const isTier2 = userTier === StaffHierarchyTier.TIER_2_OFFICER;
  const isMentor = currentUser.role.toUpperCase() === 'MENTOR';

  // Filter assignable users based on hierarchy:
  // Super Admin can assign to Tier 2 (Mentor, Executive, Security Admin) and Tier 3 (Junior)
  // Tier 2 can only assign to Tier 3 (Junior)
  const allowedAssignees = React.useMemo(() => {
    const list = Array.isArray(assignableUsers) ? assignableUsers : [];
    if (isSuperAdmin) return list;
    if (isTier2) {
      return list.filter((u) => u.role?.toUpperCase() === 'STAFF_JUNIOR');
    }
    return [];
  }, [assignableUsers, isSuperAdmin, isTier2]);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'DAILY_OPS',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    assigneeId: allowedAssignees[0]?.id || assignableUsers[0]?.id || '',
    dueDate: '',
    proofRequired: false,
  });

  const [proofForm, setProofForm] = useState({
    proofUrl: '',
    proofFilename: '',
    proofNotes: '',
  });

  const [reportForm, setReportForm] = useState({
    dailyReport: '',
    progressPercent: 100,
  });

  const [reviewForm, setReviewForm] = useState({
    supervisorFeedback: '',
    status: 'COMPLETED' as 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED',
  });

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Ensure createForm.assigneeId always points to a valid allowed assignee
  React.useEffect(() => {
    if (allowedAssignees && allowedAssignees.length > 0) {
      if (!createForm.assigneeId || !allowedAssignees.some((u) => u.id === createForm.assigneeId)) {
        const first = allowedAssignees[0]?.id;
        if (first) {
          setCreateForm((prev) => ({ ...prev, assigneeId: first }));
        }
      }
    }
  }, [allowedAssignees, createForm.assigneeId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.assigneeId) return;

    const targetUser = assignableUsers.find((u) => u.id === createForm.assigneeId);
    if (!targetUser) return;

    startTransition(async () => {
      const res = await createDocketItemAction({
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        category: createForm.category,
        priority: createForm.priority,
        assigneeId: targetUser.id,
        assigneeRole: targetUser.role,
        dueDate: createForm.dueDate || undefined,
        proofRequired: targetUser.role === 'MENTOR' ? true : createForm.proofRequired,
      });

      if (res.success && res.data) {
        setItems([res.data, ...items]);
        setIsCreateOpen(false);
        setCreateForm({
          title: '',
          description: '',
          category: 'DAILY_OPS',
          priority: 'MEDIUM',
          assigneeId: assignableUsers[0]?.id || '',
          dueDate: '',
          proofRequired: false,
        });
        showNotice('Docket item created and assigned successfully under operational hierarchy.');
      } else {
        alert(res.error || 'Failed to create docket item');
      }
    });
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalItem || !proofForm.proofUrl.trim()) return;

    startTransition(async () => {
      const res = await submitDocketProofAction({
        id: proofModalItem.id,
        proofUrl: proofForm.proofUrl.trim(),
        proofFilename: proofForm.proofFilename.trim() || 'Verified-Task-Proof.pdf',
        proofNotes: proofForm.proofNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        setItems(items.map((i) => (i.id === proofModalItem.id ? res.data : i)));
        setProofModalItem(null);
        setProofForm({ proofUrl: '', proofFilename: '', proofNotes: '' });
        showNotice('Proof verified and submitted! Prior task is now ACTIVE on the docket tracker.');
      } else {
        alert(res.error || 'Failed to submit proof');
      }
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalItem || !reportForm.dailyReport.trim()) return;

    startTransition(async () => {
      const res = await submitDailyReportAction({
        id: reportModalItem.id,
        dailyReport: reportForm.dailyReport.trim(),
        progressPercent: Number(reportForm.progressPercent),
      });

      if (res.success && res.data) {
        setItems(items.map((i) => (i.id === reportModalItem.id ? res.data : i)));
        setReportModalItem(null);
        setReportForm({ dailyReport: '', progressPercent: 100 });
        showNotice('Daily work report submitted to supervisor successfully.');
      } else {
        alert(res.error || 'Failed to submit daily report');
      }
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem) return;

    startTransition(async () => {
      const res = await reviewDocketItemAction({
        id: reviewModalItem.id,
        supervisorFeedback: reviewForm.supervisorFeedback.trim(),
        status: reviewForm.status,
      });

      if (res.success && res.data) {
        setItems(items.map((i) => (i.id === reviewModalItem.id ? res.data : i)));
        setReviewModalItem(null);
        setReviewForm({ supervisorFeedback: '', status: 'COMPLETED' });
        showNotice('Supervisor audit notes and status updated.');
      } else {
        alert(res.error || 'Failed to review docket item');
      }
    });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assigner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesTier =
      tierFilter === 'ALL' ||
      (tierFilter === 'TIER_1_2' && item.assignerTier === 'TIER_1_SUPER_ADMIN') ||
      (tierFilter === 'TIER_2_3' && item.assignerTier === 'TIER_2_OFFICER');

    return matchesSearch && matchesStatus && matchesTier;
  });

  const pendingProofCount = items.filter((i) => i.status === 'PENDING_PROOF').length;
  const activeCount = items.filter((i) => i.status === 'ACTIVE' || i.status === 'IN_PROGRESS').length;
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            &times;
          </button>
        </div>
      )}

      {/* Top Banner & Hierarchy Clearance Info */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-300 uppercase">
              OPERATIONAL WORKFLOW DIRECTORY &bull; TODAY&apos;S DOCKET
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Today&apos;s Docket &amp; Daily Work Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Hierarchical task assignment, day-wise work reporting, and mentor progress verification. Tier 2 officers report to Super Admin; Junior Staff report to Tier 2.
          </p>
        </div>

        {/* User Identity & Assignment Capabilities */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <div>
            <div className="text-[11px] text-slate-300 font-mono">Current Session</div>
            <div className="font-bold text-sm text-white">{currentUser.name || currentUser.email}</div>
            <div className="text-xs text-indigo-300 font-semibold mt-0.5">
              {isSuperAdmin
                ? 'Super Admin (Tier 1)'
                : isMentor
                ? 'Faculty Mentor (Tier 2)'
                : isTier2
                ? 'Staff Executive (Tier 2)'
                : 'Junior Staff (Tier 3)'}
            </div>
          </div>

          {(isSuperAdmin || isTier2) && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Docket</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Docket Items</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{items.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Awaiting Mentor Proof</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{pendingProofCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">Active / In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{activeCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Completed &amp; Reviewed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{completedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search docket by task, assignee, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_PROOF">Pending Proof (Mentor)</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Hierarchy Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="TIER_1_2">Super Admin &rarr; Tier 2 (Mentor/Executive)</option>
              <option value="TIER_2_3">Tier 2 &rarr; Tier 3 (Junior Staff)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Docket Task Cards Grid */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">No docket items match current query.</p>
            <p className="text-xs text-slate-400 mt-1">Use "Assign New Docket" to issue operational tasks.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isAssignedToCurrent = item.assigneeId === currentUser.userId;
            const isCreatedByCurrent = item.assignerId === currentUser.userId;
            const canSubmitProof = isAssignedToCurrent && (item.proofRequired || item.status === 'PENDING_PROOF');
            const canSubmitReport = isAssignedToCurrent && item.status !== 'PENDING_PROOF';
            const canReview = isSuperAdmin || (isTier2 && item.assignerId === currentUser.userId);

            const isPendingProof = item.status === 'PENDING_PROOF';
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl bg-white border transition-all shadow-xs space-y-4 ${
                  isPendingProof
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.priority === 'URGENT'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.priority === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'PENDING_PROOF'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                            : item.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {item.status === 'PENDING_PROOF' ? '⚠️ PENDING PROOF (PROOF REQ)' : item.status}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">{item.description}</p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {canSubmitProof && (
                      <button
                        onClick={() => {
                          setProofModalItem(item);
                          setProofForm({
                            proofUrl: item.proofUrl || '',
                            proofFilename: item.proofFilename || '',
                            proofNotes: item.proofNotes || '',
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Proof</span>
                      </button>
                    )}

                    {canSubmitReport && (
                      <button
                        onClick={() => {
                          setReportModalItem(item);
                          setReportForm({
                            dailyReport: item.dailyReport || '',
                            progressPercent: item.progressPercent || 100,
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Daily Report</span>
                      </button>
                    )}

                    {canReview && (
                      <button
                        onClick={() => {
                          setReviewModalItem(item);
                          setReviewForm({
                            supervisorFeedback: item.supervisorFeedback || '',
                            status: item.status === 'PENDING_PROOF' ? 'ACTIVE' : (item.status as any),
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
                        <span>Supervisor Review</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hierarchy Delegation Metadata Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-400">Assigned By:</span>
                    <span className="font-bold text-slate-800 truncate">{item.assigner?.name || item.assigner?.email}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700 font-mono">
                      {item.assigner?.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-400">Assignee:</span>
                    <span className="font-bold text-slate-800 truncate">{item.assignee?.name || item.assignee?.email}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono">
                      {item.assignee?.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-1 text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Speedometer Telemetry Gauge in Card */}
                <div className="pt-2 px-1">
                  <SpeedometerProgress percent={item.progressPercent || 0} size="sm" />
                </div>

                {/* Proof & Work Report Disclosures */}
                {(item.proofUrl || item.dailyReport || item.supervisorFeedback) && (
                  <div className="pt-2 space-y-2 border-t border-slate-100 text-xs">
                    {item.proofUrl && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">Attached Proof:</span>
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                        >
                          <span>{item.proofFilename || 'View Uploaded Document'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {item.proofNotes && (
                          <span className="text-slate-600 italic truncate max-w-md">
                            &bull; &quot;{item.proofNotes}&quot;
                          </span>
                        )}
                      </div>
                    )}

                    {item.dailyReport && (
                      <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-slate-800">
                        <span className="font-bold text-indigo-900 mr-2">Daily Progress Report:</span>
                        <span>{item.dailyReport}</span>
                      </div>
                    )}

                    {item.supervisorFeedback && (
                      <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-900">
                        <span className="font-bold mr-2">Supervisor Feedback:</span>
                        <span>{item.supervisorFeedback}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE DOCKET ITEM MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-violet-600" />
              <span>Issue Docket Task (Hierarchical Delegation)</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Task Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Conduct Session 12 on Active Directory Kerberoasting"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-violet-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Task Directives &amp; Scope</label>
              <textarea
                rows={3}
                placeholder="Specify precise expectations, required deliverables, student verification metrics..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Operational Assignee *</label>
                <select
                  required
                  value={createForm.assigneeId}
                  onChange={(e) => setCreateForm({ ...createForm, assigneeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-violet-500"
                >
                  {allowedAssignees.length === 0 ? (
                    <option value="" disabled>No eligible operational assignees found</option>
                  ) : (
                    allowedAssignees.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.role})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Priority</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-violet-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (Day Priority)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-violet-500"
                >
                  <option value="DAILY_OPS">Daily Operations</option>
                  <option value="BATCH_CONDUCTION">Batch &amp; Timetable Conduction</option>
                  <option value="MENTORSHIP">Mentor Curriculum Delivery</option>
                  <option value="INVOICING">Student Invoicing &amp; Receipts</option>
                  <option value="EDITORIAL">Blog Studio &amp; Editorial</option>
                  <option value="LAB_OPS">Cloud Sandboxed Labs</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Due Date</label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                </input>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Proof Requirement Rule:
              </span>
              <p>
                When assigning to a Faculty Mentor, tasks remain in <code className="font-mono font-bold">PENDING_PROOF</code> until an official PDF or verifiable evidence is submitted.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md"
              >
                {isPending ? 'Delegating...' : 'Assign to Docket'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SUBMIT PROOF MODAL (For Mentors & Assignees) */}
      <Dialog open={Boolean(proofModalItem)} onOpenChange={(open) => !open && setProofModalItem(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>Submit Proof to Activate Task</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProofSubmit} className="space-y-4 pt-2">
            <p className="text-slate-600 text-xs">
              Task: <strong className="text-slate-900">{proofModalItem?.title}</strong>
            </p>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                PDF / Evidence Document URL *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. /uploads/assignments/kerberoasting-proof.pdf or https://..."
                value={proofForm.proofUrl}
                onChange={(e) => setProofForm({ ...proofForm, proofUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Proof Filename Label</label>
              <input
                type="text"
                placeholder="e.g. Batch-Alpha-Attendance-Lab-Sheet.pdf"
                value={proofForm.proofFilename}
                onChange={(e) => setProofForm({ ...proofForm, proofFilename: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Summary Notes</label>
              <textarea
                rows={2}
                placeholder="Confirm student turnout, topics covered, test outcomes..."
                value={proofForm.proofNotes}
                onChange={(e) => setProofForm({ ...proofForm, proofNotes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProofModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md"
              >
                {isPending ? 'Verifying...' : 'Submit & Activate'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DAILY WORK REPORT MODAL */}
      <Dialog open={Boolean(reportModalItem)} onOpenChange={(open) => !open && setReportModalItem(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Submit Day-Wise Work Report</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReportSubmit} className="space-y-4 pt-2">
            <p className="text-slate-600 text-xs">
              Task: <strong className="text-slate-900">{reportModalItem?.title}</strong>
            </p>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Daily Work Accomplished *</label>
              <textarea
                rows={4}
                required
                placeholder="Detail what was executed today, challenges faced, hours invested, deliverables ready for review..."
                value={reportForm.dailyReport}
                onChange={(e) => setReportForm({ ...reportForm, dailyReport: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Progress Rate &amp; Telemetry Speedometer
              </label>
              <SpeedometerProgress
                percent={reportForm.progressPercent}
                interactive={true}
                onChange={(newVal) => setReportForm({ ...reportForm, progressPercent: newVal })}
                size="md"
                showDetails={true}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
              >
                {isPending ? 'Submitting...' : 'Send Daily Report'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SUPERVISOR AUDIT & REVIEW MODAL */}
      <Dialog open={Boolean(reviewModalItem)} onOpenChange={(open) => !open && setReviewModalItem(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>Supervisor Review &amp; Sign-Off</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <p className="text-slate-600 text-xs">
              Task: <strong className="text-slate-900">{reviewModalItem?.title}</strong>
            </p>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Update Docket Status</label>
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Approved &amp; Completed</option>
                <option value="BLOCKED">Blocked / Revision Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Supervisor Feedback &amp; Directives
              </label>
              <textarea
                rows={3}
                placeholder="Give constructive feedback or next steps for the assignee..."
                value={reviewForm.supervisorFeedback}
                onChange={(e) => setReviewForm({ ...reviewForm, supervisorFeedback: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md"
              >
                {isPending ? 'Saving...' : 'Confirm Review'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

