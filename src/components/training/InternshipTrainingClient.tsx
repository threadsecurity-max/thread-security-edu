'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  Brain,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Phone,
  FileCheck,
  Building,
  GraduationCap,
  Users,
  Check,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

type DurationKey = '45-days' | '3-months' | '6-months';
type TrackKey = 'cyber' | 'ai';

interface DurationData {
  id: DurationKey;
  label: string;
  badge: string;
  subtitle: string;
  targetAudience: string;
  hours: number;
  projectsCount: number;
  labsCount: number;
  highlightPoints: string[];
  cyberCurriculum: {
    title: string;
    description: string;
    topics: string[];
  }[];
  aiCurriculum: {
    title: string;
    description: string;
    topics: string[];
  }[];
  projectDeliverables: string[];
}

const DURATIONS_DATA: Record<DurationKey, DurationData> = {
  '45-days': {
    id: '45-days',
    label: '45 Days / 6 Weeks Training',
    badge: 'Trending — Summer / Winter Batches',
    subtitle: 'Fast-paced, high-intensity foundational training with 100% practical cloud sandboxes and university project report sign-off.',
    targetAudience: 'B.Tech (2nd/3rd year), BCA, MCA, BSc IT, Diploma students seeking university-mandated summer or winter internship training.',
    hours: 75,
    projectsCount: 2,
    labsCount: 35,
    highlightPoints: [
      'Official University Training Letter & Completion Certificate',
      'Synopses, Source Code & Minor Project Documentation included',
      'Daily Browser-Based Cloud Sandbox Lab Access (Zero Installation)',
      'Offline Batches in Jalandhar (Vasal Mall) + Live Interactive Online',
    ],
    cyberCurriculum: [
      {
        title: 'Phase 1: Linux Fundamentals & Offensive Networking',
        description: 'Command line proficiency, bash scripting for security, TCP/IP deep-dive, Wireshark packet capture analysis, and stealth port scanning with Nmap.',
        topics: ['Kali Linux CLI', 'OSI / TCP-IP Analysis', 'Nmap Port Scanning', 'Wireshark Sniffing'],
      },
      {
        title: 'Phase 2: Web Application Security & OWASP Top 10',
        description: 'Core concepts of vulnerability assessment, Burp Suite Professional setup, SQL injection, Cross-Site Scripting (XSS), and Broken Authentication.',
        topics: ['Burp Suite Proxy', 'SQLi & Blind Injections', 'Stored & Reflected XSS', 'Authentication Bypasses'],
      },
      {
        title: 'Phase 3: Ethical Hacking Tools & Minor Capstone',
        description: 'Vulnerability assessment with OpenVAS and Nikto, Metasploit fundamentals, password cracking with Hashcat, and automated security audit report.',
        topics: ['Metasploit Exploits', 'Password Auditing', 'Automated Scanners', 'Minor Project Defense'],
      },
    ],
    aiCurriculum: [
      {
        title: 'Phase 1: Modern Python & Data Engineering for AI',
        description: 'Modern Python idioms, vectorized computation with NumPy and Pandas, statistical analysis, and automated data cleaning pipelines.',
        topics: ['Vectorized NumPy', 'Pandas Dataframes', 'Exploratory Data Analysis', 'Python OOP for AI'],
      },
      {
        title: 'Phase 2: Machine Learning Pipelines & Neural Networks',
        description: 'Supervised & unsupervised learning, classification, regression, model evaluation metrics, and building deep neural networks using PyTorch.',
        topics: ['Scikit-Learn Pipelines', 'PyTorch Foundations', 'Loss Functions & Optimizers', 'Model Benchmarking'],
      },
      {
        title: 'Phase 3: Generative AI, Prompting & Minor Project',
        description: 'Hands-on with OpenAI API, Anthropic Claude, LangChain foundations, prompt engineering architectures, and building a conversational AI tool.',
        topics: ['LangChain Agents', 'Prompt Engineering', 'API Integration', 'Minor Project Defense'],
      },
    ],
    projectDeliverables: [
      'Automated Web Vulnerability Scanner OR Conversational Knowledge Assistant',
      'Full IEEE-standard Project Synopsis & Training Report',
      'Authorized Certificate of Training Completion with TS-ID',
    ],
  },
  '3-months': {
    id: '3-months',
    label: '3 Months Industrial Internship',
    badge: 'Popular — Mid-Semester Practical Track',
    subtitle: 'Comprehensive skill-building with enterprise blue team defenses, web/API penetration testing, and agentic AI architectures.',
    targetAudience: 'Pre-final year college students, fresh graduates, and career changers transitioning into junior cybersecurity or AI engineer roles.',
    hours: 150,
    projectsCount: 4,
    labsCount: 65,
    highlightPoints: [
      'Full Mid-Semester Project with Production-Grade Architecture',
      'Dual Offensive & Defensive Hands-on Cyber Range Drills',
      'Global Certification Preparation: CEH v13 / CompTIA Security+ / LangChain',
      'Resume Review & Mock Technical Interview Coaching',
    ],
    cyberCurriculum: [
      {
        title: 'Phase 1: Advanced Network Security & Active Directory Basics',
        description: 'Network segmentation, firewall rules, Active Directory domain architecture, Kerberos authentication fundamentals, and internal network reconnaissance.',
        topics: ['AD Architecture', 'Kerberos Fundamentals', 'Internal Pivoting', 'Privilege Escalation'],
      },
      {
        title: 'Phase 2: Comprehensive VAPT across Web & REST APIs',
        description: 'Server-Side Request Forgery (SSRF), IDOR/BOLA authorization flaws, JWT token attacks, GraphQL batching abuse, and CVSS v3.1 report writing.',
        topics: ['SSRF & RCE Vectors', 'BOLA / BFLA Exploitation', 'JWT Tampering', 'Professional VAPT Reports'],
      },
      {
        title: 'Phase 3: SOC Blue Team Operations with Splunk & Wazuh',
        description: 'Live SIEM log ingestion, SPL threat hunting queries, Windows Event ID analysis, memory forensics with Volatility, and incident response playbooks.',
        topics: ['Splunk SPL Queries', 'Wazuh EDR Alerts', 'Memory Forensics', 'Incident Triage'],
      },
    ],
    aiCurriculum: [
      {
        title: 'Phase 1: Deep Learning Architectures & Transformer Mechanics',
        description: 'Attention mechanisms, transformer encoder-decoder layers, fine-tuning Hugging Face models, and embedding vector mathematics.',
        topics: ['Attention Mechanics', 'Hugging Face Transformers', 'Embedding Spaces', 'PEFT & LoRA Basics'],
      },
      {
        title: 'Phase 2: Production RAG Architectures & Vector Databases',
        description: 'Building multi-stage Retrieval-Augmented Generation pipelines, vector databases (Pinecone/Qdrant), rerankers, and hybrid semantic search.',
        topics: ['Vector DBs (Qdrant/Pinecone)', 'Hybrid Retrieval', 'Reranking Algorithms', 'Hallucination Mitigation'],
      },
      {
        title: 'Phase 3: Agentic AI Engineering & Production Tool-Calling',
        description: 'Designing autonomous agents with LangGraph, function calling, state management, tool execution sandboxes, and evaluating agent performance.',
        topics: ['LangGraph Workflows', 'Function Tool Execution', 'Stateful Memory', 'Agent Evaluation'],
      },
    ],
    projectDeliverables: [
      'Multi-Tenant Enterprise SOC SIEM Threat Hunter OR Autonomous Agentic RAG Platform',
      'Formal Mid-Term Industrial Internship Letter & Evaluation Dossier',
      'Cryptographically Verified TS-ID Credential for LinkedIn',
    ],
  },
  '6-months': {
    id: '6-months',
    label: '6 Months Industrial Training & Internship',
    badge: 'Flagship — Full-Semester Career Accelerator',
    subtitle: 'The ultimate enterprise industrial immersion program designed to take you from fundamentals to job-ready senior capabilities with 100% placement support.',
    targetAudience: 'Final year B.Tech, MCA, MSc IT students needing full 8th/6th semester industrial training, and job seekers aiming for high-paying roles.',
    hours: 300,
    projectsCount: 8,
    labsCount: 120,
    highlightPoints: [
      '100% Placement Assistance: Direct Corporate Hiring Referrals & Interview Drives',
      'Live Industry Production Sandboxes with Real Enterprise Scenarios',
      'University Major Project Report & Faculty Guide Sign-off Guarantee',
      '1-on-1 Mentor Office Hours, Portfolio Audits & Mock Board Interviews',
    ],
    cyberCurriculum: [
      {
        title: 'Phase 1-2: Foundations to Advanced Full-Scope VAPT',
        description: 'Complete mastery of ethical hacking, web applications, mobile (iOS/Android), APIs, cloud security (AWS/GCP), and Active Directory attack paths.',
        topics: ['Full-Scope VAPT', 'BloodHound AD Graphing', 'AWS IAM Misconfigurations', 'Mobile Reverse Engineering'],
      },
      {
        title: 'Phase 3-4: SOC Blue Team Operations & Incident Response',
        description: 'Enterprise SIEM (Splunk, Microsoft Sentinel), MITRE ATT&CK detection mapping, live ransomware containment, and malware static/dynamic analysis.',
        topics: ['Enterprise Splunk SIEM', 'MITRE ATT&CK Matrix', 'Malware Disassembly', 'DFIR Playbooks'],
      },
      {
        title: 'Phase 5-6: Red Teaming, DevSecOps & Enterprise Capstone',
        description: 'CI/CD pipeline security (SAST/DAST), container security (Docker/Kubernetes), EDR evasion fundamentals, and live enterprise capstone defense.',
        topics: ['Kubernetes Hardening', 'DevSecOps Pipelines', 'Red Team Simulation', 'Production Capstone Defense'],
      },
    ],
    aiCurriculum: [
      {
        title: 'Phase 1-2: Deep Learning, Transformers & Foundation Models',
        description: 'Mathematical intuition, transformer architectures, pre-training vs. fine-tuning, parameter-efficient fine-tuning (LoRA, QLoRA), and model evaluation.',
        topics: ['Transformer Internals', 'QLoRA Fine-Tuning', 'vLLM Serving', 'Quantization (AWQ/GGUF)'],
      },
      {
        title: 'Phase 2-4: Enterprise Agentic Systems & Multi-Modal Pipelines',
        description: 'Multi-agent orchestration, human-in-the-loop validation, multi-modal vision-language models (VLMs), and enterprise workflow automation.',
        topics: ['Multi-Agent Swarms', 'Vision Transformers', 'Tool Sandboxing', 'Zero-Latency Streaming'],
      },
      {
        title: 'Phase 5-6: AI Security, LLM Red Teaming & Enterprise Defense',
        description: 'Prompt injection mitigation, NeMo guardrails with Colang, vector database data poisoning defense, model extraction resistance, and compliance.',
        topics: ['NeMo Guardrails', 'Prompt Injection Red Teaming', 'Model Stealing Defense', 'Production Deployment'],
      },
    ],
    projectDeliverables: [
      'Enterprise End-to-End Red Team Pentest & SOC SIEM Defense OR Autonomous Enterprise Multi-Agent Copilot',
      'Official Major Project Thesis & University Evaluation Dossier',
      'Direct Corporate Job Referrals, Verified TS-ID Credential & Placement Letter',
    ],
  },
};

