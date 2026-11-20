/**
 * Thread Security Education (TSE) — About Us & Trust Engine Data
 *
 * Content Integrity Guardrails:
 * - Brand: Thread Security Education | Parent Org: https://threadsecurity.org/
 * - Main Campus: 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001
 * - Government & Standard Credentials: DPIIT Recognized (DIPP169824), ISO 9001:2015 Certified
 * - Strict Anti-Hallucination: Zero invented placement packages, salaries, fake student testimonials,
 *   or unauthorized partnerships. Verified factual data only.
 */

export interface VerificationItem {
  id: string;
  title: string;
  claim: string;
  description: string;
  sourceType: 'INDEPENDENT_GOVERNMENT_REGISTRY' | 'ISO_ACCREDITATION' | 'INSTITUTIONAL_DOCUMENTATION' | 'PLATFORM_SYSTEM';
  sourceLabel: string;
  isIndependent: boolean;
  destinationUrl?: string;
  documentRef?: string;
  statusText: string;
  statusBadge: 'VERIFIED' | 'OFFICIAL' | 'ACTIVE';
}

export interface VerificationCategory {
  id: string;
  name: string;
  description: string;
  items: VerificationItem[];
}

export interface TransparencyTopic {
  id: string;
  topic: string;
  whatToCheck: string;
  destinationLabel: string;
  destinationHref: string;
  note?: string;
}

