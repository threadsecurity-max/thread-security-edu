'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  Sparkles,
  Search,
  MessageSquare,
  Filter,
  Loader2,
  X,
  FileText,
  User,
  ShieldCheck,
  Send,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

interface AdminBlogDashboardClientProps {
  initialData: {
    blogs: any[];
    total: number;
    page: number;
    totalPages: number;
    metrics: {
      totalCount: number;
      pendingReviewCount: number;
      publishedCount: number;
      draftCount: number;
      totalViews: number;
    };
  };
  categories: any[];
  user: {
    userId: string;
    name?: string | null;
    role: string;
  };
}

export function AdminBlogDashboardClient({
  initialData,
  categories,
  user,
}: AdminBlogDashboardClientProps) {
  const [blogs, setBlogs] = useState<any[]>(initialData.blogs || []);
  const [metrics, setMetrics] = useState(initialData.metrics);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Rejection / Revision Request Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBlogForReject, setSelectedBlogForReject] = useState<any | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<any | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('categoryId', categoryFilter);

      const res = await fetch(`/api/admin/blogs?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.blogs || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs();
  };

  // 1-Click Approve & Publish
  const handleApprove = async (blogId: string) => {
    setActionLoadingId(blogId);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve blog');

      setBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, status: 'PUBLISHED', publishedAt: new Date().toISOString() } : b))
      );
      setMetrics((prev) => ({
        ...prev,
        pendingReviewCount: Math.max(0, prev.pendingReviewCount - 1),
        publishedCount: prev.publishedCount + 1,
      }));
    } catch (err: any) {
      alert(err.message || 'Error approving blog');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Rejection Dialog
  const openRejectDialog = (blog: any) => {
    setSelectedBlogForReject(blog);
    setFeedbackNote('');
    setRejectModalOpen(true);
  };

  // Submit Rejection / Revisions Request
  const handleSubmitReject = async () => {
    if (!selectedBlogForReject) return;
    setActionLoadingId(selectedBlogForReject.id);
    try {
      const res = await fetch(`/api/admin/blogs/${selectedBlogForReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request revisions');

      setBlogs((prev) =>
        prev.map((b) => (b.id === selectedBlogForReject.id ? { ...b, status: 'DRAFT' } : b))
      );
      setMetrics((prev) => ({
        ...prev,
        pendingReviewCount: Math.max(0, prev.pendingReviewCount - 1),
        draftCount: prev.draftCount + 1,
      }));
      setRejectModalOpen(false);
      setSelectedBlogForReject(null);
    } catch (err: any) {
      alert(err.message || 'Error sending revisions request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (blogId: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}/feature`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blogId ? { ...b, featured: !b.featured } : b))
        );
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to permanently delete this publication?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== blogId));
        setMetrics((prev) => ({ ...prev, totalCount: Math.max(0, prev.totalCount - 1) }));
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  // Items in REVIEW status
  const pendingReviews = blogs.filter((b) => b.status === 'REVIEW');

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-[#C6FF34] bg-black p-1.5 rounded-xl" /> Editorial & Blog Moderation
            </h1>
            <Badge className="bg-[#C6FF34]/15 border border-[#C6FF34]/30 text-black dark:text-[#C6FF34] font-mono text-xs font-bold">
              ACADEMIC EDITORIAL BOARD
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Review submitted research, verify E-E-A-T metadata, approve articles for public release, and manage academy publications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/blog" target="_blank">
            <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 h-9">
              <ExternalLink className="w-4 h-4 text-emerald-500" />
              View Public Blog
            </Button>
          </Link>
          <Link href="/mentor/blogs/new">
            <Button size="sm" className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs gap-1.5 h-9 px-4">
              <Plus className="w-4 h-4" />
              Compose as Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Review Queue KPI */}
        <div className={`p-5 rounded-2xl border transition-all ${
          metrics.pendingReviewCount > 0
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-white dark:bg-[#0c0c0c] border-slate-200 dark:border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PENDING APPROVAL
            </span>
            <Clock className={`w-4 h-4 ${metrics.pendingReviewCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono">
            {metrics.pendingReviewCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {metrics.pendingReviewCount > 0 ? 'Requires editorial decision' : 'All clear - queue is empty'}
          </p>
        </div>

        {/* Published Articles KPI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PUBLISHED LIVE
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono text-emerald-600 dark:text-emerald-400">
            {metrics.publishedCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Indexed on Google SERP
          </p>
        </div>

        {/* Total Reader Views KPI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CUMULATIVE VIEWS
            </span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono text-sky-600 dark:text-sky-400">
            {metrics.totalViews.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Across all research papers
          </p>
        </div>

        {/* Total Drafts KPI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DRAFTS IN PROGRESS
            </span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2 font-mono text-purple-600 dark:text-purple-400">
            {metrics.draftCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Faculty works in progress
          </p>
        </div>
      </div>

      {/* SECTION 1: PENDING EDITORIAL REVIEW QUEUE */}
      {pendingReviews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                SUBMITTED FOR REVIEW & APPROVAL ({pendingReviews.length})
              </h2>
            </div>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReviews.map((blog) => (
              <div
                key={blog.id}
                className="bg-white dark:bg-[#0c0c0c] border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[1080/711] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black">
                    <BlogCoverImage blog={blog} />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black">
                      PENDING REVIEW
                    </span>
                    {blog.category && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#C6FF34] font-bold">
                        {blog.category.name}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {blog.excerpt || blog.subtitle || 'No excerpt provided.'}
                    </p>
                  </div>

                  {/* Author Byline */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#181818] border border-white/20 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0">
                        {blog.author?.user?.avatarUrl ? (
                          <img src={blog.author.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          blog.author?.user?.name?.[0] || 'M'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {blog.author?.user?.name || 'Faculty Mentor'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {blog.author?.title || 'Security Mentor'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {blog.readingTime || 5} min read
                    </span>
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  <Button
                    onClick={() => handleApprove(blog.id)}
                    disabled={actionLoadingId === blog.id}
                    className="w-full bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-9 rounded-xl shadow-md cursor-pointer"
                  >
                    {actionLoadingId === blog.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    )}
                    Approve & Make Live
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRejectDialog(blog)}
                      disabled={actionLoadingId === blog.id}
                      className="font-mono text-xs border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 h-8"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      Request Edits
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreviewBlog(blog);
                        setPreviewModalOpen(true);
                      }}
                      className="font-mono text-xs border-slate-300 dark:border-white/20 h-8"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Read Preview
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: ALL PUBLICATIONS MANAGEMENT TABLE */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C6FF34]" /> ALL RESEARCH PUBLICATIONS ({blogs.length})
          </h2>

          {/* Filters Strip */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or author..."
                className="pl-8 h-8 text-xs bg-white dark:bg-[#121212] border-slate-200 dark:border-white/15 w-48 sm:w-60"
              />
            </form>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121212] text-xs font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="REVIEW">Pending Review</option>
              <option value="PUBLISHED">Published Live</option>
              <option value="DRAFT">Drafts</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121212] text-xs font-mono"
            >
              <option value="ALL">All Topics</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Article & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured Hero</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-slate-700 dark:text-slate-300">
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No publications match the current filters.
                    </td>
                  </tr>
                ) : (
                  blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 aspect-[1080/711] rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-black shrink-0">
                            <BlogCoverImage blog={b} className="w-full h-full object-cover" />
                          </div>
                          <div className="max-w-xs sm:max-w-md">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                              {b.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              By {b.author?.user?.name || 'Mentor'} · {b.author?.title || 'Security Lead'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10">
                          {b.category?.name || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {b.status === 'PUBLISHED' && (
                          <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            ● LIVE
                          </Badge>
                        )}
                        {b.status === 'REVIEW' && (
                          <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] animate-pulse">
                            ● PENDING REVIEW
                          </Badge>
                        )}
                        {b.status === 'DRAFT' && (
                          <Badge className="bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400 text-[10px]">
                            ● DRAFT
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(b.id)}
                          className={`p-1 rounded-lg border transition-all ${
                            b.featured
                              ? 'bg-[#C6FF34]/15 border-[#C6FF34] text-[#C6FF34]'
                              : 'bg-transparent border-slate-300 dark:border-white/10 text-slate-400 hover:text-white'
                          }`}
                          title={b.featured ? 'Featured on Home Hero' : 'Mark as Featured Hero'}
                        >
                          <Star className={`w-3.5 h-3.5 ${b.featured ? 'fill-[#C6FF34]' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {b.viewCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : 'Unpublished'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'REVIEW' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(b.id)}
                              disabled={actionLoadingId === b.id}
                              className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-bold text-[10px] h-7 px-2.5 rounded-lg"
                            >
                              Approve
                            </Button>
                          )}

                          {b.status === 'PUBLISHED' && (
                            <Link href={`/blog/${b.slug}`} target="_blank">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}

                          <Link href={`/mentor/blogs/${b.id}/edit`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBlog(b.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* REVISION REQUEST / REJECT FEEDBACK MODAL */}
      {rejectModalOpen && selectedBlogForReject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 text-white font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400 uppercase">
                <MessageSquare className="w-4 h-4" /> Request Article Revisions
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Article: {selectedBlogForReject.title}</p>
              <p className="text-[11px] text-slate-400">
                Author: {selectedBlogForReject.author?.user?.name || 'Faculty Mentor'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-300">
                Editorial Feedback / Revision Instructions *
              </label>
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Explain what needs adjustment (e.g. Please add practical code samples for Phase 2, update hero cover image to 1080x711 standard, and expand the conclusion)..."
                rows={4}
                className="w-full p-3 rounded-xl bg-[#181818] border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none resize-none font-sans"
              />
              <p className="text-[10px] text-slate-500">
                This note will be automatically dispatched to the mentor's in-app notification center.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                className="text-xs font-mono border-white/10 h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReject}
                disabled={actionLoadingId === selectedBlogForReject.id || !feedbackNote.trim()}
                className="bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs h-8 px-4"
              >
                {actionLoadingId === selectedBlogForReject.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1" />
                )}
                Send Feedback & Revert to Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ARTICLE PREVIEW MODAL */}
      {previewModalOpen && previewBlog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#0c0c0c] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10 text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono font-bold text-[#C6FF34] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> ADMIN EDITORIAL PREVIEW
              </span>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Article Header */}
            <div className="space-y-3 text-center">
              <Badge className="bg-[#C6FF34] text-black font-mono font-bold uppercase">
                {previewBlog.category?.name || 'General Cybersecurity'}
              </Badge>
              <h1 className="text-2xl md:text-4xl font-extrabold font-serif">{previewBlog.title}</h1>
              {previewBlog.subtitle && (
                <p className="text-sm md:text-base text-slate-300 font-serif italic max-w-2xl mx-auto">
                  {previewBlog.subtitle}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-400 pt-2">
                <span>By {previewBlog.author?.user?.name || 'Faculty Mentor'}</span>
                <span>·</span>
                <span>{previewBlog.readingTime || 5} min read</span>
              </div>
            </div>

            {/* Cover Image */}
            <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <BlogCoverImage blog={previewBlog} priority />
            </div>

            {/* Content Body */}
            <div
              className="tiptap prose prose-invert max-w-none text-slate-200 leading-relaxed text-base font-sans pt-4 border-t border-white/10"
              dangerouslySetInnerHTML={{ __html: previewBlog.content || '<p>No content written yet.</p>' }}
            />

            {/* Bottom Actions inside modal */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between font-mono text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModalOpen(false)}
                className="border-white/15 text-white"
              >
                Close Preview
              </Button>

              <div className="flex items-center gap-2">
                <Link href={`/mentor/blogs/${previewBlog.id}/edit`}>
                  <Button size="sm" variant="outline" className="border-sky-500/30 text-sky-400">
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit in Studio
                  </Button>
                </Link>

                {previewBlog.status === 'REVIEW' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setPreviewModalOpen(false);
                      handleApprove(previewBlog.id);
                    }}
                    className="bg-[#C6FF34] text-black font-bold hover:bg-[#b2eb2a]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Make Live
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
