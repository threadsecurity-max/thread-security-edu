'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Code2, Briefcase, Share2, Newspaper, ChevronDown, Sparkles } from 'lucide-react';

export function MoreDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms grace period so dropdown doesn't snap shut when cursor moves
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3.5 py-1.5 rounded-full text-sm font-bold tracking-tight text-neutral-600 hover:text-black transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>More</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-2 w-56 z-50">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-xl p-2 transition-all">
            <Link
              href="/workshops"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm text-black"
            >
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>Workshop Gallery</span>
            </Link>

            <Link
              href="/contact?topic=success-stories"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm text-black"
            >
              <Code2 className="w-4 h-4 text-black shrink-0" />
              <span>Success Stories</span>
            </Link>

            {/* <Link
              href="/placements"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm text-black"
            >
              <Briefcase className="w-4 h-4 text-black shrink-0" />
              <span>Placement Highlights</span>
            </Link> */}

            {/* <Link
              href="/contact?topic=hiring"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm text-black"
            >
              <Share2 className="w-4 h-4 text-black shrink-0" />
              <span>Hire From Us</span>
            </Link> */}

            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm text-black"
            >
              <Newspaper className="w-4 h-4 text-black shrink-0" />
              <span>Blogs</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
