/**
 * Industrial Training Cities Data Module
 *
 * Strongly-typed data module defining unique, locally relevant data for
 * 45-Day Summer Training and 6-Month Industrial Training in Cybersecurity & AI.
 *
 * STRICT NON-DOORWAY & ACCURACY GUARDRAILS:
 * - Brand: Thread Security Education (TSE) | Parent Org: https://threadsecurity.org/
 * - Main Campus: 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001
 * - Credentials: DPIIT Recognized (DIPP169824), ISO 9001:2015 Certified, Verifiable TS-ID Credentials.
 * - Target Audience: B.Tech / BCA / MCA / BSc IT students seeking academic industrial training & internships.
 */

export interface CityFaq {
  question: string;
  answer: string;
}

export interface UniversityCompliance {
  synopsisApproval: string;
  weeklyLogbook: string;
  midTermReview: string;
  capstoneProject: string;
  vivaDefensePrep: string;
  tsIdCredential: string;
}

export interface IndustrialTrainingCity {
  slug: 'jalandhar' | 'phagwara' | 'ludhiana' | 'chandigarh' | 'dharamshala';
  cityName: string;
  state: string;
  regionLabel: string;
  primaryKeyword: string;
  metaTitle: string; // 50-60 characters, never truncated mid-word
  metaDescription: string; // 140-155 characters
  heroH1: string;
  heroSub: string;
  blufSummary: string; // 40-60 words factual BLUF GEO summary optimized for Google AI Overviews
  deliveryMode: string;
  deliveryTypeBadge: 'Flagship In-Person Campus' | 'Commute & Hybrid Labs' | 'Weekend & Hybrid Track' | 'Hybrid Mentorship Cohort' | '100% Live Interactive Online';
  courseMode: 'onsite' | 'blended' | 'online';
  campusAddress?: string;
  targetUniversitiesAndColleges: string[];
  commuteTransitDetails: string;
  universityComplianceBlock: UniversityCompliance;
  localFaqs: CityFaq[];
  relatedCourses: Array<{
    title: string;
    slug: string;
    badge: string;
  }>;
}

export interface ProgramComparisonTrack {
  id: '45-days' | '6-months';
  title: string;
  durationLabel: string;
  targetAudience: string;
  academicFit: string;
  dailyCommitment: string;
  primaryFocus: string;
  cyberTrackCurriculum: string[];
  aiTrackCurriculum: string[];
  labEnvironment: string;
  capstoneDeliverable: string;
  universityPaperwork: string[];
  placementSupport: string;
  credentialBadge: string;
}

