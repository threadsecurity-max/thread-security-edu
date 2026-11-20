'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckSquare, Sparkles } from 'lucide-react';

interface SubNavItem {
  id: string;
  label: string;
  shortLabel?: string;
  isSpecial?: boolean;
}

const SUB_NAV_ITEMS: SubNavItem[] = [
  { id: 'who-we-are', label: 'Who We Are' },
  { id: 'our-story', label: 'Our Story' },
  { id: 'mission-vision', label: 'Mission & Vision' },
  { id: 'what-we-bring', label: 'Our Approach' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'verification', label: 'Verify Us', isSpecial: true },
  { id: 'transparency', label: 'Transparency' },
  { id: 'checklist', label: '10-Point Checklist' },
  { id: 'principles', label: 'Principles' },
  { id: 'faqs', label: 'FAQs' },
];

export function AboutSubNav() {
  const [activeId, setActiveId] = useState<string>('who-we-are');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = SUB_NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = SUB_NAV_ITEMS[i];
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <aside
      aria-label="About Page Navigation"
      className="sticky top-[4.25rem] z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {SUB_NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollTo(e, item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? item.isSpecial
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                        : 'bg-white/10 text-white border border-white/20 shadow-xs'
                      : item.isSpecial
                      ? 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.isSpecial && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Quick jump to pre-enrolment checklist */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 shrink-0">
            <a
              href="#checklist"
              onClick={(e) => scrollTo(e, 'checklist')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400/10 hover:bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-mono font-bold tracking-tight transition-all cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-lime-400" />
              <span>Pre-Enrollment Checklist</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
