'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Shield,
  ShieldAlert,
  Terminal,
  Cpu,
  Brain,
  Bot,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Network,
  Bug,
  FileCode2,
  Database,
  Radio,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface CourseLinkItem {
  title: string;
  href: string;
  isTrending?: boolean;
  isNew?: boolean;
}

interface CourseCategoryColumn {
  title: string;
  icon: any;
  accentColor: string;
  badgeBg: string;
  courses: CourseLinkItem[];
}

const COURSES_DATA: CourseCategoryColumn[] = [
  {
    title: 'CYBER SECURITY & OFFENSE',
    icon: ShieldAlert,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-600',
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
        title: 'Active Directory & Red Teaming',
        href: '/courses/active-directory-exploitation',
      },
      {
        title: 'Mobile App Security (iOS & Android)',
        href: '/courses/mobile-application-penetration-testing',
      },
      {
        title: 'API Security & Microservices',
        href: '/courses/api-security-microservices-exploitation',
      },
      {
        title: 'Linux for Ethical Hackers',
        href: '/courses/cyber-security-course',
      },
      {
        title: 'Bug Bounty Hunting Program',
        href: '/courses/cyber-security-course',
        isTrending: true,
      },
    ],
  },
  {
    title: 'SOC & CLOUD DEFENSE',
    icon: Shield,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-600',
    courses: [
      {
        title: 'SOC Operations & Threat Hunting',
        href: '/courses/soc-blue-team-operations',
        isTrending: true,
      },
      {
        title: 'Cloud DevSecOps & AWS Hardening',
        href: '/courses/cloud-security-devsecops',
      },
      {
        title: 'Splunk SIEM Enterprise Defense',
        href: '/courses/soc-blue-team-operations',
        isTrending: true,
      },
      {
        title: 'Binary Exploitation & Reversing',
        href: '/courses/binary-exploitation-reverse-engineering',
      },
      {
        title: 'Industrial OT / ICS & SCADA Defense',
        href: '/courses/ot-ics-critical-infrastructure-security',
      },
      {
        title: 'Malware Analysis & Incident Triage',
        href: '/courses/cyber-security-course',
      },
      {
        title: 'Network Packet Forensics (Wireshark)',
        href: '/courses/soc-blue-team-operations',
      },
      {
        title: 'Cryptographic TS-ID Security',
        href: '/verify-certificate',
      },
    ],
  },
  {
    title: 'ARTIFICIAL INTELLIGENCE & AGENTS',
    icon: Brain,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-600',
    courses: [
      {
        title: 'Artificial Intelligence Masterclass',
        href: '/courses/agentic-ai-engineering',
        isTrending: true,
      },
      {
        title: 'Agentic AI Engineering & Systems',
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
    icon: Lock,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-600',
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
        title: 'AI Safety & Dual-LLM Guardrails',
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
      {/* Trigger Button with Active Indicator Line matching Reference */}
      <div className="relative py-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 cursor-pointer focus:outline-none ${
            isOpen || isCoursesActive
              ? 'text-blue-600 font-bold'
              : 'text-slate-700 hover:text-blue-600'
          }`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          id="courses-mega-menu-trigger"
        >
          <span>Courses</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : 'text-slate-500'
            }`}
          />
        </button>

        {/* Active Underline matching reference screenshot */}
        {(isOpen || isCoursesActive) && (
          <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full transition-all duration-200" />
        )}
      </div>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          role="region"
          aria-labelledby="courses-mega-menu-trigger"
          className="fixed left-0 right-0 top-[4.25rem] w-screen px-4 sm:px-8 lg:px-12 z-[100] pointer-events-none"
        >
          <div className="max-w-[1400px] mx-auto pointer-events-auto">
            <div
              style={{ backgroundColor: '#ffffff' }}
              className="rounded-2xl border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              
              {/* 4 Specialized Columns strictly for Cybersecurity and AI */}
              <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {COURSES_DATA.map((col, idx) => (
                  <div key={idx} className="space-y-4">
                    
                    {/* Column Heading in Bold Blue Uppercase matching screenshot */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <col.icon className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="text-xs sm:text-[13px] font-extrabold text-blue-600 tracking-wider uppercase font-mono">
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
                            className="group flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg text-[13px] text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 font-medium transition-all duration-150"
                          >
                            <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">
                              {course.title}
                            </span>

                            {course.isTrending && (
                              <span className="shrink-0 text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-xs tracking-tight">
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Practical Sandboxed Cloud Labs</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dual Track: Offensive Security & Defensive AI</span>
                  </span>
                  <span className="hidden md:flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Verifiable Cryptographic TS-ID</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <Link
                    href="/courses?track=cyber"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    Cybersecurity Track
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href="/courses?track=ai"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    AI Track
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href="/courses"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
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
