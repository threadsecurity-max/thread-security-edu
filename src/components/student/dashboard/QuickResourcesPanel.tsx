'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { FileText, Download, ExternalLink, BookOpen } from 'lucide-react';

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  courseTitle: string;
  url: string;
}

export function QuickResourcesPanel({
  resources,
}: {
  resources: ResourceItem[];
}) {
  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#C6FF34]" />
          QUICK RESOURCES
        </span>
        <span className="text-[10px] font-mono text-zinc-500">Curated Materials</span>
      </div>

      {resources.length === 0 ? (
        <div className="space-y-2 py-2">
          <p className="text-xs text-zinc-500 font-mono">
            Default sandbox reference guides & OWASP summaries.
          </p>
          <a
            href="https://owasp.org/www-project-top-ten/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white text-xs transition-colors"
          >
            <span className="truncate">OWASP Top 10 Security Reference</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C6FF34] shrink-0" />
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.slice(0, 4).map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all text-xs group"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <span className="font-semibold text-white group-hover:text-[#C6FF34] transition-colors block truncate">
                  {res.title}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 block truncate">
                  {res.type} • {res.courseTitle}
                </span>
              </div>
              <Download className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#C6FF34] shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
