'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Award, 
  Terminal, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface DirectoryCategory {
  id: string;
  name: string;
  badge: string;
  icon: any;
  description: string;
  keywords: { label: string; href: string; tag: string }[];
}

const DIRECTORY_CATEGORIES: DirectoryCategory[] = [
  {
    id: 'flagship',
    name: 'Flagship Cyber Security Courses',
    badge: 'Core Programs',
    icon: ShieldCheck,
    description: 'Comprehensive, job-oriented cyber security courses and professional training programs with hands-on sandboxed labs and placement support.',
    keywords: [
      { label: 'Cyber Security Course (Flagship)', href: '/courses/cyber-security-course', tag: 'Flagship' },
      { label: 'Professional Cyber Security Course', href: '/courses/cyber-security-course', tag: 'Job Ready' },
      { label: 'Practical Hands-on Cybersecurity Training', href: '/courses/cyber-security-course', tag: '100% Labs' },
      { label: 'Job Oriented Cyber Security Course', href: '/placements', tag: 'Placement' },
      { label: 'Industry Ready Cyber Security Bootcamp', href: '/courses/cyber-security-course', tag: 'Bootcamp' },
      { label: 'Cyber Security Course for Beginners', href: '/learning-paths', tag: 'Beginners' },
      { label: 'Cyber Security Course for Students & Freshers', href: '/courses', tag: 'College' },
      { label: 'Cyber Security Course for Working Professionals', href: '/courses', tag: 'Weekend' },
      { label: 'Live Offline Cyber Security Course (Jalandhar)', href: '/contact', tag: 'Offline' },
      { label: 'Online Cyber Security Course (India)', href: '/courses/cyber-security-course', tag: 'Online' },
      { label: 'Real World Cyber Security Lab Training', href: '/courses/cyber-security-course', tag: 'Cloud Labs' },
      { label: 'Project-Based Cyber Security Master Course', href: '/courses/cyber-security-course', tag: 'Capstone' },
    ],
  },
  {
    id: 'durations',
    name: '45 Days & 6 Months Industrial Training',
    badge: 'College & Internship',
    icon: Clock,
    description: 'Accredited university industrial training, summer internships, and fast-track bootcamps for BTech, BCA, MCA, and Diploma students in Punjab & Pan-India.',
    keywords: [
      { label: '45 Days Cyber Security Course & Summer Training', href: '/workshops', tag: '45 Days' },
      { label: '6 Weeks Cyber Security Training & Internship', href: '/workshops', tag: '6 Weeks' },
      { label: '45 Days Ethical Hacking Course Jalandhar', href: '/contact', tag: 'Jalandhar' },
      { label: '45 Days VAPT & Penetration Testing Course', href: '/courses/web-application-security-vapt', tag: 'VAPT' },
      { label: '45 Days Bug Bounty Summer Internship Punjab', href: '/workshops', tag: 'Bug Bounty' },
      { label: '6 Month Cyber Security Industrial Training Jalandhar', href: '/workshops', tag: '6 Months' },
      { label: '6 Months Cyber Security Course Punjab', href: '/courses/cyber-security-course', tag: 'Punjab' },
      { label: '6 Month Ethical Hacking Course for Engineering Students', href: '/workshops', tag: 'BTech' },
      { label: '6 Month SOC Analyst Course & Internship', href: '/courses/soc-blue-team-operations', tag: 'SOC' },
      { label: 'Cyber Security Industrial Training after BTech / BCA', href: '/placements', tag: 'Careers' },
      { label: '45 Days Cyber Security Course with Certificate', href: '/verify-certificate', tag: 'TS-ID' },
      { label: '6 Month Cyber Security Career Program with Placement', href: '/placements', tag: '100% Placement' },
    ],
  },
  {
    id: 'local',
    name: 'Jalandhar, Punjab & Regional Centers',
    badge: 'Campus Training',
    icon: MapPin,
    description: 'North India\'s premier cyber defense institute and physical training campus located in Jalandhar, serving students across Punjab and neighboring cities.',
    keywords: [
      { label: 'Cyber Security Course in Jalandhar', href: '/contact', tag: 'Jalandhar' },
      { label: 'Cyber Security Training Institute in Jalandhar', href: '/contact', tag: 'Center' },
      { label: 'Cyber Security Academy in Jalandhar', href: '/', tag: 'Campus' },
      { label: 'Ethical Hacking Course in Jalandhar', href: '/contact', tag: 'Classroom' },
      { label: 'VAPT Training & Certification in Jalandhar', href: '/courses/web-application-security-vapt', tag: 'VAPT' },
      { label: 'SOC Analyst Training in Jalandhar (Blue Team)', href: '/courses/soc-blue-team-operations', tag: 'SOC' },
      { label: 'Cyber Security Course Punjab (Amritsar, Ludhiana)', href: '/contact', tag: 'Punjab' },
      { label: 'Cyber Security Training in Chandigarh & Mohali', href: '/courses/cyber-security-course', tag: 'Regional' },
      { label: 'Cyber Security Course near Jalandhar (Vasal Mall)', href: '/contact', tag: 'Location' },
      { label: 'Cyber Security Coaching & Career Center Jalandhar', href: '/contact', tag: 'Admissions' },
      { label: 'Cybersecurity Education Punjab (Offline & Online)', href: '/', tag: 'Hybrid' },
      { label: 'Cyber Security Course India (All States)', href: '/courses/cyber-security-course', tag: 'India' },
    ],
  },
  {
    id: 'ethical-hacking',
    name: 'Ethical Hacking & Offensive Security',
    badge: 'Red Team',
    icon: Terminal,
    description: 'Master offensive security, adversary emulation, red teaming, network exploitation, and ethical hacking from fundamentals to expert level.',
    keywords: [
      { label: 'Ethical Hacking Course for Beginners', href: '/courses/cyber-security-course', tag: 'Beginners' },
      { label: 'Advanced Ethical Hacking Course & Bootcamp', href: '/courses/cyber-security-course', tag: 'Advanced' },
      { label: 'Hands-on Ethical Hacking Training (Kali Linux)', href: '/courses/cyber-security-course', tag: 'Kali Linux' },
      { label: 'Ethical Hacking Certification Course (CEH v13 Prep)', href: '/courses/cyber-security-course', tag: 'CEH v13' },
      { label: 'Practical Ethical Hacking Course Jalandhar', href: '/contact', tag: 'Jalandhar' },
      { label: 'Offensive Security Course & OSCP Preparation', href: '/courses/active-directory-exploitation', tag: 'OSCP' },
      { label: 'Red Team Cybersecurity Training & Active Directory', href: '/courses/active-directory-exploitation', tag: 'Red Team' },
      { label: 'Adversary Simulation & EDR Evasion Course', href: '/courses/active-directory-exploitation', tag: 'Expert' },
      { label: 'Ethical Hacking Course after 12th / BTech / BCA', href: '/learning-paths', tag: 'Roadmap' },
      { label: 'Ethical Hacking Internship & Summer Training', href: '/workshops', tag: 'Internship' },
      { label: 'eJPT & PNPT Practical Training Drills', href: '/courses/cyber-security-course', tag: 'eJPT' },
      { label: 'Ethical Hacking Career Course with TS-ID Certificate', href: '/verify-certificate', tag: 'TS-ID' },
    ],
  },
  {
    id: 'vapt-bugbounty',
    name: 'VAPT, Web Security & Bug Bounty',
    badge: 'AppSec',
    icon: ShieldCheck,
    description: 'Professional vulnerability assessment, web and API penetration testing, OWASP Top 10, Burp Suite Pro, and responsible disclosure bug bounty hunting.',
    keywords: [
      { label: 'VAPT Course & Industrial Training', href: '/courses/web-application-security-vapt', tag: 'VAPT' },
      { label: 'Web Application Penetration Testing Training', href: '/courses/web-application-security-vapt', tag: 'WebSec' },
      { label: 'OWASP Top 10 & Burp Suite Pro Training', href: '/courses/web-application-security-vapt', tag: 'Burp Suite' },
      { label: 'API Security & Microservices Exploitation Course', href: '/courses/api-security-microservices-exploitation', tag: 'API Sec' },
      { label: 'Mobile App Penetration Testing (iOS & Android)', href: '/courses/mobile-application-penetration-testing', tag: 'Mobile' },
      { label: 'Network Penetration Testing Course', href: '/courses/cyber-security-course', tag: 'Network' },
      { label: 'Cloud Penetration Testing (AWS / Azure)', href: '/courses/cloud-security-devsecops', tag: 'Cloud' },
      { label: 'Bug Bounty Hunting Course for Beginners', href: '/courses/web-application-security-vapt', tag: 'Bug Bounty' },
      { label: 'HackerOne & Bugcrowd Methodology Training', href: '/courses/web-application-security-vapt', tag: 'HackerOne' },
      { label: 'Vulnerability Research & Exploit Discovery Course', href: '/courses/binary-exploitation-reverse-engineering', tag: 'Research' },
      { label: 'VAPT Course in Jalandhar & Punjab', href: '/contact', tag: 'Local' },
      { label: 'VAPT Course with Internship & Placement Support', href: '/placements', tag: 'Placement' },
    ],
  },
  {
    id: 'soc-blueteam',
    name: 'SOC Analyst, SIEM & Incident Response',
    badge: 'Blue Team',
    icon: Award,
    description: 'Enterprise defensive operations, real-time log analysis, Splunk SIEM querying, Wazuh EDR detection engineering, and threat hunting.',
    keywords: [
      { label: 'SOC Analyst Course & Certification Training', href: '/courses/soc-blue-team-operations', tag: 'SOC L1/L2' },
      { label: 'Security Operations Center (SOC) Training', href: '/courses/soc-blue-team-operations', tag: 'Defensive' },
      { label: 'Blue Team Cybersecurity Course', href: '/courses/soc-blue-team-operations', tag: 'Blue Team' },
      { label: 'SIEM Training (Splunk, Wazuh & Microsoft Sentinel)', href: '/courses/soc-blue-team-operations', tag: 'Splunk' },
      { label: 'Threat Hunting & Threat Detection Course', href: '/courses/soc-blue-team-operations', tag: 'Hunting' },
      { label: 'Incident Response & Malware Triage Training', href: '/courses/soc-blue-team-operations', tag: 'Incident' },
      { label: 'MITRE ATT&CK Framework Training & Log Analysis', href: '/courses/soc-blue-team-operations', tag: 'MITRE' },
      { label: 'Digital Forensics & Reverse Engineering Course', href: '/courses/binary-exploitation-reverse-engineering', tag: 'Forensics' },
      { label: 'SOC Analyst Course in Jalandhar & Punjab', href: '/contact', tag: 'Jalandhar' },
      { label: 'SOC Internship & Live Incident Handling Playbooks', href: '/workshops', tag: 'Playbooks' },
      { label: 'How to Become a SOC Analyst (Career Roadmap)', href: '/learning-paths', tag: 'Roadmap' },
      { label: 'SOC Analyst Interview Preparation & Resume Training', href: '/placements', tag: 'Interviews' },
    ],
  },
  {
    id: 'cloud-devsecops',
    name: 'Cloud Security, DevSecOps & Supply Chain',
    badge: 'Infrastructure',
    icon: Terminal,
    description: 'AWS & Azure cloud defense, Kubernetes hardening, CI/CD pipeline security gates, container protection, and software supply chain audits.',
    keywords: [
      { label: 'Cloud Security Course & Certification Training', href: '/courses/cloud-security-devsecops', tag: 'Cloud' },
      { label: 'DevSecOps Course & Practical Pipeline Hardening', href: '/courses/cloud-security-devsecops', tag: 'DevSecOps' },
      { label: 'AWS Cybersecurity Training & IAM Policy Audits', href: '/courses/cloud-security-devsecops', tag: 'AWS' },
      { label: 'Azure Security Course & Sentinel Integration', href: '/courses/cloud-security-devsecops', tag: 'Azure' },
      { label: 'Docker & Kubernetes Security Course', href: '/courses/cloud-security-devsecops', tag: 'Containers' },
      { label: 'CI/CD Pipeline Security & GitHub Actions Gates', href: '/courses/cloud-security-devsecops', tag: 'CI/CD' },
      { label: 'Software Supply Chain Security (SBOM, SLSA)', href: '/courses/cloud-security-devsecops', tag: 'Supply Chain' },
      { label: 'DevSecOps Course in Jalandhar & Punjab', href: '/contact', tag: 'Punjab' },
      { label: 'Zero Trust Security Architecture Course', href: '/courses/cloud-security-devsecops', tag: 'Zero Trust' },
      { label: 'Secure Code Review & SAST/DAST Tool Training', href: '/courses/web-application-security-vapt', tag: 'AppSec' },
    ],
  },
  {
    id: 'ai-security',
    name: 'AI, GenAI & LLM Red Teaming',
    badge: 'Next-Gen AI',
    icon: GraduationCap,
    description: 'Cutting-edge artificial intelligence, machine learning security, LLM jailbreaking, prompt injection defense, and agentic AI security engineering.',
    keywords: [
      { label: 'AI Security Course & LLM Red Teaming Training', href: '/courses/ai-security-llm-redteaming', tag: 'AI Red Team' },
      { label: 'Artificial Intelligence & Machine Learning Course', href: '/courses/data-science-ml-security', tag: 'AI & ML' },
      { label: 'Generative AI & LLM Application Development Course', href: '/courses/agentic-ai-engineering', tag: 'GenAI' },
      { label: 'Prompt Engineering & Prompt Injection Testing', href: '/courses/ai-security-llm-redteaming', tag: 'Prompt Injection' },
      { label: 'RAG Vulnerability Analysis & Vector DB Hardening', href: '/courses/rag-vulnerability-analysis', tag: 'RAG' },
      { label: 'AI Agents & Agentic Automation Security Course', href: '/courses/agentic-ai-engineering', tag: 'AI Agents' },
      { label: 'OWASP Top 10 for Large Language Models (LLMs)', href: '/courses/ai-security-llm-redteaming', tag: 'OWASP LLM' },
      { label: 'AI Course in Jalandhar, Punjab & India', href: '/contact', tag: 'Jalandhar' },
      { label: '45 Days & 6 Month AI Industrial Training Punjab', href: '/workshops', tag: 'AI Training' },
      { label: 'AI Cybersecurity Projects for College Students', href: '/learning-paths', tag: 'Projects' },
    ],
  },
];

