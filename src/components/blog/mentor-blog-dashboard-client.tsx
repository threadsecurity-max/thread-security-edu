'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Globe,
  Clock,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  FolderCheck,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MentorBlogDashboardClientProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function MentorBlogDashboardClient({ user }: MentorBlogDashboardClientProps) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mentor/blogs?search=${encodeURIComponent(search)}&status=${statusFilter}`
      );
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [search, statusFilter]);

  const handleCreateNewBlog = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/mentor/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Article' }),
      });
      const data = await res.json();
      if (res.ok && data.blog?.id) {
        router.push(`/mentor/blogs/${data.blog.id}/edit`);
      }
    } catch (err) {
      console.error('Error creating blog:', err);
      setCreating(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/mentor/blogs/${blogId}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b.id !== blogId));
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  // Metrics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === 'PUBLISHED').length;
  const draftCount = blogs.filter((b) => b.status === 'DRAFT').length;
  const reviewCount = blogs.filter((b) => b.status === 'REVIEW').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <Globe className="w-3.5 h-3.5" />
            Faculty Articles & Research
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Technical Articles & Publications
          </h1>
          <p className="text-sm text-slate-500">
            Author, review, and publish cybersecurity research guides and educational articles for the academy.
          </p>
        </div>

        <Button
          onClick={handleCreateNewBlog}
          disabled={creating}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs h-10 px-5 rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer shrink-0"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Workspace...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Write New Article
            </>
          )}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Total Articles
          </span>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-1">
          <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Published Live
          </span>
          <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-100 shadow-xs space-y-1">
          <span className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Working Drafts
          </span>
          <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-violet-100 shadow-xs space-y-1">
          <span className="text-xs font-medium text-violet-700 flex items-center gap-1.5">
            <FolderCheck className="w-3.5 h-3.5 text-violet-600" /> Under Review
          </span>
          <p className="text-2xl font-bold text-violet-600">{reviewCount}</p>
        </div>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search articles by title..."
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200 rounded-xl w-full md:w-auto overflow-x-auto">
          {['ALL', 'DRAFT', 'REVIEW', 'PUBLISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-violet-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Articles' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-medium bg-white border border-slate-200 rounded-2xl shadow-xs animate-pulse">
          Loading faculty articles...
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No articles match the selected filter. Click "Write New Article" to start drafting a new piece.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-4">Article Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Read Time</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 max-w-xs">
                      <Link
                        href={`/mentor/blogs/${b.id}/edit`}
                        className="font-semibold text-slate-900 hover:text-violet-600 transition-colors block truncate"
                      >
                        {b.title}
                      </Link>
                      {b.subtitle && (
                        <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">{b.subtitle}</p>
                      )}
                    </td>

                    <td className="p-4">
                      {b.category ? (
                        <Badge className="bg-slate-100 text-slate-700 font-normal border-slate-200 text-[10px] rounded-md">
                          {b.category.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'REVIEW'
                            ? 'bg-violet-50 text-violet-700 border border-violet-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600">{b.readingTime ? `${b.readingTime} min read` : '1 min read'}</td>

                    <td className="p-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {b.viewCount || 0}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/mentor/blogs/${b.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs font-medium text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </Link>

                        {b.status === 'PUBLISHED' && (
                          <Link href={`/blog/${b.slug}`} target="_blank">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </Link>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBlog(b.id)}
                          className="h-8 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
