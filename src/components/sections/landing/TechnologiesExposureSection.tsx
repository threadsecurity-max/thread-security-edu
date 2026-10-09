'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Zap } from 'lucide-react';

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
}

/* ═══════════════════════════════════════════════════════════════════════════
   TECH ITEMS — 36 Tools Distributed Across 4 Orbital Rings
   ═══════════════════════════════════════════════════════════════════════════ */

// Ring 1 (innermost) — 6 items
const RING_1: TechItem[] = [
  { id: 'pytorch', name: 'PyTorch', category: 'ai', iconSrc: '/TechStack/PyTorch.svg', role: 'Deep Learning', description: 'Build adversarial classifiers and neural threat detection models.' },
  { id: 'bash', name: 'Bash', category: 'cyber', iconSrc: '/TechStack/Bash.svg', role: 'Shell Automation', description: 'Post-exploitation shells, cron surveillance, and scripted recon.' },
  { id: 'jupyter', name: 'Jupyter', category: 'ai', iconSrc: '/TechStack/Jupyter.svg', role: 'Research Notebooks', description: 'Interactive threat data exploration and live exploit prototyping.' },
  { id: 'selenium', name: 'Selenium', category: 'cyber', iconSrc: '/TechStack/Selenium.svg', role: 'Browser Pentesting', description: 'XSS propagation, automated crawling, and web fuzzing.' },
  { id: 'flask', name: 'Flask', category: 'core', iconSrc: '/TechStack/Flask.svg', role: 'Security APIs', description: 'Lightweight CTF challenge backends and telemetry dispatch.' },
  { id: 'angular', name: 'Angular', category: 'core', iconSrc: '/TechStack/Angular.svg', role: 'Enterprise Web', description: 'Strict CSP policies, DOM sanitization, and SPA defense.' },
];

// Ring 2 — 8 items
const RING_2: TechItem[] = [
  { id: 'tensorflow', name: 'TensorFlow', category: 'ai', iconSrc: '/TechStack/TensorFlow.svg', role: 'Production ML', description: 'Anomaly detection, malware clustering, and tensor optimizations.' },
  { id: 'aws', name: 'AWS Cloud', category: 'cloud', iconSrc: '/TechStack/AWS.svg', role: 'Cloud Security', description: 'IAM escalation testing, S3 hardening, VPC peering, and GuardDuty.' },
  { id: 'fastapi', name: 'FastAPI', category: 'core', iconSrc: '/TechStack/FastAPI.svg', role: 'Async Services', description: 'High-throughput security microservices and threat ingestion.' },
  { id: 'docker', name: 'Docker', category: 'cloud', fallbackText: 'Dckr', role: 'Containerization', description: 'Isolated victim targets and container escape analysis.' },
  { id: 'opencv', name: 'OpenCV', category: 'ai', iconSrc: '/TechStack/OpenCV.svg', role: 'Vision & Forensics', description: 'Deepfake detection, artifact forensics, and biometrics.' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'cloud', fallbackText: 'K8s', role: 'Cluster Defense', description: 'RBAC, pod security standards, and network microsegmentation.' },
  { id: 'streamlit', name: 'Streamlit', category: 'ai', iconSrc: '/TechStack/Streamlit.svg', role: 'Rapid Dashboards', description: 'Real-time threat investigation and incident report UIs.' },
  { id: 'kali', name: 'Kali Linux', category: 'cyber', fallbackText: 'Kali', role: 'Offensive OS', description: 'Industry-standard penetration testing distribution.' },
];