export function CyberTrainingDirectorySection() {
  const [activeTab, setActiveTab] = useState<string>('flagship');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentCategory = DIRECTORY_CATEGORIES.find((c) => c.id === activeTab) || DIRECTORY_CATEGORIES[0];

  const filteredKeywords = searchFilter.trim()
    ? DIRECTORY_CATEGORIES.flatMap((c) => c.keywords).filter((k) =>
        k.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
        k.tag.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : currentCategory.keywords;

  return (
    <section 
      aria-label="Cybersecurity and AI Training Programs Comprehensive Directory"
      className="py-16 md:py-24 bg-[#050914] text-white border-t border-slate-800 relative overflow-hidden"
    >
      {/* Subtle Matrix Ambient Background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACADEMIC CURRICULUM &amp; CAMPUS DIRECTORY</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cybersecurity &amp; AI Training Directory
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-sans max-w-3xl mx-auto font-normal">
            Browse our full catalog of job-oriented <strong className="text-white font-semibold">cyber security courses</strong>, <strong className="text-white font-semibold">45 days summer training</strong>, <strong className="text-white font-semibold">6 months industrial internships</strong>, and ethical hacking certifications available offline at our <strong className="text-white font-semibold">Jalandhar, Punjab campus</strong> and live online across India.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search courses, e.g. 'SOC analyst', '45 days', 'Jalandhar'..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-sans"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs (When Not Searching) */}
        {!searchFilter && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-slate-800 pb-4">
            {DIRECTORY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Category Description Banner */}
        {!searchFilter && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                {currentCategory.badge}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                {currentCategory.description}
              </p>
            </div>
            <Link href="/courses" className="shrink-0">
              <button className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold font-mono transition-colors">
                <span>View Full Curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}

        {/* Keywords Semantic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredKeywords.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white font-medium truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                  {item.tag}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Global Certification & Local Campus Badge Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block mb-0.5">Global Certifications Prepared</span>
              <span>CEH v13 (EC-Council), CompTIA Security+ (SY0-701), OSCP, eJPT, AWS Certified Security, and TS-ID.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block mb-0.5">Flexible Training Durations</span>
              <span>45 Days / 6 Weeks Summer Training, 6 Months Industrial Internships, Fast-Track Bootcamps &amp; Weekend Batches.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block mb-0.5">Jalandhar Campus &amp; Online India</span>
              <span>3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001. Live interactive batches nationwide.</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-10 text-center">
          <Link href="/contact">
            <button className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer inline-flex items-center gap-2">
              <span>Enroll In Upcoming Cyber Security Batch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