export const PROGRAM_COMPARISON_TRACKS: ProgramComparisonTrack[] = [
  {
    id: '45-days',
    title: '45-Day Summer Training (Sprint)',
    durationLabel: '45 Days / 6 Weeks',
    targetAudience: '2nd & 3rd Year B.Tech (CSE, IT, ECE), BCA, BSc IT students',
    academicFit: 'Fulfills mandatory university summer internship & training credits post 4th or 6th semester',
    dailyCommitment: '2 to 3 Hours / Day (Live lab drills + instructor feedback)',
    primaryFocus: 'Foundational offensive security drills, network defense, or practical AI agent workflows',
    cyberTrackCurriculum: [
      'Linux Kernel Internals, Bash Scripting & Network Protocol Analysis (Wireshark)',
      'Web Application Vulnerability Assessment (OWASP Top 10, Burp Suite Pro basics)',
      'Network Penetration Testing, Port Scanning & Metasploit Framework Fundamentals',
      'SOC Analyst Baseline: Log Analysis, Wazuh Host Agent, and Incident Triage',
    ],
    aiTrackCurriculum: [
      'Python for AI & Security Automation (Requests, Scapy, NumPy, Pandas)',
      'Prompt Engineering, LLM System Architecture & API Integration (Gemini, OpenAI)',
      'Agentic AI Workflows: LangChain, Tool-Calling Agents & Retrieval Augmented Generation (RAG)',
      'AI Security Fundamentals: Prompt Injections, Jailbreaking & Output Sanitization',
    ],
    labEnvironment: '100% browser-based sandboxed cloud instances; zero host machine setup required',
    capstoneDeliverable: 'Working Proof-of-Concept (PoC) security audit report or automated AI workflow tool',
    universityPaperwork: [
      'Official Training Offer & Acceptance Letter on TSE letterhead',
      'Pre-approved Project Synopsis for university HOD submission',
      'Verified 45-Day Industrial Training Completion Certificate with cryptographic TS-ID',
    ],
    placementSupport: 'Resume review, GitHub portfolio structuring, and cybersecurity roadmap session',
    credentialBadge: 'TS-ID Verified 45-Day Credential',
  },
  {
    id: '6-months',
    title: '6-Month Industrial Training (Fellowship)',
    durationLabel: '6 Months / 24 Weeks (Full Semester)',
    targetAudience: 'Final Year B.Tech (7th/8th Sem), MCA, M.Tech, and career-transitioning graduates',
    academicFit: 'Fulfills mandatory full-semester degree internship / major project requirements',
    dailyCommitment: '4 to 6 Hours / Day (Enterprise project sprints, lab challenges & code reviews)',
    primaryFocus: 'Advanced enterprise VAPT, Red Teaming, SIEM/SOC engineering, or Production AI Guardrails',
    cyberTrackCurriculum: [
      'Full-Scope Web & API Penetration Testing (GraphQL, REST, OAuth, JWT exploitation)',
      'Active Directory Attacks, Kerberoasting, Lateral Movement & Privilege Escalation',
      'Enterprise SOC Operations: Splunk SIEM Ingestion, Wazuh EDR, Threat Hunting & DFIR',
      'Cloud Security & DevSecOps: AWS/GCP IAM misconfigurations, container escape, CI/CD pipeline auditing',
      'Bug Bounty Methodologies, Exploit Development & Executive Remediation Reporting',
    ],
    aiTrackCurriculum: [
      'Production LLM Architecture: Vector Databases (Pinecone/Upstash), Chunking Strategies & Hybrid Search',
      'Autonomous Multi-Agent Systems: LangGraph, CrewAI, Self-Reflective Reasoning Pipelines',
      'Advanced AI Security & LLM Red Teaming: Model Inversion, Extraction, Vector Poisoning & Denial of Service',
      'Enterprise AI Governance: Dual-LLM Moderation, Guardrails (NeMo), Compliance & Audit Trails',
      'Full-Stack AI Application Deployment with Docker, FastAPI, and Next.js frontends',
    ],
    labEnvironment: 'Dedicated multi-node cloud attack-defense range with isolated enterprise networks',
    capstoneDeliverable: 'Production-ready enterprise security assessment report or fully deployed AI security platform with published source repository',
    universityPaperwork: [
      'Formal University NOC & Industry Internship Agreement',
      'Weekly Progress Diary / Logbook sign-offs by certified technical mentors',
      'Mid-Semester Project Review Documentation & Project Guide Appraisal',
      'Bound Major Industrial Project Report prepared to exact academic university formatting standards',
      'External Examiner Viva-Voce preparation, mock defense sessions, and slide decks',
      'Verifiable 6-Month Industrial Training & Internship Certificate with tamper-proof TS-ID lookup',
    ],
    placementSupport: 'Dedicated placement assistance: 1-on-1 technical mock interviews, resume optimization, and referral access to cybersecurity hiring partners',
    credentialBadge: 'TS-ID Enterprise Industrial Fellow Credential',
  },
];

