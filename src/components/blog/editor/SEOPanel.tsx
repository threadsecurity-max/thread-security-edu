'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
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
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // Analyze SEO parameters
  const keyword = (focusKeyword || '').trim().toLowerCase();
  const textContent = (content || '').replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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
      id: 'meta-title-length',
      label: 'Meta Title Length (30–60 chars)',
      passed: metaTitle.length >= 30 && metaTitle.length <= 60,
      tip: `Current length: ${metaTitle.length} chars (aim for 30-60).`,
    },
    {
      id: 'meta-desc-length',
      label: 'Meta Description Length (100–160 chars)',
      passed: metaDescription.length >= 100 && metaDescription.length <= 160,
      tip: `Current length: ${metaDescription.length} chars (aim for 100-160).`,
    },
    {
      id: 'word-count',
      label: 'Substantial Word Count (300+ words)',
      passed: wordCount >= 300,
      tip: `Current word count: ${wordCount} words.`,
    },
    {
      id: 'featured-image',
      label: '1080×711 Cover Image Uploaded',
      passed: Boolean(coverImageId),
      tip: 'Featured cover image improves social sharing CTR.',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const seoScore = Math.round((passedCount / checks.length) * 100);

  // Keyword Factory Suggestions based on title
  const generateKeywordSuggestions = () => {
    if (!title) return ['cybersecurity', 'threat intelligence', 'SOC operations', 'cloud security'];
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = cleanTitle.split(/\s+/).filter((w) => w.length > 3);
    const main = words.slice(0, 3).join(' ');

    return [
      main || 'cybersecurity defense',
      `${words[0] || 'cyber'} best practices`,
      `${words[0] || 'security'} guide 2026`,
      'threat intelligence',
      'SOC automation',
    ];
  };

  const suggestions = generateKeywordSuggestions();

  const handleCopySuggestion = (kw: string) => {
    onUpdateSEO({
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || subtitle,
      focusKeyword: kw,
    });
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-xl text-white">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 bg-[#141414] border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#C6FF34]/10 text-[#C6FF34]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              SEO KEYWORD FACTORY & SCORE
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Estimated Read: {readingTime} min ({wordCount} words)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-20 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  seoScore >= 80 ? 'bg-emerald-400' : seoScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                seoScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : seoScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {seoScore}/100
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-5 text-xs font-mono">
          {/* Focus Keyword Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">
              Focus Keyword / Primary Subject
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

          {/* Keyword Factory Suggestions */}
          <div className="p-3 bg-[#141414] border border-white/10 rounded-xl space-y-2">
            <span className="text-[10px] text-[#C6FF34] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> SUGGESTED KEYWORDS
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestions.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleCopySuggestion(kw)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C6FF34] hover:text-black border border-white/10 text-[11px] text-slate-300 transition-all flex items-center gap-1 group"
                >
                  <span>{kw}</span>
                  {copiedKeyword === kw ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Meta Title & Meta Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-300 font-bold uppercase">Meta Title</label>
                <span className={metaTitle.length > 60 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {metaTitle.length}/60
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
                placeholder="Title formatted for Google search result"
                className="bg-[#181818] border-white/10 text-white focus:border-[#C6FF34]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <label className="text-slate-300 font-bold uppercase">Meta Description</label>
                <span className={metaDescription.length > 160 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {metaDescription.length}/160
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
                placeholder="Concise 1-2 sentence snippet for search engine previews..."
                className="w-full p-2.5 rounded-lg bg-[#181818] border border-white/10 text-white focus:border-[#C6FF34] focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              SEO CRITERIA CHECKLIST ({passedCount}/{checks.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {checks.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    item.passed ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
