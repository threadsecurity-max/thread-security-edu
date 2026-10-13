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
  const [error, setError] = useState<string | null>(null);

  // Local Draft Auto-Recovery State
  const LOCAL_STORAGE_KEY = `tse_blog_draft_${blog.id}`;
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [localDraftTime, setLocalDraftTime] = useState<string | null>(null);

  // Check on mount for unsaved local device draft
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

  // Background auto-save to localStorage every 15 seconds
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
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Save changes callback
  const handleSave = useCallback(
    async (overrideStatus?: string) => {
      setSaving(true);
      setError(null);

      const targetStatus = overrideStatus || publishStatus;

      try {
        const res = await fetch(`/api/mentor/blogs/${blog.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            subtitle,
            excerpt,
            content,
            categoryId: categoryId || null,
            tagNames: tags,
            status: targetStatus,
            coverImageId,
            seo: {
              metaTitle,
              metaDescription,
              focusKeyword,
              canonicalUrl,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to save blog changes');
        }

        setBlog(data.blog);
        setPublishStatus(data.blog.status);
        setLastSaved(new Date().toLocaleTimeString());
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHasLocalDraft(false);
        } catch (e) {}
        setSaving(false);
        return true;
      } catch (err: any) {
        console.error('Error saving blog:', err);
        setError(err.message || 'Failed to save draft');
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
      coverImageId,
      metaTitle,
      metaDescription,
      focusKeyword,
      LOCAL_STORAGE_KEY,
    ]
  );

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Article Title is required before publishing.');
      return;
    }
    if (!content.trim()) {
      setError('Article Content cannot be empty.');
      return;
    }

    const success = await handleSave('PUBLISHED');
    if (success) {
      alert('Congratulations! Your blog article is now LIVE on the public TSE platform.');
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
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/mentor/blogs">
            <Button size="sm" variant="ghost" className="h-9 px-2 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#C6FF34]" /> EDITORIAL WORKSPACE
              </h1>
              <Badge
                className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                  publishStatus === 'PUBLISHED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : publishStatus === 'REVIEW'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {publishStatus === 'PUBLISHED' ? '● LIVE' : publishStatus === 'REVIEW' ? '● UNDER REVIEW' : '● DRAFT'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Slug: <code className="text-slate-300">/blog/{blog.slug}</code> {publishStatus === 'PUBLISHED' ? '(🔒 Locked)' : '(⚡ Auto-syncs)'} · {lastSaved ? `Saved ${lastSaved}` : 'Unsaved changes'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#121212] p-1 border border-white/10 rounded-xl">
            <button
              onClick={() => setPreviewTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                previewTab === 'editor' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Write & Format
            </button>
            <button
              onClick={() => setPreviewTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                previewTab === 'preview' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
            </button>
          </div>

          <Button
            onClick={() => handleSave('DRAFT')}
            disabled={saving}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 font-mono text-xs h-9"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Save Draft
          </Button>

          {publishStatus !== 'PUBLISHED' && (
            <Button
              onClick={() => handleSave('REVIEW')}
              disabled={saving}
              variant="outline"
              className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 font-mono text-xs h-9"
            >
              Submit for Review
            </Button>
          )}

          <Button
            onClick={handlePublish}
            disabled={saving}
            className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-[#C6FF34]/10 cursor-pointer"
          >
            {publishStatus === 'PUBLISHED' ? 'Update Live Article' : 'Publish to Platform'}
          </Button>

          {publishStatus === 'PUBLISHED' && (
            <Link href={`/blog/${blog.slug}`} target="_blank">
              <Button size="sm" variant="ghost" className="h-9 text-xs font-mono text-emerald-400">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

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

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
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