// Ring 3 — 10 items
const RING_3: TechItem[] = [
  { id: 'scikit', name: 'scikit-learn', category: 'ai', iconSrc: '/TechStack/scikit-learn.svg', role: 'Statistical ML', description: 'Random Forest anomaly detection and intrusion clustering.' },
  { id: 'wireshark', name: 'Wireshark', category: 'cyber', fallbackText: 'Wire', role: 'Packet Inspection', description: 'Protocol dissection, exfiltration tracking, and DPI.' },
  { id: 'kaggle', name: 'Kaggle', category: 'ai', iconSrc: '/TechStack/Kaggle.svg', role: 'Benchmark Data', description: 'Global cyber threat corpora and adversarial datasets.' },
  { id: 'metasploit', name: 'Metasploit', category: 'cyber', fallbackText: 'MSF', role: 'Exploitation', description: 'CVE verification, payload staging, and lateral movement.' },
  { id: 'matplotlib', name: 'Matplotlib', category: 'core', iconSrc: '/TechStack/Matplotlib.svg', role: 'Threat Visuals', description: 'Anomaly plots, packet histograms, and security surfaces.' },
  { id: 'burpsuite', name: 'Burp Suite', category: 'cyber', fallbackText: 'Burp', role: 'Web App VAPT', description: 'Proxy intercept, fuzzing, CSRF checks, and OWASP auditing.' },
  { id: 'plotly', name: 'Plotly', category: 'core', iconSrc: '/TechStack/Ploty.svg', role: 'Interactive Charts', description: 'Attack path scatter plots and drill-down telemetry.' },
  { id: 'nmap', name: 'Nmap', category: 'cyber', fallbackText: 'Nmap', role: 'Network Recon', description: 'NSE scripting, host discovery, and OS fingerprinting.' },
  { id: 'matlab', name: 'MATLAB', category: 'core', iconSrc: '/TechStack/MATLAB.svg', role: 'Signal Processing', description: 'Spectral analysis and cryptographic algorithm simulation.' },
  { id: 'ghidra', name: 'Ghidra', category: 'cyber', fallbackText: 'Ghdr', role: 'Reverse Engineering', description: 'NSA-grade binary decompilation and zero-day logic analysis.' },
];

// Ring 4 (outermost) — 12 items
const RING_4: TechItem[] = [
  { id: 'pyscript', name: 'PyScript', category: 'core', iconSrc: '/TechStack/PyScript.svg', role: 'Browser Python', description: 'Sandboxed Python directly in the browser context.' },
  { id: 'splunk', name: 'Splunk', category: 'cyber', fallbackText: 'Splk', role: 'SIEM Hunting', description: 'Alert correlation, SPL tuning, and incident triage.' },
  { id: 'python', name: 'Python', category: 'core', fallbackText: 'Py', role: 'Tactical Scripting', description: 'The lingua franca of cybersecurity and exploit dev.' },
  { id: 'suricata', name: 'Suricata', category: 'cyber', fallbackText: 'Suri', role: 'IDS / IPS Engine', description: 'Signature matching, heuristic filtering, and quarantine.' },
  { id: 'pandas', name: 'Pandas', category: 'ai', fallbackText: 'Pd', role: 'Log Analysis', description: 'Gigabyte-scale firewall and syslog transformation.' },
  { id: 'git', name: 'Git & GitHub', category: 'core', fallbackText: 'Git', role: 'DevSecOps', description: 'Commit signing, secret scanning, and CI/CD gating.' },
  { id: 'numpy', name: 'NumPy', category: 'core', fallbackText: 'Np', role: 'Cryptographic Math', description: 'Vectorized cryptanalysis and matrix permutations.' },
  { id: 'postgres', name: 'PostgreSQL', category: 'core', fallbackText: 'PG', role: 'Relational Security', description: 'Row-level security (RLS) and encrypted storage.' },
  { id: 'huggingface', name: 'Hugging Face', category: 'ai', fallbackText: 'HF', role: 'LLM Security', description: 'Red-team open-source models and adversarial guardrails.' },
  { id: 'redis', name: 'Redis', category: 'core', fallbackText: 'Rds', role: 'Rate Limiting', description: 'DDoS defense, session invalidation, and pub/sub alerts.' },
  { id: 'langchain', name: 'LangChain', category: 'ai', fallbackText: 'LC', role: 'Agentic AI', description: 'Audit autonomous agents and prompt injection surfaces.' },
  { id: 'linux', name: 'Linux Kernel', category: 'core', fallbackText: 'Lnx', role: 'OS Hardening', description: 'Namespaces, cgroups, SELinux, and iptables mastery.' },
];

