'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shield, Terminal, Cpu, Lock, Sparkles } from 'lucide-react';
import { getBlogCoverImageUrl, getBlogCoverImageAlt } from '@/lib/blog/coverImageHelper';

interface BlogCoverImageProps {
  blog: any;
  priority?: boolean;
  className?: string;
  sizes?: string;
  hoverZoom?: boolean;
}

export function BlogCoverImage({
  blog,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  hoverZoom = true,
}: BlogCoverImageProps) {
  const imageUrl = getBlogCoverImageUrl(blog);
  const altText = getBlogCoverImageAlt(blog);
  const [hasError, setHasError] = useState(false);

  const categoryName = blog?.category?.name || 'CYBERSECURITY';

  // Determine icon based on category
  const renderCategoryIcon = () => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('intel') || cat.includes('zero') || cat.includes('malware')) {
      return <Shield className="w-8 h-8 text-[#C6FF34]" />;
    }
    if (cat.includes('hack') || cat.includes('pen') || cat.includes('exploit')) {
      return <Terminal className="w-8 h-8 text-rose-400" />;
    }
    if (cat.includes('ai') || cat.includes('data')) {
      return <Cpu className="w-8 h-8 text-sky-400" />;
    }
    return <Lock className="w-8 h-8 text-purple-400" />;
  };

  if (imageUrl && !hasError) {
    return (
      <div className={`w-full relative overflow-hidden aspect-[1080/711] bg-[#0a0a0a] border border-white/10 rounded-2xl ${className}`}>
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority={priority}
          sizes={sizes}
          onError={() => setHasError(true)}
          className={`object-cover ${hoverZoom ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
        />
        {/* Subtle dark vignette overlay for text legibility and rich contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      </div>
    );
  }

  // High-Tech Cyber Pattern Fallback (Guaranteed to NEVER look broken)
  return (
    <div
      className={`w-full relative overflow-hidden aspect-[1080/711] bg-gradient-to-br from-[#0c1017] via-[#08090d] to-[#040405] border border-white/10 rounded-2xl flex flex-col justify-between p-6 select-none ${className}`}
    >
      {/* Decorative Matrix Grid Lines */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #C6FF34 1px, transparent 1px), linear-gradient(to bottom, #C6FF34 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Cyber Glowing Orb */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C6FF34]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header inside placeholder */}
      <div className="relative flex items-center justify-between z-10">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C6FF34]/15 border border-[#C6FF34]/30 text-[#C6FF34] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {categoryName}
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          TSE RESEARCH
        </span>
      </div>

      {/* Center Icon & Branding */}
      <div className="relative my-auto flex flex-col items-center justify-center text-center space-y-2 z-10 py-4">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          {renderCategoryIcon()}
        </div>
        <p className="text-xs font-mono font-bold text-white max-w-xs truncate px-4">
          {blog?.title || 'Cybersecurity Technical Report'}
        </p>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative flex items-center justify-between text-[10px] font-mono text-slate-500 z-10 pt-2 border-t border-white/10">
        <span>TSE INTEL DISCLOSURE</span>
        <span>1080 × 711 STANDARD</span>
      </div>
    </div>
  );
}
