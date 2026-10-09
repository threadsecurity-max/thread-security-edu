'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Shield,
  BatteryCharging,
  Cpu,
  RefreshCw,
  Terminal,
  Cloud,
  Layers,
  Activity,
  Flame,
  ArrowRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   TECHNOLOGY ITEM INTERFACE
   ═══════════════════════════════════════════════════════════════════════════ */
interface TechItem {
  id: string;
  name: string;
  category: 'ai' | 'cyber' | 'cloud' | 'core';
  iconSrc?: string;
  fallbackText?: string;
  role: string;
  description: string;
  powerTier: number; // 1 (25%), 2 (50%), 3 (75%), 4 (100%)
}

/* ═══════════════════════════════════════════════════════════════════════════
   TECH ITEMS — 36 Weaponized Tools in 2 Continuous Marquee Feeds
   ═══════════════════════════════════════════════════════════════════════════ */

// Marquee Feed Alpha (Offensive Ops, Core ML & Tactical Recon) — 18 tools
const FEED_ALPHA: TechItem[] = [
  { id: 'pytorch', name: 'PyTorch', category: 'ai', iconSrc: '/TechStack/PyTorch.svg', role: 'Deep Learning', description: 'Adversarial classifiers, neural malware detection, and gradient manipulation.', powerTier: 4 },
  { id: 'kali', name: 'Kali Linux', category: 'cyber', fallbackText: 'Kali', role: 'Offensive OS', description: 'Full weaponized pentesting arsenal for red-team operations and payload delivery.', powerTier: 2 },
  { id: 'aws', name: 'AWS Cloud', category: 'cloud', iconSrc: '/TechStack/AWS.svg', role: 'Cloud Security', description: 'IAM privilege escalation, S3 security audits, VPC peering, and GuardDuty triaging.', powerTier: 3 },
  { id: 'metasploit', name: 'Metasploit', category: 'cyber', fallbackText: 'MSF', role: 'Exploitation', description: 'Automated exploit payloads, Meterpreter sessions, and lateral network movement.', powerTier: 2 },
  { id: 'tensorflow', name: 'TensorFlow', category: 'ai', iconSrc: '/TechStack/TensorFlow.svg', role: 'Production ML', description: 'High-throughput anomaly detection, malware clustering, and neural security pipelines.', powerTier: 4 },
  { id: 'burpsuite', name: 'Burp Suite', category: 'cyber', fallbackText: 'Burp', role: 'Web Pentesting', description: 'HTTP proxy intercept, automated fuzzing, CSRF validation, and OWASP top-10 audits.', powerTier: 2 },
  { id: 'docker', name: 'Docker', category: 'cloud', fallbackText: 'Docker', role: 'Containers', description: 'Container isolation, sandboxed victim targets, and container escape analysis.', powerTier: 3 },
  { id: 'wireshark', name: 'Wireshark', category: 'cyber', fallbackText: 'Wire', role: 'Packet Forensics', description: 'Deep packet inspection (DPI), exfiltration tracking, and TLS anomaly analysis.', powerTier: 1 },
  { id: 'scikit', name: 'scikit-learn', category: 'ai', iconSrc: '/TechStack/scikit-learn.svg', role: 'Statistical ML', description: 'Random Forest anomaly detection and signatureless intrusion clustering.', powerTier: 4 },
  { id: 'nmap', name: 'Nmap', category: 'cyber', fallbackText: 'Nmap', role: 'Network Recon', description: 'Port scanning, NSE scripted auditing, OS fingerprinting, and service detection.', powerTier: 1 },
  { id: 'opencv', name: 'OpenCV', category: 'ai', iconSrc: '/TechStack/OpenCV.svg', role: 'Vision Forensics', description: 'Deepfake forensic analysis, visual steganography, and biometric verification.', powerTier: 4 },
  { id: 'ghidra', name: 'Ghidra', category: 'cyber', fallbackText: 'Ghidra', role: 'Reverse Eng.', description: 'NSA-grade x86/ARM binary decompilation, assembly tracing, and zero-day analysis.', powerTier: 2 },
  { id: 'kaggle', name: 'Kaggle', category: 'ai', iconSrc: '/TechStack/Kaggle.svg', role: 'Cyber Datasets', description: 'Global malware datasets, phishing corpora, and adversarial model benchmarks.', powerTier: 4 },
  { id: 'splunk', name: 'Splunk', category: 'cyber', fallbackText: 'Splunk', role: 'SIEM Hunting', description: 'Enterprise log correlation, threat hunting queries, and automated SOC alerting.', powerTier: 3 },
  { id: 'streamlit', name: 'Streamlit', category: 'ai', iconSrc: '/TechStack/Streamlit.svg', role: 'Threat Dashboards', description: 'Rapid cyber intelligence tools, live incident triage, and forensic reports.', powerTier: 4 },
  { id: 'suricata', name: 'Suricata', category: 'cyber', fallbackText: 'Suricata', role: 'IDS / IPS Engine', description: 'Multi-threaded network intrusion detection, signature matching, and inline blocking.', powerTier: 3 },
  { id: 'jupyter', name: 'Jupyter', category: 'ai', iconSrc: '/TechStack/Jupyter.svg', role: 'Research Lab', description: 'Interactive exploit prototyping, data transformation, and threat visualization.', powerTier: 1 },
  { id: 'selenium', name: 'Selenium', category: 'cyber', iconSrc: '/TechStack/Selenium.svg', role: 'Web Automation', description: 'Automated headless browser attacks, credential stuffing, and DOM crawling.', powerTier: 1 },
];

