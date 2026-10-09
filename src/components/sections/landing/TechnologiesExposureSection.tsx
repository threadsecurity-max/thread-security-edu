'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Shield,
  Layers,
  Terminal,
  Play,
  Pause,
  RotateCw,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface TechItem {
  id: string;
  name: string;
  category: 'ai' | 'cyber' | 'cloud' | 'core';
  ring: 1 | 2 | 3 | 4; // 1 = inner, 4 = outer
  angle: number; // base angle in degrees along the arc (-75 to +75)
  side: 'left' | 'right';
  iconSrc?: string; // from /TechStack/*.svg if available
  customSvg?: React.ReactNode;
  fallbackText?: string;
  role: string;
  description: string;
}

// ── COMPREHENSIVE TECH ARSENAL (17 from /TechStack + Key Cyber & Systems Tools) ──
const ALL_TECH_ITEMS: TechItem[] = [
  // ────────────────── LEFT SEMI-CIRCLE (AI, ML & DATA INTELLIGENCE) ──────────────────
  // Ring 1 (Inner Arc - R: 150px)
  {
    id: 'pytorch',
    name: 'PyTorch',
    category: 'ai',
    ring: 1,
    angle: -45,
    side: 'left',
    iconSrc: '/TechStack/PyTorch.svg',
    role: 'Deep Learning & Neural Architectures',
    description: 'Build and audit neural models, adversarial classifiers, and threat detection pipelines.',
  },
  {
    id: 'jupyter',
    name: 'Jupyter',
    category: 'ai',
    ring: 1,
    angle: 0,
    side: 'left',
    iconSrc: '/TechStack/Jupyter.svg',
    role: 'Interactive Research Notebooks',
    description: 'Exploratory threat data analysis, live exploit prototyping, and visual model verification.',
  },
  {
    id: 'flask',
    name: 'Flask',
    category: 'core',
    ring: 1,
    angle: 45,
    side: 'left',
    iconSrc: '/TechStack/Flask.svg',
    role: 'Microservice API Prototyping',
    description: 'Lightweight web service backends for security hooks, telemetry dispatch, and CTF challenges.',
  },

  // Ring 2 (Middle-Inner Arc - R: 230px)
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    category: 'ai',
    ring: 2,
    angle: -60,
    side: 'left',
    iconSrc: '/TechStack/TensorFlow.svg',
    role: 'Production Machine Learning',
    description: 'Large-scale anomaly detection, malware signature clustering, and tensor optimizations.',
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'core',
    ring: 2,
    angle: -20,
    side: 'left',
    iconSrc: '/TechStack/FastAPI.svg',
    role: 'Asynchronous Cyber Services',
    description: 'High-throughput async security microservices, automated threat ingestion endpoints, and auth handlers.',
  },
  {
    id: 'opencv',
    name: 'OpenCV',
    category: 'ai',
    ring: 2,
    angle: 20,
    side: 'left',
    iconSrc: '/TechStack/OpenCV.svg',
    role: 'Computer Vision & Forensics',
    description: 'Visual artifact forensics, deepfake detection, and biometrics analysis.',
  },
  {
    id: 'streamlit',
    name: 'Streamlit',
    category: 'ai',
    ring: 2,
    angle: 60,
    side: 'left',
    iconSrc: '/TechStack/Streamlit.svg',
    role: 'Rapid Security Dashboarding',
    description: 'Deploy real-time threat investigation frontends and incident report generators in hours.',
  },

  // Ring 3 (Middle-Outer Arc - R: 310px)
  {
    id: 'scikit-learn',
    name: 'scikit-learn',
    category: 'ai',
    ring: 3,
    angle: -65,
    side: 'left',
    iconSrc: '/TechStack/scikit-learn.svg',
    role: 'Statistical Machine Learning',
    description: 'Random Forest anomaly detection, clustering network intrusions, and feature engineering.',
  },
  {
    id: 'kaggle',
    name: 'Kaggle',
    category: 'ai',
    ring: 3,
    angle: -30,
    side: 'left',
    iconSrc: '/TechStack/Kaggle.svg',
    role: 'Global Benchmark Datasets',
    description: 'Benchmark models against global cyber threat corpora and adversarial datasets.',
  },
  {
    id: 'matplotlib',
    name: 'Matplotlib',
    category: 'core',
    ring: 3,
    angle: 0,
    side: 'left',
    iconSrc: '/TechStack/Matplotlib.svg',
    role: 'Scientific Threat Visuals',
    description: 'Plot network latency anomalies, packet frequency histograms, and security metric surfaces.',
  },
  {
    id: 'plotly',
    name: 'Plotly',
    category: 'core',
    ring: 3,
    angle: 30,
    side: 'left',
    iconSrc: '/TechStack/Ploty.svg',
    role: 'Interactive Cyber Telemetry',
    description: 'Multidimensional threat graphs, attack path scatter plots, and drill-down visuals.',
  },
  {
    id: 'matlab',
    name: 'MATLAB',
    category: 'core',
    ring: 3,
    angle: 65,
    side: 'left',
    iconSrc: '/TechStack/MATLAB.svg',
    role: 'Signal Processing & Cryptography',
    description: 'Spectral analysis, cryptographic algorithm simulation, and mathematical modeling.',
  },

  // Ring 4 (Outer Arc - R: 390px)
  {
    id: 'pyscript',
    name: 'PyScript',
    category: 'core',
    ring: 4,
    angle: -70,
    side: 'left',
    iconSrc: '/TechStack/PyScript.svg',
    role: 'Client-Side Python Engine',
    description: 'Run sandboxed Python code directly inside browser execution contexts without server overhead.',
  },
  {
    id: 'python',
    name: 'Python',
    category: 'core',
    ring: 4,
    angle: -40,
    side: 'left',
    fallbackText: 'Py',
    role: 'Tactical Scripting & Exploit Dev',
    description: 'The lingua franca of cybersecurity research, automated scrapers, and exploit payload delivery.',
  },
  {
    id: 'pandas',
    name: 'Pandas',
    category: 'ai',
    ring: 4,
    angle: -10,
    side: 'left',
    fallbackText: 'Pd',
    role: 'SIEM Log Analysis & Telemetry',
    description: 'High-speed ingestion and transformation of gigabyte-scale firewall and syslog datasets.',
  },
  {
    id: 'numpy',
    name: 'NumPy',
    category: 'core',
    ring: 4,
    angle: 15,
    side: 'left',
    fallbackText: 'Np',
    role: 'Linear Algebra & Cryptographic Math',
    description: 'Vectorized computing powering cryptanalysis, matrix permutations, and threat algorithms.',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'ai',
    ring: 4,
    angle: 45,
    side: 'left',
    fallbackText: 'HF',
    role: 'LLM & Transformer Security',
    description: 'Deploy, fine-tune, and red-team open-source language models and adversarial guardrails.',
  },
  {
    id: 'langchain',
    name: 'LangChain',
    category: 'ai',
    ring: 4,
    angle: 70,
    side: 'left',
    fallbackText: 'LC',
    role: 'Agentic AI Architecture',
    description: 'Audit autonomous agent loops, prompt injection surfaces, and retrieval-augmented pipelines.',
  },

  // ────────────────── RIGHT SEMI-CIRCLE (CYBER DEFENSE, CLOUD & SYSTEMS) ──────────────────
  // Ring 1 (Inner Arc - R: 150px)
  {
    id: 'bash',
    name: 'Bash',
    category: 'cyber',
    ring: 1,
    angle: -45,
    side: 'right',
    iconSrc: '/TechStack/Bash.svg',
    role: 'Kernel Shell & Tactical Automation',
    description: 'Command line mastery, cron surveillance, and post-exploitation shell stabilization.',
  },
  {
    id: 'selenium',
    name: 'Selenium',
    category: 'cyber',
    ring: 1,
    angle: 0,
    side: 'right',
    iconSrc: '/TechStack/Selenium.svg',
    role: 'Headless Browser Penetration Testing',
    description: 'Automated vulnerability crawling, XSS payload propagation testing, and web app fuzzing.',
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'core',
    ring: 1,
    angle: 45,
    side: 'right',
    iconSrc: '/TechStack/Angular.svg',
    role: 'Enterprise Web Security',
    description: 'Deep dive into strict CSP, DOM sanitization, and enterprise single-page application defense.',
  },

  // Ring 2 (Middle-Inner Arc - R: 230px)
  {
    id: 'aws',
    name: 'AWS Cloud',
    category: 'cloud',
    ring: 2,
    angle: -60,
    side: 'right',
    iconSrc: '/TechStack/AWS.svg',
    role: 'Cloud Security Architecture',
    description: 'IAM privilege escalation testing, S3 bucket policy hardening, VPC peering, and AWS GuardDuty.',
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'cloud',
    ring: 2,
    angle: -20,
    side: 'right',
    fallbackText: 'Dckr',
    role: 'Containerization & Sandbox Isolation',
    description: 'Spin up isolated victim targets, analyze container escape exploits, and build hardened images.',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'cloud',
    ring: 2,
    angle: 20,
    side: 'right',
    fallbackText: 'K8s',
    role: 'Cluster Defense & Orchestration',
    description: 'Role-based access control (RBAC), pod security standards, and microsegmentation with network policies.',
  },
  {
    id: 'kali',
    name: 'Kali Linux',
    category: 'cyber',
    ring: 2,
    angle: 60,
    side: 'right',
    fallbackText: 'Kali',
    role: 'Offensive Penetration Testing OS',
    description: 'Industry-standard penetration testing distribution loaded with tactical security evaluation tools.',
  },

  // Ring 3 (Middle-Outer Arc - R: 310px)
  {
    id: 'wireshark',
    name: 'Wireshark',
    category: 'cyber',
    ring: 3,
    angle: -65,
    side: 'right',
    fallbackText: 'Wire',
    role: 'Deep Packet Inspection (DPI)',
    description: 'Packet capture dissection, protocol anomaly detection, and exfiltration stream tracking.',
  },
  {
    id: 'metasploit',
    name: 'Metasploit',
    category: 'cyber',
    ring: 3,
    angle: -30,
    side: 'right',
    fallbackText: 'MSF',
    role: 'Exploitation & Adversary Emulation',
    description: 'CVE verification, payload staging, and automated lateral movement simulations.',
  },
  {
    id: 'burpsuite',
    name: 'Burp Suite',
    category: 'cyber',
    ring: 3,
    angle: 0,
    side: 'right',
    fallbackText: 'Burp',
    role: 'Web Application VAPT',
    description: 'Intercepting proxy, automated fuzzing, CSRF validation, and OWASP Top 10 auditing.',
  },
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'cyber',
    ring: 3,
    angle: 30,
    side: 'right',
    fallbackText: 'Nmap',
    role: 'Network Reconnaissance & Port Scanning',
    description: 'NSE script automation, host discovery, OS fingerprinting, and service version enumeration.',
  },
  {
    id: 'ghidra',
    name: 'Ghidra',
    category: 'cyber',
    ring: 3,
    angle: 65,
    side: 'right',
    fallbackText: 'Ghdr',
    role: 'NSA Reverse Engineering Suite',
    description: 'Decompile malicious binaries, analyze assembly control flow, and unearth zero-day logic flaws.',
  },

  // Ring 4 (Outer Arc - R: 390px)
  {
    id: 'splunk',
    name: 'Splunk',
    category: 'cyber',
    ring: 4,
    angle: -70,
    side: 'right',
    fallbackText: 'Splk',
    role: 'SIEM & SOC Threat Hunting',
    description: 'Real-time alert correlation, SPL query tuning, and blue-team incident triage workflows.',
  },
  {
    id: 'suricata',
    name: 'Suricata',
    category: 'cyber',
    ring: 4,
    angle: -40,
    side: 'right',
    fallbackText: 'Suri',
    role: 'Next-Gen IDS / IPS Engine',
    description: 'High-speed signature matching, zero-day heuristic filtering, and automated traffic quarantine.',
  },
  {
    id: 'git',
    name: 'Git & GitHub',
    category: 'core',
    ring: 4,
    angle: -10,
    side: 'right',
    fallbackText: 'Git',
    role: 'DevSecOps & Code Integrity',
    description: 'Commit signing, branch protection rules, secret scanning, and automated CI/CD gating.',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'core',
    ring: 4,
    angle: 15,
    side: 'right',
    fallbackText: 'PG',
    role: 'Cryptographic Ledger & Relational DB',
    description: 'Acid-compliant security audits, row-level security (RLS), and encrypted data-at-rest storage.',
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'core',
    ring: 4,
    angle: 45,
    side: 'right',
    fallbackText: 'Rds',
    role: 'Ultra-Fast Memory Caching & Rate Limiting',
    description: 'Token bucket DDoS defense, session store invalidation, and sub-millisecond pub/sub alerts.',
  },
  {
    id: 'linux',
    name: 'Linux Kernel',
    category: 'core',
    ring: 4,
    angle: 70,
    side: 'right',
    fallbackText: 'Lnx',
    role: 'Operating System Hardening',
    description: 'Kernel namespaces, cgroups, AppArmor/SELinux mandatory access controls, and iptables rules.',
  },
];

