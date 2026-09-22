'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Search,
  Building2,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  X,
  BookOpen,
  Terminal,
  Cpu,
  Check,
  Zap,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PlacementRecord {
  id: string;
  name: string;
  role: string;
  category: 'SOC & Blue Teaming' | 'Penetration Testing / VAPT' | 'Cloud DevSecOps' | 'AI Security';
  company: string;
  companyCategory: string;
  companyDescription: string;
  hiringCriteria: string[];
  package: string;
  hike: string;
  prevRole: string;
  avatar: string;
  verifiedTsId: string;
  quote?: string;
  skillsMastered: string[];
}

interface CompanyProfile {
  name: string;
  category: string;
  badge: string;
  description: string;
  hiringRoles: string[];
  avgPackage: string;
  skillsRequired: string[];
  logo: string;
}

const PLACEMENTS_DATA: PlacementRecord[] = [
  {
    id: 'p-1',
    name: 'Abhay Pathania',
    role: 'Threat Hunter & Bug Bounty Lead',
    category: 'Penetration Testing / VAPT',
    company: 'CrowdStrike',
    companyCategory: 'Global Cybersecurity Leader',
    companyDescription: 'CrowdStrike is a global leader in cloud-delivered endpoint protection, threat intelligence, and next-gen anti-virus.',
    hiringCriteria: ['Active Directory Security', 'EDR Bypass & Memory Analysis', 'Kernel Syscall Tracing'],
    package: '₹18.0 LPA',
    hike: '210% Salary Hike',
    prevRole: 'B.Tech CSE Graduate',
    avatar: '/images/Students/Abhay.svg',
    verifiedTsId: 'TS-2025-8842',
    quote: 'TSE taught me practical Burp Suite and Active Directory exploitation. Finding critical vulnerabilities in live labs directly landed me my role at CrowdStrike.',
    skillsMastered: ['Burp Suite Professional', 'Kerberoasting & BloodHound', 'Cobalt Strike Simulations', 'Linux Kernel Instrumentation'],
  },
  {
    id: 'p-2',
    name: 'Rahul Sharma',
    role: 'SOC Analyst L2',
    category: 'SOC & Blue Teaming',
    company: 'Palo Alto Networks',
    companyCategory: 'Enterprise Network & Cloud Security',
    companyDescription: 'Palo Alto Networks is the global cybersecurity leader, shaping the cloud-centric future with technology that transforms security operations.',
    hiringCriteria: ['SIEM / Splunk Querying', 'MITRE ATT&CK Triage', 'Network Packet Analysis'],
    package: '₹14.5 LPA',
    hike: '180% Salary Hike',
    prevRole: 'Fresher / BCA',
    avatar: '/images/Students/Piyush.svg',
    verifiedTsId: 'TS-2025-9120',
    quote: 'The hands-on SIEM and Splunk log analysis modules gave me the confidence to handle live SOC incidents during my technical interviews.',
    skillsMastered: ['Splunk Enterprise Security', 'Wireshark & PCAP Triage', 'CORTEX XDR Incident Response', 'Snort & Suricata IDS Rules'],
  },
  {
    id: 'p-3',
    name: 'Divya Patel',
    role: 'Penetration Testing Consultant',
    category: 'Penetration Testing / VAPT',
    company: 'Deloitte Cyber Risk',
    companyCategory: 'Big4 Tech Consulting',
    companyDescription: 'Deloitte Cyber Risk Services helps global organizations mitigate cyber risks and execute secure digital transformations.',
    hiringCriteria: ['OWASP Top 10 Web Exploits', 'API Security Testing', 'Professional Report Writing'],
    package: '₹12.8 LPA',
    hike: '140% Salary Hike',
    prevRole: 'Non-Tech Background',
    avatar: '/images/Students/Jasjot.svg',
    verifiedTsId: 'TS-2025-7731',
    quote: 'Transitioning from non-tech to cybersecurity felt seamless thanks to the 1-on-1 mentorship and capstone red team projects.',
    skillsMastered: ['Web Application VAPT', 'REST & GraphQL Security', 'Business Logic Exploitation', 'CVSS v3.1 Vulnerability Scoring'],
  },
  {
    id: 'p-4',
    name: 'Piya Kohli',
    role: 'AI Security Guardrails Specialist',
    category: 'AI Security',
    company: 'Cloudflare',
    companyCategory: 'Global Cloud & CDN Security',
    companyDescription: 'Cloudflare runs one of the world’s largest networks, securing online platforms from DDoS, web attacks, and AI prompt injection risks.',
    hiringCriteria: ['LLM Red Teaming', 'Prompt Injection Prevention', 'Vector Database Security'],
    package: '₹16.8 LPA',
    hike: '190% Salary Hike',
    prevRole: 'B.Tech ECE',
    avatar: '/images/Students/Piya.svg',
    verifiedTsId: 'TS-2025-6629',
    quote: 'Red teaming LLMs and building prompt injection defenses at TSE prepared me for cutting-edge AI security engineering roles.',
    skillsMastered: ['LLM Guardrails Implementation', 'Agentic SSRF & RCE Vectors', 'VectorDB Data Poisoning Defense', 'Python ML Security Audit'],
  },
  {
    id: 'p-5',
    name: 'Jasjot Kaur',
    role: 'AppSec Consultant',
    category: 'Cloud DevSecOps',
    company: 'Thoughtworks',
    companyCategory: 'Global Technology Consultancy',
    companyDescription: 'Thoughtworks is a premium software consultancy driving agile software design, cloud native DevSecOps, and continuous delivery.',
    hiringCriteria: ['CI/CD Pipeline Security', 'Docker & K8s Hardening', 'Static & Dynamic Code Analysis (SAST/DAST)'],
    package: '₹15.2 LPA',
    hike: '165% Salary Hike',
    prevRole: 'B.Sc IT Student',
    avatar: '/images/Students/Jasjot.svg',
    verifiedTsId: 'TS-2025-5418',
    quote: 'Learning container security, Kubernetes hardening, and CI/CD security pipelines set my profile apart from generic software engineers.',
    skillsMastered: ['GitHub Actions Security Pipeline', 'Trivy & Semgrep SAST Integration', 'Kubernetes NetworkPolicies & RBAC', 'HashiCorp Vault Secrets Mgmt'],
  },
  {
    id: 'p-6',
    name: 'Shashikant',
    role: 'Incident Response Analyst',
    category: 'SOC & Blue Teaming',
    company: 'Ernst & Young (EY)',
    companyCategory: 'Big4 Security Advisory',
    companyDescription: 'EY Cyber Advisory provides end-to-end security operations, threat management, and compliance consulting for Fortune 500 enterprises.',
    hiringCriteria: ['Memory Forensics & Volatility', 'Malware Triage & Sandboxing', 'Threat Intel Feed Integration'],
    package: '₹11.5 LPA',
    hike: '150% Salary Hike',
    prevRole: 'IT Support Engineer',
    avatar: '/images/Students/Shashi.svg',
    verifiedTsId: 'TS-2025-4309',
    quote: 'I cleared 3 rounds of technical interview questions effortlessly because every scenario asked was already covered in TSE labs.',
    skillsMastered: ['Volatility RAM Analysis', 'Any.Run Malware Triage', 'Logstash & Elastic Stack Pipeline', 'RegRipper Windows Registry Forensics'],
  },
  {
    id: 'p-7',
    name: 'Kashish Sharma',
    role: 'Offensive Security Engineer',
    category: 'Penetration Testing / VAPT',
    company: 'Wipro CyberDefense',
    companyCategory: 'Global IT & Security Services',
    companyDescription: 'Wipro CyberDefense Center delivers managed threat defense and penetration testing services to global enterprise clients.',
    hiringCriteria: ['Network Infrastructure VAPT', 'Wireless Auditing', 'Privilege Escalation'],
    package: '₹10.5 LPA',
    hike: '130% Salary Hike',
    prevRole: 'CS Student',
    avatar: '/images/Students/Kashish.svg',
    verifiedTsId: 'TS-2025-3198',
    quote: 'TSE hands-on network lab environments allowed me to practice Linux privilege escalation and pivoting across isolated subnets.',
    skillsMastered: ['Nmap Advanced Port Scanning', 'Metasploit Framework', 'Linux Privilege Escalation', 'Pivoting & Chaining Proxies'],
  },
  {
    id: 'p-8',
    name: 'Mohit',
    role: 'Cloud DevSecOps Lead',
    category: 'Cloud DevSecOps',
    company: 'KPMG Cyber',
    companyCategory: 'Enterprise Risk Advisory',
    companyDescription: 'KPMG Cyber Risk assists multi-national corporations in securing cloud infrastructure, Terraform IaC, and AWS/Azure workloads.',
    hiringCriteria: ['AWS CloudTrail & GuardDuty', 'IaC Security Scanning (Checkov)', 'IAM Least Privilege Audit'],
    package: '₹13.2 LPA',
    hike: '175% Salary Hike',
    prevRole: 'System Administrator',
    avatar: '/images/Students/Mohit.svg',
    verifiedTsId: 'TS-2025-2087',
    quote: 'The AWS cloud security modules gave me real-world experience configuring IAM policies, GuardDuty alerts, and Terraform security scans.',
    skillsMastered: ['AWS Security Architecture', 'Terraform IaC Checkov Auditing', 'AWS GuardDuty & SecurityHub', 'Docker Bench Security'],
  },
];

