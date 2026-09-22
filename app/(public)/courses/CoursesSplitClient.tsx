'use client';

import { useState, useMemo } from 'react';
import { CourseHero } from '@/components/courses/CourseHero';
import { HowWeConductCourses } from '@/components/courses/HowWeConductCourses';
import { MethodologySection } from '@/components/courses/MethodologySection';
import { LearningRoute } from '@/components/courses/LearningRoute';
import { CourseCatalogue, CourseItem } from '@/components/courses/CourseCatalogue';
import { MentorsSection } from '@/components/courses/MentorsSection';
import { CourseCTA } from '@/components/courses/CourseCTA';

const DEFAULT_COURSES: CourseItem[] = [
  // ── CYBERSECURITY TRACK (8 COURSES: 2 Beginner, 2 Intermediate, 2 Advanced, 2 Expert) ──
  {
    id: 'cyber-1',
    slug: 'web-application-security-vapt',
    title: 'Web Application Security & VAPT Masterclass',
    subtitle: 'Master OWASP Top 10, Burp Suite Pro, Server-Side Request Forgery (SSRF), and Business Logic Exploitation.',
    track: 'cyber',
    category: 'VAPT & Web Security',
    level: 'Beginner',
    durationHours: 60,
    modulesCount: 12,
    labsCount: 45,
    highlights: ['Burp Suite Professional Triage', 'OWASP Top 10 Web Exploitation', 'CVSS v3.1 Report Writing'],
    mentorName: 'Kunal Singh',
    mentorCompany: 'Lead Security Architect',
  },
  {
    id: 'cyber-2',
    slug: 'soc-blue-team-operations',
    title: 'SOC Operations & Threat Hunting (Blue Team)',
    subtitle: 'Real-time SIEM log analysis with Splunk, MITRE ATT&CK mapping, memory forensics, and PCAP incident triage.',
    track: 'cyber',
    category: 'SOC & Blue Team',
    level: 'Beginner',
    durationHours: 75,
    modulesCount: 14,
    labsCount: 60,
    highlights: ['Splunk Enterprise Log Analysis', 'Wireshark & Memory Forensics', 'CORTEX XDR Incident Playbooks'],
    mentorName: 'Vikramaditya Sharma',
    mentorCompany: 'Principal SOC Engineer',
  },
  {
    id: 'cyber-3',
    slug: 'cloud-security-devsecops',
    title: 'Cloud DevSecOps & Infrastructure Hardening',
    subtitle: 'AWS Security Architecture, Kubernetes network policies, Terraform Checkov IaC scans, and CI/CD SAST pipelines.',
    track: 'cyber',
    category: 'Cloud DevSecOps',
    level: 'Intermediate',
    durationHours: 80,
    modulesCount: 16,
    labsCount: 50,
    highlights: ['AWS SecurityHub & GuardDuty', 'Kubernetes RBAC & Container Hardening', 'GitHub Actions DevSecOps Pipeline'],
    mentorName: 'Rohan Mehta',
    mentorCompany: 'DevSecOps Architect',
  },
  {
    id: 'cyber-4',
    slug: 'active-directory-exploitation',
    title: 'Active Directory Enterprise Attack Paths',
    subtitle: 'BloodHound graph analysis, Kerberoasting, AS-REP roasting, AD CS abuse, and Golden Ticket persistence.',
    track: 'cyber',
    category: 'Red Teaming',
    level: 'Expert',
    durationHours: 50,
    modulesCount: 10,
    labsCount: 35,
    highlights: ['BloodHound Trust Graph Mining', 'Kerberos Ticket Forgery', 'EDR Evasion & Memory Unhooking'],
    mentorName: 'Kunal Singh',
    mentorCompany: 'Offensive Security Lead',
  },
  {
    id: 'cyber-5',
    slug: 'mobile-application-penetration-testing',
    title: 'Mobile Application Penetration Testing (iOS & Android)',
    subtitle: 'Frida dynamic instrumentation, OWASP MASVS audits, SSL pinning bypass, and APK/IPA reverse engineering.',
    track: 'cyber',
    category: 'Mobile Security',
    level: 'Intermediate',
    durationHours: 55,
    modulesCount: 11,
    labsCount: 38,
    highlights: ['Frida & Objection Dynamic Hooking', 'OWASP MASVS / MSTG Standards', 'iOS Keychain & Android Keystore Audits'],
    mentorName: 'Rohan Mehta',
    mentorCompany: 'Senior Mobile Security Researcher',
  },
  {
    id: 'cyber-6',
    slug: 'api-security-microservices-exploitation',
    title: 'API Security & Microservices Exploitation',
    subtitle: 'BOLA/BFLA authorization flaws, GraphQL query depth attacks, mass assignment, and OAuth 2.0 / JWT vulnerabilities.',
    track: 'cyber',
    category: 'API Security',
    level: 'Advanced',
    durationHours: 65,
    modulesCount: 13,
    labsCount: 42,
    highlights: ['Broken Object Level Auth (BOLA)', 'GraphQL Introspection & Batching', 'OAuth 2.0 Redirect URI Hijacking'],
    mentorName: 'Kunal Singh',
    mentorCompany: 'Lead Security Architect',
  },
  {
    id: 'cyber-7',
    slug: 'binary-exploitation-reverse-engineering',
    title: 'Binary Exploitation & Reverse Engineering',
    subtitle: 'Ghidra x86/ARM disassembly, stack buffer overflows, Return-Oriented Programming (ROP), and heap exploitation.',
    track: 'cyber',
    category: 'Offensive Research',
    level: 'Expert',
    durationHours: 85,
    modulesCount: 16,
    labsCount: 55,
    highlights: ['Ghidra & IDA Pro Static Reversing', 'ROP Gadget Chaining & ASLR Defeat', 'Heap Chunk Manipulation (Use-After-Free)'],
    mentorName: 'Vikramaditya Sharma',
    mentorCompany: 'Exploit Developer & Reverse Engineer',
  },
  {
    id: 'cyber-8',
    slug: 'ot-ics-critical-infrastructure-security',
    title: 'Industrial OT / ICS & SCADA Defense',
    subtitle: 'Purdue model architecture, Modbus & DNP3 industrial packet injection, PLC firmware extraction, and safety instrumented systems.',
    track: 'cyber',
    category: 'OT / ICS Security',
    level: 'Advanced',
    durationHours: 60,
    modulesCount: 12,
    labsCount: 36,
    highlights: ['Modbus & DNP3 Packet Injection', 'PLC Ladder Logic Vulnerabilities', 'Purdue Model Zone/Conduit Isolation'],
    mentorName: 'Rohan Mehta',
    mentorCompany: 'Critical Infrastructure Consultant',
  },

  // ── ARTIFICIAL INTELLIGENCE TRACK (8 COURSES: 2 Beginner, 2 Intermediate, 2 Advanced, 2 Expert) ──
  {
    id: 'ai-1',
    slug: 'ai-security-llm-redteaming',
    title: 'AI Security & LLM Red Teaming Masterclass',
    subtitle: 'Exploit LLM pipelines, master indirect prompt injection, bypass NeMo guardrails, and mitigate agentic RCE threats.',
    track: 'ai',
    category: 'AI Security',
    level: 'Intermediate',
    durationHours: 65,
    modulesCount: 12,
    labsCount: 40,
    highlights: ['Indirect Prompt Injection Vectors', 'NeMo Guardrails & Dual-LLM Auditing', 'VectorDB Data Poisoning Defense'],
    mentorName: 'Ananya Roy',
    mentorCompany: 'Head of AI Vulnerability Research',
  },
  {
    id: 'ai-2',
    slug: 'agentic-ai-engineering',
    title: 'Agentic AI Engineering & Production Systems',
    subtitle: 'Build autonomous tool-using AI agents, multi-modal LLM pipelines, LangChain security, and cloud sandbox isolation.',
    track: 'ai',
    category: 'Autonomous AI',
    level: 'Advanced',
    durationHours: 70,
    modulesCount: 14,
    labsCount: 45,
    highlights: ['Tool-Calling Agent Architecture', 'LangChain & LlamaIndex Audits', 'Agentic Web Browsing SSRF Evasion'],
    mentorName: 'Harpreet Kaur',
    mentorCompany: 'Senior AI Engineer',
  },
  {
    id: 'ai-3',
    slug: 'data-science-ml-security',
    title: 'Data Science & Machine Learning Pipeline Security',
    subtitle: 'Adversarial attacks on neural networks, model stealing, training data extraction, and PyTorch security hardening.',
    track: 'ai',
    category: 'ML Security',
    level: 'Beginner',
    durationHours: 55,
    modulesCount: 10,
    labsCount: 30,
    highlights: ['PyTorch Model Evasion Attacks', 'Feature Extraction Protection', 'ML Data Leakage Audit'],
    mentorName: 'Piya Kohli',
    mentorCompany: 'AI Security Specialist',
  },
  {
    id: 'ai-4',
    slug: 'rag-vulnerability-analysis',
    title: 'RAG Architecture Security & Vector DB Defense',
    subtitle: 'Securing Retrieval-Augmented Generation systems, vector embedding tampering, and semantic search poisoning.',
    track: 'ai',
    category: 'AI DevSecOps',
    level: 'Intermediate',
    durationHours: 60,
    modulesCount: 11,
    labsCount: 35,
    highlights: ['Pinecone & Qdrant Vector Audits', 'Semantic Search Poisoning Mitigations', 'Enterprise RAG Access Control'],
    mentorName: 'Ananya Roy',
    mentorCompany: 'AI Defense Lead',
  },
  {
    id: 'ai-5',
    slug: 'enterprise-ai-governance-guardrails',
    title: 'Enterprise AI Governance & NeMo Guardrails',
    subtitle: 'Deploy programmable semantic safety rails with Colang, enforce PII redaction, and implement dual-LLM moderation architectures.',
    track: 'ai',
    category: 'AI Governance',
    level: 'Beginner',
    durationHours: 50,
    modulesCount: 10,
    labsCount: 32,
    highlights: ['Colang Programmable Rails', 'Real-Time PII & Secret Redaction', 'Dual-LLM Cross-Verification Triage'],
    mentorName: 'Harpreet Kaur',
    mentorCompany: 'AI Governance Director',
  },
  {
    id: 'ai-6',
    slug: 'computer-vision-multimodal-threat-intel',
    title: 'Computer Vision & Multimodal Threat Intelligence',
    subtitle: 'Adversarial patch attacks on vision transformers (ViT), multimodal prompt injection, and synthetic deepfake detection pipelines.',
    track: 'ai',
    category: 'Multimodal AI',
    level: 'Advanced',
    durationHours: 65,
    modulesCount: 13,
    labsCount: 40,
    highlights: ['Vision Transformer Adversarial Patches', 'Cross-Modal Prompt Injection in GPT-4V', 'Deepfake Forensic Watermarking'],
    mentorName: 'Piya Kohli',
    mentorCompany: 'Multimodal AI Scientist',
  },
  {
    id: 'ai-7',
    slug: 'model-inversion-extraction-defense',
    title: 'Model Inversion, Stealing & Extraction Defense',
    subtitle: 'Differential privacy with DP-SGD, membership inference resistance, gradient sanitization, and confidential enclave training.',
    track: 'ai',
    category: 'AI Privacy & Cryptography',
    level: 'Expert',
    durationHours: 75,
    modulesCount: 15,
    labsCount: 48,
    highlights: ['DP-SGD Differential Privacy Budgeting', 'Membership Inference Attack Simulation', 'Confidential Computing GPU Enclaves'],
    mentorName: 'Ananya Roy',
    mentorCompany: 'Head of AI Vulnerability Research',
  },
  {
    id: 'ai-8',
    slug: 'edge-ai-quantization-hardware-tuning',
    title: 'High-Throughput Edge AI & Model Quantization',
    subtitle: '4-bit AWQ and GGUF quantization, TensorRT-LLM compilation, zero-latency inference scaling, and embedded edge deployments.',
    track: 'ai',
    category: 'Production AI Infrastructure',
    level: 'Expert',
    durationHours: 70,
    modulesCount: 14,
    labsCount: 44,
    highlights: ['AWQ & GGUF 4-Bit Precision Quantization', 'TensorRT-LLM Engine Optimization', 'vLLM Continuous Batching Architecture'],
    mentorName: 'Harpreet Kaur',
    mentorCompany: 'Senior AI Engineer',
  },
];

