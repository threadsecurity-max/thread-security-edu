'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Shield,
  ShieldAlert,
  Brain,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface CourseLinkItem {
  title: string;
  href: string;
  isTrending?: boolean;
}

interface CourseCategoryColumn {
  title: string;
  theme: 'cyber' | 'ai';
  icon: any;
  headerColor: string;
  borderColor: string;
  badgeClass: string;
  hoverClass: string;
  courses: CourseLinkItem[];
}

const COURSES_DATA: CourseCategoryColumn[] = [
  {
    title: 'CYBER SECURITY & DEFENSE',
    theme: 'cyber',
    icon: ShieldAlert,
    headerColor: 'text-lime-600',
    borderColor: 'border-lime-200/80',
    badgeClass: 'bg-lime-400 text-black font-extrabold',
    hoverClass: 'hover:text-lime-700 hover:bg-lime-50/80',
    courses: [
      {
        title: 'Cyber Security Masterclass',
        href: '/courses/cyber-security-course',
        isTrending: true,
      },
      {
        title: 'Ethical Hacking & Pentesting',
        href: '/courses/cyber-security-course',
        isTrending: true,
      },
      {
        title: 'Web Application Security (VAPT)',
        href: '/courses/web-application-security-vapt',
        isTrending: true,
      },
      {
        title: 'Cloud DevSecOps & AWS Hardening',
        href: '/courses/cloud-security-devsecops',
        isTrending: true,
      },
      {
        title: 'Active Directory & Red Teaming',
        href: '/courses/active-directory-exploitation',
      },
      {
        title: 'Mobile App Security (iOS & Android)',
        href: '/courses/mobile-application-penetration-testing',
      },
      {
        title: 'API Security & Microservices Exploitation',
        href: '/courses/api-security-microservices-exploitation',
      },
      {
        title: 'Bug Bounty Hunting Program',
        href: '/courses/cyber-security-course',
        isTrending: true,
      },
      {
        title: 'Binary Exploitation & Reversing',
        href: '/courses/binary-exploitation-reverse-engineering',
      },
      {
        title: 'Linux for Ethical Hackers & Forensics',
        href: '/courses/cyber-security-course',
      },
    ],
  },
  {
    title: 'ARTIFICIAL INTELLIGENCE & AGENTS',
    theme: 'ai',
    icon: Brain,
    headerColor: 'text-violet-600',
    borderColor: 'border-violet-100',
    badgeClass: 'bg-violet-600 text-white font-extrabold',
    hoverClass: 'hover:text-violet-700 hover:bg-violet-50/80',
    courses: [
      {
        title: 'Artificial Intelligence Masterclass',
        href: '/courses/agentic-ai-engineering',
        isTrending: true,
      },
      {
        title: 'Agentic AI Engineering & Production',
        href: '/courses/agentic-ai-engineering',
        isTrending: true,
      },
      {
        title: 'Generative AI & LLM Systems',
        href: '/courses/ai-security-llm-redteaming',
        isTrending: true,
      },
      {
        title: 'Machine Learning & Deep Learning',
        href: '/courses/data-science-ml-security',
      },
      {
        title: 'Data Science & Predictive Modeling',
        href: '/courses/data-science-ml-security',
      },
      {
        title: 'Autonomous Tool-Calling Agents',
        href: '/courses/agentic-ai-engineering',
      },
      {
        title: 'High-Throughput Edge AI & Quantization',
        href: '/courses/edge-ai-quantization-hardware-tuning',
      },
      {
        title: 'Python for AI & Data Pipelines',
        href: '/courses/data-science-ml-security',
      },
    ],
  },
  {
    title: 'AI SECURITY & GOVERNANCE',
    theme: 'ai',
    icon: Lock,
    headerColor: 'text-violet-600',
    borderColor: 'border-violet-100',
    badgeClass: 'bg-violet-600 text-white font-extrabold',
    hoverClass: 'hover:text-violet-700 hover:bg-violet-50/80',
    courses: [
      {
        title: 'AI Security & LLM Red Teaming',
        href: '/courses/ai-security-llm-redteaming',
        isTrending: true,
      },
      {
        title: 'RAG Security & Vector DB Defense',
        href: '/courses/rag-vulnerability-analysis',
        isTrending: true,
      },
      {
        title: 'Enterprise AI Governance & Guardrails',
        href: '/courses/enterprise-ai-governance-guardrails',
      },
      {
        title: 'Model Inversion & Stealing Defense',
        href: '/courses/model-inversion-extraction-defense',
      },
      {
        title: 'Prompt Injection & Jailbreak Defense',
        href: '/courses/ai-security-llm-redteaming',
        isTrending: true,
      },
      {
        title: 'Computer Vision & Deepfake Intel',
        href: '/courses/computer-vision-multimodal-threat-intel',
      },
      {
        title: 'Adversarial ML & Evasion Attacks',
        href: '/courses/data-science-ml-security',
      },
      {
        title: 'AI Safety & Dual-LLM Moderation',
        href: '/courses/enterprise-ai-governance-guardrails',
      },
    ],
  },
];

