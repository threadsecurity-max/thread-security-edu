'use client';

import React from 'react';
import { Gauge, ShieldAlert, Flag, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export interface SpeedometerLevel {
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  title: string;
  subtitle: string;
  minPercent: number;
  maxPercent: number;
  color: string;
  trackColor: string;
  glowColor: string;
  icon: React.ElementType;
}

export const SPEEDOMETER_LEVELS: SpeedometerLevel[] = [
  {
    level: 'L1',
    title: 'L1 — Under Investigation',
    subtitle: 'Awaiting Brief / Not Started',
    minPercent: 0,
    maxPercent: 20,
    color: '#ef4444',
    trackColor: 'rgba(239, 68, 68, 0.25)',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    icon: AlertOctagon,
  },
  {
    level: 'L2',
    title: 'L2 — Yellow Flag',
    subtitle: 'Caution / Early Learning Phase',
    minPercent: 21,
    maxPercent: 40,
    color: '#f59e0b',
    trackColor: 'rgba(245, 158, 11, 0.25)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: Flag,
  },
  {
    level: 'L3',
    title: 'L3 — Green Flag Running',
    subtitle: 'Unrestricted Course Progress',
    minPercent: 41,
    maxPercent: 70,
    color: '#10b981',
    trackColor: 'rgba(16, 185, 129, 0.25)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    icon: Flag,
  },
  {
    level: 'L4',
    title: "L4 — Stewards' Inquiry",
    subtitle: 'Submitted for Mentor Assessment / Lab Proof',
    minPercent: 71,
    maxPercent: 90,
    color: '#6366f1',
    trackColor: 'rgba(99, 102, 241, 0.25)',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    icon: ShieldAlert,
  },
  {
    level: 'L5',
    title: 'L5 — No Further Action / Verified',
    subtitle: 'Signed Off & Passed',
    minPercent: 91,
    maxPercent: 100,
    color: '#8b5cf6',
    trackColor: 'rgba(139, 92, 246, 0.25)',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    icon: CheckCircle2,
  },
];

export function getSpeedometerLevel(percent: number): SpeedometerLevel {
  const p = Math.max(0, Math.min(100, percent || 0));
  if (p <= 20) return SPEEDOMETER_LEVELS[0];
  if (p <= 40) return SPEEDOMETER_LEVELS[1];
  if (p <= 70) return SPEEDOMETER_LEVELS[2];
  if (p <= 90) return SPEEDOMETER_LEVELS[3];
  return SPEEDOMETER_LEVELS[4];
}

interface SpeedometerProgressProps {
  percent: number;
  interactive?: boolean;
  onChange?: (newPercent: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function SpeedometerProgress({
  percent,
  interactive = false,
  onChange,
  size = 'md',
  showDetails = true,
}: SpeedometerProgressProps) {
  const currentLevel = getSpeedometerLevel(percent);
  const clampedPercent = Math.max(0, Math.min(100, percent || 0));

  // Gauge angle calculation (-120deg at 0% to +120deg at 100%)
  const needleAngle = -120 + (clampedPercent / 100) * 240;

  const LevelIcon = currentLevel.icon;

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2.5">
        {/* Compact Speedometer Arc */}
        <div className="relative w-12 h-8 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
            {/* Background Arch */}
            <path
              d="M 15 50 A 35 35 0 0 1 85 50"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active Colored Arc */}
            <path
              d="M 15 50 A 35 35 0 0 1 85 50"
              fill="none"
              stroke={currentLevel.color}
              strokeWidth="8"
              strokeDasharray="110"
              strokeDashoffset={110 - (110 * clampedPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            {/* Needle */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="24"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
              transform={`rotate(${needleAngle} 50 50)`}
              className="transition-transform duration-500 ease-out"
            />
            <circle cx="50" cy="50" r="5" fill="#0f172a" />
          </svg>
        </div>

        {/* Text readout */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] leading-tight" style={{ color: currentLevel.color }}>
            <span>{currentLevel.level}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="truncate">{currentLevel.title.split('—')[1]?.trim()}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {clampedPercent}% &bull; {currentLevel.subtitle}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
      {/* Speedometer Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">Docket Velocity &amp; Progress Gauge</span>
        </div>
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase border shadow-2xs"
          style={{
            backgroundColor: currentLevel.trackColor,
            borderColor: currentLevel.color,
            color: currentLevel.color,
          }}
        >
          {currentLevel.level}
        </span>
      </div>

      {/* Speedometer Gauge Visualizer */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative w-48 h-28 flex items-end justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f59e0b" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="85%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Segment Ticks */}
            {/* L1: 0-20% */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="14"
              strokeDasharray="236"
              strokeDashoffset={236 - (236 * clampedPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Level Zone Dots / Indicators */}
            <circle cx="35" cy="85" r="2.5" fill="#ef4444" opacity="0.6" />
            <circle cx="58" cy="46" r="2.5" fill="#f59e0b" opacity="0.6" />
            <circle cx="100" cy="30" r="2.5" fill="#10b981" opacity="0.6" />
            <circle cx="142" cy="46" r="2.5" fill="#6366f1" opacity="0.6" />
            <circle cx="165" cy="85" r="2.5" fill="#8b5cf6" opacity="0.6" />

            {/* Pivot Needle */}
            <g
              transform={`rotate(${needleAngle} 100 105)`}
              className="transition-transform duration-500 ease-out"
            >
              <line
                x1="100"
                y1="105"
                x2="100"
                y2="42"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="100"
                y1="46"
                x2="100"
                y2="38"
                stroke={currentLevel.color}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Center Pivot Hub */}
            <circle cx="100" cy="105" r="10" fill="#0f172a" />
            <circle cx="100" cy="105" r="4" fill="#ffffff" />
          </svg>

          {/* Digital readout badge at bottom */}
          <div className="absolute -bottom-2 flex flex-col items-center">
            <span className="font-mono font-black text-xl text-slate-900 tracking-tight">
              {clampedPercent}%
            </span>
          </div>
        </div>

        {/* Current Active Level Descriptor */}
        <div className="mt-3 text-center">
          <div
            className="font-bold font-mono text-xs flex items-center justify-center gap-1.5"
            style={{ color: currentLevel.color }}
          >
            <LevelIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{currentLevel.title}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {currentLevel.subtitle}
          </div>
        </div>
      </div>

      {/* Interactive Tier Clicker (if interactive mode is active) */}
      {interactive && onChange && (
        <div className="mt-4 pt-3 border-t border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-600 mb-2">
            Update Telemetry Tier:
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {SPEEDOMETER_LEVELS.map((lvl) => {
              const isSelected = currentLevel.level === lvl.level;
              return (
                <button
                  type="button"
                  key={lvl.level}
                  onClick={() => onChange(lvl.maxPercent)}
                  className={`px-1.5 py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'shadow-xs font-bold scale-[1.03]'
                      : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-600 opacity-80'
                  }`}
                  style={{
                    backgroundColor: isSelected ? lvl.trackColor : undefined,
                    borderColor: isSelected ? lvl.color : undefined,
                    color: isSelected ? lvl.color : undefined,
                  }}
                  title={`${lvl.title}: ${lvl.subtitle}`}
                >
                  <div className="text-[11px] font-mono font-bold">{lvl.level}</div>
                  <div className="text-[9px] font-mono opacity-80">{lvl.maxPercent}%</div>
                </button>
              );
            })}
          </div>

          {/* Precision Slider */}
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={clampedPercent}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
            <span className="text-[11px] font-mono font-bold text-slate-700 w-10 text-right">
              {clampedPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Telemetry Legend when showDetails is enabled */}
      {showDetails && !interactive && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-500 font-mono">
          <div>L1: Under Investigation (0-20%)</div>
          <div>L2: Yellow Flag Caution (21-40%)</div>
          <div>L3: Green Flag Running (41-70%)</div>
          <div>L4: Stewards Inquiry (71-90%)</div>
          <div className="sm:col-span-2 text-violet-700 font-bold">L5: Verified &amp; Passed (91-100%)</div>
        </div>
      )}
    </div>
  );
}

