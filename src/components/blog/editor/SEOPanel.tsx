'use client';

import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Globe,
  Smartphone,
  Monitor,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SEOPanelProps {
  title: string;
  subtitle: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  coverImageId?: string | null;
  onUpdateSEO: (seoData: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    keywords?: string[];
  }) => void;
}

const INTERNAL_LINK_SUGGESTIONS = [
  { text: 'Certified SOC Analyst Masterclass', url: '/courses/soc-analyst', topic: 'SOC, Blue Team, SIEM' },
  { text: 'Practical Ethical Hacking & Pentesting', url: '/courses/ethical-hacking', topic: 'Red Team, Exploits, Kali' },
  { text: 'AI-Powered Threat Detection Track', url: '/courses/ai-security', topic: 'AI, LLM Security, Machine Learning' },
  { text: 'Verify Student Certificate Portal', url: '/verify-certificate', topic: 'Credentials, Verification' },
];

export function SEOPanel({
  title,
  subtitle,
  content,
  metaTitle,
  metaDescription,
  focusKeyword,
  coverImageId,
  onUpdateSEO,
}: SEOPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Clean text and calculate metrics
  const keyword = (focusKeyword || '').trim().toLowerCase();
  const textContent = (content || '').replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const first150Words = textContent.toLowerCase().split(/\s+/).slice(0, 150).join(' ');
  const keywordInIntro = Boolean(keyword && first150Words.includes(keyword));
  const keywordInDesc = Boolean(keyword && (metaDescription || '').toLowerCase().includes(keyword));

  // Slug simulation
  const simulatedSlug = title
    ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 45)
    : 'article-slug';

  const previewTitle = metaTitle || (title ? `${title} | Thread Security Education` : 'Article Title | Thread Security');
  const previewDescription =
    metaDescription ||
    subtitle ||
    (textContent.slice(0, 150) ? `${textContent.slice(0, 150)}...` : 'Comprehensive cybersecurity research and practical editorial from Thread Security Education.');

  // Advanced Google Ranking Checks
  const checks = [
    {
      id: 'keyword-set',
      label: 'Primary Focus Keyword Defined',
      passed: Boolean(keyword),
      tip: 'Set a target keyword e.g. "Zero Trust Architecture".',
    },
    {
      id: 'keyword-title',
      label: 'Focus Keyword in Title',
      passed: Boolean(keyword && title.toLowerCase().includes(keyword)),
      tip: 'Include focus keyword naturally in the title.',
    },
    {
      id: 'keyword-intro',
      label: 'Focus Keyword in First 150 Words',
      passed: keywordInIntro,
      tip: 'Google values early keyword occurrence in the introduction.',
    },
    {
      id: 'keyword-desc',
      label: 'Focus Keyword in Meta Description',
      passed: keywordInDesc,
      tip: 'Keyword in description boosts Google CTR by matching user queries.',
    },
    {
      id: 'meta-title-length',
      label: 'Meta Title Length (40–60 chars)',
      passed: metaTitle.length >= 40 && metaTitle.length <= 60,
      tip: `Current length: ${metaTitle.length}/60 chars (aim for 40-60).`,
    },
    {
      id: 'meta-desc-length',
      label: 'Meta Description Length (120–158 chars)',
      passed: metaDescription.length >= 120 && metaDescription.length <= 158,
      tip: `Current length: ${metaDescription.length}/158 chars (aim for 120-158).`,
    },
    {
      id: 'word-count',
      label: 'Technical Depth (500+ words)',
      passed: wordCount >= 500,
      tip: `Current word count: ${wordCount} words (minimum 500 for ranking).`,
    },
    {
      id: 'featured-image',
      label: '1080×711 Hero Cover Image',
      passed: Boolean(coverImageId),
      tip: 'Featured cover image enables Google Discover and rich snippets.',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const seoScore = Math.round((passedCount / checks.length) * 100);

  // Smart Heuristic SEO Generator (Instant 1-Click Optimization)
  const handleSmartAutoFill = () => {
    let kw = focusKeyword;
    if (!kw && title) {
      const clean = title.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
      kw = clean.slice(0, 3).join(' ');
    }
    if (!kw) kw = 'Cybersecurity Research';

    // Generate optimal title (45-60 chars)
    let generatedTitle = title ? `${title} | TSE` : `${kw} Guide | Thread Security`;
    if (generatedTitle.length > 60) {
      generatedTitle = generatedTitle.slice(0, 57).trim() + '...';
    }

    // Generate optimal description (130-155 chars)
    let generatedDesc = subtitle || textContent.slice(0, 140);
    if (!generatedDesc || generatedDesc.length < 50) {
      generatedDesc = `Explore in-depth technical analysis and best practices on ${kw}. Practical cybersecurity insights by Thread Security Education faculty.`;
    } else if (!generatedDesc.toLowerCase().includes(kw.toLowerCase())) {
      generatedDesc = `${kw}: ${generatedDesc}`;
    }
    if (generatedDesc.length > 155) {
      generatedDesc = generatedDesc.slice(0, 152).trim() + '...';
    }

    onUpdateSEO({
      metaTitle: generatedTitle,
      metaDescription: generatedDesc,
      focusKeyword: kw,
    });
  };

  const copyInternalLink = (markdown: string, id: string) => {
    navigator.clipboard.writeText(markdown);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-white">
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 bg-[#141414] border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#C6FF34]/10 text-[#C6FF34]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              GOOGLE SEARCH OPTIMIZER & AUDIT
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Est. Read: {readingTime} min · {wordCount} words
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  seoScore >= 80 ? 'bg-[#C6FF34]' : seoScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                seoScore >= 80 ? 'bg-[#C6FF34]/20 text-[#C6FF34]' : seoScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {seoScore}%
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-6 text-xs font-mono">
          {/* Quick Auto-Fill Action */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-white/10">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C6FF34]" /> Smart SEO Assistant
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Auto-generate optimal Meta Title & Description with 1 click</p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleSmartAutoFill}
              className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-bold text-[11px] h-8 px-3 rounded-lg"
            >
              Auto-Optimize
            </Button>
          </div>

          {/* Google SERP Snippet Simulator */}
          <div className="p-4 bg-[#0a0a0a] border border-white/15 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#C6FF34]" /> GOOGLE SEARCH SNIPPET SIMULATOR
              </span>
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setSerpView('desktop')}
                  className={`p-1 rounded text-xs ${serpView === 'desktop' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setSerpView('mobile')}
                  className={`p-1 rounded text-xs ${serpView === 'mobile' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Simulated Google SERP Card */}
            <div className={`space-y-1 font-sans ${serpView === 'mobile' ? 'max-w-xs' : 'max-w-md'}`}>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-[#C6FF34]">
                  TS
                </div>
                <span className="text-slate-300 font-medium">Thread Security Education</span>
                <span className="text-slate-500">› blog › {simulatedSlug}</span>
              </div>

              <h4 className="text-base text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-2 font-normal">
                {previewTitle}
              </h4>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {previewDescription}
              </p>
            </div>
          </div>

          {/* Focus Keyword Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">
              Primary Focus Keyword *
            </label>
            <Input
              value={focusKeyword}
              onChange={(e) =>
                onUpdateSEO({
                  metaTitle,
                  metaDescription,
                  focusKeyword: e.target.value,
                })
              }
              placeholder="e.g. AI Threat Detection"
              className="bg-[#181818] border-white/10 text-white focus:border-[#C6FF34]"
            />
          </div>

          {/* Meta Title & Meta Description Inputs */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-300 font-bold uppercase">Google Meta Title (40–60 chars)</label>
                <span className={`font-mono font-bold ${
                  metaTitle.length >= 40 && metaTitle.length <= 60
                    ? 'text-[#C6FF34]'
                    : metaTitle.length > 60
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {metaTitle.length}/60 chars
                </span>
              </div>
              <Input
                value={metaTitle}
                onChange={(e) =>
                  onUpdateSEO({
                    metaTitle: e.target.value,
                    metaDescription,
                    focusKeyword,
                  })
                }
                placeholder="Catchy headline optimized for Google search"
                className="bg-[#181818] border-white/10 text-white focus:border-[#C6FF34]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-300 font-bold uppercase">Google Meta Description (120–158 chars)</label>
                <span className={`font-mono font-bold ${
                  metaDescription.length >= 120 && metaDescription.length <= 158
                    ? 'text-[#C6FF34]'
                    : metaDescription.length > 158
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {metaDescription.length}/158 chars
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) =>
                  onUpdateSEO({
                    metaTitle,
                    metaDescription: e.target.value,
                    focusKeyword,
                  })
                }
                rows={2}
                placeholder="Action-oriented summary enticing Google users to click..."
                className="w-full p-2.5 rounded-lg bg-[#181818] border border-white/10 text-white focus:border-[#C6FF34] focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Internal Link Equity Booster */}
          <div className="p-3 bg-[#141414] border border-white/10 rounded-xl space-y-2">
            <span className="text-[10px] text-[#C6FF34] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> INTERNAL LINK EQUITY BOOSTER
            </span>
            <p className="text-[10px] text-slate-400">
              Linking to TSE course tracks inside your blog passes domain authority and boosts Google rankings:
            </p>
            <div className="space-y-1.5 pt-1">
              {INTERNAL_LINK_SUGGESTIONS.map((link, idx) => {
                const markdown = `[${link.text}](${link.url})`;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#C6FF34]/40 transition-colors"
                  >
                    <div>
                      <p className="text-xs text-white font-bold">{link.text}</p>
                      <p className="text-[9px] text-slate-400">{link.topic} · {link.url}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => copyInternalLink(markdown, `link-${idx}`)}
                      className="h-7 px-2 text-[10px] text-[#C6FF34] hover:bg-white/10"
                    >
                      {copiedLink === `link-${idx}` ? (
                        <>
                          <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" /> Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEO Checklist */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              GOOGLE RANKING AUDIT ({passedCount}/{checks.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {checks.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                    item.passed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-[11px]">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
