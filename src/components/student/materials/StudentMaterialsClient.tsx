'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  FileCode,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Download,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface StudentResourceItem {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  createdAt: string | Date;
  batch?: {
    id: string;
    batchCode: string;
    title: string;
  } | null;
}

export function StudentMaterialsClient({
  initialResources,
}: {
  initialResources: StudentResourceItem[];
}) {
  const [resources] = useState<StudentResourceItem[]>(initialResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getResourceTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CODE':
      case 'SCRIPT':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'SPREADSHEET':
        return <FileSpreadsheet className="w-5 h-5 text-amber-400" />;
      case 'CHEATSHEET':
      case 'SLIDES':
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      default:
        return <FileText className="w-5 h-5 text-[#C6FF34]" />;
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.batch && r.batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedTypeFilter === 'ALL' || r.resourceType.toUpperCase() === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 text-white font-mono">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF34]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/30 uppercase">
              FACULTY STUDY VAULT
            </span>
            <span className="text-xs text-zinc-400">
              TACTICAL CURRICULUM ASSETS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Cohort Study Materials &amp; Resources
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Reference lecture slide decks, offensive security cheatsheets, lab commands, and supplementary guides published directly by faculty mentors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center font-mono min-w-[120px]">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">AVAILABLE</span>
            <span className="text-2xl font-extrabold text-[#C6FF34] block mt-0.5">
              {resources.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study guides, cheatsheets, slides..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF34]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400">Type:</span>
          {['ALL', 'PDF', 'SLIDES', 'CODE', 'CHEATSHEET', 'LINK'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                selectedTypeFilter === type
                  ? 'bg-[#C6FF34] text-black border-[#C6FF34]'
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── MATERIALS GRID ── */}
      {filteredResources.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-serif font-bold text-white">No study materials found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Your assigned mentors will publish slide presentations, PDFs, and cheatsheets as you progress through your cohort curriculum.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-3xl bg-[#0b0d12] hover:bg-[#10131a] border border-white/[0.08] hover:border-[#C6FF34]/30 transition-all backdrop-blur-xl flex flex-col justify-between space-y-5 group shadow-xl hover:shadow-2xl hover:scale-[1.01]"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 uppercase font-mono">
                    {res.resourceType}
                  </span>

                  {res.batch && (
                    <span className="text-[11px] font-mono text-zinc-400">
                      {res.batch.batchCode}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {getResourceTypeIcon(res.resourceType)}
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                      {res.title}
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono block pt-0.5">
                      Added: {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {res.description && (
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopy(res.id, res.url)}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  title="Copy link"
                >
                  {copiedId === res.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#C6FF34]" />
                      <span className="text-[10px] text-[#C6FF34]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_2px_12px_rgba(198,255,52,0.2)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>View Material ↗</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