// Ring radii definition
const RING_RADII = {
  1: 140,
  2: 220,
  3: 300,
  4: 380,
};

export function TechnologiesExposureSection() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'cyber' | 'cloud'>('all');
  const [isRotating, setIsRotating] = useState(true);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);

  // Smooth continuous oscillation / rotation of the dual semi-circles
  useEffect(() => {
    if (!isRotating) return;

    const interval = setInterval(() => {
      setRotationOffset((prev) => (prev + 0.35) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, [isRotating]);

  // Filter items based on active pill
  const filteredItems = ALL_TECH_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'ai') return item.category === 'ai';
    if (selectedCategory === 'cyber') return item.category === 'cyber';
    if (selectedCategory === 'cloud') return item.category === 'cloud' || item.category === 'core';
    return true;
  });

  return (
    <section className="relative py-24 sm:py-32 bg-[#050706] text-white overflow-hidden border-t border-b border-white/[0.08] select-none">
      {/* ── AMBIENT NEON GLOWS & BACKGROUND GRID ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(198,255,52,0.06),rgba(255,255,255,0))]" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#C6FF34]/[0.025] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/[0.025] rounded-full blur-3xl pointer-events-none" />

      {/* Cybernetic Dot Matrix Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#C6FF34 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#C6FF34] uppercase">
              LIVE TOOLING ECOSYSTEM
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Comprehensive <span className="text-[#C6FF34]">Technologies Exposure</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
            From low-level reverse engineering and adversarial cloud exploitation to enterprise deep learning models. 
            Students train directly inside production-grade tools from day one.
          </p>

          {/* Category Filter Chips & Animation Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            {[
              { id: 'all', label: 'All Technologies (36+)' },
              { id: 'ai', label: 'AI & Data Intelligence' },
              { id: 'cyber', label: 'Offensive & Defensive Cyber' },
              { id: 'cloud', label: 'Cloud & Infrastructure' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#C6FF34] text-black shadow-[0_0_20px_rgba(198,255,52,0.3)]'
                    : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => setIsRotating(!isRotating)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.08] hover:text-white hover:border-[#C6FF34]/50 transition-all cursor-pointer ml-1"
              title={isRotating ? 'Pause rotation' : 'Resume rotation'}
            >
              {isRotating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#C6FF34]" />
                  <span>Orbit Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Paused</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── DUAL 90° ROTATED SEMI-CIRCLE ORBITAL ARENA ── */}
        <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-3xl bg-black/40 border border-white/[0.08] backdrop-blur-2xl p-4 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
          {/* Top arena indicator badges */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-white/[0.06] pb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-300 font-bold uppercase tracking-wider">
                WEST WING • AI &amp; MACHINE LEARNING
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-[#C6FF34]">
                DUAL 90° ORBITAL ACCELERATOR
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-bold uppercase tracking-wider">
                EAST WING • CYBER WARFARE &amp; CLOUD
              </span>
              <span className="w-2 h-2 rounded-full bg-[#C6FF34]" />
            </div>
          </div>

          {/* Interactive Radar Visual Canvas Container */}
          <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] flex items-center justify-center overflow-hidden">
            {/* ──────── CENTRAL TACTICAL CORE NODE (BRIDGE) ──────── */}
            <div className="absolute z-30 flex flex-col items-center justify-center pointer-events-none">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#080c09] border border-[#C6FF34]/40 shadow-[0_0_35px_rgba(198,255,52,0.25)] flex flex-col items-center gap-1.5 text-center pointer-events-auto hover:border-[#C6FF34] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/15 border border-[#C6FF34]/40 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#C6FF34]" />
                </div>
                <span className="text-[11px] font-mono font-extrabold tracking-widest text-[#C6FF34] uppercase">
                  THREAD SECURITY
                </span>
                <span className="text-[9px] font-mono text-zinc-400 tracking-wider">
                  TACTICAL RADAR
                </span>
              </div>
            </div>

            {/* ──────── LEFT SEMI-CIRCLE SYSTEM (90° ROTATED, FACING LEFT / WEST) ──────── */}
            <div className="absolute left-1/2 -translate-x-[100%] w-[420px] sm:w-[500px] lg:w-[560px] h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-end pointer-events-none">
              <div className="relative w-full h-full">
                {/* Concentric Guide Track Arcs */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                  viewBox="-400 -400 800 800"
                >
                  <defs>
                    <linearGradient id="leftArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C6FF34" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  {[140, 220, 300, 380].map((r, i) => (
                    <path
                      key={i}
                      // Semi-circle arc curving to the left: from top (0, -r) through (-r, 0) to bottom (0, r)
                      d={`M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r}`}
                      fill="none"
                      stroke="url(#leftArcGrad)"
                      strokeWidth={i === 3 ? '1.5' : '1'}
                      strokeDasharray={i % 2 === 1 ? '4 4' : 'none'}
                      opacity={0.35 + i * 0.12}
                    />
                  ))}
                  {/* Subtle Radar sweep beam on left */}
                  <line
                    x1="0"
                    y1="0"
                    x2={-380 * Math.cos(((rotationOffset * 1.5) % 90) * (Math.PI / 180))}
                    y2={380 * Math.sin(((rotationOffset * 1.5 - 45) % 90) * (Math.PI / 180))}
                    stroke="#C6FF34"
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                  />
                </svg>

                {/* Left Orbiting Nodes */}
                {filteredItems
                  .filter((item) => item.side === 'left')
                  .map((item) => {
                    const radius = RING_RADII[item.ring];
                    // Base angle + dynamic wave movement (smooth harmonic oscillation along the semi-circle arc)
                    const harmonicMovement =
                      Math.sin((rotationOffset * 0.05 + item.ring * 1.2) * Math.PI) * 16;
                    const dynamicAngleDeg = item.angle + harmonicMovement;

                    // Convert angle along the left-facing semi-circle (-90° to +90° relative to -X axis)
                    // At 0 deg: exactly at (-radius, 0)
                    // At -90 deg: at (0, -radius)
                    // At +90 deg: at (0, +radius)
                    const angleRad = (dynamicAngleDeg * Math.PI) / 180;
                    const x = -radius * Math.cos(angleRad);
                    const y = radius * Math.sin(angleRad);

                    const isHovered = hoveredTech?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className="absolute pointer-events-auto transition-transform duration-150"
                        style={{
                          left: `calc(100% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <TechBadge
                          item={item}
                          isHovered={isHovered}
                          onMouseEnter={() => setHoveredTech(item)}
                          onMouseLeave={() => setHoveredTech(null)}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ──────── RIGHT SEMI-CIRCLE SYSTEM (90° ROTATED, FACING RIGHT / EAST) ──────── */}
            <div className="absolute right-1/2 translate-x-[100%] w-[420px] sm:w-[500px] lg:w-[560px] h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-start pointer-events-none">
              <div className="relative w-full h-full">
                {/* Concentric Guide Track Arcs */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                  viewBox="-400 -400 800 800"
                >
                  <defs>
                    <linearGradient id="rightArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C6FF34" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  {[140, 220, 300, 380].map((r, i) => (
                    <path
                      key={i}
                      // Semi-circle arc curving to the right: from top (0, -r) through (+r, 0) to bottom (0, r)
                      d={`M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r}`}
                      fill="none"
                      stroke="url(#rightArcGrad)"
                      strokeWidth={i === 3 ? '1.5' : '1'}
                      strokeDasharray={i % 2 === 1 ? '4 4' : 'none'}
                      opacity={0.35 + i * 0.12}
                    />
                  ))}
                  {/* Subtle Radar sweep beam on right */}
                  <line
                    x1="0"
                    y1="0"
                    x2={380 * Math.cos(((rotationOffset * 1.5) % 90) * (Math.PI / 180))}
                    y2={380 * Math.sin(((rotationOffset * 1.5 - 45) % 90) * (Math.PI / 180))}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                  />
                </svg>

                {/* Right Orbiting Nodes */}
                {filteredItems
                  .filter((item) => item.side === 'right')
                  .map((item) => {
                    const radius = RING_RADII[item.ring];
                    // Dynamic harmonic movement in complementary counter-phase
                    const harmonicMovement =
                      -Math.sin((rotationOffset * 0.05 + item.ring * 1.2) * Math.PI) * 16;
                    const dynamicAngleDeg = item.angle + harmonicMovement;

                    // Convert angle along the right-facing semi-circle (-90° to +90° relative to +X axis)
                    const angleRad = (dynamicAngleDeg * Math.PI) / 180;
                    const x = radius * Math.cos(angleRad);
                    const y = radius * Math.sin(angleRad);

                    const isHovered = hoveredTech?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className="absolute pointer-events-auto transition-transform duration-150"
                        style={{
                          left: `calc(0% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <TechBadge
                          item={item}
                          isHovered={isHovered}
                          onMouseEnter={() => setHoveredTech(item)}
                          onMouseLeave={() => setHoveredTech(null)}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* ──────── TACTICAL INSPECTION CARD (DYNAMIC HOVER HUD) ──────── */}
          <div className="mt-4 pt-4 border-t border-white/[0.08] min-h-[96px] flex items-center justify-between gap-4">
            {hoveredTech ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-[#C6FF34]/30"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-md">
                    {hoveredTech.iconSrc ? (
                      <img
                        src={hoveredTech.iconSrc}
                        alt={hoveredTech.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-mono font-extrabold text-black text-sm">
                        {hoveredTech.fallbackText || hoveredTech.name.slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-white text-base">
                        {hoveredTech.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30">
                        {hoveredTech.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed">
                      {hoveredTech.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Syllabus Level: <strong className="text-white">Hands-on Sandbox</strong>
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-500 py-2 px-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C6FF34]" />
                  <span>Hover or tap any orbital node above to inspect syllabus integration &amp; operational utility.</span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span>Concentric Tracks: 4 Orbit Rings</span>
                  <span>•</span>
                  <span>Opposing Phase: Symmetrical 90° Shift</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER CALLOUT METRICS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 text-center">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C6FF34] block">
              100%
            </span>
            <span className="text-xs text-zinc-400 font-sans block">Real Tools, Zero Dummy Mocks</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">
              36+
            </span>
            <span className="text-xs text-zinc-400 font-sans block">Active Frameworks &amp; Stacks</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C6FF34] block">
              Dual 90°
            </span>
            <span className="text-xs text-zinc-400 font-sans block">AI &amp; Cyber Orbital Parity</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">
              Direct CLI
            </span>
            <span className="text-xs text-zinc-400 font-sans block">Cloud Sandboxes &amp; CTF Labs</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SUB-COMPONENT: CIRCULAR ORBITAL BADGE (MATCHING THE REFERENCE IMAGE MEDALLION STYLE) ──
function TechBadge({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  item: TechItem;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
        isHovered ? 'scale-125 z-40' : 'scale-100 hover:scale-115 z-20'
      }`}
    >
      {/* Outer Glow Halo on Hover */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 pointer-events-none ${
          isHovered
            ? 'opacity-100 bg-[#C6FF34]/60'
            : 'opacity-0 group-hover:opacity-60 bg-[#C6FF34]/30'
        }`}
      />

      {/* Circular White Medallion (Crisp high-contrast look directly inspired by the user reference image) */}
      <div
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.7)] border-2 transition-all ${
          isHovered
            ? 'border-[#C6FF34] shadow-[0_0_24px_rgba(198,255,52,0.8)]'
            : 'border-white/80 group-hover:border-[#C6FF34]'
        }`}
      >
        {item.iconSrc ? (
          <img
            src={item.iconSrc}
            alt={item.name}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
          />
        ) : (
          <span className="text-[11px] sm:text-xs font-mono font-extrabold text-black tracking-tight select-none pointer-events-none">
            {item.fallbackText || item.name.slice(0, 3)}
          </span>
        )}
      </div>

      {/* Floating Micro-Badge Label */}
      <span
        className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-md ${
          isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {item.name}
      </span>
    </div>
  );
}