// Marquee Feed Beta (Infrastructure, Systems, LLMs & Defensive Engines) — 18 tools
const FEED_BETA: TechItem[] = [
  { id: 'python', name: 'Python', category: 'core', fallbackText: 'Python', role: 'Tactical Scripting', description: 'The lingua franca of offensive tooling, custom fuzzers, and automation harnesses.', powerTier: 1 },
  { id: 'kubernetes', name: 'Kubernetes', category: 'cloud', fallbackText: 'K8s', role: 'Cluster Defense', description: 'Pod security standards, RBAC privilege boundaries, and runtime eBPF auditing.', powerTier: 3 },
  { id: 'bash', name: 'Bash', category: 'cyber', iconSrc: '/TechStack/Bash.svg', role: 'Shell Automation', description: 'Post-exploitation shells, cron persistence checks, and Linux host surveillance.', powerTier: 1 },
  { id: 'huggingface', name: 'Hugging Face', category: 'ai', fallbackText: 'HuggingFace', role: 'LLM Red-Teaming', description: 'Auditing LLMs, adversarial jailbreaking, model quantization, and safety testing.', powerTier: 4 },
  { id: 'linux', name: 'Linux Kernel', category: 'core', fallbackText: 'Linux', role: 'Kernel Hardening', description: 'Namespaces, cgroups, SELinux enforcement, and kernel exploit mitigation.', powerTier: 1 },
  { id: 'langchain', name: 'LangChain', category: 'ai', fallbackText: 'LangChain', role: 'Agentic AI', description: 'Testing autonomous agent workflows, prompt injection vectors, and tool abuse.', powerTier: 4 },
  { id: 'postgres', name: 'PostgreSQL', category: 'core', fallbackText: 'Postgres', role: 'Data Security', description: 'Row-Level Security (RLS), encrypted data at rest, and SQL injection defense.', powerTier: 2 },
  { id: 'redis', name: 'Redis', category: 'core', fallbackText: 'Redis', role: 'Rate Limiting', description: 'DDoS mitigation layers, session token storage, and distributed security locks.', powerTier: 3 },
  { id: 'fastapi', name: 'FastAPI', category: 'core', iconSrc: '/TechStack/FastAPI.svg', role: 'Async Security APIs', description: 'High-throughput microservices for automated IOC lookup and alert dispatch.', powerTier: 2 },
  { id: 'git', name: 'Git & GitHub', category: 'core', fallbackText: 'GitHub', role: 'DevSecOps', description: 'Secret scanning, signed commits, automated SAST pipelines, and supply chain audit.', powerTier: 1 },
  { id: 'flask', name: 'Flask', category: 'core', iconSrc: '/TechStack/Flask.svg', role: 'Target Backends', description: 'Intentionally vulnerable backends for live CTF capture and authentication tests.', powerTier: 2 },
  { id: 'pandas', name: 'Pandas', category: 'ai', fallbackText: 'Pandas', role: 'Log Wrangling', description: 'High-speed ingestion and transformation of gigabyte-scale proxy and firewall logs.', powerTier: 3 },
  { id: 'numpy', name: 'NumPy', category: 'core', fallbackText: 'NumPy', role: 'Vectorized Math', description: 'Cryptographic primitive calculations, entropy tests, and matrix permutations.', powerTier: 2 },
  { id: 'matlab', name: 'MATLAB', category: 'core', iconSrc: '/TechStack/MATLAB.svg', role: 'Signal & Crypto', description: 'Side-channel attack simulation, signal processing, and cryptographic verification.', powerTier: 3 },
  { id: 'matplotlib', name: 'Matplotlib', category: 'core', iconSrc: '/TechStack/Matplotlib.svg', role: 'Visual Telemetry', description: 'Packet density heatmaps, intrusion histograms, and attack surface rendering.', powerTier: 2 },
  { id: 'plotly', name: 'Plotly', category: 'core', iconSrc: '/TechStack/Ploty.svg', role: '3D Threat Graphs', description: 'Interactive network graph topologies and multidimensional attack path displays.', powerTier: 3 },
  { id: 'pyscript', name: 'PyScript', category: 'core', iconSrc: '/TechStack/PyScript.svg', role: 'Client Python', description: 'Sandboxed browser execution for client-side cryptographic and reverse tasks.', powerTier: 2 },
  { id: 'angular', name: 'Angular', category: 'core', iconSrc: '/TechStack/Angular.svg', role: 'Enterprise Web', description: 'Strict CSP boundaries, DOM sanitization engines, and CSRF token defenses.', powerTier: 2 },
];