const ALL_RINGS = [RING_1, RING_2, RING_3, RING_4];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export function TechnologiesExposureSection() {
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);

  return (
    <section className="relative py-24 sm:py-32 bg-[#050706] text-white overflow-hidden select-none">
      {/* ── AMBIENT LAYERS ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(198,255,52,0.05),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C6FF34 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#C6FF34] uppercase">
              LIVE TOOLING ECOSYSTEM
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Technologies You Will{' '}
            <span className="relative inline-block">
              <span className="text-[#C6FF34]">Master</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6c40-4 80-4 196 0" stroke="#C6FF34" strokeWidth="2" strokeLinecap="round" opacity="0.5" /></svg>
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
            From reverse engineering and adversarial cloud exploitation to production-scale deep learning.
            Our cadets train directly inside <strong className="text-white">36+ industry-grade tools</strong> from day one.
          </p>
        </div>

        {/* ── OPEN RADAR ORBITAL ARENA ── */}
        <div className="relative w-full flex items-center justify-center">
          {/* The open arena with no box border — pure floating radar */}
          <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] md:w-[640px] md:h-[640px] lg:w-[780px] lg:h-[780px]">

            {/* ──── CONCENTRIC RING TRACKS (SVG) ──── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 800">
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C6FF34" stopOpacity="0.12" />
                  <stop offset="60%" stopColor="#C6FF34" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C6FF34" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#C6FF34" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Soft core glow */}
              <circle cx="400" cy="400" r="380" fill="url(#radarGlow)" />

              {/* Concentric orbit track rings */}
              {[120, 190, 270, 360].map((r, i) => (
                <circle key={i} cx="400" cy="400" r={r} fill="none" stroke="url(#ringStroke)" strokeWidth={i === 3 ? '1' : '0.8'} strokeDasharray={i % 2 === 0 ? 'none' : '6 6'} opacity={0.3 + i * 0.1} />
              ))}

              {/* Cross-hair tactical lines */}
              <line x1="400" y1="30" x2="400" y2="770" stroke="#C6FF34" strokeWidth="0.5" opacity="0.08" />
              <line x1="30" y1="400" x2="770" y2="400" stroke="#C6FF34" strokeWidth="0.5" opacity="0.08" />
              <line x1="120" y1="120" x2="680" y2="680" stroke="#C6FF34" strokeWidth="0.3" opacity="0.05" />
              <line x1="680" y1="120" x2="120" y2="680" stroke="#C6FF34" strokeWidth="0.3" opacity="0.05" />

              {/* Rotating radar sweep beam */}
              <g className="origin-center" style={{ transformOrigin: '400px 400px', animation: 'radarSweep 8s linear infinite' }}>
                <line x1="400" y1="400" x2="400" y2="40" stroke="#C6FF34" strokeWidth="1.5" opacity="0.3" />
                <line x1="400" y1="400" x2="400" y2="40" stroke="#C6FF34" strokeWidth="8" opacity="0.06" filter="blur(4px)" />
              </g>
            </svg>

            {/* ──── CENTER CORE — HEROFILL LOGO ──── */}
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 pointer-events-auto">
                {/* Outer glow ring */}
                <div className="absolute -inset-3 rounded-full bg-[#C6FF34]/10 blur-xl animate-pulse pointer-events-none" />
                <div className="absolute -inset-1 rounded-full border border-[#C6FF34]/30 pointer-events-none" />

                {/* Logo container */}
                <div className="relative w-full h-full rounded-full bg-[#080c09] border-2 border-[#C6FF34]/50 shadow-[0_0_40px_rgba(198,255,52,0.2)] flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logos/herofill.svg"
                    alt="Thread Security Education"
                    width={120}
                    height={120}
                    unoptimized
                    className="w-[70%] h-[70%] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* ──── ORBITING TECH NODES ──── */}
            {ALL_RINGS.map((ring, ringIndex) => {
              const ringRadius = [120, 190, 270, 360][ringIndex];
              const itemCount = ring.length;
              // Duration varies per ring — inner spins faster, outer slower
              const duration = [28, 36, 46, 58][ringIndex];
              // Alternate ring rotation direction
              const direction = ringIndex % 2 === 0 ? 1 : -1;

              return (
                <div
                  key={ringIndex}
                  className="absolute inset-0"
                  style={{
                    animation: `spin${direction > 0 ? 'CW' : 'CCW'} ${duration}s linear infinite`,
                  }}
                >
                  {ring.map((item, itemIndex) => {
                    // Distribute evenly around full circle
                    const angleDeg = (360 / itemCount) * itemIndex;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    // Convert polar to cartesian — center is 50% 50%
                    const radiusPercent = (ringRadius / 800) * 100;
                    const xPercent = 50 + radiusPercent * Math.cos(angleRad);
                    const yPercent = 50 + radiusPercent * Math.sin(angleRad);
                    const isHovered = hoveredTech?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                          transform: 'translate(-50%, -50%)',
                          // Counter-rotate so icons stay upright
                          animation: `spin${direction > 0 ? 'CCW' : 'CW'} ${duration}s linear infinite`,
                        }}
                      >
                        <div
                          onMouseEnter={() => setHoveredTech(item)}
                          onMouseLeave={() => setHoveredTech(null)}
                          className={`group relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
                            isHovered ? 'scale-[1.45] z-50' : 'hover:scale-[1.25] z-20'
                          }`}
                        >
                          {/* Hover halo */}
                          <div className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
                            isHovered ? 'opacity-100 bg-[#C6FF34]/50 blur-lg scale-150' : 'opacity-0 group-hover:opacity-50 bg-[#C6FF34]/30 blur-md scale-125'
                          }`} />

                          {/* White medallion badge */}
                          <div className={`relative flex items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] border-2 transition-all duration-300 ${
                            isHovered ? 'border-[#C6FF34] shadow-[0_0_28px_rgba(198,255,52,0.7)]' : 'border-white/70 group-hover:border-[#C6FF34]/80'
                          } w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 p-1.5`}>
                            {item.iconSrc ? (
                              <img src={item.iconSrc} alt={item.name} className="w-full h-full object-contain pointer-events-none" loading="lazy" />
                            ) : (
                              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-extrabold text-black tracking-tight select-none pointer-events-none">
                                {item.fallbackText || item.name.slice(0, 3)}
                              </span>
                            )}
                          </div>

                          {/* Floating micro-label */}
                          <span className={`absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border text-white whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-lg text-[8px] sm:text-[9px] font-mono ${
                            isHovered ? 'opacity-100 border-[#C6FF34]/50' : 'opacity-0 group-hover:opacity-100 border-white/20'
                          }`}>
                            {item.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── HOVER INSPECTION HUD ── */}
        <div className="mt-12 max-w-3xl mx-auto min-h-[80px]">
          {hoveredTech ? (
            <motion.div
              key={hoveredTech.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-[#C6FF34]/30 backdrop-blur-md"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-lg">
                {hoveredTech.iconSrc ? (
                  <img src={hoveredTech.iconSrc} alt={hoveredTech.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="font-mono font-extrabold text-black text-sm">{hoveredTech.fallbackText || hoveredTech.name.slice(0, 3)}</span>
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif font-bold text-white text-base sm:text-lg">{hoveredTech.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 shrink-0">{hoveredTech.role}</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed truncate sm:whitespace-normal">{hoveredTech.description}</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 py-4">
              <Sparkles className="w-4 h-4 text-[#C6FF34]" />
              <span>Hover over any tool to inspect its role in the curriculum</span>
            </div>
          )}
        </div>

        {/* ── BOTTOM STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12 text-center">
          {[
            { value: '36+', label: 'Production-Grade Tools', accent: true },
            { value: '100%', label: 'Hands-On From Day One', accent: false },
            { value: '4', label: 'Concentric Mastery Tiers', accent: true },
            { value: '∞', label: 'Cloud Lab Access', accent: false },
          ].map((stat, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-[#C6FF34]/30 transition-colors">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono block ${stat.accent ? 'text-[#C6FF34]' : 'text-white'}`}>{stat.value}</span>
              <span className="text-[11px] sm:text-xs text-zinc-400 font-sans block leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CSS KEYFRAME ANIMATIONS ── */}
      <style jsx global>{`
        @keyframes spinCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinCCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
