export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    durationMinutes: number;
    type: 'VIDEO' | 'LAB' | 'READING' | 'QUIZ';
  }[];
}

export interface CourseLab {
  id: string;
  title: string;
  objective: string;
  skills: string;
  estimatedMinutes: number;
}

export interface CourseFaq {
  q: string;
  a: string;
}

export interface MasterCourseData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  track: 'cyber' | 'ai';
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  durationHours: number;
  modulesCount: number;
  labsCount: number;
  highlights: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  toolsCovered: string[];
  mentor: {
    name: string;
    role: string;
    company: string;
    bio: string;
  };
  modules: CourseModule[];
  labs: CourseLab[];
  faqs: CourseFaq[];
}

export const MASTER_COURSES: MasterCourseData[] = [
  // ── CYBERSECURITY TRACK (8 COURSES) ──
  {
    id: 'cyber-1',
    slug: 'web-application-security-vapt',
    title: 'Web Application Security & VAPT Masterclass',
    subtitle: 'Master OWASP Top 10, Burp Suite Pro, Server-Side Request Forgery (SSRF), and Business Logic Exploitation.',
    description: 'A comprehensive, 100% hands-on offensive security program designed to transform developers and aspiring analysts into industry-grade Web Penetration Testers. Learn how to systematically discover, exploit, and remediate high-severity web vulnerabilities in real-world web architectures.',
    track: 'cyber',
    category: 'VAPT & Web Security',
    level: 'Beginner',
    durationHours: 60,
    modulesCount: 12,
    labsCount: 45,
    highlights: ['Burp Suite Professional Triage', 'OWASP Top 10 Web Exploitation', 'CVSS v3.1 Report Writing'],
    prerequisites: ['Basic HTTP protocol concepts', 'Familiarity with web browsers & developer tools', 'Introductory command-line experience'],
    learningOutcomes: [
      'Conduct rigorous vulnerability assessments aligned with OWASP Top 10 and WSTG v4.2',
      'Automate target reconnaissance and vulnerability triage using Burp Suite Pro Intruder & Repeater',
      'Identify and exploit Server-Side Request Forgery (SSRF) and IDOR in production cloud APIs',
      'Draft industry-standard executive and technical CVSS v3.1 penetration testing reports',
    ],
    toolsCovered: ['Burp Suite Pro', 'OWASP ZAP', 'ffuf', 'sqlmap', 'Postman', 'Sublist3r'],
    mentor: {
      name: 'Kunal Singh',
      role: 'Lead Security Architect & Offensive Operations',
      company: 'Thread Security Education',
      bio: '10+ years conducting enterprise penetration testing, red teaming, and threat modeling for global fintech and SaaS platforms.',
    },
    modules: [
      {
        id: 'm1',
        title: 'HTTP Protocol Deep Dive & Attack Surface Mining',
        description: 'Analyze raw headers, proxies, sessions, and client-server communication flows.',
        lessons: [
          { id: 'l1', title: 'HTTP/1.1 vs HTTP/2 Request Smuggling Primer', durationMinutes: 45, type: 'VIDEO' },
          { id: 'l2', title: 'Configuring Burp Suite Pro for Interception & SSL Pinning', durationMinutes: 50, type: 'LAB' },
        ],
      },
      {
        id: 'm2',
        title: 'OWASP Top 10 Exploitation Workflows',
        description: 'Hands-on exploitation of SQL Injection, Cross-Site Scripting (XSS), and Broken Access Control.',
        lessons: [
          { id: 'l3', title: 'Second-Order SQL Injection & Filter Bypasses', durationMinutes: 60, type: 'VIDEO' },
          { id: 'l4', title: 'DOM & Stored XSS Triage in Single Page Applications', durationMinutes: 55, type: 'LAB' },
        ],
      },
      {
        id: 'm3',
        title: 'SSRF & Cloud Metadata Exploitation',
        description: 'Pivoting from web applications into internal AWS/GCP cloud environments via vulnerable endpoints.',
        lessons: [
          { id: 'l5', title: 'Bypassing Cloud WAF Regex to Access 169.254.169.254', durationMinutes: 65, type: 'VIDEO' },
          { id: 'l6', title: 'Harvesting AWS IAM Credentials from Metadata Service', durationMinutes: 70, type: 'LAB' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Burp Suite Repeater & Intruder Automation', objective: 'Brute force access tokens and bypass rate limits on a live target.', skills: 'Burp Suite, Automation', estimatedMinutes: 45 },
      { id: 'lab2', title: 'SSRF Cloud AWS Metadata Extraction', objective: 'Bypass WAF filters and extract temporary IAM role credentials.', skills: 'AWS, SSRF, Cloud Security', estimatedMinutes: 60 },
      { id: 'lab3', title: 'BOLA/IDOR API Parameter Tampering', objective: 'Access unauthorized student records across tenant boundaries.', skills: 'API Security, IDOR', estimatedMinutes: 50 },
    ],
    faqs: [
      { q: 'Is this course suitable for beginners?', a: 'Yes! We start with HTTP protocol fundamentals before escalating into advanced exploitation chains.' },
      { q: 'How do the sandbox labs work?', a: 'Every lab launches on-demand in an isolated Docker container with zero local installation required.' },
      { q: 'Does this prepare me for CEH or OSCP?', a: 'The practical methodology directly aligns with OSCP web assessment and eWPT standards.' },
    ],
  },
  {
    id: 'cyber-2',
    slug: 'soc-blue-team-operations',
    title: 'SOC Operations & Threat Hunting (Blue Team)',
    subtitle: 'Real-time SIEM log analysis with Splunk, MITRE ATT&CK mapping, memory forensics, and PCAP incident triage.',
    description: 'Train as an enterprise SOC Analyst. Learn how to ingest multi-source telemetries into Splunk, build automated correlation rules, investigate live ransomware outbreaks, and execute structured threat hunting using the MITRE ATT&CK framework.',
    track: 'cyber',
    category: 'SOC & Blue Team',
    level: 'Beginner',
    durationHours: 75,
    modulesCount: 14,
    labsCount: 60,
    highlights: ['Splunk Enterprise Log Analysis', 'Wireshark & Memory Forensics', 'CORTEX XDR Incident Playbooks'],
    prerequisites: ['Basic operating system concepts (Windows/Linux)', 'Understanding of TCP/IP networking'],
    learningOutcomes: [
      'Operate Splunk Enterprise SIEM for real-time alerting and incident investigation',
      'Map observed adversary behaviors to MITRE ATT&CK tactics and techniques',
      'Analyze Wireshark PCAPs to detect command-and-control (C2) beaconing and data exfiltration',
      'Perform volatility-based live memory forensics during simulated malware infections',
    ],
    toolsCovered: ['Splunk', 'Wireshark', 'Volatility 3', 'Sysmon', 'Velociraptor', 'Suricata'],
    mentor: {
      name: 'Vikramaditya Sharma',
      role: 'Principal SOC Engineer & Incident Commander',
      company: 'Thread Security Education',
      bio: 'Former Lead Incident Responder managing 24/7 global defense operations, triage, and threat eradication.',
    },
    modules: [
      {
        id: 'm1',
        title: 'SIEM Architecture & Splunk Fundamentals',
        description: 'Ingesting Windows Event Logs, Sysmon, and Linux auth telemetries into a distributed SIEM.',
        lessons: [
          { id: 'l1', title: 'Writing Performant SPL Queries & Search Macros', durationMinutes: 50, type: 'VIDEO' },
          { id: 'l2', title: 'Detecting Pass-the-Hash in Windows Security Logs', durationMinutes: 60, type: 'LAB' },
        ],
      },
      {
        id: 'm2',
        title: 'Network Traffic Analysis & PCAP Forensics',
        description: 'Uncovering encrypted malware beacons, DNS tunneling, and cleartext credential harvesting in PCAPs.',
        lessons: [
          { id: 'l3', title: 'Wireshark Advanced Display Filters for Beacon Detection', durationMinutes: 45, type: 'VIDEO' },
          { id: 'l4', title: 'Carving Executable Payloads from HTTP Streams', durationMinutes: 55, type: 'LAB' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Splunk Ransomware Triage Challenge', objective: 'Identify patient zero, infection vector, and lateral movement timeline in Splunk.', skills: 'Splunk, SPL, Incident Response', estimatedMinutes: 60 },
      { id: 'lab2', title: 'Memory Forensics with Volatility 3', objective: 'Extract injected DLLs and malicious process trees from infected memory dumps.', skills: 'Volatility, Memory Analysis', estimatedMinutes: 65 },
    ],
    faqs: [
      { q: 'Will I learn how to use real enterprise SIEM tools?', a: 'Yes! You work directly inside a licensed enterprise Splunk environment with populated multi-gigabyte attack datasets.' },
      { q: 'What jobs does this qualify me for?', a: 'SOC Analyst Tier 1 & 2, Incident Responder, Threat Intelligence Analyst, and Junior Threat Hunter.' },
    ],
  },
  {
    id: 'cyber-3',
    slug: 'cloud-security-devsecops',
    title: 'Cloud DevSecOps & Infrastructure Hardening',
    subtitle: 'AWS Security Architecture, Kubernetes network policies, Terraform Checkov IaC scans, and CI/CD SAST pipelines.',
    description: 'Bridge the gap between modern cloud development and offensive security. Master AWS IAM least-privilege, Kubernetes container isolation, infrastructure-as-code security scans with Checkov, and automated CI/CD pipeline security gates.',
    track: 'cyber',
    category: 'Cloud DevSecOps',
    level: 'Intermediate',
    durationHours: 80,
    modulesCount: 16,
    labsCount: 50,
    highlights: ['AWS SecurityHub & GuardDuty', 'Kubernetes RBAC & Container Hardening', 'GitHub Actions DevSecOps Pipeline'],
    prerequisites: ['Basic Docker/Container knowledge', 'Introductory AWS console or CLI familiarity'],
    learningOutcomes: [
      'Design zero-trust cloud architectures with AWS IAM, SCPs, and VPC endpoints',
      'Implement Kubernetes Pod Security Standards and calico network policy isolation',
      'Embed automated SAST, DAST, and secret scanners into GitHub Actions pipelines',
      'Audit Terraform configurations using Checkov and tfsec to enforce compliance',
    ],
    toolsCovered: ['AWS CloudTrail', 'Kubernetes', 'Trivy', 'Checkov', 'GitHub Actions', 'Docker'],
    mentor: {
      name: 'Rohan Mehta',
      role: 'Cloud Security Architect',
      company: 'Thread Security Education',
      bio: 'Architecting secure multi-region cloud infrastructures and automated compliance pipelines for Fortune 500 organizations.',
    },
    modules: [
      {
        id: 'm1',
        title: 'AWS Identity & Cloud Infrastructure Hardening',
        description: 'IAM privilege escalation vectors, GuardDuty threat triage, and KMS envelope encryption.',
        lessons: [
          { id: 'l1', title: 'Detecting IAM Privilege Escalation Paths', durationMinutes: 50, type: 'VIDEO' },
          { id: 'l2', title: 'Configuring AWS SecurityHub & Automated Remediation Lambdas', durationMinutes: 60, type: 'LAB' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Kubernetes Container Escape Audit', objective: 'Audit misconfigured privileged pods and enforce strict admission controllers.', skills: 'Kubernetes, Container Security', estimatedMinutes: 60 },
      { id: 'lab2', title: 'Automated CI/CD Pipeline Hardening', objective: 'Construct a secure GitHub Actions workflow with secret masking and Trivy image scanning.', skills: 'DevSecOps, GitHub Actions', estimatedMinutes: 50 },
    ],
    faqs: [
      { q: 'Is this focused on AWS only or multi-cloud?', a: 'Core principles apply across all cloud providers, with concrete deep dives in AWS and Kubernetes.' },
    ],
  },
  {
    id: 'cyber-4',
    slug: 'active-directory-exploitation',
    title: 'Active Directory Enterprise Attack Paths',
    subtitle: 'BloodHound graph analysis, Kerberoasting, AS-REP roasting, AD CS abuse, and Golden Ticket persistence.',
    description: 'An elite red teaming masterclass dissecting Windows enterprise infrastructure. Discover how real-world attackers map privilege escalation graphs with BloodHound, abuse Kerberos delegation, exploit Active Directory Certificate Services (AD CS), and establish domain persistence.',
    track: 'cyber',
    category: 'Red Teaming',
    level: 'Expert',
    durationHours: 50,
    modulesCount: 10,
    labsCount: 35,
    highlights: ['BloodHound Trust Graph Mining', 'Kerberos Ticket Forgery', 'EDR Evasion & Memory Unhooking'],
    prerequisites: ['Strong understanding of Windows domains & Kerberos', 'Basic PowerShell scripting'],
    learningOutcomes: [
      'Enumerate hidden enterprise trust paths using BloodHound and SharpHound',
      'Execute Kerberoasting and AS-REP roasting attacks to crack service account passwords',
      'Abuse vulnerable AD CS certificate templates (ESC1 through ESC8) for instant domain admin escalation',
      'Forge Golden and Silver Kerberos tickets for persistent stealth access',
    ],
    toolsCovered: ['BloodHound', 'Mimikatz', 'Rubeus', 'Certify', 'Impacket', 'PowerView'],
    mentor: {
      name: 'Kunal Singh',
      role: 'Offensive Security Lead',
      company: 'Thread Security Education',
      bio: 'Certified Red Teamer with hundreds of successful domain compromise engagements across global corporate networks.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Active Directory Architecture & Kerberos In-Depth',
        description: 'TGTs, TGSs, SPNs, and the underlying mechanics of Windows authentication.',
        lessons: [
          { id: 'l1', title: 'Dissecting Kerberos Traffic in Wireshark', durationMinutes: 50, type: 'VIDEO' },
          { id: 'l2', title: 'Extracting and Cracking Service Tickets with Rubeus', durationMinutes: 60, type: 'LAB' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'AD CS ESC1 Exploitation Sandbox', objective: 'Find misconfigured certificate templates and request a certificate on behalf of Domain Admin.', skills: 'AD CS, PKI, Red Teaming', estimatedMinutes: 60 },
      { id: 'lab2', title: 'Golden Ticket Forgery & DCShadow Persistence', objective: 'Dump KRBTGT hash and forge long-term valid Kerberos tickets.', skills: 'Mimikatz, Kerberos, Persistence', estimatedMinutes: 65 },
    ],
    faqs: [
      { q: 'Do I get access to a full Windows Active Directory lab?', a: 'Yes! You receive access to a multi-domain forest virtual lab with real Windows Server domain controllers.' },
    ],
  },
  {
    id: 'cyber-5',
    slug: 'mobile-application-penetration-testing',
    title: 'Mobile Application Penetration Testing (iOS & Android)',
    subtitle: 'Frida dynamic instrumentation, OWASP MASVS audits, SSL pinning bypass, and APK/IPA reverse engineering.',
    description: 'Learn how to decompile, audit, and instrument Android APKs and iOS IPAs. Master Frida hooking, jailbreak/root detection bypass, local data storage exploitation, and insecure IPC communications.',
    track: 'cyber',
    category: 'Mobile Security',
    level: 'Intermediate',
    durationHours: 55,
    modulesCount: 11,
    labsCount: 38,
    highlights: ['Frida & Objection Dynamic Hooking', 'OWASP MASVS / MSTG Standards', 'iOS Keychain & Android Keystore Audits'],
    prerequisites: ['Basic Java/Kotlin or Swift familiarity', 'Understanding of client-server APIs'],
    learningOutcomes: [
      'Decompile Android APKs with JADX-GUI and reverse engineer Dalvik bytecode',
      'Bypass SSL certificate pinning dynamically using Frida and Objection scripts',
      'Extract sensitive cryptographic keys and session tokens from SQLite and Keychain storage',
      'Identify and remediate Android exported component vulnerabilities',
    ],
    toolsCovered: ['Frida', 'Objection', 'JADX-GUI', 'MobSF', 'Burp Suite', 'Ghidra'],
    mentor: {
      name: 'Rohan Mehta',
      role: 'Senior Mobile Security Researcher',
      company: 'Thread Security Education',
      bio: 'Specialist in mobile application vulnerabilities and zero-day discoveries in commercial iOS and Android applications.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Android Security Internals & Static Analysis',
        description: 'APK structure, AndroidManifest.xml analysis, and decompilation with JADX.',
        lessons: [
          { id: 'l1', title: 'Analyzing Smali Code and Finding Hardcoded Secrets', durationMinutes: 45, type: 'VIDEO' },
          { id: 'l2', title: 'Automated Vulnerability Triage with MobSF', durationMinutes: 50, type: 'LAB' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Dynamic SSL Pinning Bypass with Frida', objective: 'Write custom Frida Javascript hooks to override SSLContext trust verification.', skills: 'Frida, SSL Pinning', estimatedMinutes: 55 },
    ],
    faqs: [
      { q: 'Do I need physical rooted phones?', a: 'No, our cloud sandbox provides virtualized pre-rooted Android emulators and jailbroken Corellium iOS instances.' },
    ],
  },
  {
    id: 'cyber-6',
    slug: 'api-security-microservices-exploitation',
    title: 'API Security & Microservices Exploitation',
    subtitle: 'BOLA/BFLA authorization flaws, GraphQL query depth attacks, mass assignment, and OAuth 2.0 / JWT vulnerabilities.',
    description: 'Modern architectures rely on REST and GraphQL APIs. Master the OWASP API Security Top 10, discovering Broken Object Level Authorization (BOLA), mass assignment, JWT signature stripping, and GraphQL denial-of-service vulnerabilities.',
    track: 'cyber',
    category: 'API Security',
    level: 'Advanced',
    durationHours: 65,
    modulesCount: 13,
    labsCount: 42,
    highlights: ['Broken Object Level Auth (BOLA)', 'GraphQL Introspection & Batching', 'OAuth 2.0 Redirect URI Hijacking'],
    prerequisites: ['REST API basics', 'Familiarity with JSON and HTTP authentication'],
    learningOutcomes: [
      'Perform systematic audits against the OWASP API Security Top 10',
      'Exploit BOLA/IDOR flaws to access restricted multi-tenant business data',
      'Crack weak JWT HMAC secrets and manipulate claims for privilege escalation',
      'Abuse GraphQL batch queries, deep recursion, and schema introspection flaws',
    ],
    toolsCovered: ['Postman', 'Kiterunner', 'jwt_tool', 'InQL GraphQL Scanner', 'Burp Suite'],
    mentor: {
      name: 'Kunal Singh',
      role: 'Lead Security Architect',
      company: 'Thread Security Education',
      bio: 'Advising engineering teams on resilient microservice architectures and zero-trust API gateways.',
    },
    modules: [
      {
        id: 'm1',
        title: 'REST API Authentication & JWT Deep Dive',
        description: 'Token forgery, algorithm confusion attacks (RS256 to HS256), and jku/kid header injections.',
        lessons: [
          { id: 'l1', title: 'Exploiting JWT None Algorithm & Header Injections', durationMinutes: 50, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'GraphQL Batching & Nested Recursion DoS', objective: 'Trigger compute starvation on a vulnerable GraphQL endpoint via circular queries.', skills: 'GraphQL, DoS Defense', estimatedMinutes: 50 },
    ],
    faqs: [
      { q: 'Are practical API targets provided?', a: 'Yes! You test against custom banking and healthcare API testbeds simulated in cloud sandboxes.' },
    ],
  },
  {
    id: 'cyber-7',
    slug: 'binary-exploitation-reverse-engineering',
    title: 'Binary Exploitation & Reverse Engineering',
    subtitle: 'Ghidra x86/ARM disassembly, stack buffer overflows, Return-Oriented Programming (ROP), and heap exploitation.',
    description: 'Demystify low-level software vulnerabilities. Analyze compiled x86_64 and ARM binaries in Ghidra and GDB, construct Return-Oriented Programming (ROP) exploit chains to bypass DEP/NX and ASLR, and exploit heap memory corruption bugs.',
    track: 'cyber',
    category: 'Offensive Research',
    level: 'Expert',
    durationHours: 85,
    modulesCount: 16,
    labsCount: 55,
    highlights: ['Ghidra & IDA Pro Static Reversing', 'ROP Gadget Chaining & ASLR Defeat', 'Heap Chunk Manipulation (Use-After-Free)'],
    prerequisites: ['C/C++ programming understanding', 'Familiarity with assembly language and computer memory architecture'],
    learningOutcomes: [
      'Reverse engineer complex compiled executables using Ghidra decompiler',
      'Construct reliable stack buffer overflow exploits bypassing NX/DEP using ROP gadgets',
      'Defeat Address Space Layout Randomization (ASLR) via memory leak techniques',
      'Analyze heap chunk metadata and exploit Use-After-Free (UAF) vulnerabilities',
    ],
    toolsCovered: ['Ghidra', 'GDB-pwndbg', 'pwntools', 'ROPgadget', 'checksec'],
    mentor: {
      name: 'Vikramaditya Sharma',
      role: 'Exploit Developer & Reverse Engineer',
      company: 'Thread Security Education',
      bio: 'Low-level vulnerability researcher discovering CVEs in enterprise operating systems and networking firmware.',
    },
    modules: [
      {
        id: 'm1',
        title: 'x86_64 Stack Architecture & GDB Mastery',
        description: 'Registers, stack frames, calling conventions, and dynamic debugging.',
        lessons: [
          { id: 'l1', title: 'Debugging with GDB-pwndbg and Context Inspection', durationMinutes: 55, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'ROP Chain Construction on 64-bit Linux', objective: 'Chain gadget addresses to execute system("/bin/sh") bypassing non-executable stack.', skills: 'ROP, Pwntools, Linux Exploitation', estimatedMinutes: 70 },
    ],
    faqs: [
      { q: 'Is C programming necessary?', a: 'Yes, basic familiarity with pointers and memory management in C is strongly recommended.' },
    ],
  },
  {
    id: 'cyber-8',
    slug: 'ot-ics-critical-infrastructure-security',
    title: 'Industrial OT / ICS & SCADA Defense',
    subtitle: 'Purdue model architecture, Modbus & DNP3 industrial packet injection, PLC firmware extraction, and safety instrumented systems.',
    description: 'Defend physical systems from cyber warfare. Learn how Programmable Logic Controllers (PLCs), Remote Terminal Units (RTUs), and SCADA HMIs operate, analyze industrial Modbus/DNP3 protocols, and secure critical infrastructure from advanced threat actors.',
    track: 'cyber',
    category: 'OT / ICS Security',
    level: 'Advanced',
    durationHours: 60,
    modulesCount: 12,
    labsCount: 36,
    highlights: ['Modbus & DNP3 Packet Injection', 'PLC Ladder Logic Vulnerabilities', 'Purdue Model Zone/Conduit Isolation'],
    prerequisites: ['Networking fundamentals', 'Basic understanding of industrial automation or IoT'],
    learningOutcomes: [
      'Map physical plant networks according to the Purdue Enterprise Reference Architecture',
      'Inspect unencrypted industrial control traffic (Modbus TCP, DNP3, Ethernet/IP)',
      'Simulate unauthorized command injection against virtualized PLC ladder logic',
      'Implement passive OT network intrusion detection using Suricata and Zeek ICS parsers',
    ],
    toolsCovered: ['Wireshark (ICS)', 'Modbus-cli', 'OpenPLC', 'Scapy', 'Ghidra'],
    mentor: {
      name: 'Rohan Mehta',
      role: 'Critical Infrastructure Security Consultant',
      company: 'Thread Security Education',
      bio: 'Advising power generation, water treatment, and manufacturing facilities on air-gapped industrial defense.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Purdue Model & Industrial Network Segmentation',
        description: 'Level 0 field devices to Level 3 operations management zoning.',
        lessons: [
          { id: 'l1', title: 'Dissecting Modbus Function Codes and Register Memory', durationMinutes: 50, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'OpenPLC Coils & Register Injection Attack', objective: 'Inject rogue Modbus packets to force open simulated coolant valves.', skills: 'Modbus, OpenPLC, Industrial Security', estimatedMinutes: 60 },
    ],
    faqs: [
      { q: 'How is physical equipment simulated?', a: 'We use OpenPLC running in virtualized sandbox containers with animated digital twin plant simulations.' },
    ],
  },

  // ── ARTIFICIAL INTELLIGENCE TRACK (8 COURSES) ──
  {
    id: 'ai-1',
    slug: 'ai-security-llm-redteaming',
    title: 'AI Security & LLM Red Teaming Masterclass',
    subtitle: 'Exploit LLM pipelines, master indirect prompt injection, bypass NeMo guardrails, and mitigate agentic RCE threats.',
    description: 'The definitive cybersecurity curriculum for Generative AI. Audit foundation model integrations, execute direct and indirect prompt injections, circumvent output moderation rails, and defend production LLM pipelines from supply chain poisoning.',
    track: 'ai',
    category: 'AI Security',
    level: 'Intermediate',
    durationHours: 65,
    modulesCount: 12,
    labsCount: 40,
    highlights: ['Indirect Prompt Injection Vectors', 'NeMo Guardrails & Dual-LLM Auditing', 'VectorDB Data Poisoning Defense'],
    prerequisites: ['Basic Python programming', 'Understanding of LLM prompt engineering concepts'],
    learningOutcomes: [
      'Execute direct and indirect prompt injection attacks against multimodal foundation models',
      'Test and bypass semantic guardrails built with NeMo Guardrails and Llama Guard',
      'Audit autonomous AI agents for unsafe tool invocation and Server-Side Request Forgery (SSRF)',
      'Implement dual-LLM verification architectures and input sanitization filters',
    ],
    toolsCovered: ['LangChain', 'NeMo Guardrails', 'Garak LLM Scanner', 'OpenAI API', 'ChromaDB'],
    mentor: {
      name: 'Ananya Roy',
      role: 'Head of AI Vulnerability Research',
      company: 'Thread Security Education',
      bio: 'Pioneering researcher specializing in adversarial prompt injection and safety guardrails for production enterprise models.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Prompt Injection Taxonomy & Attack Surfaces',
        description: 'Direct jailbreaks, token smuggling, base64 payloads, and indirect injection via third-party web content.',
        lessons: [
          { id: 'l1', title: 'Anatomy of Indirect Prompt Injection in RAG Pipelines', durationMinutes: 50, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'NeMo Guardrails Bypass Sandbox', objective: 'Craft adversarial prompts that circumvent programmable Colang safety rules.', skills: 'NeMo, Prompt Injection', estimatedMinutes: 50 },
    ],
    faqs: [
      { q: 'Are these attacks demonstrated on real LLMs?', a: 'Yes, labs utilize open-source models (Llama 3, Mistral) and API integrations.' },
    ],
  },
  {
    id: 'ai-2',
    slug: 'agentic-ai-engineering',
    title: 'Agentic AI Engineering & Production Systems',
    subtitle: 'Build autonomous tool-using AI agents, multi-modal LLM pipelines, LangChain security, and cloud sandbox isolation.',
    description: 'Learn how to architect, build, and deploy production-grade autonomous AI agents equipped with tools, memory, and multi-agent coordination while enforcing military-grade security sandboxes around external code execution.',
    track: 'ai',
    category: 'Autonomous AI',
    level: 'Advanced',
    durationHours: 70,
    modulesCount: 14,
    labsCount: 45,
    highlights: ['Tool-Calling Agent Architecture', 'LangChain & LlamaIndex Audits', 'Agentic Web Browsing SSRF Evasion'],
    prerequisites: ['Intermediate Python', 'Familiarity with REST APIs and async programming'],
    learningOutcomes: [
      'Build autonomous agents with function-calling, planning loops, and reflection capabilities',
      'Isolate code execution tools within Firecracker microVMs and secure gVisor sandboxes',
      'Audit LangChain and LlamaIndex agents for unintended tool-calling privilege escalation',
      'Implement multi-agent consensus protocols and rate limiting architectures',
    ],
    toolsCovered: ['LangChain', 'LangGraph', 'Docker Sandboxes', 'FastAPI', 'Redis'],
    mentor: {
      name: 'Harpreet Kaur',
      role: 'Senior AI Systems Engineer',
      company: 'Thread Security Education',
      bio: 'Building enterprise tool-using agent fleets and high-concurrency LLM inference microservices.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Agent ReAct Loop & Function Calling Architectures',
        description: 'Reasoning, planning, and state management in autonomous LLM agents.',
        lessons: [
          { id: 'l1', title: 'Designing Safe Tool Calling Schemas and Parameter Validators', durationMinutes: 55, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Sandbox Isolation for Python Code Execution Agent', objective: 'Deploy an agent that runs arbitrary code inside restricted gVisor microVM containers.', skills: 'Docker, gVisor, Agent Security', estimatedMinutes: 60 },
    ],
    faqs: [
      { q: 'Will I build real autonomous agents?', a: 'Yes! You build multi-agent workflows with LangGraph capable of automated research, coding, and triage.' },
    ],
  },
  {
    id: 'ai-3',
    slug: 'data-science-ml-security',
    title: 'Data Science & Machine Learning Pipeline Security',
    subtitle: 'Adversarial attacks on neural networks, model stealing, training data extraction, and PyTorch security hardening.',
    description: 'Foundational security for data science. Learn how machine learning pipelines are attacked in practice: adversarial evasion samples, model inversion attacks that leak private training data, and malicious pickle payload deserialization in model weights.',
    track: 'ai',
    category: 'ML Security',
    level: 'Beginner',
    durationHours: 55,
    modulesCount: 10,
    labsCount: 30,
    highlights: ['PyTorch Model Evasion Attacks', 'Feature Extraction Protection', 'ML Data Leakage Audit'],
    prerequisites: ['Introductory Python and basic mathematics/linear algebra'],
    learningOutcomes: [
      'Generate FGSM (Fast Gradient Sign Method) adversarial perturbations against image classifiers',
      'Identify arbitrary code execution vulnerabilities in serialized pickle / PyTorch checkpoint files',
      'Audit machine learning training data for leakage of personally identifiable information (PII)',
      'Harden ML pipelines using SafeTensors and differential privacy libraries',
    ],
    toolsCovered: ['PyTorch', 'CleverHans', 'SafeTensors', 'scikit-learn', 'Jupyter'],
    mentor: {
      name: 'Piya Kohli',
      role: 'AI Security Specialist',
      company: 'Thread Security Education',
      bio: 'Specialist in adversarial robustness testing and secure lifecycle management for deep learning neural networks.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Adversarial Machine Learning Fundamentals',
        description: 'White-box vs black-box threat models and gradient-based perturbation techniques.',
        lessons: [
          { id: 'l1', title: 'Generating Evasion Samples with PyTorch and FGSM', durationMinutes: 50, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Malicious Model Checkpoint RCE Demonstration', objective: 'Demonstrate how unvalidated pickle loads allow remote shell execution and convert to SafeTensors.', skills: 'PyTorch, SafeTensors, Deserialization', estimatedMinutes: 50 },
    ],
    faqs: [
      { q: 'Is this suitable for data science beginners?', a: 'Yes, step-by-step Jupyter notebooks guide you through both the math and the practical code.' },
    ],
  },
  {
    id: 'ai-4',
    slug: 'rag-vulnerability-analysis',
    title: 'RAG Architecture Security & Vector DB Defense',
    subtitle: 'Securing Retrieval-Augmented Generation systems, vector embedding tampering, and semantic search poisoning.',
    description: 'Retrieval-Augmented Generation powers modern enterprise search. Learn how attackers inject poisoned documents into knowledge bases, tamper with dense vector embeddings, and leak confidential cross-tenant enterprise data.',
    track: 'ai',
    category: 'AI DevSecOps',
    level: 'Intermediate',
    durationHours: 60,
    modulesCount: 11,
    labsCount: 35,
    highlights: ['Pinecone & Qdrant Vector Audits', 'Semantic Search Poisoning Mitigations', 'Enterprise RAG Access Control'],
    prerequisites: ['Python basics', 'Understanding of vector databases and embeddings'],
    learningOutcomes: [
      'Execute document poisoning attacks that manipulate top-k vector search results',
      'Audit vector databases (Qdrant, Pinecone, Milvus) for missing multi-tenant metadata filters',
      'Prevent cross-tenant document leakage in enterprise RAG systems',
      'Implement cryptographic signing and verification for retrieved context documents',
    ],
    toolsCovered: ['Qdrant', 'Pinecone', 'LlamaIndex', 'SentenceTransformers', 'Python'],
    mentor: {
      name: 'Ananya Roy',
      role: 'AI Defense Lead',
      company: 'Thread Security Education',
      bio: 'Leading vulnerability assessments on production vector search architectures and corporate knowledge engines.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Embedding Spaces & Vector Search Vulnerabilities',
        description: 'Cosine similarity, Euclidean distance, and semantic perturbation mechanics.',
        lessons: [
          { id: 'l1', title: 'Manipulating Embedding Distance to Force Inaccurate Citations', durationMinutes: 50, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Bypassing Multi-Tenant ACLs in Vector Databases', objective: 'Exploit missing metadata filter enforcement to retrieve confidential executive board notes.', skills: 'Qdrant, Vector Search, Access Control', estimatedMinutes: 55 },
    ],
    faqs: [
      { q: 'Which vector databases are used?', a: 'You interact with Qdrant, ChromaDB, and Pinecone instances.' },
    ],
  },
  {
    id: 'ai-5',
    slug: 'enterprise-ai-governance-guardrails',
    title: 'Enterprise AI Governance & NeMo Guardrails',
    subtitle: 'Deploy programmable semantic safety rails with Colang, enforce PII redaction, and implement dual-LLM moderation architectures.',
    description: 'Operationalize enterprise AI safety and regulatory compliance. Learn how to write programmable Colang guardrails, enforce automated PII/secret scrubbing before prompts hit cloud APIs, and deploy dual-LLM cross-verification pipelines.',
    track: 'ai',
    category: 'AI Governance',
    level: 'Beginner',
    durationHours: 50,
    modulesCount: 10,
    labsCount: 32,
    highlights: ['Colang Programmable Rails', 'Real-Time PII & Secret Redaction', 'Dual-LLM Cross-Verification Triage'],
    prerequisites: ['Basic Python familiarity', 'Understanding of enterprise data governance concepts'],
    learningOutcomes: [
      'Write and deploy programmable Colang dialogue rails using NVIDIA NeMo Guardrails',
      'Configure real-time PII, credit card, and API key redaction filters using Presidio',
      'Implement dual-model verification pipelines to catch hallucinations and toxic outputs',
      'Map enterprise AI systems to the NIST AI Risk Management Framework (AI RMF)',
    ],
    toolsCovered: ['NVIDIA NeMo', 'Colang', 'Microsoft Presidio', 'OpenAI Moderation', 'FastAPI'],
    mentor: {
      name: 'Harpreet Kaur',
      role: 'AI Governance Director',
      company: 'Thread Security Education',
      bio: 'Advising healthcare and banking institutions on responsible AI deployments and compliance standards.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Programmable Guardrails with Colang',
        description: 'Writing input rails, dialogue flows, and output validation rules.',
        lessons: [
          { id: 'l1', title: 'Building Brand Protection and Topic Restriction Rails', durationMinutes: 45, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Automated Presidio PII Masking Pipeline', objective: 'Intercept incoming user prompts and redact SSNs, names, and credit cards before model processing.', skills: 'Presidio, PII Redaction, AI Safety', estimatedMinutes: 45 },
    ],
    faqs: [
      { q: 'Is coding experience required?', a: 'Basic Python is helpful, but Colang is designed as an accessible declarative scripting language.' },
    ],
  },
  {
    id: 'ai-6',
    slug: 'computer-vision-multimodal-threat-intel',
    title: 'Computer Vision & Multimodal Threat Intelligence',
    subtitle: 'Adversarial patch attacks on vision transformers (ViT), multimodal prompt injection, and synthetic deepfake detection pipelines.',
    description: 'Multimodal models accept images, audio, and video alongside text. Discover how adversarial optical illusions trick Vision Transformers, embed hidden prompt instructions within visual textures, and construct deepfake forensic watermarking pipelines.',
    track: 'ai',
    category: 'Multimodal AI',
    level: 'Advanced',
    durationHours: 65,
    modulesCount: 13,
    labsCount: 40,
    highlights: ['Vision Transformer Adversarial Patches', 'Cross-Modal Prompt Injection in GPT-4V', 'Deepfake Forensic Watermarking'],
    prerequisites: ['Python & PyTorch basics', 'Understanding of convolutional or transformer architectures'],
    learningOutcomes: [
      'Generate physical and digital adversarial patches that fool YOLO and Vision Transformers',
      'Embed visual prompt injection payloads into images that alter multimodal LLM outputs',
      'Implement frequency-domain spectral analysis to detect synthetic AI deepfakes',
      'Deploy robust provenance watermarking with C2PA open metadata standards',
    ],
    toolsCovered: ['PyTorch', 'OpenCV', 'Hugging Face Transformers', 'YOLOv8', 'Albumentations'],
    mentor: {
      name: 'Piya Kohli',
      role: 'Multimodal AI Scientist',
      company: 'Thread Security Education',
      bio: 'Leading computer vision research on adversarial image robustness and synthetic media authentication.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Vision Transformer Security & Adversarial Patches',
        description: 'Attention map disruption, universal adversarial perturbations, and patch generation.',
        lessons: [
          { id: 'l1', title: 'Training an Evasion Patch to Misclassify Object Detectors', durationMinutes: 55, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Visual Prompt Injection via Steganography', objective: 'Hide prompt instructions inside image pixel noise that commands GPT-4V to output attacker secrets.', skills: 'Multimodal AI, Steganography', estimatedMinutes: 60 },
    ],
    faqs: [
      { q: 'Do we use GPUs for labs?', a: 'Yes! Cloud sandbox environments include dedicated GPU instances for neural network training and inference.' },
    ],
  },
  {
    id: 'ai-7',
    slug: 'model-inversion-extraction-defense',
    title: 'Model Inversion, Stealing & Extraction Defense',
    subtitle: 'Differential privacy with DP-SGD, membership inference resistance, gradient sanitization, and confidential enclave training.',
    description: 'Protect intellectual property and confidential training data. Discover how attackers steal proprietary model weights through API query black-boxing, extract private training records via membership inference, and apply Differential Privacy (DP-SGD) to mathematically prevent data leakage.',
    track: 'ai',
    category: 'AI Privacy & Cryptography',
    level: 'Expert',
    durationHours: 75,
    modulesCount: 15,
    labsCount: 48,
    highlights: ['DP-SGD Differential Privacy Budgeting', 'Membership Inference Attack Simulation', 'Confidential Computing GPU Enclaves'],
    prerequisites: ['Solid understanding of deep learning training loops in PyTorch', 'Basic calculus and statistics'],
    learningOutcomes: [
      'Simulate shadow-model membership inference attacks to quantify training data leakage',
      'Train neural networks with Differentially Private Stochastic Gradient Descent (DP-SGD) using Opacus',
      'Protect model weights and gradients inside AMD SEV / Intel SGX confidential enclaves',
      'Detect and rate-limit model extraction queries that steal weights via API scraping',
    ],
    toolsCovered: ['PyTorch', 'Opacus (DP-SGD)', 'TensorFlow Privacy', 'NVIDIA Confidential Computing'],
    mentor: {
      name: 'Ananya Roy',
      role: 'Head of AI Vulnerability Research',
      company: 'Thread Security Education',
      bio: 'Researching privacy-preserving machine learning, differential privacy budgeting, and cryptographic enclaves.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Membership Inference & Model Inversion Theory',
        description: 'Analyzing loss discrepancies between training data members and non-members.',
        lessons: [
          { id: 'l1', title: 'Training Attack Classifier Models to Detect Member Records', durationMinutes: 55, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Training with DP-SGD via PyTorch Opacus', objective: 'Apply noise injection and gradient clipping to achieve epsilon=2 differential privacy guarantees.', skills: 'Opacus, Differential Privacy', estimatedMinutes: 65 },
    ],
    faqs: [
      { q: 'Is this mathematical or hands-on?', a: 'Both! You learn the epsilon-delta mathematical definitions and implement the code directly in PyTorch.' },
    ],
  },
  {
    id: 'ai-8',
    slug: 'edge-ai-quantization-hardware-tuning',
    title: 'High-Throughput Edge AI & Model Quantization',
    subtitle: '4-bit AWQ and GGUF quantization, TensorRT-LLM compilation, zero-latency inference scaling, and embedded edge deployments.',
    description: 'Deploy massive models on resource-constrained hardware with zero compromise on safety. Master 4-bit AWQ, GPTQ, and GGUF quantization, compile optimized TensorRT-LLM inference engines, and run models locally on embedded edge devices.',
    track: 'ai',
    category: 'Production AI Infrastructure',
    level: 'Expert',
    durationHours: 70,
    modulesCount: 14,
    labsCount: 44,
    highlights: ['AWQ & GGUF 4-Bit Precision Quantization', 'TensorRT-LLM Engine Optimization', 'vLLM Continuous Batching Architecture'],
    prerequisites: ['Python, Linux CLI, and basic understanding of GPU hardware architectures'],
    learningOutcomes: [
      'Quantize 70B parameter models down to 4-bit INT4 precision with minimal perplexity degradation',
      'Build and benchmark high-throughput inference servers with vLLM continuous batching',
      'Compile custom TensorRT-LLM engines for NVIDIA Jetson and desktop GPUs',
      'Audit quantized models for emerging safety alignment degradation flaws',
    ],
    toolsCovered: ['vLLM', 'TensorRT-LLM', 'AutoAWQ', 'llama.cpp', 'Ollama'],
    mentor: {
      name: 'Harpreet Kaur',
      role: 'Senior AI Engineer',
      company: 'Thread Security Education',
      bio: 'Optimizing high-concurrency LLM inference fleets and embedded edge deployments for real-time defense applications.',
    },
    modules: [
      {
        id: 'm1',
        title: 'Precision Formats & Quantization Mechanics',
        description: 'FP32, FP16, BF16, INT8, and INT4 arithmetic, outlier weights, and perplexity evaluations.',
        lessons: [
          { id: 'l1', title: 'Quantizing Llama 3 with AutoAWQ and Evaluating Accuracy', durationMinutes: 50, type: 'VIDEO' },
        ],
      },
    ],
    labs: [
      { id: 'lab1', title: 'Deploying High-Throughput vLLM Cluster with PagedAttention', objective: 'Benchmark tokens-per-second throughput under 100 concurrent user streams.', skills: 'vLLM, Inference Optimization', estimatedMinutes: 60 },
    ],
    faqs: [
      { q: 'Can I run these quantized models on a standard laptop?', a: 'Yes! The course teaches both cloud GPU clusters and local GGUF/Ollama deployments.' },
    ],
  },
];

export function getMasterCourseBySlug(slug: string): MasterCourseData | undefined {
  return MASTER_COURSES.find((c) => c.slug === slug);
}
