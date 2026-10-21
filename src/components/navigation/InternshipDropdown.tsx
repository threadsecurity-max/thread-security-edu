'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface TrainingProgram {
  title: string;
  durationLabel: string;
  href: string;
  description: string;
  isTrending?: boolean;
  highlight: string;
}

const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    title: '45 Days Training',
    durationLabel: '45 Days / 6 Weeks',
    href: '/internship-training?duration=45-days',
    description: 'Summer & Winter training for B.Tech, BCA, MCA. Hands-on labs & university project letter.',
    isTrending: true,
    highlight: 'Summer / Winter Batches',
  },
  {
    title: '3 Months Industrial Internship',
    durationLabel: '90 Days / 3 Months',
    href: '/internship-training?duration=3-months',
    description: 'Deep-dive into Offensive VAPT, Splunk SIEM & Production Agentic AI with live lab exercises.',
    isTrending: true,
    highlight: 'Mid-Semester Project',
  },
  {
    title: '6 Months Industrial Training & Internship',
    durationLabel: '6 Months Full Semester',
    href: '/internship-training?duration=6-months',
    description: 'Enterprise capstone project, real-world incident response, sandboxed range & 100% placement support.',
    isTrending: true,
    highlight: 'Placement & University NOC',
  },
];

export function InternshipDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const isTrainingActive = pathname.startsWith('/internship-training');

  return (
    <div
      ref={dropdownRef}
      className="relative flex items-center h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button with Active Indicator Line */}
      <div className="relative py-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 cursor-pointer focus:outline-none ${
            isOpen || isTrainingActive
              ? 'text-slate-900 font-bold'
              : 'text-slate-700 hover:text-black'
          }`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          id="internship-dropdown-trigger"
        >
          <span>Internship & Training</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-violet-600' : 'text-slate-500'
            }`}
          />
        </button>

        {/* Active Underline matching Lime for Cyber and Violet for AI */}
        {(isOpen || isTrainingActive) && (
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lime-400 via-lime-500 to-violet-600 rounded-full transition-all duration-200" />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="region"
          aria-labelledby="internship-dropdown-trigger"
          className="absolute top-full left-0 pt-2 w-[340px] sm:w-[400px] z-[100] pointer-events-auto"
        >
          <div
            style={{ backgroundColor: '#ffffff', opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            
            {/* Header info */}
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-lime-600" />
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  Industrial Training
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-900 bg-lime-100 border border-lime-300/80 px-2 py-0.5 rounded-full">
                UGC / AICTE Aligned
              </span>
            </div>

            {/* Program Items */}
            <div className="p-3 space-y-1.5 bg-white">
              {TRAINING_PROGRAMS.map((program, idx) => (
                <Link
                  key={idx}
                  href={program.href}
                  onClick={() => setIsOpen(false)}
                  className="group block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {program.title}
                    </span>
                    {program.isTrending && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs tracking-tight shrink-0 ${
                        idx === 0
                          ? 'bg-lime-400 text-black'
                          : idx === 1
                          ? 'bg-violet-600 text-white'
                          : 'bg-gradient-to-r from-lime-400 to-violet-600 text-black'
                      }`}>
                        Trending
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-snug line-clamp-2 mb-2 font-normal">
                    {program.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Clock className="w-3 h-3 text-lime-600" />
                      <span>{program.durationLabel}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">
                      {program.highlight}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Footer Action */}
            <div className="bg-slate-50 border-t border-slate-100 p-3 text-center">
              <Link
                href="/internship-training"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>View All Training & Internship Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