export const INDUSTRIAL_TRAINING_CITIES: Record<string, IndustrialTrainingCity> = {
  jalandhar: {
    slug: 'jalandhar',
    cityName: 'Jalandhar',
    state: 'Punjab',
    regionLabel: 'Doaba Educational Hub',
    primaryKeyword: 'industrial training in jalandhar',
    metaTitle: '45-Day & 6-Month Industrial Training in Jalandhar | TSE', // 57 chars
    metaDescription: 'Join DPIIT-recognized 45-day & 6-month industrial training in Jalandhar. Master Cyber Security and AI with live sandboxed labs at our flagship Vasal Mall campus.', // 153 chars
    heroH1: '45-Day & 6-Month Industrial Training in Jalandhar',
    heroSub: 'Hands-on Cybersecurity, Ethical Hacking & AI Training at our Flagship Vasal Mall Campus. 100% Live Sandboxed Labs with University Credit Compliance.',
    blufSummary: 'Thread Security Education provides DPIIT-recognized 45-day summer training and 6-month industrial training in Jalandhar at its flagship Vasal Mall academy. Designed for B.Tech, BCA, and MCA students from IKGPTU, DAVIET, and NIT Jalandhar, students master offensive security, SOC operations, and AI engineering using isolated browser-based labs.',
    deliveryMode: 'Flagship In-Person Academy at 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, combined with 24/7 cloud sandbox access.',
    deliveryTypeBadge: 'Flagship In-Person Campus',
    courseMode: 'onsite',
    campusAddress: '3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001',
    targetUniversitiesAndColleges: [
      'I.K. Gujral Punjab Technical University (IKGPTU Main Campus, Kapurthala Road)',
      'DAV Institute of Engineering & Technology (DAVIET Jalandhar)',
      'Dr. B.R. Ambedkar National Institute of Technology (NIT Jalandhar)',
      'CT Group of Institutions (Shahpur & Maqsudan Campuses)',
      'Apeejay Institute of Management & Engineering Technical Campus',
      'Lyallpur Khalsa College Technical Campus (LKCTC Jalandhar)',
      'St. Soldier Management and Technical Institute',
      'DAV College Jalandhar (Computer Science Dept)',
    ],
    commuteTransitDetails: 'Centrally situated on Police Line Road within Vasal Mall, the facility is within 3.2 km of Jalandhar City Railway Station and 5.5 km of Jalandhar Cantt Station. Local students commute easily via direct e-rickshaws, autos, and City Bus lines stopping right in front of Hotel President.',
    universityComplianceBlock: {
      synopsisApproval: 'Immediate issuance of pre-formatted synopsis for IKGPTU, DAVIET, and local college academic review within 48 hours of joining.',
      weeklyLogbook: 'Structured weekly progress logbook sign-offs by certified security researchers verifying lab hours and code commits.',
      midTermReview: 'Structured mid-term evaluation document aligned with academic internal assessment deadlines.',
      capstoneProject: 'Individual capstone implementation (vulnerability assessment or production AI tool) with verifiable code on GitHub.',
      vivaDefensePrep: 'One-on-one viva voce coaching by senior penetration testers to prepare students for external university examiners.',
      tsIdCredential: 'Tamper-proof TS-ID credential verifiable 24/7 by colleges, HR teams, and verification portals via threadsecurity.in/verify-certificate.',
    },
    localFaqs: [
      {
        question: 'Where is the physical training academy located in Jalandhar?',
        answer: 'Our flagship academy is located on the 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001. Students have daily access to high-speed workstations, dedicated mentor cabins, and enterprise attack-defense ranges.',
      },
      {
        question: 'Is this training recognized by IKGPTU, DAVIET, and Punjab technical colleges?',
        answer: 'Yes. Thread Security Education is DPIIT-recognized (DIPP169824) by the Government of India and ISO 9001:2015 certified. All offer letters, training completion certificates, and project reports strictly adhere to IKGPTU and affiliated university credit standards.',
      },
      {
        question: 'Can I choose between Cybersecurity and AI tracks for my 6-month industrial training?',
        answer: 'Yes. Students can specialize in Full-Stack Cybersecurity (Offensive VAPT, Network Pen-Testing, SOC SIEM) or Applied Artificial Intelligence & Security (Agentic AI, LLM Red Teaming, RAG pipelines), or pursue an integrated dual track.',
      },
      {
        question: 'What are the daily class timings and lab accessibility options?',
        answer: 'In-person batches run morning and afternoon sessions (2 to 4 hours per day of live mentor drills). In addition, every student receives 24/7 access to cloud sandboxed lab instances to practice exploit workflows and AI models from home.',
      },
      {
        question: 'How does TSE support university final project submissions and vivas in Jalandhar?',
        answer: 'We provide end-to-end documentation support: formal synopsis, weekly signed logbooks, IEEE/university-standard spiral-bound project reports, and mock viva-voce defense sessions led by working security professionals.',
      },
    ],
    relatedCourses: [
      { title: 'Cybersecurity Course in Jalandhar', slug: 'cybersecurity-course-in-jalandhar', badge: 'Flagship Track' },
      { title: 'Ethical Hacking Course in Jalandhar', slug: 'ethical-hacking-course-in-jalandhar', badge: 'Offensive VAPT' },
      { title: 'SOC Analyst Course in Jalandhar', slug: 'soc-analyst-course-in-jalandhar', badge: 'Blue Team / SIEM' },
      { title: 'AI Course in Jalandhar', slug: 'ai-course-in-jalandhar', badge: 'Agentic AI & LLMs' },
    ],
  },

  phagwara: {
    slug: 'phagwara',
    cityName: 'Phagwara',
    state: 'Punjab',
    regionLabel: 'Doaba Technology Corridor',
    primaryKeyword: 'industrial training in phagwara',
    metaTitle: 'Industrial Training in Phagwara | 45-Day & 6-Month Labs', // 54 chars
    metaDescription: 'Premier 45-day and 6-month industrial training in Cybersecurity and AI for Phagwara students. Commute-friendly hybrid batches tailored for LPU & GNA.', // 149 chars
    heroH1: '45-Day & 6-Month Industrial Training in Phagwara',
    heroSub: 'Accredited Cyber Security, VAPT & AI Industrial Training for Phagwara Engineering Students. Hybrid Schedules Tailored for LPU & GNA University.',
    blufSummary: 'Thread Security Education delivers 45-day summer training and 6-month industrial training for engineering students in Phagwara. Located just 20 km from Phagwara via NH-44, students combine direct in-person lab sessions at our flagship Vasal Mall academy with 24/7 cloud sandbox access fitted around LPU and GNA University academic timetables.',
    deliveryMode: 'Commute-Friendly Hybrid: Direct transit to Jalandhar Flagship Campus (~20–25 km via NH-44) plus 24/7 remote browser cloud lab instances.',
    deliveryTypeBadge: 'Commute & Hybrid Labs',
    courseMode: 'blended',
    campusAddress: '3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar (20 min commute from Phagwara via NH-44)',
    targetUniversitiesAndColleges: [
      'Lovely Professional University (LPU Phagwara, Jalandhar-Delhi G.T. Road)',
      'GNA University (Sri Hargobindgarh, Phagwara)',
      'Ramgarhia Institute of Engineering & Technology (RIET Phagwara)',
      'MLU DAV College Phagwara',
      'Kamla Nehru College for Women (Computer Science Dept, Phagwara)',
    ],
    commuteTransitDetails: 'Phagwara students enjoy a fast 20 to 25-minute direct commute via NH-44 Grand Trunk Road. Direct express and local buses operate every 5 to 10 minutes between Phagwara Bus Stand and Jalandhar, while local passenger trains connect Phagwara Junction directly to Jalandhar City in under 20 minutes.',
    universityComplianceBlock: {
      synopsisApproval: 'Formatted project synopsis tailored specifically for LPU and GNA University portal submissions within 48 hours.',
      weeklyLogbook: 'Digital and printed weekly mentor sign-offs aligned with university midterm evaluation schedules.',
      midTermReview: 'Structured project milestone evaluations with performance feedback letters for faculty coordinators.',
      capstoneProject: 'Enterprise-grade capstone deployment (e.g., active vulnerability scanner or defensive AI agent) with verifiable repository.',
      vivaDefensePrep: 'Technical interview practice and mock defense targeting university internal and external faculty panels.',
      tsIdCredential: 'Cryptographically verifiable TS-ID industrial training certificate validating all completed practical lab hours.',
    },
    localFaqs: [
      {
        question: 'How do students from LPU and GNA University commute for in-person training?',
        answer: 'Our flagship academy at Vasal Mall Jalandhar is located just 20 to 25 km from Phagwara along the NH-44 Grand Trunk Road. Many LPU and GNA students carpool or take frequent 20-minute local buses or trains, while utilizing our 24/7 cloud labs on heavy lecture days.',
      },
      {
        question: 'Are class schedules flexible enough to fit around LPU/GNA university hours?',
        answer: 'Yes. We run specialized morning, evening, and weekend batches for Phagwara students. In addition, our hybrid model ensures you can complete live lab assignments remotely through your web browser without missing university classes.',
      },
      {
        question: 'Does the training fulfill LPU mandatory summer training (45 days) credit requirements?',
        answer: 'Absolutely. We provide the mandatory training offer letter, industry guide credentials, weekly progress logs, and university-formatted project documentation that fulfill LPU, GNA, and IKGPTU credit transfer standards.',
      },
      {
        question: 'What hardware or laptop do I need to attend the training from Phagwara?',
        answer: 'Any standard laptop (Windows, macOS, or Linux) with an internet connection is sufficient. All cybersecurity ranges, Linux target environments, and GPU workloads run in our 100% browser-based cloud sandboxes, eliminating host performance limits.',
      },
      {
        question: 'What credentials will I receive upon completing my industrial training?',
        answer: 'You will receive a DPIIT-recognized Government of India accredited Training & Internship Completion Certificate bearing your unique TS-ID, verifiable by employers and university registrars worldwide.',
      },
    ],
    relatedCourses: [
      { title: 'Cybersecurity Course in Jalandhar', slug: 'cybersecurity-course-in-jalandhar', badge: 'Commute Accessible' },
      { title: 'Ethical Hacking Course in Jalandhar', slug: 'ethical-hacking-course-in-jalandhar', badge: 'VAPT Specialization' },
      { title: 'AI Course in Jalandhar', slug: 'ai-course-in-jalandhar', badge: 'AI & Machine Learning' },
      { title: 'Bug Bounty Course in Jalandhar', slug: 'bug-bounty-course-in-jalandhar', badge: 'Live Hunting' },
    ],
  },

  ludhiana: {
    slug: 'ludhiana',
    cityName: 'Ludhiana',
    state: 'Punjab',
    regionLabel: 'Malwa Industrial Hub',
    primaryKeyword: 'industrial training in ludhiana',
    metaTitle: 'Industrial Training in Ludhiana | Cyber Security & AI', // 53 chars
    metaDescription: 'Top-rated 45-day summer training and 6-month industrial training for Ludhiana engineering students. Weekend in-person lab drills + 24/7 cloud sandbox.', // 151 chars
    heroH1: '45-Day & 6-Month Industrial Training in Ludhiana',
    heroSub: 'Industry-Grade Cybersecurity & AI Industrial Training for GNDEC, PCTE & Ludhiana Engineering Students. Weekend Drills & 24/7 Cloud Labs.',
    blufSummary: 'Thread Security Education offers 45-day summer training and 6-month industrial training for Ludhiana engineering students. Combining flexible weekday cloud sandbox labs with high-impact weekend drills at our nearby Jalandhar campus (55 km via NH-44), students from GNDEC, PCTE, and CT University master offensive security and modern AI without relocating.',
    deliveryMode: 'Weekend Intensive In-Person Drills at Jalandhar Campus combined with weekday hybrid sessions and 24/7 remote browser cloud sandboxes.',
    deliveryTypeBadge: 'Weekend & Hybrid Track',
    courseMode: 'blended',
    campusAddress: 'Flagship Campus: 3rd Floor, Vasal Mall, Police Line, Jalandhar (~50 min via NH-44 express from Ludhiana)',
    targetUniversitiesAndColleges: [
      'Guru Nanak Dev Engineering College (GNDEC Ludhiana, Gill Road)',
      'Punjab Agricultural University (College of Agricultural Engineering & Tech, Ludhiana)',
      'PCTE Group of Institutes (Baddowal, Ludhiana)',
      'CT University (Ferozepur Road, Ludhiana)',
      'Gulzar Group of Institutes (GGI Khanna / Ludhiana)',
      'Ludhiana College of Engineering & Technology (LCET Katani Kalan)',
      'Aryabhatta Group of Institutes',
      'Govt. College for Girls (Ludhiana BCA/IT)',
    ],
    commuteTransitDetails: 'Ludhiana engineering students connect seamlessly to Jalandhar via the 6-lane NH-44 expressway (approx. 55 to 60 km / 50 minutes via express bus or carpool). Hourly superfast trains (Shatabdi, Vande Bharat, Intercity) run between Ludhiana Junction and Jalandhar City in under 45 minutes.',
    universityComplianceBlock: {
      synopsisApproval: 'Rapid synopsis turnaround conforming to GNDEC and PTU autonomous college project guidelines.',
      weeklyLogbook: 'Digital attendance logs and verified code contributions for weekly university department reviews.',
      midTermReview: 'Formal mid-term project milestone verification documentation with industry mentor ratings.',
      capstoneProject: 'Live capstone deliverable (enterprise vulnerability assessment or production AI guardrail tool) hosted online.',
      vivaDefensePrep: 'Rigorous external examiner viva-voce coaching including presentation slides, architectural schematics, and Q&A prep.',
      tsIdCredential: 'ISO 9001:2015 and DPIIT-recognized certificate with permanent TS-ID verification for campus placement drives.',
    },
    localFaqs: [
      {
        question: 'How do Ludhiana engineering students attend training without daily relocation?',
        answer: 'We operate a specialized Weekend & Hybrid track: students conduct hands-on attack-defense drills during weekend in-person sessions at our Vasal Mall campus, while completing weekday live lectures and lab assignments via our 24/7 browser cloud sandbox from Ludhiana.',
      },
      {
        question: 'Is this training program accepted by GNDEC Ludhiana for 6-month industrial credits?',
        answer: 'Yes. Our 6-month fellowship includes official industry offer letters, university NOC agreements, weekly technical diary sign-offs, and complete project documentation that fully meet GNDEC, PTU, and autonomous college requirements.',
      },
      {
        question: 'What cybersecurity tracks are most in-demand for Ludhiana engineering students?',
        answer: 'Ludhiana students predominantly pursue Offensive VAPT & Ethical Hacking (focusing on cloud and corporate networks) or SOC Analyst & Threat Detection (focusing on Splunk, SIEM, and incident handling for enterprise IT infrastructure).',
      },
      {
        question: 'Can I do my 45-day summer training completely online from Ludhiana?',
        answer: 'Yes. Students from Ludhiana who prefer not to commute can enroll in our 100% interactive live online cohort, which includes live daily mentor instruction and identical 24/7 browser-based cloud labs.',
      },
      {
        question: 'How does Thread Security Education assist with campus placements in Ludhiana and North India?',
        answer: 'Students receive 1-on-1 technical mock interviews, resume refactoring tailored for cybersecurity roles, and direct profile sharing with our network of hiring partners across Mohali, Gurgaon, Noida, and Bangalore.',
      },
    ],
    relatedCourses: [
      { title: 'Cybersecurity Course in Jalandhar', slug: 'cybersecurity-course-in-jalandhar', badge: 'Weekend Cohort' },
      { title: 'Penetration Testing Course in Jalandhar', slug: 'penetration-testing-course-in-jalandhar', badge: 'Network VAPT' },
      { title: 'SOC Analyst Course in Jalandhar', slug: 'soc-analyst-course-in-jalandhar', badge: 'SIEM & SOC' },
      { title: 'AI Security Course in Jalandhar', slug: 'ai-security-course-in-jalandhar', badge: 'AI Red Teaming' },
    ],
  },

  chandigarh: {
    slug: 'chandigarh',
    cityName: 'Chandigarh',
    state: 'Chandigarh (Tricity / Mohali & Panchkula)',
    regionLabel: 'Tricity IT & Engineering Hub',
    primaryKeyword: 'industrial training in chandigarh',
    metaTitle: 'Industrial Training in Chandigarh | 45 Days & 6 Months', // 54 chars
    metaDescription: 'Advanced 45-day and 6-month Cybersecurity and AI industrial training for Chandigarh, Mohali & Panchkula students. Hybrid mentorship + live sandbox.', // 149 chars
    heroH1: '45-Day & 6-Month Industrial Training in Chandigarh (Tricity)',
    heroSub: 'Next-Gen Cybersecurity, Ethical Hacking & Agentic AI Training for Panjab University, CCET & Mohali Engineering Students. Hybrid Mentorship & Sandboxed Range.',
    blufSummary: 'Thread Security Education delivers premium 45-day summer training and 6-month industrial training for Tricity (Chandigarh, Mohali, and Panchkula) engineering students. Featuring live mentor-led cohorts, 24/7 cloud sandbox environments, and capstone project defense, students from Panjab University, CCET, and CGC Landran gain high-demand practical security and AI credentials.',
    deliveryMode: 'Hybrid Live Mentor-Led Cohorts + 24/7 browser cloud sandboxes with optional in-person defense workshops at our regional flagship facility.',
    deliveryTypeBadge: 'Hybrid Mentorship Cohort',
    courseMode: 'blended',
    targetUniversitiesAndColleges: [
      'Panjab University (UIET & UICET Sector 25, Chandigarh)',
      'Chandigarh College of Engineering & Technology (CCET Sector 26, Chandigarh)',
      'PEC University of Technology (Punjab Engineering College, Chandigarh)',
      'Chandigarh University (CU Gharuan, Mohali)',
      'Chandigarh Group of Colleges (CGC Landran & CGC Jhanjeri)',
      'Swami Vivekanand Institute of Engineering & Technology (SVIET Banur / Mohali)',
      'Rayat Bahra University (Sahauran, Mohali)',
      'Chitkara University (Rajpura / Punjab Campus near Chandigarh)',
    ],
    commuteTransitDetails: 'Designed specifically for students across Chandigarh, Mohali (IT City / Sector 67-82), and Panchkula. High-speed interactive live sessions eliminate daily travel while students have direct highway (NH-5 to NH-44) and train access for scheduled in-person capstone reviews and defense workshops.',
    universityComplianceBlock: {
      synopsisApproval: 'University-aligned project synopsis formatted for Panjab University, autonomous colleges, and private universities within 48 hours.',
      weeklyLogbook: 'Digital progress diary with cryptographically logged lab hours, code commits, and mentor reviews.',
      midTermReview: 'Structured project milestone reports and mentor appraisal letters for university semester evaluations.',
      capstoneProject: 'Enterprise security proof-of-concept or LLM red-teaming tool deployed live on a public repository.',
      vivaDefensePrep: 'Targeted preparation for external examiner viva-voce, including system architecture schematics and Q&A defense coaching.',
      tsIdCredential: 'Government-recognized DPIIT credential with permanent digital TS-ID verification for international and MNC background checks.',
    },
    localFaqs: [
      {
        question: 'How is this training conducted for students in Chandigarh, Mohali, and Panchkula?',
        answer: 'Our Tricity cohort operates on a state-of-the-art hybrid model: interactive daily live mentor sessions and 24/7 access to cloud sandboxed attack-defense ranges, supplemented by optional weekend capstone workshops at our flagship regional center.',
      },
      {
        question: 'Does the training meet Panjab University (UIET/CCET) and CGC Landran 6-month internship criteria?',
        answer: 'Yes. Thread Security Education fulfills all university criteria, including company registration credentials, corporate mentor allocation, signed weekly logs, formal project evaluation documentation, and final completion certificates.',
      },
      {
        question: 'What practical skills will I gain compared to traditional software training institutes in Chandigarh?',
        answer: 'Unlike generic centers teaching theoretical slides or outdated syntax, TSE focuses 100% on live offensive-defensive drills: exploiting real CVEs, configuring Splunk/Wazuh SIEM pipelines, and red-teaming production AI models in safe browser containers.',
      },
      {
        question: 'What capstone projects do 6-month industrial trainees build in the AI & Cyber tracks?',
        answer: 'Students build enterprise deliverables: for example, automated vulnerability scanners, Active Directory lateral movement detection rules, autonomous dual-LLM guardrail systems, or RAG security testing frameworks.',
      },
      {
        question: 'What job placement support is provided for Chandigarh / Mohali IT sector roles?',
        answer: 'We provide dedicated placement guidance including resume transformation, technical mock interviews, and profile referrals to cybersecurity consultancies, product startups, and SOC providers in Mohali IT Park and the wider NCR region.',
      },
    ],
    relatedCourses: [
      { title: 'Cybersecurity Professional Course in Jalandhar', slug: 'cybersecurity-professional-course-in-jalandhar', badge: 'Tricity Track' },
      { title: 'Enterprise Red Teaming Course in Jalandhar', slug: 'enterprise-red-teaming-course-in-jalandhar', badge: 'Offensive Security' },
      { title: 'SOC Operations Course in Jalandhar', slug: 'soc-operations-course-in-jalandhar', badge: 'Enterprise Defense' },
      { title: 'AI Security & LLM Red Teaming Course in Jalandhar', slug: 'ai-security-llm-red-teaming-course-in-jalandhar', badge: 'GenAI Security' },
    ],
  },

  dharamshala: {
    slug: 'dharamshala',
    cityName: 'Dharamshala',
    state: 'Himachal Pradesh',
    regionLabel: 'Kangra Valley Higher Education Belt',
    primaryKeyword: 'industrial training in dharamshala',
    metaTitle: 'Industrial Training in Dharamshala | Cyber Security & AI', // 56 chars
    metaDescription: 'Accredited 45-day and 6-month online industrial training for Himachal students. 100% sandboxed cloud labs, live mentor classes, and project reports.', // 151 chars
    heroH1: '45-Day & 6-Month Industrial Training in Dharamshala',
    heroSub: 'DPIIT-Recognized Cybersecurity, Ethical Hacking & AI Training for Himachal Pradesh Engineering Students. 100% Cloud Sandboxed Labs & University Project Reports.',
    blufSummary: 'Thread Security Education provides DPIIT-recognized 45-day summer training and 6-month industrial training tailored for Dharamshala and Himachal Pradesh college students. Delivered via 100% live interactive online classes and browser-based sandboxes, students from RGGEC Kangra and Govt College Dharamshala master hands-on cybersecurity and AI without relocating to distant metros.',
    deliveryMode: '100% Live Interactive Online Instruction + 24/7 Isolated Cloud Sandbox Labs tailored for Himachal Pradesh colleges, with digital TS-ID credentialing.',
    deliveryTypeBadge: '100% Live Interactive Online',
    courseMode: 'online',
    targetUniversitiesAndColleges: [
      'Govt. Post Graduate College Dharamshala (Kangra, HP)',
      'Rajiv Gandhi Government Engineering College (RGGEC Kangra / Nagrota Bagwan)',
      'Himachal Pradesh University (HPU Shimla - UIIT & Computer Science Dept)',
      'Himachal Pradesh Technical University (HPTU Hamirpur)',
      'Central University of Himachal Pradesh (CUHP Dharamshala & Shahpur Campuses)',
      'Govt. Engineering College Sundernagar (Mandi)',
      'Dronacharya Post Graduate College of Education (Rait, Kangra)',
      'Govt. Degree College Kangra',
    ],
    commuteTransitDetails: 'Eliminates the heavy financial and logistical burden of relocating to Delhi, Chandigarh, or plains metros for mandatory industrial training. Students from Dharamshala, Kangra, Palampur, and across Himachal Pradesh access enterprise lab compute through any web browser from their home or campus hostel.',
    universityComplianceBlock: {
      synopsisApproval: 'Prompt issuance of university project synopsis aligned with HPU, HPTU, and Himachal college format guidelines.',
      weeklyLogbook: 'Digital progress diary logs verifying practical lab hours and exercises, signed by certified security trainers.',
      midTermReview: 'Structured interim evaluation reports and guide appraisals for mid-semester university checks.',
      capstoneProject: 'Practical capstone project deliverable with live deployment and hosted GitHub code repository.',
      vivaDefensePrep: 'Online 1-on-1 viva coaching and mock examination sessions to ensure students score top grades in external college evaluations.',
      tsIdCredential: 'Tamper-evident TS-ID digital credential verifiable worldwide by university faculties and background verification teams.',
    },
    localFaqs: [
      {
        question: 'Can students in Dharamshala complete 45-day summer training or 6-month industrial training online?',
        answer: 'Yes! Our Dharamshala track is 100% online and interactive. You join live instructor-led video classes and perform hands-on exploit and defense drills inside our browser-based cloud sandboxes without needing any travel or local software installation.',
      },
      {
        question: 'Is this training recognized by HPTU Hamirpur, HPU Shimla, and RGGEC Kangra?',
        answer: 'Yes. Thread Security Education is DPIIT-recognized (DIPP169824) by the Government of India and ISO 9001:2015 certified. Our training offer letters, progress reports, and final certificates are accepted across all Himachal colleges and universities.',
      },
      {
        question: 'What are the internet and laptop requirements for attending from Himachal Pradesh?',
        answer: 'You only require a standard laptop or desktop with basic broadband or 4G/5G mobile hotspot connectivity. Because all heavy tools (Kali Linux, Docker, Splunk, Python AI models) execute on our cloud infrastructure, your local computer stays fast and malware-free.',
      },
      {
        question: 'How do students get their physical certificates and project reports signed?',
        answer: 'We provide digitally signed, tamper-evident PDF certificates with QR-code TS-ID verification. When physical spiral-bound major project reports are required for college submission, we provide pre-formatted, examiner-ready documents for your department.',
      },
      {
        question: 'Are placement opportunities available for students residing in Himachal Pradesh?',
        answer: 'Yes. We prepare students for both remote cybersecurity analyst roles and in-office positions across Chandigarh, Mohali, Gurgaon, and Bangalore, providing complete resume review, technical mock interviews, and referral support.',
      },
    ],
    relatedCourses: [
      { title: 'Cybersecurity Professional Fellowship Course in Jalandhar', slug: 'cybersecurity-professional-fellowship-course-in-jalandhar', badge: 'Remote Friendly' },
      { title: 'Defensive Cybersecurity Course in Jalandhar', slug: 'defensive-cybersecurity-course-in-jalandhar', badge: 'Blue Team' },
      { title: 'Python for AI Course in Jalandhar', slug: 'python-for-ai-course-in-jalandhar', badge: 'AI Scripting' },
      { title: 'Responsible AI Engineering Course in Jalandhar', slug: 'responsible-ai-engineering-course-in-jalandhar', badge: 'AI Governance' },
    ],
  },
};

export const CITIES_LIST: Array<{ slug: string; name: string; state: string; badge: string }> = [
  { slug: 'jalandhar', name: 'Jalandhar', state: 'Punjab', badge: 'Flagship Campus' },
  { slug: 'phagwara', name: 'Phagwara', state: 'Punjab', badge: 'Direct Commute (20 min)' },
  { slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', badge: 'Weekend & Hybrid' },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Tricity', badge: 'Hybrid Live Cohort' },
  { slug: 'dharamshala', name: 'Dharamshala', state: 'Himachal Pradesh', badge: '100% Live Online' },
];
