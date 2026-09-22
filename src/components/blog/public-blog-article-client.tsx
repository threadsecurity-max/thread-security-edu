'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Linkedin,
  Twitter,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  List,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PublicBlogArticleClientProps {
  blog: any;
  relatedBlogs: any[];
}

export function PublicBlogArticleClient({ blog, relatedBlogs }: PublicBlogArticleClientProps) {
  const [copied, setCopied] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);

  // Dynamically extract Headings for Table of Contents
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(blog.content || '', 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));

    const items = headings.map((h, idx) => {
      const text = h.textContent || `Section ${idx + 1}`;
      const id = text.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return {
        id,
        text,
        level: parseInt(h.tagName[1], 10),
      };
    });

    setToc(items);
  }, [blog.content]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const shareTitle = encodeURIComponent(blog.title);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#C6FF34] selection:text-black">
      {/* Top Header / Breadcrumb */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between text-xs font-mono">
          <Link href="/blog" className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>
          <span className="text-slate-500 hidden md:inline truncate max-w-xs">{blog.title}</span>
          <Button size="sm" variant="ghost" onClick={handleCopyLink} className="h-7 text-xs font-mono text-[#C6FF34]">
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Share'}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <header className="py-12 md:py-16 border-b border-white/10 bg-gradient-to-b from-[#0c0c0c] to-[#050505]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-6 text-center">
          <Badge className="bg-[#C6FF34] text-black font-mono font-bold text-xs uppercase tracking-wider">
            {blog.category?.name || 'CYBERSECURITY RESEARCH'}
          </Badge>

          <h1 className="text-3xl md:text-5xl font-black font-serif text-white leading-tight tracking-tight">
            {blog.title}
          </h1>

          {blog.subtitle && (
            <p className="text-lg md:text-xl text-slate-300 font-serif italic max-w-3xl mx-auto leading-relaxed">
              {blog.subtitle}
            </p>
          )}

          {/* Author & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold font-mono text-white">
                {blog.author?.user?.name?.[0] || 'M'}
              </div>
              <div className="text-left">
                <p className="font-bold text-white">{blog.author?.user?.name || 'Faculty Lead'}</p>
                <p className="text-[10px] text-[#C6FF34]">{blog.author?.title || 'Thread Security Mentor'}</p>
              </div>
            </div>

            <div className="h-4 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Published Recent'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C6FF34]" />
              <span>{blog.readingTime || 5} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Desktop 2-Column */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Featured Hero Cover Image */}
        {blog.media?.[0]?.url && (
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black aspect-[1080/711] mb-12 shadow-2xl">
            <img src={blog.media[0].url} alt={blog.media[0].altText || blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-20 space-y-6 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-xl font-mono">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider">
              <List className="w-4 h-4 text-[#C6FF34]" /> TABLE OF CONTENTS
            </div>

            {toc.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No section headings found.</p>
            ) : (
              <nav className="space-y-2 text-xs">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-slate-400 hover:text-[#C6FF34] transition-colors truncate ${
                      item.level === 2 ? 'pl-2' : item.level === 3 ? 'pl-4 text-[11px]' : 'font-bold text-slate-200'
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            )}

            {/* Social Share Box */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">SHARE ARTICLE</span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* Article Structured Content */}
          <article className="lg:col-span-9 space-y-8 max-w-3xl mx-auto lg:mx-0">
            {/* Mobile Collapsible TOC */}
            {toc.length > 0 && (
              <div className="lg:hidden p-4 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-3 font-mono text-xs">
                <span className="font-bold text-[#C6FF34] flex items-center gap-2">
                  <List className="w-4 h-4" /> TABLE OF CONTENTS
                </span>
                <div className="space-y-1.5 pl-2">
                  {toc.map((item) => (
                    <a key={item.id} href={`#${item.id}`} className="block text-slate-300 hover:text-[#C6FF34] truncate">
                      • {item.text}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Rich HTML Render */}
            <div
              className="prose prose-invert max-w-none text-slate-200 text-base md:text-lg leading-relaxed font-sans prose-headings:font-serif prose-headings:text-white prose-a:text-[#C6FF34] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content written yet.</p>' }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-8 border-t border-white/10 space-y-2 font-mono">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ARTICLE TOPICS</span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: any) => (
                    <Badge key={tag.id} className="bg-white/5 border border-white/10 text-slate-300 font-normal">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Related Articles Section */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <section className="mt-20 pt-12 border-t border-white/10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-serif text-white">Related Research & Articles</h3>
              <Link href="/blog" className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-3 flex flex-col justify-between group transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#C6FF34] font-bold uppercase">{rel.category?.name || 'Research'}</span>
                    <Link href={`/blog/${rel.slug}`}>
                      <h4 className="text-base font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                        {rel.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2">{rel.excerpt || rel.subtitle}</p>
                  </div>

                  <p className="text-[10px] font-mono text-slate-500 pt-2 border-t border-white/10">
                    By {rel.author?.user?.name || 'Mentor'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