const COMPANY_PROFILES: CompanyProfile[] = [
  {
    name: 'Palo Alto Networks',
    category: 'Next-Gen Firewall & Cloud Security',
    badge: 'Tier-1 Security Leader',
    description: 'Specializes in enterprise threat prevention, Cortex XDR incident triage, and cloud workload protection.',
    hiringRoles: ['SOC Analyst L1/L2', 'Cloud Security Specialist', 'Cortex XDR Triage Engineer'],
    avgPackage: '₹12 - ₹16 LPA',
    skillsRequired: ['SIEM & Splunk Triage', 'Network PCAP Analysis', 'MITRE ATT&CK Framework'],
    logo: '🔒 Palo Alto',
  },
  {
    name: 'CrowdStrike',
    category: 'Endpoint Protection & Threat Intelligence',
    badge: 'Tier-1 Security Leader',
    description: 'Focuses on Falcon platform deployment, threat hunting, kernel syscall tracing, and EDR memory analysis.',
    hiringRoles: ['Threat Hunter', 'EDR Specialist', 'Malware Security Researcher'],
    avgPackage: '₹14 - ₹18.5 LPA',
    skillsRequired: ['Active Directory Exploitation', 'Memory Forensics', 'Kernel Syscall Probing'],
    logo: '🛡️ CrowdStrike',
  },
  {
    name: 'Deloitte Cyber Risk',
    category: 'Big4 Cybersecurity Consulting',
    badge: 'Global Advisory',
    description: 'Delivers web application penetration testing, cloud security audits, and risk assessment for Fortune 500 clients.',
    hiringRoles: ['Penetration Testing Consultant', 'Cyber Risk Analyst', 'VAPT Specialist'],
    avgPackage: '₹10 - ₹14 LPA',
    skillsRequired: ['Web VAPT & Burp Suite', 'API Security Auditing', 'CVSS & Technical Reporting'],
    logo: '🟢 Deloitte',
  },
  {
    name: 'Cloudflare',
    category: 'Edge Network & AI Security',
    badge: 'Cloud Leader',
    description: 'Protects global web applications against DDoS, zero-day bot attacks, and AI prompt injection vulnerabilities.',
    hiringRoles: ['AI Guardrails Engineer', 'Edge Security Architect', 'WAF Rule Developer'],
    avgPackage: '₹13 - ₹17 LPA',
    skillsRequired: ['LLM Red Teaming', 'Python Security Scripting', 'Cloud WAF Configuration'],
    logo: '☁️ Cloudflare',
  },
];

