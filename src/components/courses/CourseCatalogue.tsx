'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  Brain,
  Download,
  Play,
  Pause,
  RotateCw,
  LayoutGrid,
  Route as RouteIcon,
  CheckCircle2,
  Cpu,
  Activity,
  Zap,
  Filter,
  X,
} from 'lucide-react';

export interface CourseItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  track: 'cyber' | 'ai';
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  durationHours: number;
  modulesCount: number;
  labsCount: number;
  highlights: string[];
  mentorName?: string;
  mentorCompany?: string;
}

interface CourseCatalogueProps {
  courses: CourseItem[];
  activeTrackFilter: 'all' | 'cyber' | 'ai';
  onTrackChange: (track: 'all' | 'cyber' | 'ai') => void;
}

// ── HARDWARE SIM-CHIP ACCENT ──
const SimChip = ({ isViolet }: { isViolet?: boolean }) => (
  <svg
    className={`w-9 h-9 absolute top-5 right-5 transition-all duration-300 pointer-events-none opacity-30 group-hover:opacity-60 ${
      isViolet ? 'text-purple-400' : 'text-lime-400'
    }`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <line x1="8" y1="2" x2="8" y2="22" />
    <line x1="16" y1="2" x2="16" y2="22" />
    <line x1="2" y1="8" x2="22" y2="8" />
    <line x1="2" y1="16" x2="22" y2="16" />
    <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" />
  </svg>
);

// ── SVG RECTANGULAR CIRCUIT WITH DIRECTIONAL NEON PULSE ──
interface ConveyorCircuitSvgProps {
  isPaused: boolean;
  theme: 'emerald' | 'violet';
  direction: 'clockwise' | 'counter-clockwise';
}

const ConveyorCircuitSvg = ({ isPaused, theme, direction }: ConveyorCircuitSvgProps) => {
  const isEmerald = theme === 'emerald';
  const isCw = direction === 'clockwise';

  const circuitPath = `
    M 185,127.5
    L 581,127.5
    A 28 28 0 0 1 609,155.5
    L 609,380.5
    A 28 28 0 0 1 581,408.5
    L 185,408.5
    A 28 28 0 0 1 157,380.5
    L 157,155.5
    A 28 28 0 0 1 185,127.5
    Z
  `;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id={`grad-base-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            stopColor={isEmerald ? 'rgba(163, 230, 53, 0.12)' : 'rgba(168, 85, 247, 0.12)'}
          />
          <stop
            offset="100%"
            stopColor={isEmerald ? 'rgba(132, 204, 22, 0.22)' : 'rgba(147, 51, 234, 0.22)'}
          />
        </linearGradient>

        <linearGradient id={`grad-pulse-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isEmerald ? '#a3e635' : '#c084fc'} stopOpacity="0.95" />
          <stop offset="50%" stopColor={isEmerald ? '#84cc16' : '#a855f7'} stopOpacity="0.95" />
          <stop offset="100%" stopColor={isEmerald ? '#4ade80' : '#e879f9'} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Static Guide Track */}
      <path
        d={circuitPath}
        fill="none"
        stroke={`url(#grad-base-${theme})`}
        strokeWidth="2.5"
      />

      {/* Running Neon Pulse Beam */}
      <path
        d={circuitPath}
        fill="none"
        stroke={`url(#grad-pulse-${theme})`}
        className={`${isCw ? 'pt-track-pulse-cw' : 'pt-track-pulse-ccw'} ${
          isPaused ? 'pt-paused' : ''
        }`}
        pathLength="400"
      />

      {/* Waypoint Corner Nodes */}
      {[
        { cx: 185, cy: 127.5 },
        { cx: 581, cy: 127.5 },
        { cx: 581, cy: 408.5 },
        { cx: 185, cy: 408.5 },
      ].map((node, i) => (
        <g key={i}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r="8"
            fill="#05070d"
            stroke={isEmerald ? '#84cc16' : '#a855f7'}
            strokeWidth="2"
          />
          <circle
            cx={node.cx}
            cy={node.cy}
            r="3.5"
            fill={isEmerald ? '#bef264' : '#d8b4fe'}
          />
        </g>
      ))}
    </svg>
  );
};

