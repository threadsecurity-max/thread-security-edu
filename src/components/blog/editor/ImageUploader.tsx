'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  Link2,
  Grid,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CYBERSECURITY_COVER_PRESETS } from '@/lib/blog/coverImageHelper';

interface ImageUploaderProps {
  blogId: string;
  currentCoverUrl?: string | null;
  onUploaded: (media: { id: string; url: string; altText?: string }) => void;
  onRemove?: () => void;
}

export function ImageUploader({
  blogId,
  currentCoverUrl,
  onUploaded,
  onRemove,
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [loading, setLoading] = useState(false);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl || null);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentCoverUrl) {
      setPreviewUrl(currentCoverUrl);
    }
  }, [currentCoverUrl]);

  // Execute upload via FormData
  const executeUpload = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      formData.append('isCover', 'true');
      if (altText) formData.append('altText', altText);
      if (caption) formData.append('caption', caption);

      const res = await fetch(`/api/mentor/blogs/${blogId}/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload cover image.');
      }

      onUploaded({
        id: data.media.id,
        url: data.media.url,
        altText: data.media.altText || altText,
      });

      setPreviewUrl(data.media.url);
      setUploadedSuccess(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image to CDN.');
      setLoading(false);
    }
  };

  // Immediate upload when a file is selected
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    const calculatedAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!altText) setAltText(calculatedAlt);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', altText || calculatedAlt);

    await executeUpload(formData);
  };

  // Upload via direct URL
  const handleUrlSubmit = async () => {
    if (!directUrlInput.trim()) {
      setError('Please enter a valid image URL.');
      return;
    }

    const formData = new FormData();
    formData.append('imageUrl', directUrlInput.trim());
    formData.append('altText', altText || 'Cybersecurity Research Cover');

    await executeUpload(formData);
    setDirectUrlInput('');
  };

  // Select a preset cover
  const handleSelectPreset = async (preset: (typeof CYBERSECURITY_COVER_PRESETS)[0]) => {
    setAltText(preset.altText);
    const formData = new FormData();
    formData.append('imageUrl', preset.url);
    formData.append('altText', preset.altText);

    await executeUpload(formData);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setUploadedSuccess(false);
    setError(null);
    setWarning(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 text-white space-y-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C6FF34]" />
            FEATURED COVER IMAGE (1080 × 711 PX STANDARD)
          </h4>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Shown on public research cards, Google Sitelinks, and social share previews.
          </p>
        </div>

        {previewUrl && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3 h-3 text-[#C6FF34]" /> ACTIVE CDN ASSET
          </span>
        )}
      </div>

      {/* Preview Area if image is selected or uploaded */}
      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[1080/711] max-h-80 flex items-center justify-center group shadow-2xl">
            <img
              src={previewUrl}
              alt={altText || 'Blog Cover Preview'}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black hover:bg-slate-200 font-mono text-xs font-bold"
              >
                Replace Image
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleClear}
                className="font-mono text-xs"
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
            <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-[#C6FF34] font-bold">
              1080 × 711 ASPECT RATIO
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CDN delivery: WebP/AVIF auto-compressed</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-rose-400 hover:underline text-[11px]"
            >
              Remove Cover
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 border border-white/10 rounded-xl font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'presets'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Cyber Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> Image URL
            </button>
          </div>

          {/* Tab 1: File Dropzone */}
          {activeTab === 'upload' && (
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-white/15 hover:border-[#C6FF34]/50 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white/5 flex flex-col items-center justify-center gap-3 ${
                loading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="p-3.5 rounded-2xl bg-white/5 text-[#C6FF34] border border-white/10 shadow-lg">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#C6FF34]" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white">
                  {loading ? 'Optimizing & Uploading to Cloudinary CDN...' : 'Click to select or drop cover image'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Standard format: 1080 × 711 px (PNG, JPG, WebP, AVIF)
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Cyber Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-2 font-mono">
              <p className="text-[11px] text-slate-400">
                Select a high-resolution 1080×711 cybersecurity banner:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CYBERSECURITY_COVER_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-[#C6FF34] cursor-pointer aspect-[1080/711] bg-black transition-all shadow-md"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-bold text-white leading-tight">
                        {p.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Direct URL */}
          {activeTab === 'url' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center gap-2">
                <Input
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  className="bg-[#141414] border-white/10 text-white text-xs h-10"
                />
                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={loading || !directUrlInput.trim()}
                  className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] text-xs font-bold h-10 px-4"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Cover'}
                </Button>
              </div>
              <p className="text-[10px] text-slate-400">
                The image will be cached and delivered through high-speed CDN.
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Warnings & Errors */}
      {warning && (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{warning}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {uploadedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C6FF34]" />
          <span>Cover image verified and linked to Cloudinary CDN!</span>
        </div>
      )}

      {/* Mandatory Alt Text & Caption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-300">
            Alt Text <span className="text-rose-400">* Required for SEO</span>
          </label>
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Perimeter gateway zero-day exploit diagram"
            className="bg-[#141414] border-white/10 text-white text-xs focus:border-[#C6FF34]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
            Image Caption (Optional)
          </label>
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Source: CVE-2024 Telemetry Analysis"
            className="bg-[#141414] border-white/10 text-white text-xs focus:border-[#C6FF34]"
          />
        </div>
      </div>
    </div>
  );
}
