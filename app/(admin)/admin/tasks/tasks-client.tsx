'use client';

import React, { useState, useTransition } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  createAdminTaskAction,
  updateAdminTaskAction,
  deleteAdminTaskAction,
} from '@/features/tasks/actions/task.actions';

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  category: 'CSM' | 'SEO' | 'ACADEMIC_OPERATIONS' | 'CONTENT_CREATION' | 'TECHNICAL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'BACKLOG' | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'COMPLETED' | 'CANCELLED';
  assigneeId: string;
  assignee?: { id: string; name: string | null; email: string };
  dueDate: string | Date | null;
  referenceUrl: string | null;
  createdAt: string | Date;
};

interface TasksClientProps {
  initialTasks: TaskItem[];
  assignees: { id: string; name: string | null; email: string; role: string }[];
  currentUserId: string;
}

const CATEGORIES = [
  { value: 'ALL', label: 'All Operations' },
  { value: 'CSM', label: 'CSM (Student Success)' },
  { value: 'SEO', label: 'SEO & Marketing' },
  { value: 'ACADEMIC_OPERATIONS', label: 'Academic Ops' },
  { value: 'CONTENT_CREATION', label: 'Content Creation' },
  { value: 'TECHNICAL', label: 'Technical Infrastructure' },
];

const STATUSES: { value: TaskItem['status']; label: string; color: string; border: string; bg: string }[] = [
  { value: 'BACKLOG', label: 'Backlog', color: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-900/60' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'text-blue-400', border: 'border-blue-900/50', bg: 'bg-blue-950/20' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-amber-400', border: 'border-amber-900/50', bg: 'bg-amber-950/20' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'text-purple-400', border: 'border-purple-900/50', bg: 'bg-purple-950/20' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-emerald-400', border: 'border-emerald-900/50', bg: 'bg-emerald-950/20' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  { value: 'MEDIUM', label: 'Medium', badge: 'bg-blue-950/50 text-blue-400 border-blue-800' },
  { value: 'HIGH', label: 'High', badge: 'bg-amber-950/50 text-amber-400 border-amber-800' },
  { value: 'URGENT', label: 'Urgent', badge: 'bg-rose-950/50 text-rose-400 border-rose-800 animate-pulse' },
];

export function TasksClient({ initialTasks, assignees }: TasksClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isPending, startTransition] = useTransition();

  // Create Task Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ACADEMIC_OPERATIONS' as TaskItem['category'],
    priority: 'MEDIUM' as TaskItem['priority'],
    status: 'ASSIGNED' as TaskItem['status'],
    assigneeId: assignees[0]?.id || '',
    dueDate: '',
    referenceUrl: '',
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesCat = selectedCategory === 'ALL' || task.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;
    const matchesQuery =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignee?.name && task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesStatus && matchesQuery;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assigneeId) return;

    startTransition(async () => {
      const res = await createAdminTaskAction({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      });

      if (res.success && res.data) {
        setTasks((prev) => [res.data as TaskItem, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          title: '',
          description: '',
          category: 'ACADEMIC_OPERATIONS',
          priority: 'MEDIUM',
          status: 'ASSIGNED',
          assigneeId: assignees[0]?.id || '',
          dueDate: '',
          referenceUrl: '',
        });
      } else {
        alert(res.error || 'Failed to create task');
      }
    });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    startTransition(async () => {
      const res = await updateAdminTaskAction(taskId, { status: newStatus });
      if (!res.success) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: t.status } : t))
        );
        alert(res.error || 'Failed to update task status');
      }
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(async () => {
      const res = await deleteAdminTaskAction(taskId);
      if (!res.success) {
        alert(res.error || 'Failed to delete task');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                TASK ALLOCATION MATRIX
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-sans">
                  CSM • SEO • Ops
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Centralized command for assigning, tracking, and verifying faculty operational tasks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Work Order
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TOTAL TASKS</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{tasks.length}</div>
          <div className="text-xs text-slate-500 mt-1">Cross-department operations</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>IN PROGRESS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Active execution</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>UNDER REVIEW</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {tasks.filter((t) => t.status === 'UNDER_REVIEW').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting QA & validation</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>COMPLETED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {tasks.filter((t) => t.status === 'COMPLETED').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Delivered successfully</div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUSES.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column.value);
            return (
              <div
                key={column.value}
                className={`flex flex-col rounded-xl bg-[#090D16] border ${column.border} min-w-[280px]`}
              >
                {/* Column Header */}
                <div className={`p-3 border-b border-slate-800/80 flex items-center justify-between ${column.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono uppercase tracking-wider ${column.color}`}>
                      {column.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="p-3 flex-1 flex flex-col gap-3 min-h-[400px]">
                  {columnTasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-lg p-6">
                      No tasks in {column.label}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-lg bg-[#0E131F] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md group flex flex-col gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {task.category.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                              PRIORITIES.find((p) => p.value === task.priority)?.badge
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                          <span className="truncate font-mono text-[11px] text-slate-300">
                            @{task.assignee?.name || task.assignee?.email || 'Unassigned'}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-400/90">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Status Progression & Actions */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <select
                            value={task.status}
                            disabled={isPending}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskItem['status'])}
                            className="text-[10px] bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                → {s.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-[#090D16] border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 border-b border-slate-800 text-[11px] uppercase font-mono">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No tasks matching filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{task.title}</div>
                      {task.referenceUrl && (
                        <a
                          href={task.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> Reference doc
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {task.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {task.assignee?.name || task.assignee?.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          PRIORITIES.find((p) => p.value === task.priority)?.badge
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskItem['status'])}
                        className="text-[11px] bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                DISPATCH OPERATIONAL TASK
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">TASK TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct CSM check-in for Batch CYBER-01"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">OPERATIONAL DOMAIN</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as TaskItem['category'] })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="CSM">CSM (Student Success)</option>
                    <option value="SEO">SEO & Growth</option>
                    <option value="ACADEMIC_OPERATIONS">Academic Ops</option>
                    <option value="CONTENT_CREATION">Content Creation</option>
                    <option value="TECHNICAL">Technical Infrastructure</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">PRIORITY LEVEL</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as TaskItem['priority'] })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">FACULTY ASSIGNEE *</label>
                <select
                  required
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="">Select Assignee</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.email} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">DUE DATE</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">REFERENCE URL (OPTIONAL)</label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/..."
                    value={formData.referenceUrl}
                    onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">DESCRIPTION & INSTRUCTIONS</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise scope of work and completion criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-2"
                >
                  {isPending ? 'Dispatching...' : 'Dispatch Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
