'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ShieldCheck,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogCoverImage } from '@/components/blog/BlogCoverImage';

function processContentHeadings(content: string) {
  if (!content) return content;
  return content.replace(/<(h[1-3])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    if (/id=["'][^"']+["']/i.test(attrs)) return match;
    const text = inner.replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!id) return match;
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}

interface PublicBlogArticleClientProps {
  blog: any;
  relatedBlogs: any[];
}

export function PublicBlogArticleClient({ blog, relatedBlogs }: PublicBlogArticleClientProps) {
  const [copied, setCopied] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const processedContent = useMemo(() => processContentHeadings(blog.content), [blog.content]);

  // Dynamically extract Headings for Table of Contents
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(blog.content || '', 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));

    const items = headings.map((h, idx) => {
      const text = h.textContent || `Section ${idx + 1}`;
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `section-${idx + 1}`;
      return {
        id,
        text,
        level: parseInt(h.tagName[1], 10),
      };
    });

    setToc(items);
  }, [blog.content]);

  // Active Heading Scrollspy
  useEffect(() => {
    if (typeof window === 'undefined' || toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-90px 0px -65% 0px', threshold: 0.1 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  // Attach One-Click Copy Buttons to Pre Code blocks
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preElements = document.querySelectorAll('.tiptap pre');
    preElements.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return;
      (pre as HTMLElement).style.position = 'relative';

      const copyBtn = document.createElement('button');
      copyBtn.className =
        'code-copy-btn absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-mono transition-all border border-white/10 flex items-center gap-1 z-10 backdrop-blur-md cursor-pointer';
      copyBtn.innerHTML = '<span>Copy</span>';

      copyBtn.onclick = (e) => {
        e.preventDefault();
        const code =
          (pre.querySelector('code') as HTMLElement)?.innerText ||
          (pre as HTMLElement).innerText ||
          pre.textContent ||
          '';
        navigator.clipboard.writeText(code);
        copyBtn.innerHTML = '<span class="text-[#C6FF34] font-bold inline-flex items-center gap-1"><svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied</span>';
        setTimeout(() => {
          copyBtn.innerHTML = '<span>Copy</span>';
        }, 2000);
      };

      pre.appendChild(copyBtn);
    });
  }, [processedContent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const shareTitle = encodeURIComponent(blog.title);

  // Dynamic Course Lead Generation Mapping
  const categoryName = (blog.category?.name || '').toLowerCase();
  const courseCta =
    categoryName.includes('soc') || categoryName.includes('threat')
      ? {
          title: 'Certified SOC Analyst & Incident Response Masterclass',
          desc: 'Gain 100+ hours of hands-on security operations center telemetry, Splunk, Elastic, and incident triaging with guaranteed career assistance.',
          slug: 'cyber-security-course',
          tag: 'FLAGSHIP INDUSTRY ACCREDITED',
        }
      : categoryName.includes('hack') || categoryName.includes('pen') || categoryName.includes('red')
      ? {
          title: 'Practical Ethical Hacking & Penetration Testing Track',
          desc: 'Train with active red-team operators on network exploitation, privilege escalation, web vulnerabilities, and adversary emulation.',
          slug: 'cyber-security-course',
          tag: 'OFFENSIVE SECURITY',
        }
      : {
          title: 'End-to-End Cybersecurity Defense & Cloud Security Accelerator',
          desc: 'Master the technical pipeline from network packet analysis to enterprise Kubernetes security and SIEM detection engineering.',
          slug: 'cyber-security-course',
          tag: 'INDUSTRY CERTIFIED CAREER TRACK',
        };

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
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold font-mono text-white overflow-hidden shrink-0">
                {blog.author?.user?.avatarUrl ? (
                  <img src={blog.author.user.avatarUrl} alt={blog.author.user.name} className="w-full h-full object-cover" />
                ) : (
                  blog.author?.user?.name?.[0] || 'M'
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-white flex items-center gap-1.5">
                  {blog.author?.user?.name || 'Faculty Lead'}
                  {blog.author?.linkedinUrl && (
                    <a
                      href={blog.author.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0077b5] hover:text-[#00a0dc] transition-colors inline-block"
                      title="Contact on LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </p>
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
        <div className="max-w-4xl mx-auto mb-12 shadow-2xl">
          <BlogCoverImage
            blog={blog}
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="rounded-3xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-20 space-y-6 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-xl font-mono">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider">
              <List className="w-4 h-4 text-[#C6FF34]" /> TABLE OF CONTENTS
            </div>

            {toc.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No section headings found.</p>
            ) : (
              <nav className="space-y-1 text-xs">
                {toc.map((item) => {
                  const isActive = activeHeadingId === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`group flex items-start gap-2.5 transition-all rounded-lg py-1.5 px-2 ${
                        item.level === 2 ? 'ml-3 text-[11px]' : item.level === 3 ? 'ml-6 text-[10px]' : 'font-semibold'
                      } ${
                        isActive
                          ? 'text-[#C6FF34] font-bold bg-[#C6FF34]/10 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {/* Technical Cyber Bullet Indicator */}
                      <span className="shrink-0 mt-1 flex items-center justify-center">
                        {item.level === 1 ? (
                          <span
                            className={`w-2 h-2 rounded-full transition-all ${
                              isActive ? 'bg-[#C6FF34] ring-4 ring-[#C6FF34]/20 scale-110' : 'bg-[#C6FF34]/70 group-hover:bg-[#C6FF34]'
                            }`}
                          />
                        ) : item.level === 2 ? (
                          <span
                            className={`w-1.5 h-1.5 rounded-full border transition-all ${
                              isActive
                                ? 'border-[#C6FF34] bg-[#C6FF34] ring-2 ring-[#C6FF34]/20'
                                : 'border-slate-500 bg-transparent group-hover:border-slate-300'
                            }`}
                          />
                        ) : (
                          <span
                            className={`w-1 h-1 rounded-sm transition-all ${
                              isActive ? 'bg-[#C6FF34]' : 'bg-slate-600 group-hover:bg-slate-400'
                            }`}
                          />
                        )}
                      </span>
                      <span className="truncate leading-snug">{item.text}</span>
                    </a>
                  );
                })}
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
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex items-center gap-2 truncate transition-colors py-1 ${
                        item.level === 2 ? 'pl-3 text-[11px]' : item.level === 3 ? 'pl-5 text-[10px]' : 'font-semibold'
                      } ${
                        activeHeadingId === item.id ? 'text-[#C6FF34] font-bold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeHeadingId === item.id ? 'bg-[#C6FF34]' : 'bg-slate-500'}`} />
                      <span className="truncate">{item.text}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Rich HTML Render */}
            <div
              className="tiptap prose prose-invert max-w-none text-slate-200 text-base md:text-lg leading-relaxed font-sans prose-headings:font-serif prose-headings:text-white prose-a:text-[#C6FF34] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: processedContent || '<p>No content written yet.</p>' }}
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

            {/* High-Converting Course Lead Generation CTA Banner */}
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-[#12160d] via-[#0d0d0f] to-[#0a0a0a] border border-[#C6FF34]/30 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C6FF34]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#C6FF34]/20 transition-all" />
              <div className="relative space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge className="bg-[#C6FF34] text-black font-mono font-bold text-[10px] tracking-wider uppercase">
                    {courseCta.tag}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#C6FF34]">
                    <Award className="w-4 h-4" />
                    <span>100% Practical Defense Labs</span>
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-black font-serif text-white leading-snug">
                  {courseCta.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
                  {courseCta.desc}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href={`/courses/${courseCta.slug}`}>
                    <Button className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-10 px-6 rounded-xl shadow-lg shadow-[#C6FF34]/20">
                      Explore Syllabus & Enroll <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="ghost" className="text-slate-300 hover:text-white font-mono text-xs h-10">
                      Browse All TSE Tracks
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Author E-E-A-T Verified Profile Card */}
            <div className="mt-8 p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-4 font-mono shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-white/20 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0 shadow-md">
                    {blog.author?.user?.avatarUrl ? (
                      <img src={blog.author.user.avatarUrl} alt={blog.author.user.name} className="w-full h-full object-cover" />
                    ) : (
                      blog.author?.user?.name?.[0] || 'M'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white font-sans">{blog.author?.user?.name || 'TSE Security Mentor'}</h4>
                      <span className="flex items-center gap-1 text-[10px] text-[#C6FF34] bg-[#C6FF34]/15 px-2 py-0.5 rounded-full border border-[#C6FF34]/30 font-bold">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED FACULTY
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {blog.author?.title || 'Senior Cybersecurity Mentor'} · {blog.author?.company || 'Thread Security'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Academic Verified · E-E-A-T Indexed</span>
                </div>
              </div>

              {/* Sanitized Author Bio - Guaranteed to NEVER show Unified User Directory boilerplate */}
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {(() => {
                  const rawBio = blog.author?.bio || '';
                  if (!rawBio || rawBio.includes('Unified User Directory') || rawBio.trim() === 'Faculty mentor profile.') {
                    return 'Experienced cybersecurity mentor & researcher guiding students through enterprise SOC operations, defensive engineering, and hands-on laboratory practice.';
                  }
                  return rawBio;
                })()}
              </p>

              {blog.author?.expertise && (
                <div className="pt-1 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Specializations:</strong> {blog.author.expertise}
                </div>
              )}

              {/* Author Creds & Contact Links (LinkedIn, Medium, Twitter/X, GitHub) */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">CONNECT WITH AUTHOR:</span>

                {blog.author?.linkedinUrl ? (
                  <a
                    href={blog.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077b5]/15 hover:bg-[#0077b5]/25 border border-[#0077b5]/30 text-white transition-all text-xs font-bold"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                    Connect on LinkedIn
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ) : (
                  <a
                    href="https://www.linkedin.com/company/threadsecurity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-slate-300 transition-all text-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                    Faculty LinkedIn
                  </a>
                )}

                {blog.author?.mediumUrl && (
                  <a
                    href={blog.author.mediumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all text-xs font-bold"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Medium
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {blog.author?.twitterUrl && (
                  <a
                    href={blog.author.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all text-xs font-bold"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    Twitter / X
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {blog.author?.githubUrl && (
                  <a
                    href={blog.author.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all text-xs font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
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
                  <div className="space-y-3">
                    <BlogCoverImage blog={rel} className="rounded-xl aspect-[16/9]" />
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