// ── 4-CARD SINGLE CONVEYOR TRACK SUBCOMPONENT (DARK THEME) ──
interface SingleConveyorTrackProps {
  trackCode: string;
  tierTitle: string;
  tierBadge: string;
  description: string;
  courses: CourseItem[];
  theme: 'emerald' | 'violet';
  direction: 'clockwise' | 'counter-clockwise';
  sidebarPosition: 'left' | 'right';
  isDesktop: boolean;
  globalPaused: boolean;
}

const SingleConveyorTrack = ({
  trackCode,
  tierTitle,
  tierBadge,
  description,
  courses,
  theme,
  direction,
  sidebarPosition,
  isDesktop,
  globalPaused,
}: SingleConveyorTrackProps) => {
  const isEmerald = theme === 'emerald';
  const isCw = direction === 'clockwise';
  const isSidebarLeft = sidebarPosition === 'left';

  const [localPaused, setLocalPaused] = useState(false);
  const isPaused = globalPaused || localPaused;

  const waypoints = useMemo(() => {
    if (isCw) {
      return [
        { x: 0, y: 0 },
        { x: 396, y: 0 },
        { x: 396, y: 281 },
        { x: 0, y: 281 },
      ];
    } else {
      return [
        { x: 396, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 281 },
        { x: 396, y: 281 },
      ];
    }
  }, [isCw]);

  const [positions, setPositions] = useState<number[]>([0, 1, 2, 3]);

  const advanceTrack = () => {
    setPositions((prev) => prev.map((pos) => (pos + 1) % 4));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      advanceTrack();
    }, 4400);
    return () => clearInterval(interval);
  }, [isPaused]);

  const totalHours = courses.reduce((acc, c) => acc + c.durationHours, 0);
  const totalLabs = courses.reduce((acc, c) => acc + c.labsCount, 0);
  const totalModules = courses.reduce((acc, c) => acc + c.modulesCount, 0);

  // Status sidebar in dark theme
  const sidebarElement = (
    <div
      className={`w-full lg:w-[350px] shrink-0 p-7 rounded-3xl border flex flex-col justify-between space-y-6 relative overflow-hidden text-left ${
        isEmerald
          ? 'bg-[#080e0a]/90 border-lime-500/30 shadow-[0_0_25px_-8px_rgba(163,230,53,0.15)]'
          : 'bg-[#0d0717]/90 border-purple-500/30 shadow-[0_0_25px_-8px_rgba(168,85,247,0.15)]'
      }`}
    >
      <SimChip isViolet={!isEmerald} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border ${
              isEmerald
                ? 'bg-lime-950/80 text-lime-400 border-lime-500/40'
                : 'bg-purple-950/80 text-purple-400 border-purple-500/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{trackCode}</span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-semibold">{tierBadge}</span>
        </div>

        <div>
          <h3 className="text-xl font-black text-white leading-tight">
            {tierTitle}
          </h3>
          <p className="text-xs text-slate-300/80 font-normal leading-relaxed mt-2">
            {description}
          </p>
        </div>

        {/* Orbit Status Telemetry */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">ORBIT VECTOR:</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                isEmerald ? 'text-lime-400' : 'text-purple-400'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isCw ? '' : '-scale-x-100'}`} />
              {isCw ? 'CLOCKWISE (CW ↻)' : 'COUNTER-CW (CCW ↺)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">STATUS:</span>
            <span className="font-bold text-white">4 Active / 4 Positions</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">CYCLE INTERVAL:</span>
            <span className="font-bold text-white">4.4s Orbit Advance</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-base font-black text-white">{totalHours}h</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Hours</div>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-base font-black text-white">{totalModules}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Modules</div>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-base font-black text-white">{totalLabs}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Labs</div>
          </div>
        </div>
      </div>

      {/* Manual Track Controls */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <button
          onClick={() => setLocalPaused(!localPaused)}
          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isPaused
              ? 'bg-lime-950/70 text-lime-400 border-lime-500/50 hover:bg-lime-900/50'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-lime-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isPaused ? 'Resume Orbit' : 'Pause Orbit'}</span>
        </button>

        <button
          onClick={advanceTrack}
          className={`p-2 rounded-xl text-black shadow-md transition-all cursor-pointer font-bold ${
            isEmerald
              ? 'bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300'
              : 'bg-gradient-to-r from-purple-400 to-fuchsia-400 hover:from-purple-300 hover:to-fuchsia-300'
          }`}
          title="Manually Advance Track Positions"
        >
          <RotateCw className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`w-full flex flex-col ${
        isSidebarLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
      } items-center justify-between gap-8`}
    >
      {sidebarElement}

      <div
        className="w-full lg:w-[766px] overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none flex justify-center"
        onMouseEnter={() => setLocalPaused(true)}
        onMouseLeave={() => setLocalPaused(false)}
      >
        <div
          className="relative shrink-0"
          style={{
            width: '766px',
            height: isDesktop ? '536px' : 'auto',
          }}
        >
          {isDesktop && (
            <ConveyorCircuitSvg
              isPaused={isPaused}
              theme={theme}
              direction={direction}
            />
          )}

          {courses.slice(0, 4).map((course, idx) => {
            const currentWaypoint = waypoints[positions[idx] ?? idx] || { x: 0, y: 0 };

            return (
              <motion.div
                key={course.id}
                animate={
                  isDesktop
                    ? {
                        x: currentWaypoint.x,
                        y: currentWaypoint.y,
                      }
                    : {}
                }
                transition={{
                  duration: 1.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={
                  isDesktop
                    ? {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '370px',
                        height: '255px',
                        willChange: 'transform',
                      }
                    : {
                        position: 'relative',
                        width: '100%',
                        height: 'auto',
                        marginBottom: '16px',
                      }
                }
                className="z-10 group cursor-pointer"
                onClick={() => setLocalPaused(!localPaused)}
              >
                <div
                  className={`h-full w-full rounded-3xl p-5 border flex flex-col justify-between text-left relative overflow-hidden transition-all duration-300 ${
                    isEmerald
                      ? 'bg-gradient-to-br from-[#0c1a10] via-[#07120a] to-[#030805] border-lime-500/40 hover:border-lime-400 shadow-[0_0_20px_-8px_rgba(163,230,53,0.25)] hover:shadow-[0_0_35px_-4px_rgba(163,230,53,0.5)]'
                      : 'bg-gradient-to-br from-[#1a0c2e] via-[#10071f] to-[#07030f] border-purple-500/40 hover:border-purple-400 shadow-[0_0_20px_-8px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_-4px_rgba(168,85,247,0.5)]'
                  }`}
                >
                  <SimChip isViolet={!isEmerald} />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pr-8">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isEmerald
                            ? 'bg-lime-950/90 text-lime-300 border-lime-500/60'
                            : 'bg-purple-950/90 text-purple-300 border-purple-500/60'
                        }`}
                      >
                        {course.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold">
                        {course.level}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={`text-sm sm:text-base font-bold text-white leading-snug transition-colors line-clamp-1 ${
                          isEmerald ? 'group-hover:text-lime-300' : 'group-hover:text-purple-300'
                        }`}
                      >
                        <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-300/80 font-normal leading-relaxed mt-1 line-clamp-2">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      {course.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isEmerald ? 'text-lime-400' : 'text-purple-400'
                            }`}
                          />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.durationHours}h</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.modulesCount} Mods</span>
                      </span>
                      <span className="font-semibold text-slate-200">{course.labsCount} Labs</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`/courses/${course.slug}#syllabus`}
                        onClick={(e) => e.stopPropagation()}
                        className="py-2 px-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Syllabus</span>
                      </a>

                      <Link
                        href={`/courses/${course.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block"
                      >
                        <button
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                            isEmerald
                              ? 'bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-black'
                              : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 text-white font-black'
                          }`}
                        >
                          <span>Enroll</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── DOMAIN DUAL-TIER TRACK CONTAINER (DARK THEME) ──
interface DomainDualTierProps {
  domainKey: 'cyber' | 'ai';
  title: string;
  subtitle: string;
  badgeText: string;
  courses: CourseItem[];
  theme: 'emerald' | 'violet';
  isDesktop: boolean;
  globalPaused: boolean;
}

const DomainDualTierSection = ({
  title,
  subtitle,
  badgeText,
  courses,
  theme,
  isDesktop,
  globalPaused,
}: DomainDualTierProps) => {
  const isEmerald = theme === 'emerald';
  const tier1Courses = courses.slice(0, 4);
  const tier2Courses = courses.slice(4, 8);

  return (
    <div
      className={`rounded-3xl p-6 sm:p-10 border transition-all relative overflow-hidden ${
        isEmerald
          ? 'bg-gradient-to-b from-lime-950/20 via-black/40 to-transparent border-lime-500/30'
          : 'bg-gradient-to-b from-purple-950/20 via-black/40 to-transparent border-purple-500/30'
      }`}
    >
      {/* Domain Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-slate-800/80 text-left">
        <div className="space-y-2.5 max-w-2xl">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
              isEmerald
                ? 'bg-lime-950/80 text-lime-300 border-lime-500/50'
                : 'bg-purple-950/80 text-purple-300 border-purple-500/50'
            }`}
          >
            {isEmerald ? <Shield className="w-3.5 h-3.5 text-lime-400" /> : <Brain className="w-3.5 h-3.5 text-purple-400" />}
            <span>{badgeText}</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-slate-300 shadow-sm">
            <span className={isEmerald ? 'text-lime-400 font-bold' : 'text-purple-400 font-bold'}>
              8 Masterclasses
            </span>{' '}
            (Dual Synchronized Conveyor)
          </div>
        </div>
      </div>

      {/* Tier 1 Track */}
      <div className="space-y-4">
        <SingleConveyorTrack
          trackCode={isEmerald ? 'CYBER // TIER 01' : 'AI // TIER 01'}
          tierTitle={isEmerald ? 'Core Security & Defensive Operations' : 'Autonomous AI & Threat Defense'}
          tierBadge="Courses 01 - 04"
          description={
            isEmerald
              ? 'Foundational penetration testing, SOC blue team triage, cloud hardening, and Active Directory exploitation.'
              : 'Prompt injection defense, LLM vulnerability red teaming, tool-calling agents, and RAG vector storage protection.'
          }
          courses={tier1Courses}
          theme={theme}
          direction="clockwise"
          sidebarPosition="left"
          isDesktop={isDesktop}
          globalPaused={globalPaused}
        />

        {/* Connecting Data Bus Line */}
        <div className="py-6 flex items-center justify-center relative">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <div
            className={`absolute px-4 py-1.5 rounded-full bg-[#090d16] border text-[11px] font-mono font-bold shadow-md flex items-center gap-2 ${
              isEmerald
                ? 'border-lime-500/50 text-lime-300'
                : 'border-purple-500/50 text-purple-300'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 animate-pulse ${isEmerald ? 'text-lime-400' : 'text-purple-400'}`} />
            <span>ADVANCED SPECIALIZATION DATA BUS // TIER 01 → TIER 02 (ALTERNATE ANGLE)</span>
          </div>
        </div>

        {/* Tier 2 Track on Alternate Opposite Side */}
        <SingleConveyorTrack
          trackCode={isEmerald ? 'CYBER // TIER 02' : 'AI // TIER 02'}
          tierTitle={isEmerald ? 'Specialized Vectors & Deep Exploitation' : 'Enterprise Governance & Model Enclaves'}
          tierBadge="Courses 05 - 08"
          description={
            isEmerald
              ? 'Mobile APK/IPA dynamic reverse engineering, REST/GraphQL API abuse, binary heap ROP chains, and critical OT/ICS SCADA defense.'
              : 'NeMo guardrails architecture, vision transformer adversarial patches, differential privacy DP-SGD, and 4-bit edge quantization.'
          }
          courses={tier2Courses}
          theme={theme}
          direction="counter-clockwise"
          sidebarPosition="right"
          isDesktop={isDesktop}
          globalPaused={globalPaused}
        />
      </div>
    </div>
  );
};

export function CourseCatalogue({
  courses,
  activeTrackFilter,
  onTrackChange,
}: CourseCatalogueProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'duration-desc' | 'duration-asc' | 'labs-desc' | 'modules-desc' | 'alpha'>('default');
  const [viewMode, setViewMode] = useState<'conveyor' | 'grid'>('conveyor');
  const [globalPaused, setGlobalPaused] = useState<boolean>(false);

  // Responsive screen detection
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;

  // ── AUTOMATICALLY SWITCH TO STANDARD GRID ON USER FILTER/SEARCH ──
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    if (level !== 'All') {
      setViewMode('grid');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '') {
      setViewMode('grid');
    }
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    if (sort !== 'default') {
      setViewMode('grid');
    }
  };

  const resetAllFilters = () => {
    setSelectedLevel('All');
    setSearchQuery('');
    setSortBy('default');
    setViewMode('conveyor');
  };

  const isFiltered = selectedLevel !== 'All' || searchQuery.trim() !== '' || sortBy !== 'default';

  // Level counts based on active domain
  const levelCounts = useMemo(() => {
    const base = activeTrackFilter === 'all'
      ? courses
      : courses.filter((c) => c.track === activeTrackFilter);
    return {
      All: base.length,
      Beginner: base.filter((c) => c.level === 'Beginner').length,
      Intermediate: base.filter((c) => c.level === 'Intermediate').length,
      Advanced: base.filter((c) => c.level === 'Advanced').length,
      Expert: base.filter((c) => c.level === 'Expert').length,
    };
  }, [courses, activeTrackFilter]);

  // Filtered & sorted courses
  const filteredCourses = useMemo(() => {
    let result = courses.filter((c) => {
      if (activeTrackFilter !== 'all' && c.track !== activeTrackFilter) return false;
      if (selectedLevel !== 'All' && c.level !== selectedLevel) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesSubtitle = c.subtitle.toLowerCase().includes(q);
        const matchesCategory = c.category.toLowerCase().includes(q);
        const matchesHighlights = c.highlights.some((h) => h.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesCategory && !matchesHighlights) {
          return false;
        }
      }
      return true;
    });

    switch (sortBy) {
      case 'duration-desc':
        return [...result].sort((a, b) => b.durationHours - a.durationHours);
      case 'duration-asc':
        return [...result].sort((a, b) => a.durationHours - b.durationHours);
      case 'labs-desc':
        return [...result].sort((a, b) => b.labsCount - a.labsCount);
      case 'modules-desc':
        return [...result].sort((a, b) => b.modulesCount - a.modulesCount);
      case 'alpha':
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return result;
    }
  }, [courses, activeTrackFilter, selectedLevel, searchQuery, sortBy]);

  const cyberConveyorCourses = useMemo(() => {
    return courses.filter((c) => c.track === 'cyber');
  }, [courses]);

  const aiConveyorCourses = useMemo(() => {
    return courses.filter((c) => c.track === 'ai');
  }, [courses]);

  return (
    <section
      id="catalogue"
      className="py-24 bg-[#05070D] text-white relative z-10 border-t border-slate-800/80 overflow-hidden"
    >
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* Atmospheric Neon Radial Lighting */}
      <div className="absolute top-1/4 left-1/6 w-[800px] h-[500px] bg-[#84cc16]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-[800px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-lime-400" />
              <span>COORDINATED DUAL-DOMAIN ARCHITECTURE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">Course Catalogue</span>
            </h2>

            <p className="text-sm text-slate-300 font-normal leading-relaxed">
              8 specialized masterclasses for Cybersecurity in <span className="text-lime-400 font-bold">Electric Lime</span> and 8 specialized masterclasses for AI Systems in <span className="text-purple-400 font-bold">Electric Violet</span> (16 total).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#0b101b] border border-slate-800 text-xs font-sans text-slate-300 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
              <span>16 Enterprise Masterclasses Active</span>
            </div>
          </div>
        </div>

        {/* ── COMMAND DOCK: SEARCH, DOMAIN, LEVEL & CONTROLS ── */}
        <div className="rounded-3xl bg-[#0b101b]/95 border border-slate-800/90 p-5 sm:p-6 shadow-2xl space-y-4">
          
          {/* TOP DECK: SEARCH (EXPANDED) + SORT MENU + VIEW MODE TOGGLE + PAUSE/RESET */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search across all 16 masterclasses, modules, tools (e.g. Burp, RAG, VAPT, Ghidra)..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#121827] border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-400/80 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 justify-end">
              
              {/* Sort Menu */}
              <div className="relative flex items-center gap-1.5 bg-[#121827] border border-slate-700/80 rounded-2xl px-3 py-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="bg-transparent text-xs font-sans font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="default" className="bg-[#121827] text-white">Sort: Featured</option>
                  <option value="duration-desc" className="bg-[#121827] text-white">Duration: High to Low</option>
                  <option value="duration-asc" className="bg-[#121827] text-white">Duration: Low to High</option>
                  <option value="labs-desc" className="bg-[#121827] text-white">Most Labs</option>
                  <option value="modules-desc" className="bg-[#121827] text-white">Most Modules</option>
                  <option value="alpha" className="bg-[#121827] text-white">Alphabetical (A-Z)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center p-1 rounded-2xl bg-[#121827] border border-slate-800 text-xs font-sans shadow-sm">
                <button
                  onClick={() => setViewMode('conveyor')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'conveyor'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Conveyor Orbit View"
                >
                  <RouteIcon className="w-3.5 h-3.5" />
                  <span>Tracks</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Standard Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>

              {/* Reset Button (when filtered) */}
              {isFiltered && (
                <button
                  onClick={resetAllFilters}
                  className="px-3.5 py-2 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/70 text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              {/* Pause/Resume (when in conveyor) */}
              {viewMode === 'conveyor' && !isFiltered && (
                <button
                  onClick={() => setGlobalPaused(!globalPaused)}
                  className="px-3.5 py-2 rounded-2xl bg-[#121827] hover:bg-[#1a2338] border border-slate-700/80 text-slate-300 text-xs font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {globalPaused ? (
                    <Play className="w-3.5 h-3.5 text-lime-400" />
                  ) : (
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{globalPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}
            </div>
          </div>

          {/* LOWER DECK: DOMAIN TABS (LEFT) & EXPERIENCE LEVEL PILLS (RIGHT) */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            
            {/* Domain / Track Selection */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5 shrink-0">
                <Cpu className="w-3.5 h-3.5 text-lime-400" />
                <span>Domain:</span>
              </span>
              <div className="flex items-center p-1 rounded-2xl bg-[#121827] border border-slate-800 text-xs font-sans">
                <button
                  onClick={() => onTrackChange('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTrackFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All (16)
                </button>
                <button
                  onClick={() => onTrackChange('cyber')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTrackFilter === 'cyber'
                      ? 'bg-lime-950 text-lime-300 border border-lime-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-lime-400'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Cybersecurity (8)</span>
                </button>
                <button
                  onClick={() => onTrackChange('ai')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTrackFilter === 'ai'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-purple-400'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>AI Systems (8)</span>
                </button>
              </div>
            </div>

            {/* Experience Level Pills (Single Row with Nowrap, Never Wraps into Orphan Line) */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto scrollbar-none">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Level:</span>
              </span>
              
              <div className="flex items-center gap-1.5 shrink-0">
                {(['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => {
                  const isSelected = selectedLevel === lvl;
                  const count = levelCounts[lvl];
                  return (
                    <button
                      key={lvl}
                      onClick={() => handleLevelSelect(lvl)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(163,230,53,0.35)] font-black'
                          : 'bg-[#121827] text-slate-300 hover:bg-[#1a2338] hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{lvl}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? 'bg-black/25 text-slate-950'
                            : 'bg-black/40 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Filter Feedback Banner */}
        {isFiltered && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#0b101b]/90 border border-slate-800 text-xs font-sans text-slate-300">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-lime-400" />
              <span>
                Active Filters: {selectedLevel !== 'All' && <strong className="text-lime-300 ml-1">Level: {selectedLevel}</strong>}
                {searchQuery && <strong className="text-purple-300 ml-2">Search: &ldquo;{searchQuery}&rdquo;</strong>}
                {sortBy !== 'default' && <strong className="text-cyan-300 ml-2">Sorted by: {sortBy}</strong>}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-white font-bold">{filteredCourses.length} course(s) match</span>
            </div>

            <button
              onClick={() => {
                resetAllFilters();
                setViewMode('conveyor');
              }}
              className="text-xs font-sans font-semibold text-lime-400 hover:text-lime-300 underline cursor-pointer"
            >
              Reset & Return to Conveyor Tracks →
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════════
            VIEW MODE 1: DUAL-TIER CONVEYOR TRACKS (8 COURSES PER DOMAIN)
           ═════════════════════════════════════════════════════════════════════════════ */}
        {viewMode === 'conveyor' && !isFiltered && (
          <div className="space-y-16">
            {/* 1. CYBERSECURITY DOMAIN (8 COURSES ON 2 ALTERNATING TIERS) */}
            {(activeTrackFilter === 'all' || activeTrackFilter === 'cyber') && (
              <DomainDualTierSection
                domainKey="cyber"
                title="Cybersecurity Engineering & Offensive Defense"
                subtitle="From core VAPT and SOC blue team operations to binary reverse engineering and critical industrial SCADA infrastructure."
                badgeText="DOMAIN 01 • CYBERSECURITY ARCHITECTURE (8 COURSES)"
                courses={cyberConveyorCourses}
                theme="emerald"
                isDesktop={isDesktop}
                globalPaused={globalPaused}
              />
            )}

            {/* 2. ARTIFICIAL INTELLIGENCE DOMAIN (8 COURSES ON 2 ALTERNATING TIERS) */}
            {(activeTrackFilter === 'all' || activeTrackFilter === 'ai') && (
              <DomainDualTierSection
                domainKey="ai"
                title="Artificial Intelligence & Autonomous Agentic Systems"
                subtitle="From indirect prompt injection audits and multi-agent systems to vision transformer attacks and 4-bit edge quantization."
                badgeText="DOMAIN 02 • ARTIFICIAL INTELLIGENCE ARCHITECTURE (8 COURSES)"
                courses={aiConveyorCourses}
                theme="violet"
                isDesktop={isDesktop}
                globalPaused={globalPaused}
              />
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════════
            VIEW MODE 2: BIG GRIDS SIZE (AGGRESSIVE LIME & VIOLET GRADIENT CARDS)
           ═════════════════════════════════════════════════════════════════════════════ */}
        {(viewMode === 'grid' || isFiltered) && (
          <div>
            {filteredCourses.length === 0 ? (
              <div className="p-16 rounded-3xl bg-[#0b101b] border border-slate-800 text-center space-y-4">
                <Filter className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Courses Found Matching Your Criteria</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Try clearing your search query or selecting &ldquo;All&rdquo; in the level filters to display all 16 available masterclasses.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black text-xs font-sans transition-all cursor-pointer"
                >
                  Clear All Filters & Reset
                </button>
              </div>
            ) : (
              /* Big 3-Column Grid for Expansive Visual Impact */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course) => {
                  const isCyber = course.track === 'cyber';
                  return (
                    <div
                      key={course.id}
                      className={`group rounded-3xl p-7 sm:p-8 border flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[470px] text-left ${
                        isCyber
                          ? 'bg-gradient-to-br from-[#0c1a10] via-[#07120a] to-[#030805] border-lime-500/35 hover:border-lime-400 shadow-[0_0_30px_-10px_rgba(163,230,53,0.22)] hover:shadow-[0_0_45px_-4px_rgba(163,230,53,0.5)] hover:-translate-y-1'
                          : 'bg-gradient-to-br from-[#1a0c2e] via-[#10071f] to-[#07030f] border-purple-500/35 hover:border-purple-400 shadow-[0_0_30px_-10px_rgba(168,85,247,0.22)] hover:shadow-[0_0_45px_-4px_rgba(168,85,247,0.5)] hover:-translate-y-1'
                      }`}
                    >
                      {/* Top neon hairline highlight */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                          isCyber
                            ? 'from-transparent via-lime-400 to-transparent opacity-70 group-hover:opacity-100'
                            : 'from-transparent via-purple-400 to-transparent opacity-70 group-hover:opacity-100'
                        } transition-opacity`}
                      />

                      {/* Corner Hardware Accent */}
                      <SimChip isViolet={!isCyber} />

                      {/* Header & Badges */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pr-8">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-black uppercase tracking-wider border ${
                              isCyber
                                ? 'bg-lime-950/90 text-lime-300 border-lime-500/60'
                                : 'bg-purple-950/90 text-purple-300 border-purple-500/60'
                            }`}
                          >
                            {course.category}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                            {course.level}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3
                            className={`text-xl sm:text-2xl font-black text-white leading-tight transition-colors ${
                              isCyber ? 'group-hover:text-lime-300' : 'group-hover:text-purple-300'
                            }`}
                          >
                            <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                          </h3>
                          <p className="text-sm text-slate-300/90 font-normal leading-relaxed mt-2.5 line-clamp-2">
                            {course.subtitle}
                          </p>
                        </div>

                        {/* Highlights checklist */}
                        <div className="space-y-2 pt-4 border-t border-slate-800/80">
                          {course.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                              <span
                                className={`font-black shrink-0 ${
                                  isCyber ? 'text-lime-400 text-sm' : 'text-purple-400 text-sm'
                                }`}
                              >
                                ✓
                              </span>
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Metadata & Action Buttons */}
                      <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-4">
                        {/* Metrics Bar */}
                        <div
                          className={`p-3 rounded-2xl flex items-center justify-between text-xs font-mono border ${
                            isCyber
                              ? 'bg-[#040806] border-lime-900/50 text-slate-300'
                              : 'bg-[#0a0514] border-purple-900/50 text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{course.durationHours}h Live</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{course.modulesCount} Modules</span>
                          </span>
                          <span
                            className={`font-black ${
                              isCyber ? 'text-lime-400' : 'text-purple-400'
                            }`}
                          >
                            {course.labsCount} Sandbox Labs
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <a
                            href={`/courses/${course.slug}#syllabus`}
                            className="py-3 px-4 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-slate-400" />
                            <span>Syllabus</span>
                          </a>

                          <Link href={`/courses/${course.slug}`} className="block">
                            <button
                              className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                                isCyber
                                  ? 'bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400 hover:from-lime-400 hover:to-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(163,230,53,0.4)]'
                                  : 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 hover:from-purple-400 hover:to-fuchsia-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                              }`}
                            >
                              <span>Enroll Now</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded CSS for Directional Runner Pulses */}
      <style jsx>{`
        .pt-track-pulse-cw {
          stroke-width: 3.5px;
          stroke-linecap: round;
          stroke-dasharray: 60 180;
          animation: pt-stroke-run-cw 5s linear infinite;
          filter: drop-shadow(0 0 8px rgba(163, 230, 53, 0.8));
        }
        @keyframes pt-stroke-run-cw {
          0% {
            stroke-dashoffset: 400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .pt-track-pulse-ccw {
          stroke-width: 3.5px;
          stroke-linecap: round;
          stroke-dasharray: 60 180;
          animation: pt-stroke-run-ccw 5s linear infinite;
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.8));
        }
        @keyframes pt-stroke-run-ccw {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 400;
          }
        }

        .pt-paused {
          animation-play-state: paused !important;
          stroke: #475569;
          filter: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .pt-track-pulse-cw,
          .pt-track-pulse-ccw {
            animation: none !important;
            stroke-dasharray: none !important;
          }
        }
      `}</style>
    </section>
  );
}