export interface ChecklistItem {
  id: string;
  number: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface BrandPrinciple {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'ABOUT' | 'PROGRAMS' | 'VERIFICATION' | 'POLICIES';
}

export const GROUND_TRUTH = {
  brandName: 'Thread Security Education',
  brandShort: 'TSE',
  parentOrgUrl: 'https://threadsecurity.org',
  canonicalUrl: 'https://threadsecurity.in/about',
  contactPhone: '+91 7347398956',
  contactPhoneHref: 'tel:+917347398956',
  contactEmail: 'edu@threadsecurity.in',
  campusAddress: '3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001',
  dpiitId: 'DIPP169824',
  isoStandard: 'ISO 9001:2015',
  tsidAuthority: 'Thread Security Verifiable ID (TS-ID)',
};

export const WHO_WE_ARE_PILLARS = [
  {
    number: '01',
    title: 'Understand',
    tagline: 'Grasp the core mechanics of security',
    description:
      'Develop a principled foundation in cybersecurity architectures, threat modeling, protocol internals, and defensive foundations rather than reciting buzzwords or surface-level definitions.',
  },
  {
    number: '02',
    title: 'Practise',
    tagline: 'Translate theory into technical capability',
    description:
      'Engage with browser-isolated cloud attack ranges, defensive log audits, vulnerability reproduction drills, and secure engineering challenges designed to build real troubleshooting confidence.',
  },
  {
    number: '03',
    title: 'Evolve',
    tagline: 'Sustain continuous security curiosity',
    description:
      'Cultivate an ethical, law-abiding security mindset with rigorous engineering discipline. Grow your technical scope as emerging paradigms—such as AI security and cloud isolation—shape modern industry standards.',
  },
];

export const BRAND_STORY_STEPS = [
  {
    phase: 'The Challenge',
    title: 'Cybersecurity Education Felt Disconnected & Impenetrable',
    content:
      'As modern digital infrastructure exploded, learning security remained fractured. Beginners encountered either generic multiple-choice video courses with zero hands-on labs, or aggressive sales pitches promising overnight riches without building foundational computing knowledge.',
  },
  {
    phase: 'The Purpose',
    title: 'Bridging the Chasm Between Theory & Real-World Application',
    content:
      'Thread Security was created to demystify technical security through honest, practical education. We built a learning environment where college students, engineering graduates, and aspiring analysts could explore systems methodically, inspect real vulnerabilities, and practice in safe sandboxes.',
  },
  {
    phase: 'The Philosophy',
    title: 'Security Is Understood Through Practice, Not Memorization',
    content:
      'We believe you cannot defend what you do not understand. Our learning methodology puts conceptual foundations first, followed immediately by controlled sandbox execution, source analysis, and mentored code review.',
  },
  {
    phase: 'The Direction',
    title: 'A Culture of Technical Transparency & Responsible Engineering',
    content:
      'We are expanding specialized curriculum tracks in offensive assessment, blue-team defense, DevSecOps, and AI application security. Our focus remains steadfast: producing security-conscious practitioners grounded in law, ethics, and engineering rigor.',
  },
];

export const MISSION_AND_VISION = {
  mission: {
    heading: 'Our Mission',
    statement:
      'To make cybersecurity education more practical, approachable, and meaningful by helping learners build strong foundations, explore real-world security concepts, and develop responsible technical skills.',
    subtext:
      'We replace passive video consumption with interactive terminal sandboxes, transparent curricula, and structured engineering mentorship.',
  },
  vision: {
    heading: 'Our Vision',
    statement:
      'To contribute to a digitally safer future by developing a community of knowledgeable, curious, and responsible individuals who understand the importance of security in technology.',
    subtext:
      'A digital ecosystem where every engineer, analyst, and organization approaches technology with proactive defensive awareness.',
  },
  principles: [
    { title: 'Practical knowledge', versus: 'memorization' },
    { title: 'Responsible security', versus: 'misuse or exploits' },
    { title: 'Curiosity & investigation', versus: 'untested assumptions' },
    { title: 'Continuous learning', versus: 'shortcuts or silver bullets' },
    { title: 'Transparency', versus: 'exaggerated marketing promises' },
  ],
};

export const VALUE_PROPOSITIONS = [
  {
    id: 'structured-learning',
    title: 'Structured Learning Pathways',
    description:
      'Carefully scaffolded curricula that take you from computer networking and Linux internals to advanced application security, red teaming, and SOC operations without skipping fundamentals.',
    features: ['Modular lesson breakdown', 'Hands-on prerequisites mapped', 'Progressive difficulty scaling'],
  },
  {
    id: 'practical-exploration',
    title: 'Practical Hands-on Exploration',
    description:
      'Every major conceptual unit is anchored by browser-based terminal exercises, packet captures, and isolated target applications running in containerized lab sandboxes.',
    features: ['100% cloud-based sandboxes', 'Zero host setup friction', 'Real-world attack/defense targets'],
  },
  {
    id: 'mentorship-guidance',
    title: 'Mentorship & Human Guidance',
    description:
      'Experienced cybersecurity faculty and practitioners lead daily instruction, review capstone assignments, and facilitate live question-and-answer sessions.',
    features: ['Daily scheduled lab hours', 'Direct mentor doubt resolution', 'Personalized project reviews'],
  },
  {
    id: 'learning-management',
    title: 'Dedicated Learning Management (LMS)',
    description:
      'A unified web platform tracking your daily lecture recordings, laboratory worksheets, automated attendance ledger, and submission status in real-time.',
    features: ['Attendance & credit ledger', 'Module progression tracker', 'Centralized learning materials'],
  },
  {
    id: 'assessment-development',
    title: 'Assessment & Skill Evaluation',
    description:
      'Regular practical challenge evaluations, lab benchmarks, and capstone project defenses provide honest visibility into your strengths and areas needing improvement.',
    features: ['Skill checkpoint quizzes', 'Hands-on practical exams', 'Actionable evaluator feedback'],
  },
  {
    id: 'community-growth',
    title: 'Responsible Community & Growth',
    description:
      'Collaborate with like-minded peers across North India in workshops, CTF simulations, and technical discussions governed by strict ethical codes of conduct.',
    features: ['Peer technical study groups', 'Collegiate workshop network', 'Ethical community guidelines'],
  },
];

export const LEARNING_JOURNEY_STEPS = [
  {
    step: '01',
    name: 'Discover',
    tagline: 'Explore the Security Landscape',
    description:
      'Review cybersecurity sub-disciplines—offensive security, defensive SOC, cloud security, and AI guardrails—to identify the pathway aligning with your goals.',
  },
  {
    step: '02',
    name: 'Learn',
    tagline: 'Build Deep Conceptual Foundations',
    description:
      'Follow a curated syllabus covering TCP/IP, operating system internals, cryptography, application logic flaws, and defensive architectures.',
  },
  {
    step: '03',
    name: 'Practise',
    tagline: 'Execute in Sandboxed Lab Drills',
    description:
      'Transition theoretical knowledge into practical muscle memory through isolated browser labs, vulnerability reproduction, and terminal challenges.',
  },
  {
    step: '04',
    name: 'Evaluate',
    tagline: 'Gauge Understanding with Honest Feedback',
    description:
      'Validate your progress through lab checkpoint assessments, mentor-reviewed capstone projects, and comprehensive technical evaluations.',
  },
  {
    step: '05',
    name: 'Grow',
    tagline: 'Advance into Professional Capability',
    description:
      'Earn verifiable TS-ID credentials, maintain structured portfolios of work, and continue advancing your capabilities as technical landscapes evolve.',
  },
];

export const VERIFICATION_DIRECTORY: VerificationCategory[] = [
  {
    id: 'org-identity',
    name: 'A. Organization & Identity',
    description:
      'Official legal, regulatory, and physical address details that visitors can verify independently through government portals and corporate registries.',
    items: [
      {
        id: 'dpiit-recognition',
        title: 'Startup India / DPIIT Recognition',
        claim: 'Recognized by the Department for Promotion of Industry and Internal Trade (DPIIT), Govt. of India',
        description:
          'Thread Security holds official startup recognition certificate number DIPP169824 issued under the Startup India initiative.',
        sourceType: 'INDEPENDENT_GOVERNMENT_REGISTRY',
        sourceLabel: 'Startup India Central Registry (Govt. of India)',
        isIndependent: true,
        destinationUrl: 'https://www.startupindia.gov.in/',
        documentRef: 'DIPP169824',
        statusText: 'Active Government Recognition',
        statusBadge: 'VERIFIED',
      },
      {
        id: 'iso-standard',
        title: 'ISO 9001:2015 Quality Certification',
        claim: 'Certified Quality Management System for Educational & Technical Training Delivery',
        description:
          'Institutional educational workflows, curriculum delivery standards, and assessment processes conform to ISO 9001:2015 quality frameworks.',
        sourceType: 'ISO_ACCREDITATION',
        sourceLabel: 'Accredited Quality Certification Standard',
        isIndependent: true,
        documentRef: 'ISO 9001:2015 QMS',
        statusText: 'Audited Management Framework',
        statusBadge: 'VERIFIED',
      },
      {
        id: 'campus-address',
        title: 'Physical Flagship Campus Location',
        claim: 'Active In-Person Technical Lab & Administrative Headquarters in Jalandhar, Punjab',
        description:
          'Physical facility equipped with instructional classrooms and administrative offices located at 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001.',
        sourceType: 'INSTITUTIONAL_DOCUMENTATION',
        sourceLabel: 'Physical Campus Inspection & Registry',
        isIndependent: true,
        destinationUrl: 'https://maps.google.com/?q=Vasal+Mall+Police+Line+Jalandhar',
        statusText: 'Physical Facilities Operational',
        statusBadge: 'OFFICIAL',
      },
      {
        id: 'official-domains',
        title: 'Official Internet Domains & Parent Entity',
        claim: 'threadsecurity.in (Education Platform) and threadsecurity.org (Parent Organization)',
        description:
          'Thread Security operates threadsecurity.in for education, LMS, and admissions, and threadsecurity.org for parent organizational operations.',
        sourceType: 'PLATFORM_SYSTEM',
        sourceLabel: 'DNS & WHOIS Cryptographic Registration',
        isIndependent: true,
        destinationUrl: 'https://threadsecurity.org',
        statusText: 'Cryptographically Secured Domains',
        statusBadge: 'ACTIVE',
      },
      {
        id: 'official-helpline',
        title: 'Direct Telephony & Admissions Desk',
        claim: 'Direct Human Contact Number: +91 7347398956 | edu@threadsecurity.in',
        description:
          'Dedicated institutional telephone line for prospective learners, academic partners, and currently enrolled students.',
        sourceType: 'INSTITUTIONAL_DOCUMENTATION',
        sourceLabel: 'Telecom Carrier Registry',
        isIndependent: false,
        destinationUrl: 'tel:+917347398956',
        statusText: 'Direct Institutional Desk',
        statusBadge: 'OFFICIAL',
      },
    ],
  },
  {
    id: 'people-team',
    name: 'B. People & Faculty Team',
    description:
      'Transparent verification of Thread Security leadership, academic mentors, and subject-matter instructors.',
    items: [
      {
        id: 'faculty-mentors',
        title: 'Verified Faculty & Instructional Mentors',
        claim: 'Subject-matter instructors with active backgrounds in cybersecurity operations and academic instruction',
        description:
          'All instructional mentors undergo background identity verification, maintain active industry or research affiliations, and guide daily laboratory sessions.',
        sourceType: 'INSTITUTIONAL_DOCUMENTATION',
        sourceLabel: 'Thread Security Faculty Registry',
        isIndependent: false,
        destinationUrl: '/courses#mentors',
        statusText: 'Vetted Instructional Staff',
        statusBadge: 'OFFICIAL',
      },
      {
        id: 'academic-administration',
        title: 'Academic Administration & Attendance Officers',
        claim: 'Designated administrative coordinators managing attendance records, schedules, and college compliance',
        description:
          'Dedicated administrative leadership (including designated Attendance Coordinator Akshay Kumar and Academic Administrators) maintains formal institutional audits and university compliance reporting.',
        sourceType: 'PLATFORM_SYSTEM',
        sourceLabel: 'Institutional Administrative Roster',
        isIndependent: false,
        statusText: 'Active Governance Staff',
        statusBadge: 'ACTIVE',
      },
      {
        id: 'no-fictional-claims',
        title: 'Strict Anti-Hallucination Policy on Staff',
        claim: 'Zero fictitious advisors, fake Silicon Valley mentors, or fabricated corporate testimonials',
        description:
          'Thread Security only displays team members who actively instruct or administer cohorts. We strictly refuse to license celebrity names or invent advisory boards.',
        sourceType: 'INSTITUTIONAL_DOCUMENTATION',
        sourceLabel: 'Public Transparency Manifesto',
        isIndependent: false,
        statusText: 'Ethical Staffing Guarantee',
        statusBadge: 'OFFICIAL',
      },
    ],
  },
  {
    id: 'platform-programs',
    name: 'C. Learning Platform & Programs',
    description:
      'Methods to inspect and verify courses, syllabi, certifications, terms, and compliance policies before enrolling.',
    items: [
      {
        id: 'verifiable-tsid',
        title: 'Verifiable TS-ID Credential Verification Engine',
        claim: 'Every certificate carries an immutable, cryptographically verifiable TS-ID',
        description:
          'Employers, colleges, and university evaluators can enter any TS-ID into threadsecurity.in/verify-certificate to inspect candidate credentials, completion date, and program scope.',
        sourceType: 'PLATFORM_SYSTEM',
        sourceLabel: 'Public Credential Verification Portal',
        isIndependent: false,
        destinationUrl: '/verify-certificate',
        statusText: 'Publicly Accessible Verifier',
        statusBadge: 'VERIFIED',
      },
      {
        id: 'published-curricula',
        title: 'Transparent Public Syllabi & Course Modules',
        claim: 'All learning tracks publish full syllabus outlines, module prerequisites, and lab scopes upfront',
        description:
          'No gated curriculums or hidden module details. Prospective students can inspect every module breakdown directly on course pages before initiating enrollment.',
        sourceType: 'PLATFORM_SYSTEM',
        sourceLabel: 'Course Catalog & Syllabus Engine',
        isIndependent: false,
        destinationUrl: '/courses',
        statusText: '100% Unlocked Curriculum Details',
        statusBadge: 'OFFICIAL',
      },
      {
        id: 'governance-policies',
        title: 'Legal Terms, Privacy & Refund Policies',
        claim: 'Published policies governing student rights, data handling, and cancellation frameworks',
        description:
          'Clear contractual terms, transparent cancellation and refund guidelines, and strict student data privacy provisions.',
        sourceType: 'INSTITUTIONAL_DOCUMENTATION',
        sourceLabel: 'Published Institutional Policies',
        isIndependent: false,
        destinationUrl: '/refund-policy',
        statusText: 'Public Legal Documents',
        statusBadge: 'OFFICIAL',
      },
    ],
  },
];

export const TRANSPARENCY_DIRECTORY: TransparencyTopic[] = [
  {
    id: 'topic-courses',
    topic: 'Courses',
    whatToCheck: 'Available courses, domain learning objectives, and program scopes',
    destinationLabel: 'View Course Catalog',
    destinationHref: '/courses',
  },
  {
    id: 'topic-curriculum',
    topic: 'Curriculum',
    whatToCheck: 'Detailed breakdown of topics, tools, technologies, and hands-on modules',
    destinationLabel: 'Inspect Roadmap & Syllabi',
    destinationHref: '/#curriculum-roadmap',
  },
  {
    id: 'topic-duration',
    topic: 'Duration & Tracks',
    whatToCheck: 'Compare 45-day summer sprint vs. 6-month industrial fellowship commitments',
    destinationLabel: 'Compare Program Tracks',
    destinationHref: '/industrial-training',
  },
  {
    id: 'topic-fees',
    topic: 'Fees & Payment Terms',
    whatToCheck: 'Transparent fee structures, payment options, and zero hidden surcharge rules',
    destinationLabel: 'Review Admissions & Fees',
    destinationHref: '/contact?topic=admissions',
    note: '// TODO: VERIFY_FACT — Exact fee schedules vary by track and cohort seat allocations. Contact admissions for current semester schedules.',
  },
  {
    id: 'topic-mentorship',
    topic: 'Mentorship Scope',
    whatToCheck: 'Mentor interaction hours, scheduled lab assistance, and project reviews',
    destinationLabel: 'Explore Mentorship Model',
    destinationHref: '/courses',
  },
  {
    id: 'topic-format',
    topic: 'Learning Format',
    whatToCheck: 'In-person campus lab, commute hybrid, or remote cloud sandbox availability',
    destinationLabel: 'Check Delivery Options',
    destinationHref: '/industrial-training/jalandhar',
  },
  {
    id: 'topic-eligibility',
    topic: 'Eligibility',
    whatToCheck: 'Prerequisites for B.Tech, BCA, MCA students, and working professionals',
    destinationLabel: 'Check Prerequisites',
    destinationHref: '/industrial-training',
  },
  {
    id: 'topic-assessments',
    topic: 'Assessments',
    whatToCheck: 'Practical exam format, lab checkpoints, and capstone project defense expectations',
    destinationLabel: 'Review Assessment Structure',
    destinationHref: '/courses',
  },
  {
    id: 'topic-certificates',
    topic: 'Certificates & TS-ID',
    whatToCheck: 'Certification issuance criteria, ISO 9001 compliance, and public verifiability',
    destinationLabel: 'Test Certificate Verifier',
    destinationHref: '/verify-certificate',
  },
  {
    id: 'topic-refund',
    topic: 'Refund Policy',
    whatToCheck: 'Full formal terms governing withdrawals, cancellations, and batch transfers',
    destinationLabel: 'Read Official Refund Terms',
    destinationHref: '/refund-policy',
  },
  {
    id: 'topic-contact',
    topic: 'Contact & Support',
    whatToCheck: 'Official channels for enquiries, campus visits, and academic counseling',
    destinationLabel: 'Connect With Admissions Desk',
    destinationHref: '/contact',
  },
];

export const ENROLLMENT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'check-curriculum',
    number: '01',
    title: 'Curriculum & Technologies',
    description:
      'Confirm the specific technical topics, tools, protocols, and practical outcomes included in your chosen cybersecurity track.',
    ctaLabel: 'View Course Curriculum',
    ctaHref: '/#curriculum-roadmap',
  },
  {
    id: 'check-duration',
    number: '02',
    title: 'Program Duration & Schedule',
    description:
      'Understand total calendar duration, daily lab hours, lecture schedules, and expected weekly commitment before enrolling.',
    ctaLabel: 'Check Program Duration',
    ctaHref: '/industrial-training',
  },
  {
    id: 'check-fees',
    number: '03',
    title: 'Total Fees & Payment Terms',
    description:
      'Confirm total tuition, installment options, payment methods, and make sure there are no hidden examination or lab surcharges.',
    ctaLabel: 'View Fee Details',
    ctaHref: '/contact?topic=fees',
  },
  {
    id: 'check-practical',
    number: '04',
    title: 'Practical Learning & Sandbox Labs',
    description:
      'Ensure the program provides browser-based terminal labs, hands-on exercises, attack/defense targets, and real system exploration.',
    ctaLabel: 'Explore Learning Structure',
    ctaHref: '/courses',
  },
  {
    id: 'check-mentorship',
    number: '05',
    title: 'Mentorship & Support Channels',
    description:
      'Confirm mentor availability, scheduled doubt-clearing sessions, code/lab review processes, and academic support limitations.',
    ctaLabel: 'Understand Mentorship',
    ctaHref: '/courses',
  },
  {
    id: 'check-eligibility',
    number: '06',
    title: 'Eligibility & Prerequisites',
    description:
      'Review technical prerequisites (e.g. basic computing, networking, command-line familiarity) applicable to your specific track.',
    ctaLabel: 'Check Eligibility',
    ctaHref: '/industrial-training',
  },
  {
    id: 'check-refund',
    number: '07',
    title: 'Refund & Cancellation Policy',
    description:
      'Carefully read the published refund, batch deferral, and cancellation terms before submitting any payments or deposits.',
    ctaLabel: 'Read Refund Policy',
    ctaHref: '/refund-policy',
  },
  {
    id: 'check-format',
    number: '08',
    title: 'Learning Format & Delivery Mode',
    description:
      'Confirm whether your enrolled cohort is in-person at the Jalandhar campus, commute hybrid, or live remote instruction.',
    ctaLabel: 'Compare Learning Formats',
    ctaHref: '/industrial-training/jalandhar',
  },
  {
    id: 'check-certification',
    number: '09',
    title: 'Assessments & Verifiable TS-ID',
    description:
      'Understand completion criteria, project evaluation standards, and how your TS-ID credential can be validated by future employers.',
    ctaLabel: 'View Certification Details',
    ctaHref: '/verify-certificate',
  },
  {
    id: 'check-communication',
    number: '10',
    title: 'Communication & Official Support',
    description:
      'Verify official contact numbers (+91 7347398956) and email desks (edu@threadsecurity.in) to ensure you have a direct line to staff.',
    ctaLabel: 'Contact Thread Security',
    ctaHref: '/contact',
  },
];

