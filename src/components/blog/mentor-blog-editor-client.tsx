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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BlogEditor } from '@/components/blog/editor/BlogEditor';
import { SEOPanel } from '@/components/blog/editor/SEOPanel';
import { ImageUploader } from '@/components/blog/editor/ImageUploader';

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

  // UI State
  const [coverImageId, setCoverImageId] = useState<string | null>(initialBlog.coverImageId || null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview'>('editor');
  const [publishStatus, setPublishStatus] = useState(initialBlog.status || 'DRAFT');
  const [error, setError] = useState<string | null>(null);

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
            <h1 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C6FF34]" /> EDITORIAL WORKSPACE
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Blog ID: {blog.id} · {lastSaved ? `Autosaved at ${lastSaved}` : 'Unsaved changes'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
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
            onClick={() => handleSave()}
            disabled={saving}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 font-mono text-xs h-9"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Save Draft
          </Button>

          <Button
            onClick={handlePublish}
            disabled={saving}
            className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-[#C6FF34]/10"
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

          {coverImageUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[1080/711]">
              <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-base"
            dangerouslySetInnerHTML={{ __html: content || '<p>No content written yet...</p>' }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Writing Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Subtitle Inputs */}
            <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  BLOG TITLE *
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!metaTitle) setMetaTitle(e.target.value);
                  }}
                  placeholder="e.g. AI-Powered Threat Detection for Modern SOCs"
                  className="bg-[#141414] border-white/10 text-white font-extrabold text-lg md:text-xl h-12 focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  SUBTITLE / STANDFIRST *
                </label>
                <Input
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    if (!metaDescription) setMetaDescription(e.target.value);
                  }}
                  placeholder="A brief editorial subtitle describing the core thesis of your research..."
                  className="bg-[#141414] border-white/10 text-slate-200 text-xs h-10 focus:border-[#C6FF34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  SHORT EXCERPT (CARD SUMMARY)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Summary shown on the public blog listing cards..."
                  className="w-full p-3 rounded-lg bg-[#141414] border border-white/10 text-white focus:border-[#C6FF34] focus:outline-none text-xs font-mono"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                ARTICLE STRUCTURED CONTENT (TIPTAP EDITOR)
              </label>
              <BlogEditor content={content} onChange={setContent} />
            </div>

            {/* Featured Image Component */}
            <ImageUploader
              blogId={blog.id}
              currentCoverUrl={coverImageUrl}
              onUploaded={(media) => {
                setCoverImageId(media.id);
                setCoverImageUrl(media.url);
              }}
            />
          </div>

          {/* Right Sidebar: Categories, Tags, Google Drive Status, SEO Panel (1 Col) */}
          <div className="space-y-6">
            {/* Google Drive Status Box */}
            <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#C6FF34] font-bold uppercase flex items-center gap-1">
                  <FolderCheck className="w-3.5 h-3.5" /> GOOGLE DRIVE MEDIA LAYER
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] border border-emerald-500/30 font-bold">
                  PROVISIONED
                </Badge>
              </div>
              <p className="text-[11px] text-slate-300">
                Folder ID: <code className="bg-white/10 px-1 py-0.5 rounded text-white">{blog.driveFolderId || 'Local-Only'}</code>
              </p>
              <p className="text-[10px] text-slate-400">
                Uploaded article images will be mirrored directly to your associated Google Drive media folder.
              </p>
            </div>

            {/* Category & Tags Selector */}
            <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 font-mono text-xs shadow-xl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-300">PRIMARY CATEGORY *</label>
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
                <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1">
                  <TagIcon className="w-3.5 h-3.5 text-[#C6FF34]" /> TOPICS / TAGS
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

            {/* Real-time SEO Scoring Panel */}
            <SEOPanel
              title={title}
              subtitle={subtitle}
              content={content}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              focusKeyword={focusKeyword}
              coverImageId={coverImageId}
              onUpdateSEO={(seoData) => {
                setMetaTitle(seoData.metaTitle);
                setMetaDescription(seoData.metaDescription);
                setFocusKeyword(seoData.focusKeyword);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
