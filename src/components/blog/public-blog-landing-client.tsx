'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Shield,
  Cpu,
  Compass,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Cloud,
  GitMerge,
  ShieldAlert,
  Code2,
  SlidersHorizontal,
  X,
  Zap,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogCoverImage } from '@/components/blog/BlogCoverImage';
import { formatDate } from '@/lib/utils/formatters';

interface PublicBlogLandingClientProps {
  initialBlogs: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  categories: any[];
  currentSearch: string;
  currentCategory: string;
}

type DomainTab = 'all' | 'popular' | 'cybersecurity' | 'ai' | 'career';

interface DynamicCourseData {
  title: string;
  subtitle: string;
  slug: string;
  badge: string;
  trackName: string;
  durationHours: number;
  labsCount: number;
  highlights: string[];
  tools: string[];
}

const DOMAIN_COURSES: Record<DomainTab, DynamicCourseData> = {
  all: {
    title: 'Professional Cyber Security Course & Industrial Training (Ethical Hacking, VAPT & SOC)',
    subtitle: 'Comprehensive job-oriented training. Master Ethical Hacking, VAPT, SOC Operations, Bug Bounty, and Incident Response with 100% sandboxed cloud labs in Jalandhar & Online.',
    slug: 'cyber-security-course',
    badge: 'FLAGSHIP ACCREDITED PROGRAM',
    trackName: 'Complete Cyber Defense & Offense',
    durationHours: 120,
    labsCount: 80,
    highlights: [
      'Dual Specialization: Offensive Security & Defensive SOC',
      'Global Certification Prep: CEH v13, Security+, OSCP & Verifiable TS-ID',
      '100% Placement Assistance with Direct Hiring Referrals',
    ],
    tools: ['Kali Linux', 'Burp Suite Pro', 'Splunk Enterprise', 'Wazuh', 'Wireshark', 'Metasploit'],
  },
  popular: {
    title: 'Professional Cyber Security Course & Industrial Training (Ethical Hacking, VAPT & SOC)',
    subtitle: 'Our highest-enrolled training track combining offensive penetration testing with 24/7 security operations center telemetry analysis.',
    slug: 'cyber-security-course',
    badge: 'TOP ENROLLED PROGRAM',
    trackName: 'Industry Flagship Masterclass',
    durationHours: 120,
    labsCount: 80,
    highlights: [
      '45-Day Summer & 6-Month Industrial Internship Options',
      'Sandboxed Cloud Ranges & Real Enterprise Attack Scenarios',
      '1-on-1 Faculty Mentorship & Mock Technical Interviews',
    ],
    tools: ['Kali Linux', 'Burp Suite', 'Splunk', 'Wazuh', 'Python for Security'],
  },
  cybersecurity: {
    title: 'SOC Operations & Threat Hunting (Blue Team Masterclass)',
    subtitle: 'Gain 100+ hours of hands-on telemetry correlation, alert triage, EDR detection engineering, and incident response playbooks.',
    slug: 'soc-blue-team-operations',
    badge: 'DEFENSIVE CYBER DEFENSE',
    trackName: 'SOC Analyst & Incident Response',
    durationHours: 80,
    labsCount: 50,
    highlights: [
      'Splunk & Wazuh SIEM Telemetry Mastery',
      'MITRE ATT&CK Mapping & Detection Rule Engineering',
      'Memory Forensics & Malware Triage Workflows',
    ],
    tools: ['Splunk', 'Microsoft Sentinel', 'Elastic Security', 'TheHive', 'Zeek', 'Wireshark'],
  },
  ai: {
    title: 'AI Security & LLM Red Teaming Masterclass',
    subtitle: 'Learn to identify and mitigate prompt injections, jailbreaks, data poisoning, and model theft in production generative AI systems.',
    slug: 'ai-security-llm-redteaming',
    badge: 'CUTTING-EDGE AI TRACK',
    trackName: 'Generative AI & LLM Security',
    durationHours: 60,
    labsCount: 40,
    highlights: [
      'Prompt Injection, Jailbreaking & Extraction Drills',
      'RAG Architecture Security & Vector DB Defense',
      'NeMo Guardrails & Enterprise AI Governance',
    ],
    tools: ['LangChain', 'Llama-Index', 'Garak', 'NeMo Guardrails', 'PyTorch', 'Python'],
  },
  career: {
    title: 'Cybersecurity Career Accelerator & Industrial Internship Track',
    subtitle: 'Fast-track from beginner or college student to a hired cybersecurity analyst with structured mentorship and portfolio building.',
    slug: 'cyber-security-course',
    badge: '100% PLACEMENT ACCELERATOR',
    trackName: 'Career Pathways & Industry Placement',
    durationHours: 120,
    labsCount: 80,
    highlights: [
      'Resume & GitHub Security Portfolio Building',
      '1-on-1 Mock Technical Interviews & Salary Negotiation',
      'Direct Referrals to Hiring Security Partners across India',
    ],
    tools: ['CEH v13 Prep', 'CompTIA Security+', 'Sandboxed Range Drills', 'Git'],
  },
};