export const BRAND_PRINCIPLES: BrandPrinciple[] = [
  {
    id: 'transparency',
    title: 'Transparency',
    tagline: 'Clear, verifiable communication without exaggerated promises',
    description:
      'We publish our curriculums openly, state program limitations honestly, and never invent placement statistics or fake guarantees.',
    iconName: 'Eye',
  },
  {
    id: 'practicality',
    title: 'Practicality',
    tagline: 'Technical capability developed through hands-on practice',
    description:
      'Theory provides context; practice builds muscle memory. We design every lesson around interactive terminals and controlled live sandboxes.',
    iconName: 'Terminal',
  },
  {
    id: 'responsibility',
    title: 'Responsibility',
    tagline: 'Ethical execution grounded in law and professional ethics',
    description:
      'Cybersecurity knowledge is a serious capability. We train learners to respect legal boundaries, adhere to disclosure ethics, and protect systems.',
    iconName: 'ShieldAlert',
  },
  {
    id: 'curiosity',
    title: 'Curiosity',
    tagline: 'Investigating how digital systems genuinely operate',
    description:
      'We encourage learners to inspect packets, analyze binaries, interrogate source code, and question assumptions rather than blindly running scripts.',
    iconName: 'Search',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    tagline: 'Mastery earned through disciplined, cumulative effort',
    description:
      'There are no overnight cybersecurity experts. Real engineering acumen is forged through daily laboratory exploration and iterative problem-solving.',
    iconName: 'Activity',
  },
  {
    id: 'growth',
    title: 'Growth',
    tagline: 'Capabilities engineered to evolve alongside technology',
    description:
      'As threats transition into cloud vectors and AI models, we prepare our learners with first principles that remain resilient as technology transforms.',
    iconName: 'TrendingUp',
  },
];