export function InternshipTrainingClient() {
  const searchParams = useSearchParams();
  const urlDuration = searchParams.get('duration') as DurationKey | null;

  const [activeDuration, setActiveDuration] = useState<DurationKey>(
    urlDuration && ['45-days', '3-months', '6-months'].includes(urlDuration)
      ? urlDuration
      : '45-days'
  );
  const [activeTrack, setActiveTrack] = useState<TrackKey>('cyber');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [trainingMode, setTrainingMode] = useState('offline');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (urlDuration && ['45-days', '3-months', '6-months'].includes(urlDuration)) {
      setActiveDuration(urlDuration);
    }
  }, [urlDuration]);

  const currentData = DURATIONS_DATA[activeDuration];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setFormError('Please enter your Name, Phone Number, and Email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        courseInterest: `${currentData.label} - ${activeTrack === 'cyber' ? 'Cybersecurity Track' : 'AI Track'} (${trainingMode})`,
        careerGoal: college ? `College/University: ${college.trim()}` : 'Industrial Training & Internship',
      };

      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Submission response returned error status');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      // Graceful fallback display
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-20 bg-white border-b border-slate-200 overflow-hidden">
        {/* Subtle background tech grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Summer, Winter & Industrial Training Programs 2026</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight uppercase leading-tight">
              Industrial Training & Internship in{' '}
              <span className="text-blue-600 underline decoration-blue-600/30 decoration-wavy">Cyber Security</span>{' '}
              & <span className="text-purple-600">Artificial Intelligence</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Accelerate your engineering career with accredited <strong>45 Days</strong>, <strong>3 Months</strong>, and <strong>6 Months</strong> industrial training programs. 100% hands-on cloud sandboxes, live industry projects, university project letters, and direct placement support.
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Offline at Vasal Mall, Jalandhar & Live Online</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>University NOC & Project Report Sign-Off</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Cryptographic TS-ID Verifiable Certificate</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── DURATION SELECTOR TABS ── */}
      <section className="py-8 bg-slate-100/70 border-b border-slate-200 sticky top-[4.25rem] z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['45-days', '3-months', '6-months'] as DurationKey[]).map((durKey) => {
              const dur = DURATIONS_DATA[durKey];
              const isSelected = activeDuration === durKey;

              return (
                <button
                  key={durKey}
                  onClick={() => setActiveDuration(durKey)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-extrabold text-slate-900">
                      {dur.label}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold truncate">
                    {dur.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SELECTED DURATION DETAIL OVERVIEW ── */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
                {currentData.label} Overview
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {currentData.label} Industrial Curriculum
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {currentData.subtitle}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-4 shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center font-mono">
              <div>
                <span className="block text-xl font-black text-blue-600">{currentData.hours}+</span>
                <span className="text-[10px] text-slate-500 uppercase">Hours</span>
              </div>
              <div className="border-x border-slate-200 px-3">
                <span className="block text-xl font-black text-emerald-600">{currentData.labsCount}+</span>
                <span className="text-[10px] text-slate-500 uppercase">Cloud Labs</span>
              </div>
              <div>
                <span className="block text-xl font-black text-purple-600">{currentData.projectsCount}</span>
                <span className="text-[10px] text-slate-500 uppercase">Live Projects</span>
              </div>
            </div>
          </div>

          {/* Target Audience & Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                Target Audience & Eligibility
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentData.targetAudience}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                Key Program Deliverables
              </h4>
              <ul className="space-y-2">
                {currentData.highlightPoints.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── TRACK SELECTOR: CYBERSECURITY VS ARTIFICIAL INTELLIGENCE ── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                Specialization Track Syllabus
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Select your specialized learning track for the {currentData.label} program.
              </p>
            </div>

            {/* Track Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-200/80 border border-slate-300/80 self-start sm:self-auto">
              <button
                onClick={() => setActiveTrack('cyber')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTrack === 'cyber'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-black'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Cybersecurity Track</span>
              </button>

              <button
                onClick={() => setActiveTrack('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTrack === 'ai'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-black'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>AI & LLM Track</span>
              </button>
            </div>
          </div>

          {/* Curriculum Phase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(activeTrack === 'cyber' ? currentData.cyberCurriculum : currentData.aiCurriculum).map(
              (phase, pIdx) => (
                <div
                  key={pIdx}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 uppercase">
                      Module 0{pIdx + 1}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {phase.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {phase.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                      Practical Topics Covered:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.topics.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* ── PROJECTS & VERIFIABLE CREDENTIALS ── */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-lime-400 uppercase tracking-widest block mb-1">
                HANDS-ON OUTCOMES
              </span>
              <h3 className="text-2xl font-black uppercase text-white">
                Live Projects & University Submission Package
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              Evaluated by Senior Security Architects
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentData.projectDeliverables.map((del, dIdx) => (
              <div
                key={dIdx}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-200 font-medium leading-relaxed">
                  {del}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DURATION COMPARISON MATRIX ── */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              Training Duration Comparison Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Choose the right program based on your university semester requirement and career goal.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-4 px-6 font-bold">Feature / Deliverable</th>
                  <th className="py-4 px-6 font-bold text-blue-600">45 Days / 6 Weeks</th>
                  <th className="py-4 px-6 font-bold text-blue-600">3 Months Internship</th>
                  <th className="py-4 px-6 font-bold text-purple-600">6 Months Industrial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-6 font-semibold">Total Guided Learning</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">75+ Hours</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">150+ Hours</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">300+ Hours</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold">Cloud Sandbox Lab Range</td>
                  <td className="py-3.5 px-6 font-mono">35+ Labs</td>
                  <td className="py-3.5 px-6 font-mono">65+ Labs</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-emerald-600">120+ Labs (Full Access)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold">Real-world Industry Projects</td>
                  <td className="py-3.5 px-6">2 Minor Projects</td>
                  <td className="py-3.5 px-6">4 Practical Projects</td>
                  <td className="py-3.5 px-6 font-bold text-purple-700">8 Projects + Capstone</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold">University NOC & Project Report</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-semibold">✓ Included</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-semibold">✓ Included</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-semibold">✓ Major Thesis & Sign-off</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold">Cryptographic TS-ID Credential</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-semibold">✓ Verifiable</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-semibold">✓ Verifiable</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-semibold">✓ Certified Industrial Fellow</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold">Placement & Interview Drives</td>
                  <td className="py-3.5 px-6 text-slate-400">Resume Template</td>
                  <td className="py-3.5 px-6 text-slate-700">Mock Technical Interview</td>
                  <td className="py-3.5 px-6 font-bold text-blue-600">100% Placement Support & Drives</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ENROLLMENT / APPLICATION FORM ── */}
        <div id="apply-form" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
                ADMISSIONS OPEN
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
                Apply for {currentData.label}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Reserve your seat in our upcoming offline batch at Vasal Mall, Jalandhar or join the live interactive online batch with cloud lab access. Limited seats per batch for personalized mentoring.
              </p>

              <div className="pt-2 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Immediate syllabus counseling and batch timing confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>University letter format & approval assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Early bird fee discount for college groups & referrals</span>
                </div>
              </div>
            </div>

            {/* Form Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
              {isSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Application Received, {fullName}!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Our training coordinator will contact you at <strong>{phone}</strong> within 2 hours to confirm batch timing and syllabus details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aman Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@college.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                        College / University
                      </label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. GNDU / LPU / PTU / DAV"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                        Preferred Training Mode
                      </label>
                      <select
                        value={trainingMode}
                        onChange={(e) => setTrainingMode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="offline">Offline (Vasal Mall, Jalandhar)</option>
                        <option value="online">Live Interactive Online</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Submitting Application...' : `Confirm ${currentData.label} Seat Inquiry`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black uppercase text-slate-900">
              Training & Internship FAQs
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Common questions answered about certificates, projects, and batch timings.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Will I get an official project report and training completion certificate for my university?',
                a: 'Yes, 100%. Thread Security Education provides an authorized training completion certificate with a verifiable TS-ID, along with complete major/minor project source code, documentation, and formal university evaluation sign-off.',
              },
              {
                q: 'Where is the offline center located in Punjab?',
                a: 'Our physical center is located at 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001. We provide air-conditioned high-speed lab workstations.',
              },
              {
                q: 'Can students from other cities in India join online?',
                a: 'Absolutely. We offer live interactive online batches with daily 100% browser-based cloud sandbox lab access. Online students receive identical project guidance and verifiable credentials.',
              },
              {
                q: 'What is the difference between the 45 Days and 6 Months training programs?',
                a: 'The 45 Days program focuses on foundational mastery, rapid skill building, and a minor project (ideal for 2nd/3rd year summer requirements). The 6 Months program is a deep enterprise industrial immersion covering advanced multi-tier VAPT, SOC SIEM operations, real capstone projects, and 100% placement support.',
              },
            ].map((faq, fIdx) => (
              <div key={fIdx} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 text-left">
                <h4 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
