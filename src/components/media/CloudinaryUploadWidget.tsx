'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
  defaultUrl?: string;
}

export const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({
  onUploadSuccess,
  folder = 'course-thumbnails',
  label = 'Upload Media Asset (Cloudinary)',
  accept = 'image/*',
  defaultUrl = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultUrl);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(Boolean(defaultUrl));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setPreviewUrl(data.url);
      setIsSuccess(true);
      onUploadSuccess(data.url, data.publicId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload media asset to Cloudinary.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    setIsSuccess(false);
    onUploadSuccess('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-300">
        {label}
      </label>

      {errorMsg && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {accept.includes('image') ? (
              <img
                src={previewUrl}
                alt="Uploaded asset preview"
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700 bg-zinc-950 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
            <div className="truncate text-xs">
              <span className="font-semibold text-white block truncate">{previewUrl}</span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Cloudinary Asset Ready
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0"
            title="Remove media asset"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="relative flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-emerald-500/50 transition cursor-pointer group p-4 text-center">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={loading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          {loading ? (
            <div className="flex flex-col items-center gap-2 text-emerald-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Uploading to Cloudinary CDN...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop
              </div>
              <p className="text-[10px] text-zinc-500">
                PNG, JPG, WEBP, SVG or PDF (Cloudinary Auto-Format)
              </p>
            </div>
          )}
        </label>
      )}
    </div>
  );
};