export const ABOUT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'ABOUT',
    question: 'What is Thread Security?',
    answer:
      'Thread Security is a cybersecurity education and technology ecosystem built to make cybersecurity education practical, structured, and accessible. We deliver in-person laboratory cohorts, live hybrid mentorship, and sandboxed training programs focused on offensive assessment, defensive security, DevSecOps, and AI application security.',
  },
  {
    id: 'faq-2',
    category: 'PROGRAMS',
    question: 'What does Thread Security offer?',
    answer:
      'We provide 45-day summer training sprints, 6-month industrial training fellowships, specialized short-format workshops, and comprehensive certificate courses. All programs combine structured lectures, browser-based cloud terminal labs, capstone projects, and verifiable TS-ID credentials.',
  },
  {
    id: 'faq-3',
    category: 'PROGRAMS',
    question: 'Who can join its learning programs?',
    answer:
      'Our programs are engineered for B.Tech (CSE, IT, ECE), BCA, MCA, and Polytechnic students completing university mandatory internship credits, as well as aspiring security analysts, developers, and tech graduates seeking real-world cybersecurity capabilities.',
  },
  {
    id: 'faq-4',
    category: 'PROGRAMS',
    question: 'What cybersecurity topics can I learn?',
    answer:
      'Our curriculum covers Core Networking & Linux Internals, Ethical Hacking & Penetration Testing, Web Application Security (OWASP Top 10), SOC Operations & Blue Teaming, Network Defense & SIEM, Bug Bounty Hunting methodologies, and specialized AI Security & LLM Red Teaming.',
  },
  {
    id: 'faq-5',
    category: 'PROGRAMS',
    question: 'Does Thread Security provide practical learning?',
    answer:
      'Yes. Practical application is the core foundation of our pedagogy. Learners complete exercises in 100% browser-based containerized sandboxes, reproducing vulnerabilities, inspecting network captures, and defending mock enterprise infrastructure without complex local workstation configuration.',
  },
  {
    id: 'faq-6',
    category: 'PROGRAMS',
    question: 'How does mentorship work?',
    answer:
      'Each cohort is guided by experienced faculty and security practitioners. Mentors conduct scheduled daily instruction, supervise open laboratory sessions, resolve technical roadblocks, and perform detailed evaluations of student capstone assignments.',
  },
  {
    id: 'faq-7',
    category: 'POLICIES',
    question: 'What is included in the course fee?',
    answer:
      'Course fees include all live instructional sessions, access to cloud laboratory sandboxes during the program, learning resources, assessment evaluations, university project documentation support, and issuance of the verifiable TS-ID certificate upon successful completion.',
  },
  {
    id: 'faq-8',
    category: 'PROGRAMS',
    question: 'How can I check the curriculum?',
    answer:
      'You can review our complete curriculum roadmap directly on our website at threadsecurity.in/#curriculum-roadmap, or browse specific syllabus outlines under each course page on threadsecurity.in/courses without any required login or paywall.',
  },
  {
    id: 'faq-9',
    category: 'VERIFICATION',
    question: 'What certification is provided?',
    answer:
      'Upon meeting attendance requirements and passing practical assessments, graduates receive an official Thread Security Education Certificate of Completion. Each certificate features an immutable TS-ID number that can be verified publicly by colleges and employers via threadsecurity.in/verify-certificate.',
  },
  {
    id: 'faq-10',
    category: 'VERIFICATION',
    question: 'How can I verify the organization?',
    answer:
      'Thread Security is recognized by the Government of India under DPIIT certificate DIPP169824 and operates under an ISO 9001:2015 certified Quality Management System. You can review government registries, inspect our physical campus at Vasal Mall in Jalandhar, or contact our admissions desk directly at +91 7347398956.',
  },
  {
    id: 'faq-11',
    category: 'POLICIES',
    question: 'Where can I read the refund policy?',
    answer:
      'Our complete, transparent refund and cancellation policy is published publicly at threadsecurity.in/refund-policy. We encourage all learners to read these terms thoroughly prior to initiating any enrollment fees or deposits.',
  },
  {
    id: 'faq-12',
    category: 'ABOUT',
    question: 'How can I contact the team before enrolling?',
    answer:
      'You can reach our admissions and technical advisory team directly by telephone at +91 7347398956, by email at edu@threadsecurity.in, or by submitting an enquiry through threadsecurity.in/contact. In-person counseling is also available at our Jalandhar campus during standard working hours.',
  },
];
