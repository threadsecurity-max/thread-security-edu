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
  Star,
  Calendar,
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

  const [metrics, setMetrics] = useState({
    total: 0,
    published: 0,
    scheduled: 0,
    draft: 0,
    review: 0,
    totalViews: 0,
  });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mentor/blogs?search=${encodeURIComponent(search)}&status=${statusFilter}&limit=100`
      );
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Non-JSON response fetching mentor blogs:', text);
      }
      if (res.ok) {
        setBlogs(data.blogs || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
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
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
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
        setBlogs((prev) => prev.filter((b) => b.id !== blogId));
        fetchBlogs();
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
            <Globe className="w-3.5 h-3.5" />
            Faculty Research & Publications Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Technical Articles & Publications
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-normal">
            Author, review, schedule, and publish cybersecurity research guides and educational articles for the academy.
          </p>
        </div>

        <Button
          onClick={handleCreateNewBlog}
          disabled={creating}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer shrink-0"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Studio...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Write New Article
            </>
          )}
        </Button>
      </div>

      {/* Metrics Row (Interactive 6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer shadow-xs hover:border-slate-400 ${
            statusFilter === 'ALL' ? 'ring-2 ring-violet-500 border-violet-500 bg-violet-50/20' : 'border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Total
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</p>
          <span className="text-[10px] text-slate-400 font-mono">All articles</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PUBLISHED')}
          className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer shadow-xs hover:border-emerald-400 ${
            statusFilter === 'PUBLISHED' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-emerald-200'
          }`}
        >
          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Published
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{metrics.published}</p>
          <span className="text-[10px] text-emerald-600/80 font-mono">Live on site</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('SCHEDULED')}
          className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer shadow-xs hover:border-violet-400 ${
            statusFilter === 'SCHEDULED' ? 'ring-2 ring-violet-500 border-violet-500 bg-violet-50/20' : 'border-violet-200'
          }`}
        >
          <span className="text-xs font-semibold text-violet-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-600" /> Scheduled
          </span>
          <p className="text-2xl font-bold text-violet-700 mt-1">{metrics.scheduled}</p>
          <span className="text-[10px] text-violet-600/80 font-mono">Timed release</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('DRAFT')}
          className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer shadow-xs hover:border-amber-400 ${
            statusFilter === 'DRAFT' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20' : 'border-amber-200'
          }`}
        >
          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Drafts
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{metrics.draft}</p>
          <span className="text-[10px] text-amber-600/80 font-mono">In progress</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REVIEW')}
          className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer shadow-xs hover:border-sky-400 ${
            statusFilter === 'REVIEW' ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/20' : 'border-sky-200'
          }`}
        >
          <span className="text-xs font-semibold text-sky-800 flex items-center gap-1.5">
            <FolderCheck className="w-3.5 h-3.5 text-sky-600" /> In Review
          </span>
          <p className="text-2xl font-bold text-sky-700 mt-1">{metrics.review}</p>
          <span className="text-[10px] text-sky-600/80 font-mono">Admin queue</span>
        </button>

        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#C6FF34]" /> Total Reads
          </span>
          <p className="text-2xl font-bold text-white mt-1">{(metrics.totalViews || 0).toLocaleString()}</p>
          <span className="text-[10px] text-[#C6FF34] font-mono">Reader impact</span>
        </div>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search articles by title..."
            className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-200/80 p-1 border border-slate-300 rounded-xl w-full md:w-auto overflow-x-auto">
          {['ALL', 'DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-white text-violet-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'SCHEDULED' && <Calendar className="w-3.5 h-3.5 text-violet-600" />}
              {st === 'ALL'
                ? 'All Articles'
                : st === 'SCHEDULED'
                ? 'Scheduled'
                : st.charAt(0) + st.slice(1).toLowerCase()}
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
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/mentor/blogs/${b.id}/edit`}
                          className="font-semibold text-slate-900 hover:text-violet-600 transition-colors block truncate"
                        >
                          {b.title}
                        </Link>
                        {b.featured && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] font-mono font-bold flex items-center gap-0.5 shrink-0 px-1.5 py-0">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                            FEATURED
                          </Badge>
                        )}
                      </div>
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
                      {b.status === 'PUBLISHED' && b.publishedAt && new Date(b.publishedAt).getTime() > Date.now() ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-300">
                            <Clock className="w-3 h-3 text-violet-600" />
                            Scheduled
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : b.status === 'REVIEW'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {b.status === 'PUBLISHED' ? 'Live' : b.status === 'REVIEW' ? 'Review' : 'Draft'}
                        </span>
                      )}
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
                            className="h-8 text-xs font-semibold text-slate-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </Link>

                        {b.status === 'PUBLISHED' && (!b.publishedAt || new Date(b.publishedAt).getTime() <= Date.now()) && (
                          <Link href={`/blog/${b.slug}`} target="_blank">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Live
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