const DOMAIN_STATS = [
  { domain: 'SOC & Blue Teaming', avgSalary: '₹8.2 LPA', maxSalary: '₹14.5 LPA', demand: 'High Demand', color: 'from-blue-600 to-indigo-600' },
  { domain: 'Penetration Testing / VAPT', avgSalary: '₹9.5 LPA', maxSalary: '₹18.0 LPA', demand: 'Very High Demand', color: 'from-purple-600 to-fuchsia-600' },
  { domain: 'Cloud DevSecOps', avgSalary: '₹10.4 LPA', maxSalary: '₹15.2 LPA', demand: 'Exponential', color: 'from-emerald-600 to-teal-600' },
  { domain: 'AI & Data Security', avgSalary: '₹11.8 LPA', maxSalary: '₹16.8 LPA', demand: 'Emerging Frontier', color: 'from-amber-600 to-orange-600' },
];

const CATEGORIES = [
  'All Placements',
  'SOC & Blue Teaming',
  'Penetration Testing / VAPT',
  'Cloud DevSecOps',
  'AI Security',
];

export default function PlacementHighlightsClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Placements');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCandidate, setActiveCandidate] = useState<PlacementRecord | null>(null);

  const filteredPlacements = useMemo(() => {
    return PLACEMENTS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Placements' || item.category === selectedCategory;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.prevRole.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-900 pt-12 pb-24 relative overflow-hidden font-sans">
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/50 via-slate-100/30 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#7E3BED_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── HERO HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>DELIVERING PROOF, NOT PROMISES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Placement <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600">Highlights</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Real transformation stories of learners who mastered hands-on security and landed high-impact roles at leading technology &amp; cybersecurity firms.
          </p>
        </div>

        {/* ── STATS METRICS GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">94%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Placement Success Rate</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">₹18.0 LPA</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Highest Package Secured</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">₹6.8 LPA</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Average Starting Salary</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">150+</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Active Hiring Partners</p>
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS BAR ── */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-purple-100 shadow-md mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, role, or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 select-none scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── PLACEMENT WALL OF FAME CARDS GRID ── */}
        {filteredPlacements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredPlacements.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveCandidate(item)}
                className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
              >
                {/* Top Accent Stripe */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  {/* Student Avatar + Company Header */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-purple-100 bg-slate-100 shrink-0 shadow-sm">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{item.prevRole}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 shrink-0">
                      {item.verifiedTsId}
                    </span>
                  </div>

                  {/* Designation & Company Pill */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block font-mono">
                      PLACED AS:
                    </span>
                    <p className="font-bold text-sm text-slate-900 leading-snug">{item.role}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>{item.company}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.companyCategory}</span>
                    </div>
                  </div>

                  {/* Salary Package & Hike */}
                  <div className="flex items-center justify-between bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                        SALARY PACKAGE
                      </span>
                      <span className="font-black text-lg text-emerald-950">{item.package}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                      {item.hike}
                    </span>
                  </div>

                  {/* Testimonial Quote if present */}
                  {item.quote && (
                    <p className="text-xs text-slate-600 italic leading-relaxed pt-1 line-clamp-3">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  )}
                </div>

                {/* Footer status */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified TSE Alumni</span>
                  </span>
                  <span className="text-purple-700 font-bold group-hover:underline inline-flex items-center gap-1">
                    <span>View Journey &amp; Skills</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-purple-100 p-8 mb-16">
            <p className="text-base font-bold text-slate-800">No placements found matching your search query.</p>
            <p className="text-xs text-slate-500 mt-1">Try changing the domain filter or search term.</p>
          </div>
        )}

        {/* ── SECTION 2: TOP HIRING COMPANIES DETAILED SPOTLIGHT ── */}
        <div className="mb-20 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#C6FF34]" />
              <span>RECRUITER INSIGHTS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Top Enterprise Security Recruiters &amp; Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Learn about the global cybersecurity leaders that actively recruit TSE graduates, their role requirements, and target technical skillsets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPANY_PROFILES.map((c, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-wide">
                      {c.logo}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      {c.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {c.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                      RECRUITMENT ROLES AT TSE:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.hiringRoles.map((r, rIdx) => (
                        <span key={rIdx} className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                      PRIMARY SKILLS EVALUATED:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.skillsRequired.map((s, sIdx) => (
                        <span key={sIdx} className="text-[11px] font-mono font-bold text-purple-800 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">TYPICAL COMPENSATION:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {c.avgPackage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: STEP-BY-STEP CAREER TRANSFORMATION PIPELINE ── */}
        <div className="mb-20 bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              <span>THE TSE HIRING PIPELINE</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How We Take You From Zero To Placed
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Our 4-stage systematic methodology designed to forge industry-ready cybersecurity engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-mono font-black text-sm flex items-center justify-center">
                01
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Hands-on Security Labs</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Master Web VAPT, Active Directory Kerberoasting, and SIEM Splunk triage in 200+ isolated cloud lab sandboxes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-mono font-black text-sm flex items-center justify-center">
                02
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Red/Blue Team Projects</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Execute live adversary simulations, write professional pentest reports, and accumulate real bug bounty disclosures.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-mono font-black text-sm flex items-center justify-center">
                03
              </div>
              <h3 className="font-extrabold text-base text-slate-900">TS-ID Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Earn an industry-recognized TS-ID credential with tamper-proof public verification for corporate recruiters.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-purple-900 text-white border border-purple-700 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-[#C6FF34] text-slate-950 font-mono font-black text-sm flex items-center justify-center">
                04
              </div>
              <h3 className="font-extrabold text-base text-white">Direct Recruiter Referrals</h3>
              <p className="text-xs text-purple-200 leading-relaxed font-medium">
                Access exclusive hiring drives with 150+ partner security firms, mock technical interviews, and resume triage.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: SALARY DOMAIN INSIGHTS ── */}
        <div className="mb-20 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Domain Compensation &amp; Demand Insights
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Salary distribution across core cybersecurity and AI security specializations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {DOMAIN_STATS.map((d, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
                <span className="text-[10px] font-mono font-bold text-purple-700 uppercase bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  {d.demand}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">{d.domain}</h3>
                
                <div className="space-y-2 pt-2 border-t border-slate-100 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Average Starting:</span>
                    <span className="font-bold text-slate-900">{d.avgSalary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Highest Package:</span>
                    <span className="font-extrabold text-emerald-700">{d.maxSalary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CALL TO ACTION BANNER ── */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 text-white shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
              READY FOR YOUR CAREER TRANSFORMATION?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Become Our Next Success Story
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Book a 1-on-1 counseling session with senior security leaders. Get a customized learning roadmap and explore upcoming batch admissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C6FF34] text-slate-950 font-extrabold text-sm hover:bg-[#b3fa1b] transition-all shadow-lg cursor-pointer"
            >
              <span>Book Free Demo Class</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#curriculum-roadmap"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all cursor-pointer"
            >
              <span>Explore Curriculum</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ── CANDIDATE JOURNEY & PROFILE MODAL DIALOG ── */}
      <Dialog open={!!activeCandidate} onOpenChange={(open) => !open && setActiveCandidate(null)}>
        <DialogContent className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          {activeCandidate && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-200 bg-slate-100 shrink-0 shadow-sm">
                  <Image
                    src={activeCandidate.avatar}
                    alt={activeCandidate.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xl text-slate-900">{activeCandidate.name}</h3>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {activeCandidate.verifiedTsId}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500">{activeCandidate.prevRole} &rarr; {activeCandidate.role}</p>
                </div>
              </div>

              {/* Company & Salary Banner */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">PLACED COMPANY</span>
                  <p className="font-black text-base text-slate-900">{activeCandidate.company}</p>
                  <p className="text-[11px] text-slate-500">{activeCandidate.companyCategory}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">PACKAGE &amp; SALARY HIKE</span>
                  <p className="font-black text-base text-emerald-700">{activeCandidate.package}</p>
                  <p className="text-[11px] font-bold text-emerald-600">{activeCandidate.hike}</p>
                </div>
              </div>

              {/* Company Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-700 tracking-wider">// ABOUT {activeCandidate.company.toUpperCase()}:</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {activeCandidate.companyDescription}
                </p>
              </div>

              {/* Skills Mastered at TSE */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-700 tracking-wider">// PRACTICAL SKILLS MASTERED AT TSE:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCandidate.skillsMastered.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-semibold text-slate-800">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate Quote */}
              {activeCandidate.quote && (
                <div className="p-4 rounded-2xl bg-purple-900 text-white space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#C6FF34] uppercase tracking-wider block">STUDENT EXPERIENCE:</span>
                  <p className="text-xs leading-relaxed italic text-purple-100">
                    &ldquo;{activeCandidate.quote}&rdquo;
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveCandidate(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
