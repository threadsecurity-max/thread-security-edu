'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Compass,
  Layers,
  UserCheck,
  Terminal,
  FolderGit2,
  CheckCircle2,
  Award,
  Sparkles,
  Check,
  Clock,
  Target,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Activity,
  Code2,
} from 'lucide-react';

interface StageData {
  step: string;
  theme: 'lime' | 'violet';
  title: string;
  tag: string;
  duration: string;
  desc: string;
  competencies: string[];
  deliverables: string[];
  tools: string[];
  metric: string;
  icon: any;
}

const STAGES: StageData[] = [
  {
    step: '01',
    theme: 'lime',
    title: 'Orientation & Sandbox Diagnostic',
    tag: 'STAGE 01 • ENVIRONMENT & THREAT TRIAGE',
    duration: 'Week 01 • 15+ Practical Lab Hours',
    desc: 'LMS environment onboarding, dedicated Linux sandbox provisioning, and baseline offensive/defensive diagnostic triage to calibrate your personalized skill trajectory.',
    competencies: [
      'Isolated cloud sandbox provisioning & secure SSH bastions',
      'Initial baseline attack surface discovery & threat modeling',
      'Command-line workflow orchestration & toolchain verification',
    ],
    deliverables: [
      'Pre-configured Linux Sandbox VM with dedicated IP & keypair',
      'Baseline Offensive/Defensive Diagnostic Scorecard',
      'Configured Burp Suite Pro, Wireshark & Python 3.12 suite',
    ],
    tools: ['Kali Linux', 'Docker CLI', 'Burp Suite Pro', 'Wireshark', 'Git / GitHub', 'Terminal CLI'],
    metric: '100% Sandbox Provisioning Pass Rate',
    icon: Compass,
  },
  {
    step: '02',
    theme: 'violet',
    title: 'Core Architecture & System Internals',
    tag: 'STAGE 02 • PROTOCOLS & NEURAL ARCHITECTURE',
    duration: 'Week 02-03 • 25+ Interactive Hours',
    desc: 'Deep architectural exploration of modern system internals: dissect raw TCP 3-way handshakes, QUIC/HTTP/3 packet multiplexing, OAuth2/OIDC token flows, and LLM transformer attention mechanics.',
    competencies: [
      'Low-level protocol reverse-engineering (HTTP/3, WebSockets, gRPC)',
      'Enterprise identity architectures (OAuth 2.1, JWT RFC 7519, PKCE)',
      'Transformer attention mechanics, embeddings, and tokenizer vectors',
    ],
    deliverables: [
      'Interactive Microservice Attack Surface Threat Model',
      'Raw Protocol Packet Trace & Wireshark Decryption Blueprint',
      'Custom Tokenizer & Transformer Attention Visualizer in Python',
    ],
    tools: ['HTTP/3 & QUIC', 'Postman API', 'Wireshark', 'PyTorch', 'Hugging Face', 'Python 3'],
    metric: 'Sub-10ms Packet Analysis Benchmark',
    icon: Layers,
  },
  {
    step: '03',
    theme: 'lime',
    title: 'Mentor-Led Live Masterclasses',
    tag: 'STAGE 03 • MENTOR DISSECTION & CODE REVIEW',
    duration: 'Week 04-05 • 20+ Live & Lab Hours',
    desc: 'Direct weekly live interactive masterclasses conducted by veteran cybersecurity architects and senior AI engineers. Dissect newly published zero-day CVEs and attend 1-on-1 architecture reviews.',
    competencies: [
      'Real-world zero-day vulnerability analysis & root-cause triage',
      '1-on-1 technical code reviews with principal industry architects',
      'Live incident response war-room simulations under operational stress',
    ],
    deliverables: [
      'Mentor-reviewed enterprise threat model blueprint',
      'Exploit proof-of-concept writeup with architectural fix',
      'Personalized technical milestone scorecard and review log',
    ],
    tools: ['Splunk SIEM', 'Ghidra', 'MITRE ATT&CK', 'Burp Suite Pro', 'Live Whiteboard', 'VS Code'],
    metric: '1-on-1 Mentor Sign-off on Code Quality',
    icon: UserCheck,
  },
  {
    step: '04',
    theme: 'violet',
    title: 'Active Sandbox Exploitation & Defense',
    tag: 'STAGE 04 • OFFENSIVE & DEFENSIVE SANDBOX',
    duration: 'Week 06-08 • 35+ Hands-On Lab Hours',
    desc: 'Transition into aggressive hands-on practice in isolated target networks. Execute blind SQL injections, cloud metadata SSRF, Active Directory Kerberoasting, and bypass LLM guardrails with adversarial prompt injections.',
    competencies: [
      'Web & cloud metadata exploitation (SSRF, AWS IMDSv2, IDOR)',
      'Internal Active Directory pivoting (Kerberoasting, BloodHound)',
      'Adversarial LLM prompt injection & guardrail evasion mechanics',
    ],
    deliverables: [
      '5 Documented Exploit Proof-of-Concepts (PoCs) against live targets',
      'Active Directory Domain Attack Path Graph via BloodHound',
      'Adversarial AI Guardrail Evasion & Jailbreak Benchmark Report',
    ],
    tools: ['BloodHound', 'Impacket', 'Burp Suite Pro', 'LangChain', 'NeMo Guardrails', 'SQLMap'],
    metric: 'Root Flag Capture on 3 Staged Vulnerable Networks',
    icon: Terminal,
  },
  {
    step: '05',
    theme: 'lime',
    title: 'Enterprise Capstone Engineering',
    tag: 'STAGE 05 • ENTERPRISE CAPSTONE BUILDING',
    duration: 'Week 09-11 • 40+ Production Hours',
    desc: 'Construct a production-ready, portfolio-grade capstone project. Build custom automated vulnerability scanners, automated DevSecOps CI/CD security gates, or autonomous AI red-teaming agents with full test suites.',
    competencies: [
      'Enterprise security tooling architecture & open-source development',
      'DevSecOps pipeline orchestration (SAST, DAST, Container Scanning, SBOM)',
      'Executive risk remediation reporting following CVSS v3.1 rubrics',
    ],
    deliverables: [
      'Production-grade GitHub repository with CI/CD GitHub Actions',
      'Enterprise CVSS v3.1 Vulnerability Assessment & Mitigation Playbook',
      'Technical architecture whitepaper and demonstration walkthrough',
    ],
    tools: ['GitHub Actions', 'Trivy', 'Checkov', 'FastAPI', 'Docker Compose', 'Terraform'],
    metric: '100% Automated CI/CD Test & Security Scan Pass',
    icon: FolderGit2,
  },
  {
    step: '06',
    theme: 'violet',
    title: '24-Hour Practical Examination',
    tag: 'STAGE 06 • PRACTICAL CAPABILITY EVALUATION',
    duration: 'Week 12 • 24-Hour Timed Practical Lab',
    desc: 'A realistic 24-hour practical evaluation. No multiple-choice questions—students are placed in an unknown live sandbox network to discover, exploit, document, and remediate active vulnerabilities under time constraints.',
    competencies: [
      'Blind multi-tier network reconnaissance and vulnerability chaining',
      'Privilege escalation, persistence identification, and data protection',
      'Executive reporting and oral defense before TSE Examination Board',
    ],
    deliverables: [
      'Professional Penetration Testing & Remediation Report (Executive & Tech)',
      'Live oral defense session with senior TSE examination committee',
      'Remediation verification patch submitted to target codebase',
    ],
    tools: ['Isolated Target Subnet', 'CVSS v3.1 Calculator', 'Bash / Python', 'Wireshark', 'CLI Terminal'],
    metric: 'Practical Score >= 80% on Examination Board Rubric',
    icon: CheckCircle2,
  },
  {
    step: '07',
    theme: 'lime',
    title: 'Completion & Cryptographic TS-ID',
    tag: 'STAGE 07 • CREDENTIALING & HIRING DISPATCH',
    duration: 'Graduation & Beyond • Lifetime Access',
    desc: 'Capstone verification, thesis approval, and issuance of a cryptographically signed, blockchain-verifiable TS-ID credential. Verified graduates receive priority referral routing to partner hiring pipelines.',
    competencies: [
      'Cryptographically verifiable credential management and portfolio sharing',
      'Technical interview preparation and system architecture presentation',
      'Direct dispatch to hiring partners across Cyber & AI sectors',
    ],
    deliverables: [
      'Cryptographically signed TS-ID public credential with unique verify URL',
      'Verified LinkedIn digital skill badge and verifiable certificate',
      'Priority routing into TSE Partner Network hiring database',
    ],
    tools: ['TS-ID Credential Engine', 'TSE Alumni Portal', 'Partner Network', 'LinkedIn API'],
    metric: 'Cryptographically Signed TS-ID Credential Issued',
    icon: Award,
  },
];