interface CoursesSplitClientProps {
  initialCourses?: any[];
}

export function CoursesSplitClient({ initialCourses }: CoursesSplitClientProps) {
  const [activeTrackFilter, setActiveTrackFilter] = useState<'all' | 'cyber' | 'ai'>('all');

  // Merge DB courses with curated 8 Cyber & 8 AI default masterclasses
  const allCourses = useMemo(() => {
    // If no DB courses, use curated 16 defaults directly
    if (!initialCourses || initialCourses.length === 0) return DEFAULT_COURSES;
    
    // Create lookup map of DB courses by slug/id for enrichment
    const dbMap = new Map<string, any>();
    initialCourses.forEach((c: any) => {
      if (c.slug) dbMap.set(c.slug, c);
      if (c.id) dbMap.set(c.id, c);
    });

    // Enrich DEFAULT_COURSES with any updated DB data (modules, labs, mentors)
    const enriched = DEFAULT_COURSES.map((defCourse) => {
      const dbMatch = dbMap.get(defCourse.slug) || dbMap.get(defCourse.id);
      if (!dbMatch) return defCourse;

      return {
        ...defCourse,
        durationHours: dbMatch.durationHours || defCourse.durationHours,
        modulesCount: dbMatch.modules?.length || defCourse.modulesCount,
        labsCount: dbMatch.labs?.length || defCourse.labsCount,
        mentorName: dbMatch.mentor?.user?.name || defCourse.mentorName,
        mentorCompany: dbMatch.mentor?.company || defCourse.mentorCompany,
      };
    });

    return enriched;
  }, [initialCourses]);

  return (
    <div className="min-h-screen font-sans bg-[#F8FAFC] text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Course Hero */}
      <CourseHero />

      {/* 2. How We Conduct Courses */}
      <HowWeConductCourses />
      {/* 4. Learning Route */}
      <LearningRoute />

      {/* 5. Course Catalogue */}
      <CourseCatalogue
        courses={allCourses}
        activeTrackFilter={activeTrackFilter}
        onTrackChange={setActiveTrackFilter}
      />

      {/* 6. Mentors */}
      <MentorsSection />

      {/* 7. Final CTA */}
      <CourseCTA />

    </div>
  );
}
