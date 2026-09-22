'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Brain, 
  Terminal, 
  Code, 
  Lock, 
  Cpu, 
  Layers, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2,
  Activity,
  Server,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ScrollFloat from '@/components/ui/ScrollFloat';

export interface BentoProject {
  id: string;
  projectNumber: string;
  title: string;
  subtitle: string;
  category: 'Cyber Security' | 'AI & LLM Security' | 'Cloud & DevSecOps';
  image: string;
  icon: React.ReactNode;
  accentColor: string;
  technologies: string[];
  difficulty: 'Intermediate' | 'Advanced' | 'Mastery';
  completionHours: number;
  highlight?: string;
  description: string;
  architectureHighlights: string[];
  isHero?: boolean;
}

const PROJECTS_DATA: BentoProject[] = [
  {
    id: 'proj-1',
    projectNumber: 'PROJECT 01',
    title: 'SOC SIEM & SOAR Automation',
    subtitle: 'Automated Incident Response Engine',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000',
    icon: <Shield className="w-4 h-4" />,
    accentColor: '#8b5cf6',
    technologies: ['Splunk', 'Python', 'Wazuh', 'Shuffle SOAR'],
    difficulty: 'Advanced',
    completionHours: 35,
    highlight: 'Active Incident Containment',
    description: 'Design and deploy a full-scale Security Operations Centre pipeline that ingests telemetry across endpoints, normalises Sysmon events, and automatically blocks malicious IPs via SOAR playbooks.',
    architectureHighlights: [
      'Real-time Sigma rule parsing and alert correlation engine',
      'Automated firewall rule injection upon brute-force threshold detection',
      'Integrated MITRE ATT&CK sub-technique tagging and reporting'
    ]
  },
  {
    id: 'proj-2',
    projectNumber: 'PROJECT 02',
    title: 'Enterprise Zero-Trust IAM & Cloud Broker',
    subtitle: 'Least-Privilege Infrastructure Shield',
    category: 'Cloud & DevSecOps',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200',
    icon: <Lock className="w-4 h-4" />,
    accentColor: '#3b82f6',
    technologies: ['AWS IAM', 'HashiCorp Vault', 'Terraform', 'OIDC'],
    difficulty: 'Advanced',
    completionHours: 40,
    highlight: 'Zero Standing Privileges',
    description: 'Construct a cloud-native IAM federation gateway enforcing continuous device attestation, short-lived STS tokens, and automated secret rotation across multi-cloud VPCs.',
    architectureHighlights: [
      'Dynamic JIT (Just-In-Time) access elevation with Slack approval hooks',
      'Policy-as-Code enforcement using Open Policy Agent (OPA)',
      'Automated cryptographically signed audit trail logs to immutable S3'
    ]
  },
  {
    id: 'proj-3',
    projectNumber: 'PROJECT 03',
    title: 'Real-Time Packet Sniffer & IDS',
    subtitle: 'Deep Packet Inspection Engine',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
    icon: <Activity className="w-4 h-4" />,
    accentColor: '#06b6d4',
    technologies: ['C++', 'Suricata', 'Wireshark', 'eBPF'],
    difficulty: 'Intermediate',
    completionHours: 28,
    highlight: 'Kernel-Level Hooking',
    description: 'Write a high-performance network monitor from scratch that hooks into Linux socket buffers, detects TCP SYN floods, DNS exfiltration anomalies, and extracts raw payload signatures.',
    architectureHighlights: [
      'Multi-threaded raw socket capture with zero packet loss at 10Gbps',
      'Custom regex payload scanner for plaintext credentials and tokens',
      'Automated PCAP streaming and Grafana bandwidth telemetry'
    ]
  },
  {
    id: 'proj-4',
    projectNumber: 'PROJECT 04',
    title: 'AI Threat Hunter & MITRE Copilot',
    subtitle: 'RAG-Powered Security Operations Agent',
    category: 'AI & LLM Security',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
    icon: <Brain className="w-4 h-4" />,
    accentColor: '#ec4899',
    technologies: ['LangChain', 'OpenAI API', 'ChromaDB', 'FastAPI'],
    difficulty: 'Advanced',
    completionHours: 45,
    highlight: 'Autonomous Root-Cause Analysis',
    description: 'Develop an intelligent Tier-2 Analyst assistant that ingests raw JSON logs, correlates findings with MITRE knowledge bases, and drafts comprehensive breach assessment reports in seconds.',
    architectureHighlights: [
      'Hybrid dense & sparse vector retrieval over 10,000+ CVE databases',
      'Prompt-injection sanitisation layer protecting the analyst chat loop',
      'Structured JSON output guarantees for SIEM webhook ingestion'
    ]
  },
  {
    id: 'proj-5',
    projectNumber: 'PROJECT 05',
    title: 'Autonomous Sandbox Detonation & AI Reverse Engine',
    subtitle: 'Flagship Dynamic Analysis & Heuristic Classifier Platform',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1400',
    icon: <Cpu className="w-5 h-5" />,
    accentColor: '#10b981',
    technologies: ['QEMU KVM', 'Ghidra API', 'PyTorch', 'YARA', 'Docker', 'FastAPI'],
    difficulty: 'Mastery',
    completionHours: 60,
    highlight: 'FLAGSHIP CAPSTONE PROJECT',
    isHero: true,
    description: 'The definitive end-to-end security system: Detonate untrusted binaries in air-gapped micro-VMs, capture registry mutation graphs, and feed disassembled opcodes into an ensemble PyTorch heuristic model to classify polymorphic zero-days.',
    architectureHighlights: [
      'Sub-second micro-VM snapshot restoration with network bridge interception',
      'Deep opcode disassembly vectorisation and AST graph embedding',
      'Automated YARA rule synthesis and C2 infrastructure extraction',
      'Interactive Webhook dashboard with live execution telemetry and memory dumps'
    ]
  },
  {
    id: 'proj-6',
    projectNumber: 'PROJECT 06',
    title: 'OWASP LLM Guardrail & Red-Team Gateway',
    subtitle: 'Adversarial Prompt Defense Gateway',
    category: 'AI & LLM Security',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000',
    icon: <Sparkles className="w-4 h-4" />,
    accentColor: '#a855f7',
    technologies: ['NeMo Guardrails', 'HuggingFace', 'Redis', 'Python'],
    difficulty: 'Advanced',
    completionHours: 32,
    highlight: 'OWASP Top 10 for LLMs',
    description: 'Build an enterprise proxy sitting in front of production generative models to block jailbreaks, indirect prompt injections, sensitive PII leaks, and toxic generation attacks.',
    architectureHighlights: [
      'Self-attention semantic classifier detecting invisible ASCII & Base64 exploits',
      'Real-time PII anonymisation and token swapping with zero latency overhead',
      'Automated adversarial fuzzing test suite verifying resilience against new CVEs'
    ]
  },
  {
    id: 'proj-7',
    projectNumber: 'PROJECT 07',
    title: 'Linux Kernel Rootkit & eBPF Forensics',
    subtitle: 'Kernel-Space Memory Threat Detection',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=1000',
    icon: <Terminal className="w-4 h-4" />,
    accentColor: '#f59e0b',
    technologies: ['Volatility 3', 'Linux eBPF', 'C', 'GDB'],
    difficulty: 'Mastery',
    completionHours: 38,
    highlight: 'Ring 0 Memory Forensics',
    description: 'Inspect live Linux RAM dumps, identify hidden hooked syscalls in the sys_call_table, track stealth process masquerading, and write custom eBPF kernel probes for active defense.',
    architectureHighlights: [
      'Virtual memory translation & VMA page table walking algorithms',
      'eBPF kprobe and tracepoint triggers detecting unauthorised ptrace calls',
      'Automated volatility plugin scripts generating threat IOC timelines'
    ]
  },
  {
    id: 'proj-8',
    projectNumber: 'PROJECT 08',
    title: 'DevSecOps CI/CD Vulnerability Remediation',
    subtitle: 'Shift-Left Automated Security Governance',
    category: 'Cloud & DevSecOps',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    icon: <Layers className="w-4 h-4" />,
    accentColor: '#14b8a6',
    technologies: ['GitHub Actions', 'Trivy', 'SonarQube', 'Kubernetes'],
    difficulty: 'Intermediate',
    completionHours: 30,
    highlight: 'Continuous Compliance',
    description: 'Engineer an automated supply-chain security gate that blocks insecure container images, verifies Cosign SBOM signatures, and rejects pull requests containing hardcoded credentials.',
    architectureHighlights: [
      'Deterministic container vulnerability scoring with automated patch PRs',
      'Cosign & Sigstore cryptographic provenance validation before cluster deployment',
      'Policy enforcement terminating rogue non-compliant Kubernetes pods'
    ]
  },
  {
    id: 'proj-9',
    projectNumber: 'PROJECT 09',
    title: 'Global Honeynet & Cyber Threat Intel',
    subtitle: 'Decoy Trap & Darknet Telemetry Hub',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1000',
    icon: <Server className="w-4 h-4" />,
    accentColor: '#6366f1',
    technologies: ['Cowrie Honeypot', 'ELK Stack', 'GeoIP', 'STIX/TAXII'],
    difficulty: 'Intermediate',
    completionHours: 26,
    highlight: 'Live Adversary Ingestion',
    description: 'Deploy distributed SSH & HTTP honeypots across multiple cloud availability zones, capturing live brute-force dictionaries, shell command replay histories, and payload downloads.',
    architectureHighlights: [
      'Interactive 3D real-time globe displaying live incoming attack origins',
      'Automated extraction and scoring of threat actors via STIX/TAXII feeds',
      'Elasticsearch aggregation clustering attack patterns by geographical clusters'
    ]
  }
];