const ALL_TECH = [...FEED_ALPHA, ...FEED_BETA];

const MILESTONES = [
  { tier: 1, percent: 25, title: 'Systems & Recon', desc: 'Shells, networks, and vulnerability mapping' },
  { tier: 2, percent: 50, title: 'Offensive Exploitation', desc: 'Reverse engineering, payloads & web VAPT' },
  { tier: 3, percent: 75, title: 'Cloud & Cluster Defense', desc: 'K8s, AWS, containers & SIEM correlation' },
  { tier: 4, percent: 100, title: 'Adversarial AI & LLMs', desc: 'Deep learning defense, prompt jailbreaking & neural hunting' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT — BATTERY POWER CORE
   ═══════════════════════════════════════════════════════════════════════════ */
export function TechnologiesExposureSection() {
  const [chargePercent, setChargePercent] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);

  // Simulation charging loop when user triggers "Recharge"
  const triggerRecharge = () => {
    if (isCharging) return;
    setIsCharging(true);
    setChargePercent(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsCharging(false);
      }
      setChargePercent(current);
    }, 40);
  };

  // Determine current active milestone
  const activeMilestone =
    MILESTONES.slice().reverse().find((m) => chargePercent >= m.percent) || MILESTONES[0];

  return (
    <section className="relative py-24 sm:py-32 bg-[#050706] text-white overflow-hidden select-none">
      {/* ── BACKGROUND AMBIENCE ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(198,255,52,0.06),transparent_75%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#C6FF34 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-14">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#C6FF34]/30 backdrop-blur-md shadow-[0_0_20px_rgba(198,255,52,0.1)]">
            <Zap className="w-3.5 h-3.5 text-[#C6FF34] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#C6FF34] uppercase">
              HIGH-VOLTAGE CURRICULUM CORE
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Power Up With{' '}
            <span className="relative inline-block">
              <span className="text-[#C6FF34]">36+ Weaponized</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6c40-4 80-4 196 0" stroke="#C6FF34" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </span>{' '}
            Technologies
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
            Every tool, protocol, and exploit framework continuously streams into our cadet battery.
            Watch your operational capability charge from baseline recon to autonomous adversarial readiness.
          </p>
        </div>

        {/* ── MARQUEE FEED ROW 1: STREAMING INTO BATTERY (LEFTWARDS) ── */}
        <div className="relative mb-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-3 sm:gap-4 w-max animate-marquee-left hover:[animation-play-state:paused]">
            {[...FEED_ALPHA, ...FEED_ALPHA].map((tech, idx) => (
              <MarqueeTechBadge
                key={`alpha-${tech.id}-${idx}`}
                tech={tech}
                isHovered={hoveredTech?.id === tech.id}
                onHover={() => setHoveredTech(tech)}
                onLeave={() => setHoveredTech(null)}
              />
            ))}
          </div>
        </div>

        {/* ── CONDUIT INFLOW VISUALIZER (TOP FEED TO BATTERY) ── */}
        <div className="relative flex items-center justify-center h-8 sm:h-10 pointer-events-none">
          <div className="flex items-center gap-8 sm:gap-16 opacity-60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#C6FF34]/60 via-[#C6FF34] to-transparent animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                <span className="text-[9px] font-mono text-[#C6FF34] tracking-tighter">▼ INGEST</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            THE BIG CYBERNETIC BATTERY POWER CELL
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative max-w-4xl lg:max-w-5xl mx-auto my-2">
          {/* Outer glow surrounding the battery */}
          <div
            className="absolute -inset-4 sm:-inset-6 rounded-3xl bg-[#C6FF34]/10 blur-2xl pointer-events-none transition-opacity duration-700"
            style={{ opacity: chargePercent / 100 }}
          />

          {/* Battery Chassis Container */}
          <div className="relative flex items-center">
            {/* ── LEFT NEGATIVE TERMINAL (ANODE / BASE) ── */}
            <div className="shrink-0 w-4 sm:w-7 h-28 sm:h-44 rounded-l-2xl bg-gradient-to-r from-zinc-800 to-zinc-700 border-y-2 border-l-2 border-zinc-600 flex flex-col items-center justify-center gap-1 shadow-[-4px_0_15px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 -rotate-90 whitespace-nowrap">
                [-] GND
              </span>
              <div className="w-1.5 h-6 rounded-full bg-zinc-900 border border-zinc-600" />
            </div>

            {/* ── MAIN BATTERY CASING ── */}
            <div className="relative flex-1 min-h-[220px] sm:min-h-[280px] rounded-2xl bg-[#090d0b] border-2 border-zinc-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-3.5 sm:p-6 transition-all duration-300">
              {/* Internal Glass Reflection Sheen */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/[0.4] pointer-events-none z-20" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-20" />

              {/* Grid pattern inside chamber */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none z-10"
                style={{
                  backgroundImage: 'linear-gradient(to right, #C6FF34 1px, transparent 1px), linear-gradient(to bottom, #C6FF34 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* ── CHARGE FLUID FILL (RISING / ADVANCING HORIZONTALLY) ── */}
              <div
                className="absolute top-1 bottom-1 left-1 rounded-xl transition-all duration-300 ease-out z-0 overflow-hidden"
                style={{ width: `${Math.max(3, chargePercent)}%` }}
              >
                {/* Gradient liquid body */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/40 via-[#84cc16]/50 to-[#C6FF34]/65 shadow-[0_0_30px_rgba(198,255,52,0.5)]" />

                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

                {/* Vertical scanline energy pulse on fluid */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, #C6FF34, #C6FF34 2px, transparent 2px, transparent 6px)',
                  }}
                />

                {/* Leading edge light blade */}
                <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-white shadow-[0_0_20px_#C6FF34,0_0_40px_#C6FF34]" />

                {/* Bubbling spark particles inside fluid */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-white animate-float-spark"
                      style={{
                        left: `${15 + i * 15}%`,
                        bottom: '10%',
                        animationDelay: `${i * 0.4}s`,
                        animationDuration: `${1.8 + (i % 3) * 0.4}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ── BATTERY TOP TELEMETRY BAR ── */}
              <div className="relative z-30 flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md">
                    <BatteryCharging className="w-3.5 h-3.5 text-[#C6FF34] animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-white tracking-wider">
                      {chargePercent === 100 ? '⚡ FULLY CHARGED' : isCharging ? 'CHARGING CORE...' : 'OPERATIONAL'}
                    </span>
                  </div>

                  <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400">
                    INPUT: <strong className="text-white">36 ENGINES</strong>
                  </span>
                  <span className="hidden md:inline-block text-[10px] font-mono text-zinc-400">
                    OUTPUT: <strong className="text-[#C6FF34]">480V FULL-STACK READINESS</strong>
                  </span>
                </div>

                {/* Charge Percentage Counter & Manual Trigger */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={triggerRecharge}
                    disabled={isCharging}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.12] border border-[#C6FF34]/40 hover:border-[#C6FF34] text-[10px] sm:text-[11px] font-mono text-[#C6FF34] transition-all cursor-pointer disabled:opacity-50"
                    title="Simulate re-charging the battery"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCharging ? 'animate-spin' : ''}`} />
                    <span>{isCharging ? 'CHARGING...' : 'DISCHARGE & RECHARGE'}</span>
                  </button>

                  <div className="px-3 py-0.5 rounded-lg bg-black/80 border border-[#C6FF34]/40 shadow-[0_0_15px_rgba(198,255,52,0.2)]">
                    <span className="text-base sm:text-2xl font-mono font-black text-[#C6FF34] tracking-tight">
                      {chargePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* ── BATTERY CENTER HEART: THE HEROFILL LOGO ARC REACTOR ── */}
              <div className="relative z-30 my-auto py-2 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Energy Shockwave Rings */}
                  <div
                    className="absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full border border-[#C6FF34]/30 pointer-events-none transition-all duration-500"
                    style={{
                      transform: `scale(${1 + (chargePercent / 100) * 0.25})`,
                      boxShadow: chargePercent > 70 ? '0 0 35px rgba(198,255,52,0.3)' : 'none',
                    }}
                  />
                  <div className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-dashed border-[#C6FF34]/40 animate-spin-slow pointer-events-none" />

                  {/* Central Aperture Badge */}
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#060a07] border-2 border-[#C6FF34] shadow-[0_0_35px_rgba(198,255,52,0.4)] flex items-center justify-center p-3 sm:p-4 overflow-hidden group">
                    <Image
                      src="/logos/herofill.svg"
                      alt="Thread Security Core"
                      width={160}
                      height={160}
                      unoptimized
                      className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(198,255,52,0.6)] transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Shimmer on logo */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ── BATTERY SEGMENT MILESTONES (TIER GAUGE) ── */}
              <div className="relative z-30 grid grid-cols-4 gap-1.5 sm:gap-3 pt-2 border-t border-white/[0.08]">
                {MILESTONES.map((milestone) => {
                  const isReached = chargePercent >= milestone.percent;
                  return (
                    <div
                      key={milestone.tier}
                      className={`relative p-1.5 sm:p-2.5 rounded-lg border transition-all duration-300 ${
                        isReached
                          ? 'bg-black/60 border-[#C6FF34]/50 shadow-[0_0_12px_rgba(198,255,52,0.15)]'
                          : 'bg-black/30 border-white/[0.06] opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[9px] sm:text-[10px] font-mono font-bold ${isReached ? 'text-[#C6FF34]' : 'text-zinc-500'}`}>
                          TIER 0{milestone.tier}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-mono text-zinc-400">
                          {milestone.percent}%
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-xs font-serif font-bold text-white truncate">
                        {milestone.title}
                      </div>
                      <div className="hidden sm:block text-[9px] text-zinc-400 font-sans truncate">
                        {milestone.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT POSITIVE TERMINAL (CATHODE CAP) ── */}
            <div className="shrink-0 w-5 sm:w-8 h-20 sm:h-32 rounded-r-2xl bg-gradient-to-l from-[#C6FF34] via-[#84cc16] to-zinc-700 border-y-2 border-r-2 border-[#C6FF34] flex flex-col items-center justify-center gap-1.5 shadow-[6px_0_25px_rgba(198,255,52,0.5)] relative">
              <Zap className="w-3.5 sm:w-5 h-3.5 sm:h-5 text-black animate-bounce" />
              <span className="text-[10px] sm:text-xs font-mono font-black text-black -rotate-90 whitespace-nowrap">
                [+] 480V
              </span>
              {/* Outer electrical spark aura */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-[#C6FF34] blur-md opacity-70 animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── CONDUIT INFLOW VISUALIZER (BATTERY TO BOTTOM FEED) ── */}
        <div className="relative flex items-center justify-center h-8 sm:h-10 pointer-events-none">
          <div className="flex items-center gap-8 sm:gap-16 opacity-60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-[#C6FF34] tracking-tighter">▲ SYNCHRONIZE</span>
                <div className="w-[1.5px] h-6 bg-gradient-to-t from-[#C6FF34]/60 via-[#C6FF34] to-transparent animate-pulse" style={{ animationDelay: `${i * 200 + 100}ms` }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── MARQUEE FEED ROW 2: STREAMING INTO BATTERY (RIGHTWARDS) ── */}
        <div className="relative mt-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-3 sm:gap-4 w-max animate-marquee-right hover:[animation-play-state:paused]">
            {[...FEED_BETA, ...FEED_BETA].map((tech, idx) => (
              <MarqueeTechBadge
                key={`beta-${tech.id}-${idx}`}
                tech={tech}
                isHovered={hoveredTech?.id === tech.id}
                onHover={() => setHoveredTech(tech)}
                onLeave={() => setHoveredTech(null)}
              />
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            HOVER INSPECTION HUD CARD
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-12 max-w-3xl mx-auto min-h-[96px]">
          <AnimatePresence mode="wait">
            {hoveredTech ? (
              <motion.div
                key={hoveredTech.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border-2 border-[#C6FF34]/50 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(198,255,52,0.15)]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2.5 flex items-center justify-center shrink-0 shadow-lg border-2 border-[#C6FF34]">
                  {hoveredTech.iconSrc ? (
                    <img src={hoveredTech.iconSrc} alt={hoveredTech.name} className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <span className="font-mono font-black text-black text-xs sm:text-sm">{hoveredTech.fallbackText || hoveredTech.name.slice(0, 4)}</span>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-serif font-extrabold text-white text-lg sm:text-xl tracking-tight">
                      {hoveredTech.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/40 font-bold shrink-0">
                      {hoveredTech.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-white/[0.06] text-zinc-300 border border-white/10 shrink-0">
                      Tier 0{hoveredTech.powerTier} ({hoveredTech.powerTier * 25}%)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                    {hoveredTech.description}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-mono text-zinc-400 py-4 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <Sparkles className="w-4 h-4 text-[#C6FF34] animate-pulse" />
                <span>Hover over any streaming tech badge to inspect its operational role & syllabus impact</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── BOTTOM POWER METRICS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12 text-center">
          {[
            { value: '36+', label: 'Integrated Cyber Engines', accent: true, sub: 'Zero toy tools' },
            { value: '100%', label: 'Hands-On Penetration Labs', accent: false, sub: 'Daily deployment' },
            { value: '480V', label: 'Maximum Combat Voltage', accent: true, sub: 'Red & blue team ready' },
            { value: '∞', label: 'Continuous Lab Sandbox', accent: false, sub: 'Browser & VM access' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C6FF34]/40 transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono block tracking-tight ${stat.accent ? 'text-[#C6FF34]' : 'text-white'}`}>
                {stat.value}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-serif font-bold block mt-1">
                {stat.label}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CSS KEYFRAME ANIMATIONS ── */}
      <style jsx global>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes floatSpark {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          100% { transform: translateY(-45px) scale(0.4); opacity: 0; }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-marquee-left {
          animation: marqueeLeft 38s linear infinite;
        }
        .animate-marquee-right {
          animation: marqueeRight 38s linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 3.5s ease-in-out infinite;
        }
        .animate-float-spark {
          animation: floatSpark 2.4s ease-out infinite;
        }
        .animate-spin-slow {
          animation: spinSlow 20s linear infinite;
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MARQUEE TECH BADGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
function MarqueeTechBadge({
  tech,
  isHovered,
  onHover,
  onLeave,
}: {
  tech: TechItem;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const categoryBadgeColors: Record<TechItem['category'], string> = {
    ai: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    cyber: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    cloud: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    core: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  };

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all duration-300 ${
        isHovered
          ? 'bg-zinc-900 border-[#C6FF34] shadow-[0_0_25px_rgba(198,255,52,0.35)] scale-105 z-30'
          : 'bg-zinc-950/80 border-white/10 hover:border-[#C6FF34]/60 hover:bg-zinc-900/90'
      } border backdrop-blur-md select-none shrink-0`}
    >
      {/* Icon Medallion */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 ${
          isHovered ? 'scale-110 shadow-[0_0_15px_rgba(198,255,52,0.5)]' : 'group-hover:scale-105'
        }`}
      >
        {tech.iconSrc ? (
          <img
            src={tech.iconSrc}
            alt={tech.name}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] font-mono font-extrabold text-black tracking-tight pointer-events-none">
            {tech.fallbackText || tech.name.slice(0, 3)}
          </span>
        )}
      </div>

      {/* Label and Category Pill */}
      <div className="flex flex-col pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-serif font-bold text-white group-hover:text-[#C6FF34] transition-colors whitespace-nowrap">
            {tech.name}
          </span>
          <span
            className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded-full border ${categoryBadgeColors[tech.category]}`}
          >
            {tech.category}
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-sans truncate max-w-[120px]">
          {tech.role}
        </span>
      </div>

      {/* Power Influx Arrow */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#C6FF34] pl-1">
        <Zap className="w-3.5 h-3.5 animate-pulse" />
      </div>
    </div>
  );
}