export function CoursesMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key
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

  const isCoursesActive = pathname.startsWith('/courses');

  return (
    <div
      ref={menuRef}
      className="relative flex items-center h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button with Dual Lime & Violet Active Indicator Line */}
      <div className="relative py-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 cursor-pointer focus:outline-none ${
            isOpen || isCoursesActive
              ? 'text-slate-900 font-bold'
              : 'text-slate-700 hover:text-black'
          }`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          id="courses-mega-menu-trigger"
        >
          <span>Courses</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-violet-600' : 'text-slate-500'
            }`}
          />
        </button>

        {/* Active Underline: Lime for Cyber + Violet for AI */}
        {(isOpen || isCoursesActive) && (
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lime-400 via-lime-500 to-violet-600 rounded-full transition-all duration-200" />
        )}
      </div>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          role="region"
          aria-labelledby="courses-mega-menu-trigger"
          className="fixed left-0 right-0 top-[4.25rem] w-screen px-4 sm:px-8 lg:px-12 z-[100] pointer-events-none"
        >
          <div className="max-w-[1320px] mx-auto pointer-events-auto">
            <div
              style={{ backgroundColor: '#ffffff' }}
              className="bg-white rounded-2xl border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              
              {/* 3 Specialized Columns: Cyber in Lime, AI in Violet (SOC removed) */}
              <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                {COURSES_DATA.map((col, idx) => (
                  <div key={idx} className="space-y-4">
                    
                    {/* Column Heading */}
                    <div className={`flex items-center gap-2 border-b ${col.borderColor} pb-2.5`}>
                      <col.icon className={`w-4 h-4 ${col.headerColor} shrink-0`} />
                      <h3 className={`text-xs sm:text-[13px] font-extrabold ${col.headerColor} tracking-wider uppercase font-mono`}>
                        {col.title}
                      </h3>
                    </div>

                    {/* Courses List */}
                    <ul className="space-y-2">
                      {col.courses.map((course, cIdx) => (
                        <li key={cIdx}>
                          <Link
                            href={course.href}
                            onClick={() => setIsOpen(false)}
                            className={`group flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg text-[13px] text-slate-700 ${col.hoverClass} font-medium transition-all duration-150`}
                          >
                            <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">
                              {course.title}
                            </span>

                            {course.isTrending && (
                              <span className={`shrink-0 text-[10px] ${col.badgeClass} px-2 py-0.5 rounded-full shadow-xs tracking-tight`}>
                                Trending
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>

                  </div>
                ))}
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                    <span className="text-slate-800 font-semibold">Cybersecurity:</span>
                    <span>100% Practical Sandboxed Cloud Labs</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                    <span className="text-slate-800 font-semibold">Artificial Intelligence:</span>
                    <span>Agentic AI & LLM Red Teaming</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <Link
                    href="/courses?track=cyber"
                    onClick={() => setIsOpen(false)}
                    className="text-lime-700 hover:text-lime-800 transition-colors"
                  >
                    Cybersecurity Track
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href="/courses?track=ai"
                    onClick={() => setIsOpen(false)}
                    className="text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    AI Systems Track
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href="/courses"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-slate-900 hover:text-violet-600 transition-colors font-extrabold"
                  >
                    <span>View All 16+ Masterclasses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