const CATEGORIES = [
  'All Projects',
  'Cyber Security',
  'AI & LLM Security',
  'Cloud & DevSecOps'
] as const;

export function ProjectsBentoSection() {
  const [activeCategory, setActiveCategory] = useState<string>('All Projects');
  const [selectedProject, setSelectedProject] = useState<BentoProject | null>(null);
  const [hoveredId, setHoveredId] = useState<string>('proj-5');

  // Left Column projects
  const leftColProjects = [PROJECTS_DATA[0], PROJECTS_DATA[3], PROJECTS_DATA[6]];
  // Center Column projects
  const centerColProjects = [PROJECTS_DATA[1], PROJECTS_DATA[4], PROJECTS_DATA[7]];
  // Right Column projects
  const rightColProjects = [PROJECTS_DATA[2], PROJECTS_DATA[5], PROJECTS_DATA[8]];

  return (
    <section 
      id="projects" 
      aria-label="Real-World and AI-Powered Projects Bento Grid"
      className="relative py-20 sm:py-28 bg-white text-slate-900 overflow-hidden border-b border-slate-200"
    >
      {/* Subtle Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient background soft light accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-violet-100/50 via-purple-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── SECTION HEADER (Matches Reference Image 3) ── */}
        <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-12">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-violet-600 uppercase font-mono mb-2">
            — PROJECTS —
          </span>
          
          <ScrollFloat
            as="h2"
            animationDuration={0.8}
            ease="back.inOut(2)"
            scrollStart="top bottom-=15%"
            scrollEnd="bottom center"
            stagger={0.02}
            containerClassName="text-center"
            textClassName="text-3xl sm:text-4xl md:text-3xl font-bold text-black font-sans tracking-tight max-w-3xl mx-auto leading-tight"
          >
            Build Real-World & AI-Powered Projects
          </ScrollFloat>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto mt-3.5 font-medium leading-relaxed">
            Gain practical industry experience by building production-grade projects deployed in top cybersecurity & AI companies.
          </p>

          {/* ── FILTER PILL TABS ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-7 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full shadow-inner backdrop-blur-md">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (cat !== 'All Projects') {
                      const first = PROJECTS_DATA.find((p) => p.category === cat);
                      if (first) setHoveredId(first.id);
                    } else {
                      setHoveredId('proj-5');
                    }
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-black text-white shadow-md scale-105'
                      : 'text-slate-600 hover:text-black hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DYNAMIC ASYMMETRIC BENTO GRID (Morphs Smoothly on Hover) ── */}
        {activeCategory === 'All Projects' ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch transition-all duration-500"
            onMouseLeave={() => setHoveredId('proj-5')}
          >
            {/* ════════ LEFT COLUMN (lg:col-span-3) ════════ */}
            <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-5">
              {leftColProjects.map((proj) => {
                const isLeftHovered = leftColProjects.some((p) => p.id === hoveredId);
                const isExpanded = isLeftHovered 
                  ? hoveredId === proj.id 
                  : proj.id === 'proj-4'; // default tall middle card

                return (
                  <InteractiveBentoCard
                    key={proj.id}
                    project={proj}
                    isExpanded={isExpanded}
                    isHovered={hoveredId === proj.id}
                    onHover={() => setHoveredId(proj.id)}
                    onClick={() => setSelectedProject(proj)}
                  />
                );
              })}
            </div>

            {/* ════════ CENTER COLUMN (lg:col-span-6) — HERO MORPH SECTION ════════ */}
            <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-5">
              {centerColProjects.map((proj) => {
                const isCenterHovered = centerColProjects.some((p) => p.id === hoveredId);
                const isExpanded = isCenterHovered 
                  ? hoveredId === proj.id 
                  : proj.id === 'proj-5'; // default flagship center hero

                return (
                  <InteractiveBentoCard
                    key={proj.id}
                    project={proj}
                    isExpanded={isExpanded}
                    isHovered={hoveredId === proj.id}
                    onHover={() => setHoveredId(proj.id)}
                    onClick={() => setSelectedProject(proj)}
                  />
                );
              })}
            </div>

            {/* ════════ RIGHT COLUMN (lg:col-span-3) ════════ */}
            <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-5">
              {rightColProjects.map((proj) => {
                const isRightHovered = rightColProjects.some((p) => p.id === hoveredId);
                const isExpanded = isRightHovered 
                  ? hoveredId === proj.id 
                  : proj.id === 'proj-6'; // default tall middle card

                return (
                  <InteractiveBentoCard
                    key={proj.id}
                    project={proj}
                    isExpanded={isExpanded}
                    isHovered={hoveredId === proj.id}
                    onHover={() => setHoveredId(proj.id)}
                    onClick={() => setSelectedProject(proj)}
                  />
                );
              })}
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {PROJECTS_DATA.filter((p) => p.category === activeCategory).map((proj) => (
              <InteractiveBentoCard
                key={proj.id}
                project={proj}
                isExpanded={hoveredId === proj.id || PROJECTS_DATA.filter((p) => p.category === activeCategory).length <= 2}
                isHovered={hoveredId === proj.id}
                onHover={() => setHoveredId(proj.id)}
                onClick={() => setSelectedProject(proj)}
              />
            ))}
          </div>
        )}

        {/* ── BOTTOM CALLOUT ACTION BAR ── */}
        <div className="mt-12 sm:mt-14 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-md">
              <Code className="w-6 h-6 text-[#C6FF34]" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-medium text-black tracking-tight">
                All Projects Mapped to Real SOC, Cloud & AI Workflows
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Every project includes step-by-step lab walkthroughs, code repositories, and cryptographically verified TS-ID credentials.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => setSelectedProject(PROJECTS_DATA[4])}
            className="shrink-0 bg-black hover:bg-slate-800 text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-full shadow hover:shadow-lg transition-all"
          >
            Explore Project Architectures
            <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

      </div>

      {/* ── PROJECT DETAIL INSPECTION MODAL ── */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs font-medium bg-slate-100 border-slate-300">
                  {selectedProject.projectNumber}
                </Badge>
                <span className="text-xs font-medium uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                  {selectedProject.category}
                </span>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-semibold text-black tracking-tight">
                {selectedProject.title}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-600">
                {selectedProject.subtitle}
              </DialogDescription>
            </DialogHeader>

            {/* Modal Hero Image */}
            <div className="relative w-full h-[200px] sm:h-[240px] rounded-2xl overflow-hidden my-4 border border-slate-200">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-cover filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
                <span className="bg-black/60 px-2.5 py-1 rounded backdrop-blur-md">
                  Difficulty: <strong className="text-[#C6FF34]">{selectedProject.difficulty}</strong>
                </span>
                <span className="bg-black/60 px-2.5 py-1 rounded backdrop-blur-md">
                  Estimated Time: <strong>{selectedProject.completionHours}h</strong>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Project Scope & Overview
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Technologies */}
              <div>
                <h5 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                  Tools & Technology Stack
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech) => (
                    <span 
                      key={tech}
                      className="text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Architecture Highlights */}
              <div>
                <h5 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                  Key Architectural Deliverables
                </h5>
                <ul className="space-y-2">
                  {selectedProject.architectureHighlights.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedProject(null)}
                  className="rounded-full font-medium text-xs sm:text-sm"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedProject(null);
                    const element = document.getElementById('featured-courses') || document.getElementById('batches');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-full bg-black text-white hover:bg-slate-800 font-medium text-xs sm:text-sm gap-2"
                >
                  Enroll in Program
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

// ── DYNAMIC INTERACTIVE BENTO CARD COMPONENT ──
function InteractiveBentoCard({
  project,
  isExpanded,
  isHovered,
  onHover,
  onClick,
}: {
  project: BentoProject;
  isExpanded: boolean;
  isHovered: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      onMouseEnter={onHover}
      onClick={onClick}
      className={`relative rounded-3xl overflow-hidden cursor-pointer group bg-slate-900 border transition-all duration-300 ${
        isExpanded 
          ? 'h-[340px] lg:h-[370px] shadow-2xl z-20 border-slate-300 scale-[1.01]' 
          : 'h-[210px] sm:h-[220px] shadow-md z-10 border-slate-200/80 hover:border-slate-300'
      } ${
        isHovered ? 'ring-2 ring-[#C6FF34]/60' : ''
      }`}
    >
      {/* Background Image with smooth kinetic zoom */}
      <Image
        src={project.image}
        alt={project.title}
        fill
        className={`object-cover transition-transform duration-700 ease-out filter contrast-[1.08] ${
          isHovered ? 'scale-110 brightness-[0.8]' : 'scale-100 brightness-[0.68]'
        }`}
        sizes="(max-width: 1024px) 100vw, 33vw"
        loading="lazy"
      />

      {/* Multi-tier Gradient Overlay for crisp white text */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 z-10 ${
          isExpanded 
            ? 'bg-gradient-to-t from-black via-black/60 to-black/30' 
            : 'bg-gradient-to-t from-black via-black/45 to-transparent'
        }`} 
      />

      {/* Top Details Bar */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-5 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] sm:text-[11px] font-semibold tracking-widest px-2.5 py-0.5 rounded-full border backdrop-blur-md uppercase transition-colors ${
            isHovered 
              ? 'bg-black/90 text-[#C6FF34] border-[#C6FF34]/50' 
              : 'bg-black/60 text-white/90 border-white/15'
          }`}>
            {project.projectNumber}
          </span>
          {project.isHero && isExpanded && (
            <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wider bg-violet-600 text-white px-2.5 py-0.5 rounded-full shadow-sm uppercase">
              ⭐ FLAGSHIP
            </span>
          )}
        </div>

        <div className={`rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
          isExpanded ? 'w-8 h-8' : 'w-7 h-7'
        } ${
          isHovered 
            ? 'bg-white text-black border-white scale-110 shadow-lg' 
            : 'bg-white/20 text-white border-white/25'
        }`}>
          <ArrowUpRight className={isExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 flex flex-col justify-end">
        {/* Category & Badge */}
        <span className="text-[9px] sm:text-[10px] font-medium text-[#C6FF34] uppercase tracking-wider mb-1 drop-shadow flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] animate-pulse" />
          {project.category}
        </span>

        {/* Title */}
        <h4 className={`font-semibold text-white tracking-tight leading-snug drop-shadow-md transition-all ${
          isExpanded ? 'text-lg sm:text-xl lg:text-2xl mb-1' : 'text-sm sm:text-base'
        }`}>
          {project.title}
        </h4>

        {/* Subtitle / Description */}
        <p className={`text-slate-200 font-medium transition-all ${
          isExpanded ? 'text-xs sm:text-sm line-clamp-2 mb-2.5 text-slate-100' : 'text-[11px] text-slate-300 line-clamp-1 mt-0.5'
        }`}>
          {project.subtitle}
        </p>

        {/* Expanded Rich Details (revealed dynamically on expanded / active state) */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5 pt-1"
          >
            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((tech) => (
                <span 
                  key={tech}
                  className="text-[9px] sm:text-[10px] font-medium text-white bg-black/60 border border-white/20 px-2 py-0.5 rounded backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Bottom Meta Highlights */}
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-medium text-[#C6FF34]">
                <Zap className="w-3.5 h-3.5 fill-[#C6FF34]" />
                {project.highlight || 'Production Blueprint'}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-200">
                {project.completionHours}h Guided Lab
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Subtle glowing top border illumination on hover */}
      <div className={`absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-[#C6FF34] to-transparent transition-opacity duration-300 z-30 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </motion.div>
  );
}

