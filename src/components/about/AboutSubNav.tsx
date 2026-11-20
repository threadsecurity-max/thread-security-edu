'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckSquare } from 'lucide-react';

interface SubNavItem {
  id: string;
  label: string;
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
      className="sticky top-[4.25rem] z-30 bg-black/90 backdrop-blur-md border-b border-zinc-850 transition-all"
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
                      ? 'bg-white text-black font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {item.isSpecial && <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Quick jump to pre-enrolment checklist */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-800 shrink-0">
            <a
              href="#checklist"
              onClick={(e) => scrollTo(e, 'checklist')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-500 text-xs font-mono font-bold tracking-tight transition-all cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-zinc-300" />
              <span>Pre-Enrollment Checklist</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
