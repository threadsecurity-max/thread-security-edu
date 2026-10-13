'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploaderProps {
  blogId: string;
  currentCoverUrl?: string | null;
  onUploaded: (media: { id: string; url: string; altText?: string }) => void;
  onRemove?: () => void;
}

export function ImageUploader({ blogId, currentCoverUrl, onUploaded, onRemove }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setWarning(null);
    setUploadedSuccess(false);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    if (!altText) {
      setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    // Check dimensions using HTML Image object
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;

      // Recommended 1080 x 711 px (ratio ≈ 1.519)
      const targetRatio = 1080 / 711;
      const isRatioAccurate = Math.abs(ratio - targetRatio) < 0.15;

      if (!isRatioAccurate) {
        setWarning(`Image dimensions are ${width}×${height}px (Ratio: ${ratio.toFixed(2)}:1). Recommended standard is 1080×711px (1.52:1) for optimal hero display.`);
      } else {
        setWarning(null);
      }

      setPreviewUrl(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file && !previewUrl) {
      setError('Please select an image file first.');
      return;
    }

    if (!file && previewUrl) {
      // Image already uploaded
      return;
    }

    if (!altText.trim()) {
      setError('Alt Text is mandatory for accessibility & Google SEO indexation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('altText', altText);
      formData.append('caption', caption);
      formData.append('isCover', 'true');

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
        altText,
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

  const handleClear = () => {
    setPreviewUrl(null);
    setUploadedSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#C6FF34]" />
          FEATURED COVER IMAGE (RECOMMENDED 1080×711 PX)
        </h4>

        {previewUrl && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C6FF34]" /> CDN AUTO-OPTIMIZED
          </span>
        )}
      </div>

      {/* Preview Area */}
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-[1080/711] max-h-64 flex items-center justify-center group">
          <img src={previewUrl} alt={altText || 'Blog Cover Preview'} className="object-cover w-full h-full" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-[#C6FF34]/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white/5 flex flex-col items-center justify-center gap-3"
        >
          <div className="p-3 rounded-full bg-white/5 text-[#C6FF34]">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-white">Click to browse or drop cover image</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Recommended size: 1080 × 711 px (PNG, JPG, WebP, AVIF)</p>
          </div>
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
          <span>Cover image successfully uploaded to Cloudinary CDN with WebP/AVIF compression!</span>
        </div>
      )}

      {/* Mandatory Alt Text & Caption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-300">
            Alt Text <span className="text-rose-400">* Required for SEO & Accessibility</span>
          </label>
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. AI-powered threat detection architecture diagram"
            className="bg-[#181818] border-white/10 text-white text-xs focus:border-[#C6FF34]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Image Caption (Optional)</label>
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Figure 1.1: Neural network classification pipeline"
            className="bg-[#181818] border-white/10 text-white text-xs focus:border-[#C6FF34]"
          />
        </div>
      </div>

      {fileInputRef.current?.files?.[0] && !uploadedSuccess && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-10 rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizing & Uploading to Global CDN...
            </>
          ) : (
            'Confirm & Upload Cover Image'
          )}
        </Button>
      )}
    </div>
  );
}
