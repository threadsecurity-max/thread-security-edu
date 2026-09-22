'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PublicBlogLandingClientProps {
  initialBlogs: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  categories: any[];
  currentSearch: string;
  currentCategory: string;
}

export function PublicBlogLandingClient({
  initialBlogs,
  totalCount,
  currentPage,
  totalPages,
  categories,
  currentSearch,
  currentCategory,
}: PublicBlogLandingClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (currentCategory) params.set('category', currentCategory);
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (slug) params.set('category', slug);
    router.push(`/blog?${params.toString()}`);
  };

  // Extract featured blog
  const featuredBlog = initialBlogs.find((b) => b.featured) || initialBlogs[0];
  const latestPosts = initialBlogs.filter((b) => b.id !== featuredBlog?.id).slice(0, 4);
  const remainingBlogs = initialBlogs.filter((b) => b.id !== featuredBlog?.id).slice(4);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#C6FF34] selection:text-black">
      {/* Editorial Header Banner */}
      <section className="relative py-16 md:py-24 border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C6FF34]">
            <Sparkles className="w-3.5 h-3.5" />
            THREAD SECURITY RESEARCH & INSIGHTS
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto font-serif leading-tight">
            Blogs & Perspectives
          </h1>

          <p className="text-base md:text-lg text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed">
            Explore technical knowledge, cybersecurity research, AI threat detection, and industry perspectives authored by Thread Security leads.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative pt-4">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cybersecurity research, threat analysis, web dev..."
              className="pl-12 pr-28 h-13 rounded-2xl bg-[#121212] border-white/15 text-white placeholder:text-slate-500 font-mono text-sm focus:border-[#C6FF34] shadow-2xl"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-9 px-4 rounded-xl"
            >
              Search
            </Button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                !currentCategory
                  ? 'bg-white text-black font-bold shadow-lg'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  currentCategory === cat.slug
                    ? 'bg-[#C6FF34] text-black font-bold shadow-lg shadow-[#C6FF34]/10'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat.name} ({cat._count?.blogs || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-16">
        {initialBlogs.length === 0 ? (
          <div className="p-16 text-center bg-[#0c0c0c] border border-white/10 rounded-3xl space-y-4">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold font-mono text-white">No Blog Articles Published Yet</h3>
            <p className="text-xs text-[#94a3b8] font-mono max-w-md mx-auto">
              Check back soon for latest cybersecurity whitepapers and vulnerability research from Thread Security faculty.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article + Latest Posts Layout */}
            {featuredBlog && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 hover:border-white/20 transition-all group shadow-2xl">
                  {featuredBlog.media?.[0]?.url || featuredBlog.coverImageId ? (
                    <div className="rounded-2xl overflow-hidden aspect-[1080/711] border border-white/10 bg-black">
                      <img
                        src={featuredBlog.media?.[0]?.url || '/placeholder-blog.png'}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3 pt-2">
                    <Badge className="bg-[#C6FF34] text-black font-mono font-bold text-[11px] uppercase tracking-wider">
                      {featuredBlog.category?.name || 'FEATURED RESEARCH'}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredBlog.readingTime || 5} min read
                    </span>
                  </div>

                  <Link href={`/blog/${featuredBlog.slug}`}>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-white group-hover:text-[#C6FF34] transition-colors leading-tight">
                      {featuredBlog.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {featuredBlog.excerpt || featuredBlog.subtitle}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold font-mono">
                        {featuredBlog.author?.user?.name?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-white">{featuredBlog.author?.user?.name || 'Faculty Mentor'}</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {featuredBlog.publishedAt ? new Date(featuredBlog.publishedAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <Link href={`/blog/${featuredBlog.slug}`}>
                      <Button variant="ghost" size="sm" className="text-xs font-mono text-[#C6FF34] hover:text-[#b2eb2a] p-0 flex items-center gap-1">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C6FF34]" /> LATEST POSTS
                    </h3>
                  </div>

                  <div className="divide-y divide-white/10 space-y-4">
                    {latestPosts.map((post) => (
                      <div key={post.id} className="pt-4 first:pt-0 space-y-2 group">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="text-[#C6FF34] font-bold">{post.category?.name || 'Article'}</span>
                          <span>{post.readingTime || 4} min read</span>
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <h4 className="text-base font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                            {post.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-slate-400 line-clamp-2">{post.excerpt || post.subtitle}</p>

                        <p className="text-[10px] font-mono text-slate-500 pt-1">
                          By {post.author?.user?.name || 'Mentor'} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Grid of Remaining Articles */}
            {remainingBlogs.length > 0 && (
              <section className="space-y-6 pt-8 border-t border-white/10">
                <h3 className="text-xl font-bold font-serif text-white">More Publications</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingBlogs.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-4 flex flex-col justify-between group transition-all"
                    >
                      <div className="space-y-3">
                        {b.media?.[0]?.url && (
                          <div className="rounded-xl overflow-hidden aspect-[1080/711] border border-white/10 bg-black">
                            <img src={b.media[0].url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs font-mono">
                          <Badge className="bg-white/10 text-slate-300 font-normal border-none text-[10px]">
                            {b.category?.name || 'Research'}
                          </Badge>
                          <span className="text-slate-400 text-[11px]">{b.readingTime || 3} min read</span>
                        </div>

                        <Link href={`/blog/${b.slug}`}>
                          <h3 className="text-lg font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                            {b.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{b.excerpt || b.subtitle}</p>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{b.author?.user?.name || 'Mentor'}</span>
                        <Link href={`/blog/${b.slug}`} className="text-[#C6FF34] font-bold flex items-center gap-1 hover:underline">
                          Read <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