export function HowWeConductCourses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section
      id="conduct"
      ref={containerRef}
      className="py-24 bg-[#020406] text-white relative z-10 border-t border-slate-900 overflow-hidden"
    >
      {/* ── AMBIENT DEEP LIGHTING (ZERO GRID) ── */}
      <div className="absolute top-1/6 left-0 w-[500px] h-[500px] bg-[#C6FF34]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#7E3BED]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/6 left-10 w-[500px] h-[500px] bg-[#C6FF34]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(15,23,42,0.4),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs font-bold tracking-widest uppercase shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C6FF34]" />
            <span>HOW WE CONDUCT COURSES</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            The 7-Stage <span className="text-[#C6FF34]">Curvy</span> Pedagogy Pipeline
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            A comprehensive practical progression engineered for real-world enterprise defense and autonomous AI systems.
          </p>
        </div>

        {/* ── CURVY SERPENTINE ROADMAP CONTAINER ── */}
        <div className="relative pt-8 pb-16">
          
          {/* ═════════════════════════════════════════════════════════════════════════════
              SVG CURVY LINE WEAVING LEFT AND RIGHT DOWN THE WHOLE PIPELINE (DESKTOP)
             ═════════════════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 3200"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="curvyLimeViolet" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C6FF34" stopOpacity="0.95" />
                  <stop offset="15%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#7E3BED" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#C6FF34" stopOpacity="0.95" />
                  <stop offset="75%" stopColor="#7E3BED" stopOpacity="0.95" />
                  <stop offset="90%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#C6FF34" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="curvyPulseStream" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#C6FF34" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7E3BED" stopOpacity="0.9" />
                </linearGradient>

                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Subtle Guide Track (Dotted) */}
              <path
                d="M 500,30 
                   C 500,100 480,140 500,220 
                   C 520,300 500,420 500,660 
                   C 500,820 500,900 500,1100 
                   C 500,1260 500,1380 500,1540 
                   C 500,1700 500,1820 500,1980 
                   C 500,2140 500,2260 500,2420 
                   C 500,2580 500,2700 500,2860 
                   L 500,3150"
                stroke="#1e293b"
                strokeWidth="2"
                strokeDasharray="4 8"
                opacity={0.4}
              />

              {/* 2. Main Curvy Serpentine Track Weaving Left and Right */}
              <path
                d="M 500,20 
                   C 420,80 340,140 300,220 
                   C 260,320 380,480 500,560 
                   C 620,640 740,580 700,680 
                   C 660,780 440,940 300,1020 
                   C 180,1100 340,1320 500,1400 
                   C 660,1480 780,1420 700,1520 
                   C 620,1620 400,1780 300,1860 
                   C 200,1940 360,2160 500,2240 
                   C 640,2320 760,2280 700,2380 
                   C 640,2480 420,2640 300,2720 
                   C 180,2800 380,3020 500,3140"
                stroke="#0f172a"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* 3. Glowing Neon Scroll Curvy Path (Reacts to Scroll) */}
              <motion.path
                d="M 500,20 
                   C 420,80 340,140 300,220 
                   C 260,320 380,480 500,560 
                   C 620,640 740,580 700,680 
                   C 660,780 440,940 300,1020 
                   C 180,1100 340,1320 500,1400 
                   C 660,1480 780,1420 700,1520 
                   C 620,1620 400,1780 300,1860 
                   C 200,1940 360,2160 500,2240 
                   C 640,2320 760,2280 700,2380 
                   C 640,2480 420,2640 300,2720 
                   C 180,2800 380,3020 500,3140"
                stroke="url(#curvyLimeViolet)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#neonGlow)"
                style={{ pathLength: scaleY }}
              />

              {/* 4. Active Continuous Energy Pulse Stream Moving Along the Curve */}
              <motion.path
                d="M 500,20 
                   C 420,80 340,140 300,220 
                   C 260,320 380,480 500,560 
                   C 620,640 740,580 700,680 
                   C 660,780 440,940 300,1020 
                   C 180,1100 340,1320 500,1400 
                   C 660,1480 780,1420 700,1520 
                   C 620,1620 400,1780 300,1860 
                   C 200,1940 360,2160 500,2240 
                   C 640,2320 760,2280 700,2380 
                   C 640,2480 420,2640 300,2720 
                   C 180,2800 380,3020 500,3140"
                stroke="url(#curvyPulseStream)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="24 48"
                animate={{ strokeDashoffset: [0, -288] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
                opacity={0.8}
              />
            </svg>
          </div>

          {/* Mobile Straight Progress Spine */}
          <div className="block lg:hidden absolute left-5 top-0 bottom-0 w-[3px] bg-slate-800 z-0">
            <motion.div
              style={{ scaleY }}
              className="w-full h-full bg-gradient-to-b from-[#C6FF34] via-emerald-400 to-[#7E3BED] origin-top shadow-[0_0_15px_rgba(198,255,52,0.8)]"
            />
          </div>

          {/* ═════════════════════════════════════════════════════════════════════════════
              7 STAGES: FLEXBOX STRUCTURE (NO CSS GRID USED)
              - Left End: Lime Cards entering from left (x: -100)
              - Right End: Violet Cards entering from right (x: 100)
             ═════════════════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col space-y-20 lg:space-y-36 relative z-20">
            {STAGES.map((stage) => {
              const isLime = stage.theme === 'lime';
              const IconComp = stage.icon;

              return (
                <div
                  key={stage.step}
                  className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 lg:gap-12"
                >
                  {/* Center Node / Milestone Pin for Desktop */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30 items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-xs font-black shadow-2xl transition-all duration-300 ${
                        isLime
                          ? 'bg-[#080d09] border-2 border-[#C6FF34] text-[#C6FF34] shadow-[0_0_24px_rgba(198,255,52,0.5)]'
                          : 'bg-[#10091d] border-2 border-[#7E3BED] text-purple-300 shadow-[0_0_24px_rgba(126,59,237,0.6)]'
                      }`}
                    >
                      {stage.step}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      LEFT END CARD CONTAINER
                      - If isLime: Primary Stage Card entering from LEFT (x: -100)
                      - If !isLime: Telemetry & Competency Card entering from LEFT (x: -100)
                     ───────────────────────────────────────────────────────────── */}
                  <div className="w-full lg:w-[46%] pl-12 lg:pl-0 flex flex-col justify-center">
                    {isLime ? (
                      /* PRIMARY LIME CARD (ENTERS FROM LEFT SCREEN) */
                      <motion.div
                        initial={{ opacity: 0, x: -100, filter: 'blur(6px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="p-7 sm:p-8 rounded-3xl bg-[#060a07]/95 border-2 border-[#C6FF34]/40 hover:border-[#C6FF34] shadow-[0_15px_40px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_50px_rgba(198,255,52,0.2)] transition-all duration-300 group relative text-left space-y-5 overflow-hidden"
                      >
                        {/* Top Accent Line */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#C6FF34] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center justify-between gap-3">
                          <span className="px-3 py-1 rounded-full bg-[#C6FF34]/15 border border-[#C6FF34]/40 text-[#C6FF34] text-[11px] font-mono font-bold tracking-wider uppercase">
                            {stage.tag}
                          </span>

                          <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/15 border border-[#C6FF34]/40 text-[#C6FF34] flex items-center justify-center font-bold shadow-inner">
                            <IconComp className="w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                            <Clock className="w-3.5 h-3.5 text-[#C6FF34]" />
                            <span>{stage.duration}</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#C6FF34] transition-colors leading-snug">
                            {stage.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-2.5">
                            {stage.desc}
                          </p>
                        </div>

                        {/* Tangible Deliverables */}
                        <div className="space-y-2 pt-3 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                              Key Tangible Deliverables:
                            </span>
                            <span className="text-[10px] font-mono text-[#C6FF34] font-bold">
                              {stage.metric}
                            </span>
                          </div>
                          {stage.deliverables.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                              <Check className="w-3.5 h-3.5 text-[#C6FF34] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tools Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-900">
                          {stage.tools.map((tool, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-md bg-[#020503] border border-slate-800 text-slate-300 text-[10px] font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      /* STAGE TELEMETRY & KEY COMPETENCY CARD (VIOLET STAGE ON LEFT) */
                      <motion.div
                        initial={{ opacity: 0, x: -100, filter: 'blur(6px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden lg:flex flex-col justify-between p-7 rounded-3xl bg-[#080511]/90 border border-purple-900/40 hover:border-purple-600/70 shadow-xl transition-all duration-300 space-y-4 text-left"
                      >
                        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-mono font-bold tracking-wider uppercase text-purple-300">
                              Stage {stage.step} Telemetry &amp; Competencies
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-mono">
                            {stage.duration.split('•')[0].trim()}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                            Core Engineering Competencies Mastered:
                          </span>
                          {stage.competencies.map((comp, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                              <Code2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                              <span>{comp}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-900/50 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="text-[11px] font-mono text-purple-200">Evaluation Target:</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-purple-300">
                            {stage.metric}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      RIGHT END CARD CONTAINER
                      - If !isLime: Primary Stage Card entering from RIGHT (x: 100)
                      - If isLime: Telemetry & Competency Card entering from RIGHT (x: 100)
                     ───────────────────────────────────────────────────────────── */}
                  <div className="w-full lg:w-[46%] pl-12 lg:pl-0 flex flex-col justify-center">
                    {!isLime ? (
                      /* PRIMARY VIOLET CARD (ENTERS FROM RIGHT SCREEN) */
                      <motion.div
                        initial={{ opacity: 0, x: 100, filter: 'blur(6px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="p-7 sm:p-8 rounded-3xl bg-[#0b0616]/95 border-2 border-[#7E3BED]/45 hover:border-[#a855f7] shadow-[0_15px_40px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_50px_rgba(126,59,237,0.25)] transition-all duration-300 group relative text-left space-y-5 overflow-hidden"
                      >
                        {/* Top Accent Line */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#7E3BED] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center justify-between gap-3">
                          <span className="px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/45 text-purple-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                            {stage.tag}
                          </span>

                          <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-300 flex items-center justify-center font-bold shadow-inner">
                            <IconComp className="w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>{stage.duration}</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-300 transition-colors leading-snug">
                            {stage.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-2.5">
                            {stage.desc}
                          </p>
                        </div>

                        {/* Tangible Deliverables */}
                        <div className="space-y-2 pt-3 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                              Key Tangible Deliverables:
                            </span>
                            <span className="text-[10px] font-mono text-purple-400 font-bold">
                              {stage.metric}
                            </span>
                          </div>
                          {stage.deliverables.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                              <Check className="w-3.5 h-3.5 text-[#a855f7] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tools Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-900">
                          {stage.tools.map((tool, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-md bg-[#07030e] border border-slate-800 text-slate-300 text-[10px] font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      /* STAGE TELEMETRY & KEY COMPETENCY CARD (LIME STAGE ON RIGHT) */
                      <motion.div
                        initial={{ opacity: 0, x: 100, filter: 'blur(6px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden lg:flex flex-col justify-between p-7 rounded-3xl bg-[#040805]/90 border border-[#C6FF34]/25 hover:border-[#C6FF34]/60 shadow-xl transition-all duration-300 space-y-4 text-left"
                      >
                        <div className="flex items-center justify-between border-b border-emerald-950/50 pb-3">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#C6FF34]" />
                            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#C6FF34]">
                              Stage {stage.step} Telemetry &amp; Competencies
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-[#C6FF34] text-[10px] font-mono">
                            {stage.duration.split('•')[0].trim()}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                            Core Engineering Competencies Mastered:
                          </span>
                          {stage.competencies.map((comp, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                              <Code2 className="w-3.5 h-3.5 text-[#C6FF34] shrink-0 mt-0.5" />
                              <span>{comp}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#071309] border border-[#C6FF34]/30 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#C6FF34]" />
                            <span className="text-[11px] font-mono text-emerald-200">Evaluation Target:</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#C6FF34]">
                            {stage.metric}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
