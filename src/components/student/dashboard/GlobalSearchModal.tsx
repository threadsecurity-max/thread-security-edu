'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Layers, Cpu, FileText, ArrowRight, Loader2 } from 'lucide-react';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    courses: any[];
    modules: any[];
    assessments: any[];
    resources: any[];
  }>({
    courses: [],
    modules: [],
    assessments: [],
    resources: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults({ courses: [], modules: [], assessments: [], resources: [] });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ courses: [], modules: [], assessments: [], resources: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success && json.results) {
          setResults(json.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasAnyResults =
    results.courses.length > 0 ||
    results.modules.length > 0 ||
    results.assessments.length > 0 ||
    results.resources.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#080B09] border border-white/[0.14] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/[0.1] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C6FF34] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, modules, exams, or resources..."
            className="w-full bg-transparent text-white placeholder-zinc-500 font-sans text-sm sm:text-base outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#C6FF34] animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-5 text-sm">
          {query.trim().length >= 2 && !loading && !hasAnyResults && (
            <div className="p-8 text-center space-y-1">
              <p className="text-zinc-400 font-medium">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-zinc-600 font-mono">
                Try searching by course topic, module title, or CVE term.
              </p>
            </div>
          )}

          {/* Courses Category */}
          {results.courses.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                COURSES ({results.courses.length})
              </span>
              <div className="space-y-1">
                {results.courses.map((c) => (
                  <Link
                    key={c.id}
                    href={c.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-[#C6FF34] shrink-0" />
                      <div>
                        <span className="text-white font-medium group-hover:text-[#C6FF34] transition-colors block">
                          {c.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">{c.category}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Modules Category */}
          {results.modules.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                MODULES & SYLLABUS ({results.modules.length})
              </span>
              <div className="space-y-1">
                {results.modules.map((m) => (
                  <Link
                    key={m.id}
                    href={m.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-white font-medium group-hover:text-[#C6FF34] transition-colors block">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">{m.courseTitle}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assessments Category */}
          {results.assessments.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                ASSESSMENTS & TESTS ({results.assessments.length})
              </span>
              <div className="space-y-1">
                {results.assessments.map((a) => (
                  <Link
                    key={a.id}
                    href={a.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-white font-medium group-hover:text-[#C6FF34] transition-colors block">
                          {a.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">{a.courseTitle}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Resources Category */}
          {results.resources.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                NOTES & RESOURCES ({results.resources.length})
              </span>
              <div className="space-y-1">
                {results.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <span className="text-white font-medium group-hover:text-[#C6FF34] transition-colors block">
                          {r.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">{r.type}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Navigate with Enter • ESC to dismiss</span>
          <span>Thread Security Global Search</span>
        </div>
      </div>
    </div>
  );
}
