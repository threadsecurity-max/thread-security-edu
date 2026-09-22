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
        body: JSON.stringify({ title: 'Untitled Cybersecurity Article' }),
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
    if (!confirm('Are you sure you want to delete this blog draft? This action cannot be undone.')) return;
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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C6FF34] uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            EDITORIAL PUBLISHING ENGINE
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Mentor Blog Directory</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Author, structure, and publish technical cybersecurity research to the public TSE blog platform.
          </p>
        </div>

        <Button
          onClick={handleCreateNewBlog}
          disabled={creating}
          className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-11 px-5 rounded-xl shadow-lg shadow-[#C6FF34]/10 shrink-0"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning Drive Workspace...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> + Create New Article
            </>
          )}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total Articles</span>
          <p className="text-2xl font-black font-mono text-white">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Live Published
          </span>
          <p className="text-2xl font-black font-mono text-emerald-400">{publishedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Working Drafts
          </span>
          <p className="text-2xl font-black font-mono text-amber-400">{draftCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-sky-500/20 space-y-1">
          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase flex items-center gap-1">
            <FolderCheck className="w-3 h-3" /> Under Review
          </span>
          <p className="text-2xl font-black font-mono text-sky-400">{reviewCount}</p>
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
            className="pl-9 bg-[#121212] border-white/10 text-white text-xs font-mono focus:border-[#C6FF34]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#121212] p-1 border border-white/10 rounded-xl w-full md:w-auto overflow-x-auto">
          {['ALL', 'DRAFT', 'REVIEW', 'PUBLISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                statusFilter === st ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs animate-pulse bg-[#0e0e0e] border border-white/10 rounded-2xl">
          Loading mentor publication dashboard...
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center bg-[#0e0e0e] border border-white/10 rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono">No Blogs Found</h3>
          <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
            You have no articles matching the criteria. Click "+ Create New Article" to launch the workspace.
          </p>
        </div>
      ) : (
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#141414] border-b border-white/10 text-slate-400 font-bold uppercase">
                  <th className="p-4">Article Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Read Time</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs truncate">
                      <Link href={`/mentor/blogs/${b.id}/edit`} className="hover:text-[#C6FF34] transition-colors">
                        {b.title}
                      </Link>
                      {b.subtitle && <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{b.subtitle}</p>}
                    </td>

                    <td className="p-4">
                      {b.category ? (
                        <Badge className="bg-white/10 text-slate-300 font-normal border-none text-[10px]">
                          {b.category.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'REVIEW'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">{b.readingTime ? `${b.readingTime} min read` : '1 min read'}</td>

                    <td className="p-4 text-slate-400 font-bold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      {b.viewCount || 0}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/mentor/blogs/${b.id}/edit`}>
                          <Button size="sm" variant="ghost" className="h-8 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10">
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </Link>

                        {b.status === 'PUBLISHED' && (
                          <Link href={`/blog/${b.slug}`} target="_blank">
                            <Button size="sm" variant="ghost" className="h-8 text-xs font-mono text-emerald-400 hover:bg-emerald-500/10">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </Link>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBlog(b.id)}
                          className="h-8 text-xs font-mono text-rose-400 hover:bg-rose-500/10"
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
