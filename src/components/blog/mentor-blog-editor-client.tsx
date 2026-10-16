'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Globe,
  Loader2,
  FolderCheck,
  AlertCircle,
  Tag as TagIcon,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Info,
  Clock,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BlogEditor } from '@/components/blog/editor/BlogEditor';
import { SEOPanel } from '@/components/blog/editor/SEOPanel';
import { ImageUploader } from '@/components/blog/editor/ImageUploader';
import { BlogCoverImage } from '@/components/blog/BlogCoverImage';
import { getBlogCoverImageUrl } from '@/lib/blog/coverImageHelper';
import { AuthorCredentialsCard } from '@/components/blog/editor/AuthorCredentialsCard';

function FieldHelp({
  title,
  purpose,
  example,
  tip,
}: {
  title: string;
  purpose: string;
  example: string;
  tip?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-400 hover:text-[#C6FF34] hover:bg-[#C6FF34]/10 transition-colors focus:outline-none"
          aria-label={`Guidance for ${title}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        className="max-w-sm p-3.5 bg-[#121214] border border-white/15 text-slate-200 shadow-2xl rounded-xl space-y-2 text-xs"
      >
        <div className="flex items-center gap-1.5 font-bold border-b border-white/10 pb-1.5 font-mono text-[11px] uppercase tracking-wider text-[#C6FF34]">
          <Lightbulb className="w-3.5 h-3.5 text-[#C6FF34]" />
          {title} Guide
        </div>
        <p className="text-slate-300 leading-snug">{purpose}</p>
        <div className="bg-black/60 border border-white/10 rounded-lg p-2 font-mono text-[10px] text-slate-300">
          <span className="text-slate-500 block uppercase font-bold text-[9px] mb-0.5">Example:</span>
          &ldquo;{example}&rdquo;
        </div>
        {tip && (
          <p className="text-[10px] text-[#C6FF34] font-medium flex items-start gap-1 leading-tight pt-0.5">
            <span>💡</span>
            <span>{tip}</span>
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface MentorBlogEditorClientProps {
  initialBlog: any;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export function MentorBlogEditorClient({ initialBlog, user }: MentorBlogEditorClientProps) {
  const router = useRouter();
  const [blog, setBlog] = useState(initialBlog);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState(initialBlog.title || '');
  const [subtitle, setSubtitle] = useState(initialBlog.subtitle || '');
  const [excerpt, setExcerpt] = useState(initialBlog.excerpt || '');
  const [content, setContent] = useState(initialBlog.content || '');
  const [categoryId, setCategoryId] = useState(initialBlog.categoryId || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    initialBlog.tags ? initialBlog.tags.map((t: any) => t.name) : []
  );

  // SEO State
  const [metaTitle, setMetaTitle] = useState(initialBlog.seo?.metaTitle || initialBlog.title || '');
  const [metaDescription, setMetaDescription] = useState(
    initialBlog.seo?.metaDescription || initialBlog.subtitle || ''
  );
  const [focusKeyword, setFocusKeyword] = useState(initialBlog.seo?.focusKeyword || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialBlog.seo?.canonicalUrl || '');

  // UI State
  const initialCover = getBlogCoverImageUrl(initialBlog);
  const [coverImageId, setCoverImageId] = useState<string | null>(initialBlog.coverImageId || null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialCover);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview'>('editor');
  const [publishStatus, setPublishStatus] = useState(initialBlog.status || 'DRAFT');
  const [publishedAt, setPublishedAt] = useState<string | null>(
    initialBlog.publishedAt ? new Date(initialBlog.publishedAt).toISOString() : null
  );
  const [error, setError] = useState<string | null>(null);

  // Scheduler State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>(() => {
    if (initialBlog.publishedAt && new Date(initialBlog.publishedAt).getTime() > Date.now()) {
      return 'scheduled';
    }
    return 'immediate';
  });
  const [scheduleInput, setScheduleInput] = useState<string>(() => {
    if (initialBlog.publishedAt && new Date(initialBlog.publishedAt).getTime() > Date.now()) {
      const dt = new Date(initialBlog.publishedAt);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    }
    // Default to tomorrow 9:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  });

  const isScheduled =
    publishStatus === 'PUBLISHED' &&
    !!publishedAt &&
    new Date(publishedAt).getTime() > Date.now();

  const getCountdownLabel = (dateStr: string | null) => {
    if (!dateStr) return '';
    const diffMs = new Date(dateStr).getTime() - Date.now();
    if (diffMs <= 0) return 'Live now';
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return `In ${parts.join(' ')}`;
  };

  // Local Draft Auto-Recovery State
  const LOCAL_STORAGE_KEY = `tse_blog_draft_${blog.id}`;
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [localDraftTime, setLocalDraftTime] = useState<string | null>(null);

  // Check on mount for unsaved local device draft safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && parsed.content && parsed.content !== initialBlog.content) {
          setHasLocalDraft(true);
          setLocalDraftTime(new Date(parsed.timestamp).toLocaleTimeString());
        }
      }
    } catch (e) {
      console.warn('Local draft inspection failed:', e);
    }
  }, [blog.id, initialBlog.content, LOCAL_STORAGE_KEY]);

  // Background auto-save to localStorage every 15 seconds safely
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        if (title || content) {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({
              title,
              subtitle,
              excerpt,
              content,
              categoryId,
              tags,
              timestamp: Date.now(),
            })
          );
        }
      } catch (e) {}
    }, 15000);
    return () => clearInterval(timer);
  }, [title, subtitle, excerpt, content, categoryId, tags, LOCAL_STORAGE_KEY]);

  const restoreLocalDraft = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (parsed.excerpt) setExcerpt(parsed.excerpt);
        if (parsed.content) setContent(parsed.content);
        if (parsed.categoryId) setCategoryId(parsed.categoryId);
        if (parsed.tags) setTags(parsed.tags);
        setHasLocalDraft(false);
      }
    } catch (e) {
      console.error('Failed to restore local draft:', e);
    }
  };

  const dismissLocalDraft = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setHasLocalDraft(false);
    } catch (e) {}
  };

  // Fetch Categories
  useEffect(() => {
    fetch('/api/blogs/categories')
      .then(async (res) => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Safe Save changes callback (Robust against non-JSON and payload truncations)
  const handleSave = useCallback(
    async (overrideStatus?: string, customPublishedAt?: string | null) => {
      setSaving(true);
      setError(null);

      const targetStatus = overrideStatus || publishStatus;
      const targetPublishedAt =
        customPublishedAt !== undefined
          ? customPublishedAt
          : targetStatus === 'PUBLISHED' && !publishedAt
          ? new Date().toISOString()
          : publishedAt;

      try {
        const res = await fetch(`/api/mentor/blogs/${blog.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            subtitle: subtitle.trim(),
            excerpt: excerpt.trim(),
            content,
            categoryId: categoryId || null,
            tagNames: tags,
            status: targetStatus,
            publishedAt: targetPublishedAt,
            coverImageId,
            seo: {
              metaTitle: metaTitle.trim(),
              metaDescription: metaDescription.trim(),
              focusKeyword: focusKeyword.trim(),
              canonicalUrl: canonicalUrl.trim(),
            },
          }),
        });

        const rawText = await res.text();
        let data: any = {};
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch (parseErr) {
          console.error('Non-JSON server response:', rawText);
          throw new Error(
            res.ok
              ? 'Server returned non-JSON response.'
              : `Server error (${res.status}): ${rawText.slice(0, 160) || 'Unknown server response'}`
          );
        }

        if (!res.ok) {
          throw new Error(data.error || `Failed to save blog changes (HTTP ${res.status})`);
        }

        setBlog(data.blog);
        setPublishStatus(data.blog.status);
        if (data.blog.publishedAt) {
          setPublishedAt(new Date(data.blog.publishedAt).toISOString());
        } else {
          setPublishedAt(null);
        }
        setLastSaved(new Date().toLocaleTimeString());
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHasLocalDraft(false);
        } catch (e) {}
        setSaving(false);
        return true;
      } catch (err: any) {
        console.error('Error saving blog:', err);
        setError(err.message || 'Failed to save draft. Please check server logs.');
        setSaving(false);
        return false;
      }
    },
    [
      blog.id,
      title,
      subtitle,
      excerpt,
      content,
      categoryId,
      tags,
      publishStatus,
      publishedAt,
      coverImageId,
      metaTitle,
      metaDescription,
      focusKeyword,
      canonicalUrl,
      LOCAL_STORAGE_KEY,
    ]
  );

  const handleOpenScheduleModal = () => {
    setError(null);
    setScheduleModalOpen(true);
  };

  const handleConfirmPublishOrSchedule = async () => {
    if (!title.trim()) {
      setError('Article Title is required before publishing or scheduling.');
      setScheduleModalOpen(false);
      return;
    }
    if (!content.trim()) {
      setError('Article Content cannot be empty.');
      setScheduleModalOpen(false);
      return;
    }

    let targetDate: string | null = null;
    if (scheduleType === 'scheduled') {
      if (!scheduleInput) {
        setError('Please choose a valid release date and time.');
        return;
      }
      const selected = new Date(scheduleInput);
      if (isNaN(selected.getTime())) {
        setError('Invalid date and time selected.');
        return;
      }
      if (selected.getTime() <= Date.now()) {
        setError('Scheduled date and time must be in the future.');
        return;
      }
      targetDate = selected.toISOString();
    } else {
      targetDate = new Date().toISOString();
    }

    const success = await handleSave('PUBLISHED', targetDate);
    if (success) {
      setScheduleModalOpen(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <TooltipProvider delayDuration={100}>
      {/* High-Contrast, Professional Dark Studio Canvas */}
      <div className="rounded-2xl md:rounded-3xl bg-[#0c0c0e] border border-white/15 p-5 md:p-8 space-y-6 shadow-2xl text-slate-100 max-w-7xl mx-auto font-sans">
        {/* Top Header Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/15">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/mentor/blogs">
              <Button
                size="sm"
                variant="ghost"
                className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Studio
              </Button>
            </Link>
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg md:text-xl font-bold font-mono text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#C6FF34]" /> BLOG STUDIO WORKSPACE
                </h1>
                <Badge
                  className={`font-mono text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 ${
                    isScheduled
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : publishStatus === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : publishStatus === 'REVIEW'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isScheduled
                    ? `⏰ SCHEDULED (${getCountdownLabel(publishedAt)})`
                    : publishStatus === 'PUBLISHED'
                    ? '● LIVE ARTICLE'
                    : publishStatus === 'REVIEW'
                    ? '● UNDER REVIEW'
                    : '● WORKING DRAFT'}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  URL: <code className="bg-black/80 text-[#C6FF34] px-2 py-0.5 rounded border border-white/15">/blog/{blog.slug}</code>
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  {lastSaved ? `Auto-saved at ${lastSaved}` : 'Unsaved modifications'}
                </span>
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-black/60 p-1 border border-white/15 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewTab('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  previewTab === 'editor'
                    ? 'bg-[#C6FF34] text-black shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Write & Format
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  previewTab === 'preview'
                    ? 'bg-[#C6FF34] text-black shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
              </button>
            </div>

            {/* Save Draft */}
            <Button
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 font-mono text-xs h-9 px-3.5 rounded-xl cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save Draft
            </Button>

            {/* Submit for Review */}
            {publishStatus !== 'PUBLISHED' && (
              <Button
                onClick={() => handleSave('REVIEW')}
                disabled={saving}
                variant="outline"
                className="bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border-sky-500/40 font-mono text-xs h-9 px-3.5 rounded-xl cursor-pointer"
              >
                Submit for Review
              </Button>
            )}

            {/* Schedule & Publish Primary Action */}
            <Button
              onClick={handleOpenScheduleModal}
              disabled={saving}
              className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-black text-xs h-9 px-4 rounded-xl shadow-lg shadow-[#C6FF34]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              {isScheduled
                ? 'Manage Schedule ⏰'
                : publishStatus === 'PUBLISHED'
                ? 'Update Live / Schedule'
                : 'Publish / Schedule'}
            </Button>

            {publishStatus === 'PUBLISHED' && !isScheduled && (
              <Link href={`/blog/${blog.slug}`} target="_blank">
                <Button size="sm" variant="ghost" className="h-9 px-2 text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 rounded-xl" title="Open Live Blog Page">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Scheduled Release Active Banner */}
        {isScheduled && (
          <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/40 text-violet-100 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-violet-300 shrink-0 animate-pulse" />
              <div>
                <strong className="text-white">Scheduled Automated Release:</strong> This article is programmed to go live on{' '}
                <span className="text-[#C6FF34] font-bold">
                  {new Date(publishedAt!).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>{' '}
                ({getCountdownLabel(publishedAt)}). It will automatically become accessible to the public and Google crawlers at that precise moment.
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleSave('PUBLISHED', new Date().toISOString())}
                className="h-7 bg-[#C6FF34] text-black hover:bg-[#b2eb2a] text-xs font-bold font-mono rounded-lg cursor-pointer"
              >
                Go Live Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleOpenScheduleModal}
                className="h-7 text-violet-300 hover:text-white text-xs font-mono rounded-lg border border-violet-500/30"
              >
                Change Time
              </Button>
            </div>
          </div>
        )}

        {/* Local Auto-Recovery Alert Banner */}
        {hasLocalDraft && (
          <div className="p-3.5 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-white text-xs font-mono flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6FF34] shrink-0" />
              <span>
                ⚡ <strong className="text-[#C6FF34]">Local Auto-Recovery Available:</strong> We detected an unsaved local device draft from <span className="underline">{localDraftTime}</span>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={restoreLocalDraft} className="h-7 bg-[#C6FF34] text-black hover:bg-[#b2eb2a] text-xs font-bold font-mono">
                Restore Draft
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissLocalDraft} className="h-7 text-slate-400 hover:text-white text-xs font-mono">
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Editorial Review Pending Banner */}
        {publishStatus === 'REVIEW' && (
          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/40 text-white text-xs font-mono flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
              <span>
                📋 <strong className="text-sky-400">Submitted for Editorial Review:</strong> This article is in the Faculty Admin Review Queue. An administrator will review your technical depth, verify SEO tags, and publish it to the live platform.
              </span>
            </div>
            <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider shrink-0 bg-sky-500/20 px-2.5 py-1 rounded-md border border-sky-500/30">
              PENDING ADMIN SIGNOFF
            </span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Interactive Publication & Scheduler Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#121216] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-slate-100 font-sans animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <Clock className="w-4 h-4 text-[#C6FF34]" /> PUBLICATION & SCHEDULER ENGINE
                  </h3>
                  <p className="text-xs text-slate-400">
                    Release your technical research guide immediately or schedule automated publishing for a precise date and time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Release Mode Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div
                  onClick={() => setScheduleType('immediate')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    scheduleType === 'immediate'
                      ? 'bg-[#C6FF34]/15 border-[#C6FF34] text-white shadow-md shadow-[#C6FF34]/10'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">🚀 Publish Now</span>
                    {scheduleType === 'immediate' && (
                      <Check className="w-4 h-4 text-[#C6FF34]" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Make article live immediately on the public blog index and search engines.
                  </p>
                </div>

                <div
                  onClick={() => setScheduleType('scheduled')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    scheduleType === 'scheduled'
                      ? 'bg-violet-500/20 border-violet-400 text-white shadow-md shadow-violet-500/10'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">⏰ Schedule Release</span>
                    {scheduleType === 'scheduled' && (
                      <Check className="w-4 h-4 text-violet-400" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Hold release until designated exact date and hour.
                  </p>
                </div>
              </div>

              {/* Precise Date & Time Picker */}
              {scheduleType === 'scheduled' && (
                <div className="p-4 rounded-xl bg-black/60 border border-violet-500/30 space-y-3 font-mono text-xs">
                  <label className="text-[11px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> SELECT PRECISE DATE & TIME (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleInput}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduleInput(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#1a1a20] border border-white/20 text-white font-mono text-xs focus:border-violet-400 focus:outline-none"
                  />

                  {scheduleInput && !isNaN(new Date(scheduleInput).getTime()) && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="text-[11px] text-slate-300 flex items-center justify-between">
                        <span>Countdown Counter:</span>
                        <span className="text-[#C6FF34] font-bold font-mono">
                          {getCountdownLabel(new Date(scheduleInput).toISOString())}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Scheduled for: <strong className="text-white">{new Date(scheduleInput).toLocaleString()}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmPublishOrSchedule}
                  disabled={saving}
                  className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-lg shadow-[#C6FF34]/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                    </>
                  ) : scheduleType === 'scheduled' ? (
                    'Confirm & Schedule Article ⏰'
                  ) : (
                    'Publish Live to Platform 🚀'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace split into Editor vs Preview */}
      {previewTab === 'preview' ? (
        <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto space-y-6 text-white shadow-2xl">
          <div className="space-y-2 text-center pb-6 border-b border-white/10">
            <Badge className="bg-[#C6FF34] text-black font-mono font-bold uppercase">
              {categories.find((c) => c.id === categoryId)?.name || 'General Cybersecurity'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold">{title || 'Untitled Blog Title'}</h1>
            <p className="text-base text-slate-300 font-serif italic max-w-2xl mx-auto">{subtitle}</p>
            <div className="flex items-center justify-center gap-3 pt-3 text-xs font-mono text-slate-400">
              <span>By {user.name}</span>
              <span>·</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <BlogCoverImage
            blog={{
              ...blog,
              title,
              coverImageId,
              media: coverImageUrl ? [{ id: coverImageId, url: coverImageUrl }] : blog.media,
            }}
            priority
            className="my-4 shadow-2xl"
          />

          <div
            className="tiptap prose prose-invert max-w-none text-slate-200 leading-relaxed text-base"
            dangerouslySetInnerHTML={{ __html: content || '<p>No content written yet...</p>' }}
          />

          {tags.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-2 font-mono">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ARTICLE TOPICS / TAGS</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t} className="bg-white/5 border border-white/10 text-slate-300 font-normal">
                    #{t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Writing Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Subtitle Inputs */}
            <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              {/* Blog Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    BLOG TITLE <span className="text-[#C6FF34]">*</span>
                    <FieldHelp
                      title="Article Title"
                      purpose="The primary headline for your research paper, technical writeup, or tutorial. Must be compelling, clear, and between 40-60 characters."
                      example="AI-Powered Threat Detection in Modern Security Operations Centers (SOC)"
                      tip="Place your main keyword near the beginning for maximum Google SERP impact."
                    />
                  </label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      title.length >= 35 && title.length <= 65
                        ? 'bg-[#C6FF34]/15 text-[#C6FF34] font-bold'
                        : title.length > 65
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {title.length}/60 chars {title.length >= 35 && title.length <= 65 ? '✓ Optimal' : ''}
                  </span>
                </div>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!metaTitle) setMetaTitle(e.target.value);
                  }}
                  placeholder="e.g. AI-Powered Threat Detection for Modern SOCs"
                  className="bg-[#141414] border-white/10 text-white font-extrabold text-lg md:text-xl h-12 focus:border-[#C6FF34] focus:ring-1 focus:ring-[#C6FF34]/30"
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  Keep concise and front-load your core cybersecurity focus keyword for Google rankability.
                </p>
              </div>

              {/* Subtitle / Standfirst */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    SUBTITLE / STANDFIRST <span className="text-[#C6FF34]">*</span>
                    <FieldHelp
                      title="Subtitle / Standfirst"
                      purpose="A high-level secondary thesis (1-2 sentences) directly below the title. Expands on the problem statement or core innovation."
                      example="How neural network telemetry reduces SIEM alert fatigue by 74% in enterprise Kubernetes clusters."
                      tip="Acts as the hook that converts search visitors into engaged learners."
                    />
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {subtitle.length}/120 chars
                  </span>
                </div>
                <Input
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    if (!metaDescription) setMetaDescription(e.target.value);
                  }}
                  placeholder="A brief editorial subtitle describing the core thesis of your research..."
                  className="bg-[#141414] border-white/10 text-slate-200 text-xs h-10 focus:border-[#C6FF34] focus:ring-1 focus:ring-[#C6FF34]/30"
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  Secondary thesis sentence appearing below the headline and on social previews.
                </p>
              </div>

              {/* Short Excerpt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    SHORT EXCERPT (CARD SUMMARY)
                    <FieldHelp
                      title="Short Excerpt"
                      purpose="The snippet displayed on public blog listing cards, search engine previews, and social media links. Should summarize the entire post concisely."
                      example="A practical benchmark comparing LLM-driven incident response against traditional rule-based SIEM detection engines."
                      tip="Keep under 160 characters so Google and mobile cards don't truncate it."
                    />
                  </label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      excerpt.length >= 80 && excerpt.length <= 160
                        ? 'bg-[#C6FF34]/15 text-[#C6FF34] font-bold'
                        : excerpt.length > 160
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {excerpt.length}/160 chars {excerpt.length >= 80 && excerpt.length <= 160 ? '✓ Snippet Ready' : ''}
                  </span>
                </div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Summary shown on the public blog listing cards..."
                  className="w-full p-3 rounded-lg bg-[#141414] border border-white/10 text-white focus:border-[#C6FF34] focus:ring-1 focus:ring-[#C6FF34]/30 focus:outline-none text-xs font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  Shown on public blog listing cards, student dashboard feeds, and Google description meta tag.
                </p>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  ARTICLE STRUCTURED CONTENT (TIPTAP EDITOR)
                  <FieldHelp
                    title="Structured Article Body & Headings Hierarchy"
                    purpose="Your complete technical article or tutorial. Use H1 for main chapters, H2 for key subtopics, and H3 for specific steps or lists to create an automatic Google-crawled Table of Contents."
                    example="Introduction -> Threat Landscape (H1) -> Attack Vectors (H2) -> Step 1: Ingestion (H3)"
                    tip="All H1, H2, and H3 headers are automatically styled with accent lines and assigned anchor IDs for Google Sitelinks."
                  />
                </label>
                <span className="text-[9px] font-mono text-[#C6FF34] bg-[#C6FF34]/10 border border-[#C6FF34]/20 px-2 py-0.5 rounded font-bold">
                  H1, H2, H3 Sitelinks Anchored
                </span>
              </div>
              <BlogEditor content={content} onChange={setContent} blogId={blog.id} />
            </div>

            {/* Featured Image Component */}
            <ImageUploader
              blogId={blog.id}
              currentCoverUrl={coverImageUrl}
              onUploaded={(media) => {
                setCoverImageId(media.id);
                setCoverImageUrl(media.url);
              }}
              onRemove={() => {
                setCoverImageId(null);
                setCoverImageUrl(null);
              }}
            />
          </div>

          {/* Right Sidebar: Categories, Tags, Cloudinary CDN Status, SEO Panel (1 Col) */}
          <div className="space-y-6">
            {/* Cloudinary CDN Media Layer Status Box */}
            <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-2 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#C6FF34] font-bold uppercase flex items-center gap-1">
                  <FolderCheck className="w-3.5 h-3.5" /> CLOUDINARY CDN MEDIA ENGINE
                </span>
                <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] text-[9px] border border-[#C6FF34]/30 font-bold">
                  ACTIVE & OPTIMIZED
                </Badge>
              </div>
              <p className="text-[11px] text-slate-300">
                Cloud: <code className="bg-white/10 px-1 py-0.5 rounded text-white font-bold">qliovzms</code> · WebP/AVIF Auto-Delivery
              </p>
              <p className="text-[10px] text-slate-400">
                Article images and cover assets are hosted via high-speed global CDN with perceptual compression.
              </p>
            </div>

            {/* Category & Tags Selector */}
            <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 font-mono text-xs shadow-xl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                  PRIMARY CATEGORY *
                  <FieldHelp
                    title="Primary Academic / Research Category"
                    purpose="Assigns your publication to an official TSE topic hub (e.g., SOC Operations, Cloud Security, Threat Intelligence) for targeted student navigation."
                    example="Cloud Security, Threat Intelligence, Penetration Testing"
                    tip="Helps Google group related articles under category clusters."
                  />
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#181818] border border-white/10 text-white focus:border-[#C6FF34] focus:outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5 text-[#C6FF34]" /> TOPICS / TAGS
                  <FieldHelp
                    title="Article Topics & Keywords"
                    purpose="Granular technical keywords that connect this publication to related articles, research tracks, and course prerequisites across TSE."
                    example="ZeroTrust, SIEM, Mitre-ATT&CK, Python, EDR"
                    tip="Add 3 to 6 targeted technical tags for optimal internal linking equity."
                  />
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="e.g. SOC, AI, ZeroTrust"
                    className="bg-[#181818] border-white/10 text-white text-xs"
                  />
                  <Button type="button" onClick={handleAddTag} size="sm" className="bg-white/10 text-white hover:bg-white/20">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5"
                    >
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-500 hover:text-rose-400">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Profile & Social Credentials Card */}
            <AuthorCredentialsCard />

            {/* Real-time SEO Scoring Panel */}
            <SEOPanel
              title={title}
              subtitle={subtitle}
              content={content}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              focusKeyword={focusKeyword}
              canonicalUrl={canonicalUrl}
              coverImageId={coverImageId}
              onUpdateSEO={(seoData) => {
                setMetaTitle(seoData.metaTitle);
                setMetaDescription(seoData.metaDescription);
                setFocusKeyword(seoData.focusKeyword);
                if (seoData.canonicalUrl !== undefined) {
                  setCanonicalUrl(seoData.canonicalUrl);
                }
              }}
            />
          </div>
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}