export interface CategoryWidgetMeta {
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderHover: string;
  badgeColor: string;
  queryHint: string;
}

export const CATEGORY_WIDGETS: CategoryWidgetMeta[] = [
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Threat intelligence, network security, red teaming, and SOC operations.',
    icon: Shield,
    color: '#C6FF34',
    bgLight: 'bg-[#C6FF34]/10',
    borderHover: 'hover:border-[#C6FF34]/60',
    badgeColor: 'text-[#C6FF34] border-[#C6FF34]/30',
    queryHint: 'cybersecurity',
  },
  {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'AI, LLMs, machine learning in security, and AI threat detection.',
    icon: Cpu,
    color: '#c084fc',
    bgLight: 'bg-purple-500/10',
    borderHover: 'hover:border-purple-400/60',
    badgeColor: 'text-purple-400 border-purple-400/30',
    queryHint: 'ai',
  },
  {
    name: 'Career Guidance',
    slug: 'career-guidance',
    description: 'Career pathways, certifications, interview prep, and industry guidance.',
    icon: Compass,
    color: '#34d399',
    bgLight: 'bg-emerald-500/10',
    borderHover: 'hover:border-emerald-400/60',
    badgeColor: 'text-emerald-400 border-emerald-400/30',
    queryHint: 'career',
  },
  {
    name: 'Cloud',
    slug: 'cloud',
    description: 'AWS, GCP, Azure security, cloud-native architectures, and Kubernetes.',
    icon: Cloud,
    color: '#38bdf8',
    bgLight: 'bg-sky-500/10',
    borderHover: 'hover:border-sky-400/60',
    badgeColor: 'text-sky-400 border-sky-400/30',
    queryHint: 'cloud',
  },
  {
    name: 'DevSecOps',
    slug: 'devsecops',
    description: 'CI/CD security, automation, infrastructure as code, and compliance.',
    icon: GitMerge,
    color: '#fb923c',
    bgLight: 'bg-amber-500/10',
    borderHover: 'hover:border-amber-400/60',
    badgeColor: 'text-amber-400 border-amber-400/30',
    queryHint: 'devsecops',
  },
  {
    name: 'Threat Intelligence',
    slug: 'threat-intelligence',
    description: 'Malware analysis, threat hunting, and indicators of compromise.',
    icon: ShieldAlert,
    color: '#f43f5e',
    bgLight: 'bg-rose-500/10',
    borderHover: 'hover:border-rose-400/60',
    badgeColor: 'text-rose-400 border-rose-400/30',
    queryHint: 'threat-intelligence',
  },
  {
    name: 'Ethical Hacking',
    slug: 'ethical-hacking',
    description: 'Penetration testing, bug bounty, vulnerability assessment, and exploits.',
    icon: Terminal,
    color: '#ef4444',
    bgLight: 'bg-red-500/10',
    borderHover: 'hover:border-red-400/60',
    badgeColor: 'text-red-400 border-red-400/30',
    queryHint: 'ethical-hacking',
  },
  {
    name: 'Programming',
    slug: 'programming',
    description: 'Python, Rust, Go, TypeScript, and security tool engineering.',
    icon: Code2,
    color: '#a855f7',
    bgLight: 'bg-violet-500/10',
    borderHover: 'hover:border-violet-400/60',
    badgeColor: 'text-violet-400 border-violet-400/30',
    queryHint: 'programming',
  },
  {
    name: 'Industry Insights',
    slug: 'industry-insights',
    description: 'Cybersecurity market trends, regulatory shifts, and news.',
    icon: TrendingUp,
    color: '#facc15',
    bgLight: 'bg-yellow-500/10',
    borderHover: 'hover:border-yellow-400/60',
    badgeColor: 'text-yellow-400 border-yellow-400/30',
    queryHint: 'industry-insights',
  },
  {
    name: 'Research',
    slug: 'research',
    description: 'Original vulnerability research, whitepapers, and case studies.',
    icon: BookOpen,
    color: '#22d3ee',
    bgLight: 'bg-cyan-500/10',
    borderHover: 'hover:border-cyan-400/60',
    badgeColor: 'text-cyan-400 border-cyan-400/30',
    queryHint: 'research',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'General tech developments, hardware, and emerging trends.',
    icon: Cpu,
    color: '#94a3b8',
    bgLight: 'bg-slate-500/10',
    borderHover: 'hover:border-slate-400/60',
    badgeColor: 'text-slate-400 border-slate-400/30',
    queryHint: 'technology',
  },
];

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
  const [isSearchWidgetOpen, setIsSearchWidgetOpen] = useState(false);
  const [activeDomainTab, setActiveDomainTab] = useState<DomainTab>(() => {
    if (currentCategory === 'cybersecurity' || currentCategory.includes('threat')) return 'cybersecurity';
    if (currentCategory === 'artificial-intelligence' || currentCategory.includes('ai')) return 'ai';
    if (currentCategory === 'career' || currentCategory.includes('career')) return 'career';
    return 'all';
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchWidgetOpen(false);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (currentCategory) params.set('category', currentCategory);
    router.push(`/blog?${params.toString()}`);
  };

  const handleQuickSearch = (keyword: string) => {
    setSearch(keyword);
    setIsSearchWidgetOpen(false);
    const params = new URLSearchParams();
    params.set('search', keyword);
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string, domain?: DomainTab) => {
    if (domain) setActiveDomainTab(domain);
    setIsSearchWidgetOpen(false);
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    router.push(`/blog?${params.toString()}`);
  };

  // Safe category filtering that excludes Web Development
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const slug = (c.slug || '').toLowerCase();
      return !name.includes('web development') && !slug.includes('web-development');
    });
  }, [categories]);

  // Intelligent categorization of blogs across the 4 key domains
  const { popularBlogs, cyberBlogs, aiBlogs, careerBlogs } = useMemo(() => {
    const cyber: any[] = [];
    const ai: any[] = [];
    const career: any[] = [];

    initialBlogs.forEach((b) => {
      const cat = (b.category?.name || '').toLowerCase();
      const title = (b.title || '').toLowerCase();
      const tags = (b.tags || []).map((t: any) => (t.name || '').toLowerCase());

      const isAI =
        cat.includes('artificial') ||
        cat.includes('ai') ||
        /\b(ai|llm|gpt|deepfake|voice cloning|prompt|agent|hallucinate|neural)\b/i.test(title) ||
        title.toLowerCase().startsWith('ai ') ||
        title.toLowerCase().includes(' ai ') ||
        title.toLowerCase().includes('ai:') ||
        title.toLowerCase().includes('ai-') ||
        tags.some((t: string) => t.includes('ai') || t.includes('llm'));

      const isCareer =
        cat.includes('career') ||
        title.includes('career') ||
        title.includes('roadmap') ||
        title.includes('intern') ||
        title.includes('job') ||
        title.includes('portfolio') ||
        title.includes('courses in jalandhar') ||
        title.includes('skills ladder') ||
        title.includes('beginner') ||
        tags.some((t: string) => t.includes('career') || t.includes('intern'));

      const isCyber =
        cat.includes('cyber') ||
        cat.includes('threat') ||
        cat.includes('hack') ||
        cat.includes('security') ||
        title.includes('security') ||
        title.includes('soc') ||
        title.includes('zero-day') ||
        title.includes('ransomware') ||
        title.includes('gateway') ||
        title.includes('upi') ||
        title.includes('exploit') ||
        title.includes('cybercrime') ||
        title.includes('lab') ||
        tags.some((t: string) => t.includes('security') || t.includes('soc'));

      if (isAI) ai.push(b);
      if (isCareer) career.push(b);
      if (isCyber || (!isAI && !isCareer)) cyber.push(b);
    });

    // Popular: Featured publications, or top reading time / prominent pieces
    const popular = initialBlogs.filter((b) => b.featured).length > 0
      ? initialBlogs.filter((b) => b.featured)
      : initialBlogs.slice(0, 6);

    return {
      popularBlogs: popular,
      cyberBlogs: cyber,
      aiBlogs: ai,
      careerBlogs: career,
    };
  }, [initialBlogs]);

  // Live Instant Search Preview when user types in search input
  const instantSearchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    const isAi = q === 'ai' || q === 'a.i.' || q.includes('artificial') || q.includes('llm') || q.includes('gpt');

    return initialBlogs
      .filter((b) => {
        const title = (b.title || '').toLowerCase();
        const cat = (b.category?.name || '').toLowerCase();
        const catSlug = (b.category?.slug || '').toLowerCase();
        const excerpt = (b.excerpt || b.subtitle || '').toLowerCase();
        const tags = (b.tags || []).map((t: any) => (t.name || '').toLowerCase());

        if (isAi) {
          return (
            cat.includes('artificial') ||
            catSlug.includes('ai') ||
            catSlug.includes('artificial') ||
            /\b(ai|llm|gpt|deepfake|prompt|agent)\b/i.test(title) ||
            title.startsWith('ai ') ||
            title.includes(' ai ') ||
            tags.some((t: string) => t.includes('ai') || t.includes('llm')) ||
            excerpt.includes('artificial intelligence') ||
            excerpt.includes(' ai ')
          );
        }

        return (
          title.includes(q) ||
          cat.includes(q) ||
          catSlug.includes(q) ||
          excerpt.includes(q) ||
          tags.some((t: string) => t.includes(q))
        );
      })
      .slice(0, 5);
  }, [search, initialBlogs]);

  // Featured article for Hero spotlight
  const featuredBlog = initialBlogs.find((b) => b.featured) || initialBlogs[0];

  // Dynamic Course Data matching current active domain
  const activeCourse = DOMAIN_COURSES[activeDomainTab] || DOMAIN_COURSES.all;

  // Filtered state indicator
  const isDirectCategoryFilter = Boolean(currentCategory || currentSearch);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#C6FF34] selection:text-black font-sans">
      {/* Editorial Header Banner */}
      <section className="relative py-12 sm:py-16 md:py-24 border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#0a0a0e] via-[#07070a] to-[#050505]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(800px,100vw)] h-[350px] bg-[#C6FF34]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4 sm:space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono text-[#C6FF34] shadow-lg max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-[#C6FF34] shrink-0" />
            <span className="truncate">THREAD SECURITY RESEARCH &amp; FACULTY PERSPECTIVES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto font-serif leading-tight break-words">
            Cybersecurity &amp; AI Research Hub
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed px-2">
            Technical perspectives, threat telemetry, AI vulnerability analysis, and industry career blueprints authored by Thread Security practitioners.
          </p>

          {/* Search Bar with 11 Category Search Widgets */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto pt-2 sm:pt-4 relative w-full">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 text-slate-400 pointer-events-none z-10" />
              <Input
                value={search}
                onFocus={() => setIsSearchWidgetOpen(true)}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search research, AI models, SOC..."
                className="w-full pl-9 sm:pl-12 pr-24 sm:pr-[230px] h-11 sm:h-12 md:h-14 rounded-2xl bg-[#101014] border-white/15 text-white placeholder:text-slate-500 font-mono text-xs sm:text-sm focus:border-[#C6FF34] shadow-2xl"
              />

              <div className="absolute right-1.5 sm:right-2 flex items-center gap-1 sm:gap-1.5 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSearchWidgetOpen(!isSearchWidgetOpen)}
                  className={`h-8 sm:h-10 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all flex items-center gap-1 sm:gap-1.5 border shadow-sm ${
                    isSearchWidgetOpen
                      ? 'bg-[#182613] text-[#C6FF34] border-[#C6FF34]/50 shadow-[0_0_15px_rgba(198,255,52,0.15)]'
                      : 'bg-[#16161d] text-slate-300 hover:text-[#C6FF34] hover:bg-[#1f1f28] border-white/15'
                  }`}
                  title="Toggle 11 Category Search Widgets"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#C6FF34]" />
                  <span className="hidden sm:inline">11 Widgets</span>
                </Button>

                <Button
                  type="submit"
                  className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-8 sm:h-10 px-3 sm:px-5 rounded-xl cursor-pointer shadow-md shadow-[#C6FF34]/20"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Helper Trigger Line */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 px-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSearchWidgetOpen(!isSearchWidgetOpen)}
                className="hover:text-[#C6FF34] transition-colors flex items-center gap-1.5 text-[11px] truncate"
              >
                <Zap className="w-3.5 h-3.5 text-[#C6FF34] shrink-0" />
                <span className="truncate">{isSearchWidgetOpen ? 'Hide Category Search Widgets ▲' : 'Open 11 Category Search Widgets ▼'}</span>
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setIsSearchWidgetOpen(false);
                    router.push('/blog');
                  }}
                  className="text-slate-500 hover:text-white text-[11px] shrink-0"
                >
                  Clear search ×
                </button>
              )}
            </div>

            {/* Interactive 11 Category Search Widgets Dropdown / Explorer */}
            {isSearchWidgetOpen && (
              <div className="mt-3 p-4 sm:p-5 md:p-6 bg-[#0c0c10]/98 border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-2xl text-left space-y-4 sm:space-y-5 animate-in fade-in-0 zoom-in-95 duration-150 relative z-30">
                {/* Header & Quick Topic Chips */}
                <div className="space-y-2.5 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C6FF34] flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-[#C6FF34] shrink-0" />
                      <span className="truncate">Explore 11 Specialization Domains</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSearchWidgetOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                      aria-label="Close widgets"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Search Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">Quick Search:</span>
                    {[
                      { label: '⚡ AI & LLMs', query: 'ai' },
                      { label: '🛡️ SOC Blue Team', query: 'soc' },
                      { label: '🔍 Prompt Injection', query: 'prompt injection' },
                      { label: '💼 Career Roadmaps', query: 'career' },
                      { label: '☁️ Cloud Security', query: 'cloud' },
                      { label: '🎯 Zero-Day Exploits', query: 'zero-day' },
                      { label: '🔐 Threat Intelligence', query: 'threat intelligence' },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleQuickSearch(chip.query)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C6FF34]/15 hover:text-[#C6FF34] border border-white/10 hover:border-[#C6FF34]/30 text-[11px] font-mono transition-all text-slate-300"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Live Search Results (When typing) */}
                {search.trim().length > 0 && instantSearchResults.length > 0 && (
                  <div className="p-3 bg-black/60 border border-[#C6FF34]/30 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300 gap-2">
                      <span className="text-[#C6FF34] font-bold truncate">
                        Live Matches for &ldquo;{search}&rdquo; ({instantSearchResults.length} previewed)
                      </span>
                      <button
                        type="submit"
                        className="text-[10px] text-sky-400 hover:underline font-bold shrink-0"
                      >
                        Press Enter to View All →
                      </button>
                    </div>
                    <div className="divide-y divide-white/10">
                      {instantSearchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/blog/${item.slug}`}
                          onClick={() => setIsSearchWidgetOpen(false)}
                          className="py-2 flex items-center justify-between gap-3 group hover:bg-white/5 px-2 rounded-lg transition-colors min-w-0"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#C6FF34] shrink-0">
                              {item.category?.name || 'Research'}
                            </span>
                            <p className="text-xs font-medium text-white group-hover:text-[#C6FF34] transition-colors truncate">
                              {item.title}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {item.readingTime || 4}m read →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11 Category Widgets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {CATEGORY_WIDGETS.map((widget) => {
                    const Icon = widget.icon;
                    const catObj = categories.find(
                      (c) => c.slug === widget.slug || c.name.toLowerCase() === widget.name.toLowerCase()
                    );
                    const count = catObj?._count?.blogs ?? (
                      widget.slug === 'artificial-intelligence' ? aiBlogs.length :
                      widget.slug === 'cybersecurity' ? cyberBlogs.length :
                      widget.slug === 'career-guidance' ? careerBlogs.length : 0
                    );
                    const isSelected = currentCategory === widget.slug;

                    return (
                      <button
                        key={widget.name}
                        type="button"
                        onClick={() => {
                          if (widget.slug === 'artificial-intelligence') {
                            handleQuickSearch('ai');
                          } else {
                            handleCategorySelect(widget.slug);
                          }
                        }}
                        className={`p-3 sm:p-3.5 rounded-2xl bg-black/40 border transition-all text-left flex flex-col justify-between group cursor-pointer ${
                          isSelected
                            ? 'border-[#C6FF34] ring-1 ring-[#C6FF34]/50 bg-[#C6FF34]/5'
                            : 'border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full mb-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${widget.color}20`, color: widget.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${widget.badgeColor}`}
                          >
                            {count} {count === 1 ? 'Article' : 'Articles'}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#C6FF34] transition-colors flex items-center gap-1">
                            {widget.name}
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C6FF34]" />
                          </h4>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {widget.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form>

          {/* Dynamic Domain Category Pills (Smooth Horizontal Swiping on Mobile, Centered Wrap on Desktop) */}
          <div className="w-full max-w-5xl mx-auto pt-4 sm:pt-6">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 px-2 sm:px-0 sm:flex-wrap sm:justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* All Topics */}
              <button
                type="button"
                onClick={() => {
                  setActiveDomainTab('all');
                  handleCategorySelect('');
                }}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeDomainTab === 'all' && !currentCategory && !currentSearch
                    ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>All Topics ({initialBlogs.length})</span>
              </button>

              {/* Popular & Trending */}
              <button
                type="button"
                onClick={() => setActiveDomainTab('popular')}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeDomainTab === 'popular'
                    ? 'bg-[#C6FF34] text-black shadow-lg shadow-[#C6FF34]/20 scale-105'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Popular &amp; Trending ({popularBlogs.length})</span>
              </button>

              {/* Cybersecurity Related */}
              <button
                type="button"
                onClick={() => {
                  setActiveDomainTab('cybersecurity');
                  if (currentCategory && currentCategory !== 'cybersecurity') handleCategorySelect('cybersecurity', 'cybersecurity');
                }}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeDomainTab === 'cybersecurity'
                    ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20 scale-105'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Cybersecurity ({cyberBlogs.length})</span>
              </button>

              {/* Artificial Intelligence Related */}
              <button
                type="button"
                onClick={() => {
                  setActiveDomainTab('ai');
                  handleQuickSearch('ai');
                }}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeDomainTab === 'ai' || currentSearch === 'ai' || currentCategory === 'artificial-intelligence'
                    ? 'bg-purple-400 text-black shadow-lg shadow-purple-400/20 scale-105'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Security ({aiBlogs.length})</span>
              </button>

              {/* Career Guidance */}
              <button
                type="button"
                onClick={() => {
                  setActiveDomainTab('career');
                  if (currentCategory && currentCategory !== 'career-guidance' && currentCategory !== 'career') {
                    handleCategorySelect('career-guidance', 'career');
                  }
                }}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeDomainTab === 'career' || currentCategory === 'career-guidance' || currentCategory === 'career'
                    ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20 scale-105'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Career Guidance ({careerBlogs.length})</span>
              </button>

              {/* Toggle 11 Category Widgets Drawer */}
              <button
                type="button"
                onClick={() => setIsSearchWidgetOpen(!isSearchWidgetOpen)}
                className="shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-[#C6FF34]/10 text-[#C6FF34] hover:bg-[#C6FF34]/20 border border-[#C6FF34]/30 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>11 Search Widgets {isSearchWidgetOpen ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16 space-y-12 sm:space-y-16">
        {initialBlogs.length === 0 ? (
          <div className="p-16 text-center bg-[#0c0c0c] border border-white/10 rounded-3xl space-y-4">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold font-mono text-white">No Blog Articles Found</h3>
            <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
              Try adjusting your search criteria or switch to &ldquo;All Topics&rdquo; to view technical research publications.
            </p>
            <Button
              type="button"
              onClick={() => handleCategorySelect('')}
              className="bg-[#C6FF34] text-black font-mono font-bold text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Dynamic Relevant Featured Course Showcase Card */}
            <section className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#12160d] via-[#0d0d12] to-[#0a0a0e] border border-[#C6FF34]/30 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#C6FF34]/15 transition-all" />

              <div className="relative space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#C6FF34] text-black font-mono font-black text-[10px] tracking-wider uppercase">
                      {activeCourse.badge}
                    </Badge>
                    <Badge className="bg-white/10 text-slate-300 border border-white/15 font-mono text-[10px]">
                      {activeCourse.trackName}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5 text-[#C6FF34]">
                      <Clock className="w-4 h-4 shrink-0" /> {activeCourse.durationHours} Hours Practical
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <Terminal className="w-4 h-4 shrink-0" /> {activeCourse.labsCount}+ Live Labs
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-serif text-white leading-snug break-words">
                    {activeCourse.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl font-sans break-words">
                    {activeCourse.subtitle}
                  </p>
                </div>

                {/* Practical Highlights & Tools Covered */}
                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Core Curriculum Highlights:</span>
                    {activeCourse.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Tools &amp; Tech Covered:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeCourse.tools.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-slate-300 text-[11px] font-bold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action CTA Links */}
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 border-t border-white/10">
                  <Link href={`/courses/${activeCourse.slug}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-[#C6FF34]/20 cursor-pointer justify-center">
                      Explore Masterclass Curriculum <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/courses" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto text-slate-300 hover:text-white font-mono text-xs h-10 border border-white/10 rounded-xl justify-center"
                    >
                      View All 17+ Academic Tracks
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Direct Filtered Search View (When search or specific category is selected) */}
            {isDirectCategoryFilter ? (
              <section className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
                      <span>Search &amp; Filter Results</span>
                      <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] font-mono text-xs border border-[#C6FF34]/30">
                        {initialBlogs.length} Articles Found
                      </Badge>
                    </h2>
                    <p className="text-xs font-mono text-slate-400">
                      {currentSearch && (
                        <span>
                          Query: &ldquo;<span className="text-white font-bold">{currentSearch}</span>&rdquo;
                        </span>
                      )}
                      {currentSearch && currentCategory && <span> · </span>}
                      {currentCategory && (
                        <span>
                          Category: &ldquo;
                          <span className="text-[#C6FF34] font-bold">
                            {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                          </span>
                          &rdquo;
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      handleCategorySelect('');
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-[#C6FF34] px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#C6FF34]/30 transition-colors"
                  >
                    Clear Filter ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {initialBlogs.map((b) => (
                    <article
                      key={b.id}
                      className="bg-[#0a0a0d] border border-white/10 hover:border-[#C6FF34]/40 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col justify-between group transition-all shadow-xl min-w-0"
                    >
                      <div className="space-y-3">
                        <BlogCoverImage
                          blog={b}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="flex items-center justify-between text-xs font-mono">
                          <Badge className="bg-white/10 text-[#C6FF34] font-bold border-none text-[10px]">
                            {b.category?.name || 'Technical'}
                          </Badge>
                          <span className="text-slate-400 text-[11px]">{b.readingTime || 4} min read</span>
                        </div>

                        <Link href={`/blog/${b.slug}`}>
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug line-clamp-2 break-words">
                            {b.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-400 line-clamp-2 sm:line-clamp-3 leading-relaxed font-sans break-words">
                          {b.excerpt || b.subtitle}
                        </p>
                      </div>

                      <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono gap-2">
                        <span className="text-slate-400 text-[11px] truncate max-w-[140px]">{b.author?.user?.name || 'Faculty Mentor'}</span>
                        <Link href={`/blog/${b.slug}`} className="text-[#C6FF34] font-bold flex items-center gap-1 hover:underline shrink-0">
                          Read Article <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              /* Categorized Showcase (Showcase by Domain Sections) */
              <div className="space-y-16 sm:space-y-20">
                {/* 1. Hero Magazine Spotlight & Latest Posts Rail */}
                {featuredBlog && (
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
                    {/* Primary Hero Spotlight */}
                    <article className="lg:col-span-7 space-y-4 bg-[#0a0a0e] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-[#C6FF34]/40 transition-all group shadow-2xl min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-[#C6FF34] text-black font-mono font-bold text-[10px] uppercase tracking-wider">
                          FEATURED PUBLICATION
                        </Badge>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#C6FF34]" />
                          {featuredBlog.readingTime || 5} min read
                        </span>
                      </div>

                      <BlogCoverImage
                        blog={featuredBlog}
                        priority
                        sizes="(max-width: 1024px) 100vw, 700px"
                      />

                      <div className="space-y-2 pt-2">
                        <Badge className="bg-white/10 text-sky-400 font-mono text-[10px]">
                          {featuredBlog.category?.name || 'CYBER DEFENSE'}
                        </Badge>

                        <Link href={`/blog/${featuredBlog.slug}`}>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-serif text-white group-hover:text-[#C6FF34] transition-colors leading-tight break-words">
                            {featuredBlog.title}
                          </h2>
                        </Link>

                        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed font-sans break-words">
                          {featuredBlog.excerpt || featuredBlog.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                            {featuredBlog.author?.user?.name?.[0] || 'M'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-bold text-white truncate">{featuredBlog.author?.user?.name || 'Faculty Mentor'}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {featuredBlog.publishedAt ? formatDate(featuredBlog.publishedAt) : 'Recent'}
                            </p>
                          </div>
                        </div>

                        <Link href={`/blog/${featuredBlog.slug}`} className="shrink-0">
                          <Button variant="ghost" size="sm" className="text-xs font-mono text-[#C6FF34] hover:text-[#b2eb2a] p-0 flex items-center gap-1">
                            Read Full Article <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </article>

                    {/* Popular Topics Rail */}
                    <div className="lg:col-span-5 bg-[#0a0a0d] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl flex flex-col justify-between min-w-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
                          <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 truncate">
                            <Flame className="w-4 h-4 text-amber-400 shrink-0" /> POPULAR &amp; TRENDING READS
                          </h2>
                          <span className="text-[10px] font-mono text-[#C6FF34] uppercase font-bold shrink-0">TOP PICKS</span>
                        </div>

                        <div className="divide-y divide-white/10">
                          {popularBlogs.slice(0, 4).map((post) => (
                            <article key={post.id} className="py-3 first:pt-1 last:pb-0 flex items-start justify-between gap-3 sm:gap-4 group min-w-0">
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                  <span className="text-[#C6FF34] font-bold uppercase truncate max-w-[120px]">{post.category?.name || 'Research'}</span>
                                  <span>·</span>
                                  <span className="shrink-0">{post.readingTime || 4}m read</span>
                                </div>

                                <Link href={`/blog/${post.slug}`}>
                                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug line-clamp-2 break-words">
                                    {post.title}
                                  </h3>
                                </Link>

                                <p className="text-[10px] font-mono text-slate-500 pt-0.5 truncate">
                                  By {post.author?.user?.name || 'Mentor'} · {post.publishedAt ? formatDate(post.publishedAt) : 'Recent'}
                                </p>
                              </div>

                              <Link
                                href={`/blog/${post.slug}`}
                                className="shrink-0 w-20 sm:w-24 aspect-[1080/711] overflow-hidden rounded-xl border border-white/10 group-hover:border-[#C6FF34]/50 transition-colors"
                              >
                                <BlogCoverImage blog={post} className="w-full h-full object-cover" hoverZoom />
                              </Link>
                            </article>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                        <span className="truncate">Curated by Lead Security Researchers</span>
                        <Link href="/courses" className="text-[#C6FF34] hover:underline flex items-center gap-1 font-bold shrink-0">
                          Explore Tracks →
                        </Link>
                      </div>
                    </div>
                  </section>
                )}

                {/* 2. Section: 🛡️ Cybersecurity Related */}
                {cyberBlogs.length > 0 && (
                  <section id="cybersecurity" className="space-y-4 sm:space-y-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-md bg-sky-500/20 text-sky-400 shrink-0">
                            <Shield className="w-4 h-4" />
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black font-serif text-white break-words">
                            Cybersecurity &amp; Defensive Engineering
                          </h2>
                          <Badge className="bg-sky-500/20 text-sky-300 font-mono text-[10px] shrink-0">
                            {cyberBlogs.length} Articles
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          Security operations center workflows, zero-day threat telemetry, ransomware containment, and defensive protocols.
                        </p>
                      </div>

                      <Link
                        href="/blog?category=cybersecurity"
                        className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold shrink-0 self-start sm:self-auto"
                      >
                        View Track <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {cyberBlogs.slice(0, 6).map((b) => (
                        <article
                          key={b.id}
                          className="bg-[#09090d] border border-white/10 hover:border-sky-400/40 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col justify-between group transition-all shadow-xl min-w-0"
                        >
                          <div className="space-y-3">
                            <BlogCoverImage
                              blog={b}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="flex items-center justify-between text-xs font-mono">
                              <Badge className="bg-sky-500/15 text-sky-300 font-bold border-none text-[10px]">
                                {b.category?.name || 'Cybersecurity'}
                              </Badge>
                              <span className="text-slate-400 text-[11px]">{b.readingTime || 4}m read</span>
                            </div>

                            <Link href={`/blog/${b.slug}`}>
                              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition-colors leading-snug line-clamp-2 break-words">
                                {b.title}
                              </h3>
                            </Link>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans break-words">
                              {b.excerpt || b.subtitle}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono gap-2">
                            <span className="text-slate-400 text-[11px] truncate max-w-[140px]">{b.author?.user?.name || 'Faculty Lead'}</span>
                            <Link href={`/blog/${b.slug}`} className="text-sky-400 font-bold flex items-center gap-1 hover:underline shrink-0">
                              Read <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Section: 🤖 Artificial Intelligence Related */}
                {aiBlogs.length > 0 && (
                  <section id="ai" className="space-y-4 sm:space-y-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-md bg-purple-500/20 text-purple-400 shrink-0">
                            <Cpu className="w-4 h-4" />
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black font-serif text-white break-words">
                            Artificial Intelligence &amp; Emerging Threat Horizons
                          </h2>
                          <Badge className="bg-purple-500/20 text-purple-300 font-mono text-[10px] shrink-0">
                            {aiBlogs.length} Articles
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          Large language model vulnerabilities, prompt injection mitigation, AI hallucinations, autonomous agents, and voice cloning defenses.
                        </p>
                      </div>

                      <Link
                        href="/blog?category=artificial-intelligence"
                        className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold shrink-0 self-start sm:self-auto"
                      >
                        View Track <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {aiBlogs.slice(0, 6).map((b) => (
                        <article
                          key={b.id}
                          className="bg-[#09090d] border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col justify-between group transition-all shadow-xl min-w-0"
                        >
                          <div className="space-y-3">
                            <BlogCoverImage
                              blog={b}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="flex items-center justify-between text-xs font-mono">
                              <Badge className="bg-purple-500/15 text-purple-300 font-bold border-none text-[10px]">
                                {b.category?.name || 'Artificial Intelligence'}
                              </Badge>
                              <span className="text-slate-400 text-[11px]">{b.readingTime || 4}m read</span>
                            </div>

                            <Link href={`/blog/${b.slug}`}>
                              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-400 transition-colors leading-snug line-clamp-2 break-words">
                                {b.title}
                              </h3>
                            </Link>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans break-words">
                              {b.excerpt || b.subtitle}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono gap-2">
                            <span className="text-slate-400 text-[11px] truncate max-w-[140px]">{b.author?.user?.name || 'AI Researcher'}</span>
                            <Link href={`/blog/${b.slug}`} className="text-purple-400 font-bold flex items-center gap-1 hover:underline shrink-0">
                              Read <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Section: 🚀 Career Guidance & Pathways */}
                {careerBlogs.length > 0 && (
                  <section id="career" className="space-y-4 sm:space-y-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
                            <Compass className="w-4 h-4" />
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black font-serif text-white break-words">
                            Career Guidance, Roadmaps &amp; Placement Strategies
                          </h2>
                          <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] shrink-0">
                            {careerBlogs.length} Articles
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">
                          From college classrooms to high-paying cybersecurity and AI roles: roadmaps, portfolio building, and interview preparation.
                        </p>
                      </div>

                      <Link
                        href="/blog?category=career"
                        className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold shrink-0 self-start sm:self-auto"
                      >
                        View Blueprints <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {careerBlogs.slice(0, 6).map((b) => (
                        <article
                          key={b.id}
                          className="bg-[#09090d] border border-white/10 hover:border-emerald-400/40 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col justify-between group transition-all shadow-xl min-w-0"
                        >
                          <div className="space-y-3">
                            <BlogCoverImage
                              blog={b}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="flex items-center justify-between text-xs font-mono">
                              <Badge className="bg-emerald-500/15 text-emerald-300 font-bold border-none text-[10px]">
                                {b.category?.name || 'Career Guidance'}
                              </Badge>
                              <span className="text-slate-400 text-[11px]">{b.readingTime || 4}m read</span>
                            </div>

                            <Link href={`/blog/${b.slug}`}>
                              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2 break-words">
                                {b.title}
                              </h3>
                            </Link>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans break-words">
                              {b.excerpt || b.subtitle}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono gap-2">
                            <span className="text-slate-400 text-[11px] truncate max-w-[140px]">{b.author?.user?.name || 'Career Mentor'}</span>
                            <Link href={`/blog/${b.slug}`} className="text-emerald-400 font-bold flex items-center gap-1 hover:underline shrink-0">
                              Read <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
