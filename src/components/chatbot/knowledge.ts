export interface CourseDetailItem {
  brief: string;
  skills: string[];
}

export interface CatalogDurationItem {
  label: string;
  summary: string;
}

export interface CatalogDomainItem {
  label: string;
  durations: CatalogDurationItem[];
}

export const COURSE_DETAIL: Record<string, Record<string, Record<string, CourseDetailItem>>> = {
  ai: {
    '45 Days': {
      'Python for AI': {
        brief: 'Foundation Python tailored for AI. Covers NumPy, Pandas, EDA, error handling, and industry Git workflows. Builds the core scripting skills needed before any ML or data work. Students leave ready for real AI pipelines.',
        skills: ['Python', 'NumPy', 'Pandas', 'EDA', 'Git', 'GUI Dev']
      },
      'Data Analysis': {
        brief: 'Master extracting business insights from raw data using Python, Pandas, Excel, and SQL. Covers data manipulation, visualization, and storytelling for real-world analytics scenarios. Practical projects throughout.',
        skills: ['Python Analytics', 'Data Visualization', 'Excel', 'SQL']
      },
      'Data Science': {
        brief: 'End-to-end data science covering web scraping, data pipelines, BI dashboards, and cloud deployment. Goes beyond analysis into building production-ready data systems. SQL and GitHub are core components.',
        skills: ['Web Scraping', 'Business Intelligence', 'SQL', 'Cloud Deployment']
      },
      'Machine Learning': {
        brief: 'Hands-on ML covering supervised and unsupervised learning, model evaluation, and hyperparameter optimization. Focuses on practical algorithm application, not just theory. Ends with an industry-based project.',
        skills: ['ML Algorithms', 'Supervised/Unsupervised Learning', 'Model Evaluation', 'Predictive Modeling']
      },
      'Deep Learning': {
        brief: 'Intensive program covering neural network architecture, mathematical foundations, and model deployment. Goes deep into DNNs, optimization, and pattern recognition. Includes a capstone deployment project.',
        skills: ['Neural Networks', 'Deep Learning Frameworks', 'Applied Math', 'Model Deployment']
      }
    },
    '6 Months': {
      'Foundational AI': {
        brief: 'Comprehensive base covering data analysis, backend development, ML, DL, and SQL engineering. Designed to give students a full-stack AI foundation before specialization. Includes FastAPI, Power BI, and DevOps basics.',
        skills: ['Python', 'ML Engineering', 'DL', 'FastAPI', 'SQL', 'DevOps']
      },
      'Agentic AI & Intelligent Systems': {
        brief: 'Advanced curriculum for building autonomous AI agents, multi-agent systems, and enterprise LLM integrations. Covers RAG, vector databases, agent orchestration, and production deployment. For those who want to build next-gen AI.',
        skills: ['LLMs', 'Agentic AI', 'RAG', 'Vector DBs', 'Multi-Agent Systems', 'LLMOps']
      },
      'AI Engineering & Generative AI': {
        brief: 'In-depth engineering for LLM apps, model fine-tuning, multimodal AI, and enterprise-scale solutions. Covers embeddings, semantic search, and AI deployment end-to-end. Designed for serious AI builders.',
        skills: ['Generative AI', 'Prompt Engineering', 'Multimodal AI', 'LLM Fine-tuning', 'RAG', 'LLMOps']
      },
      'AI Infrastructure, Cloud & LLMOps': {
        brief: 'Cloud infrastructure, containerization, and production AI deployment. Covers Docker, Kubernetes, CI/CD, observability, and AI security at scale. Built for engineers who want to run AI in the real world.',
        skills: ['Cloud Computing', 'Docker/Kubernetes', 'MLOps/LLMOps', 'CI/CD', 'AI Observability']
      },
      'AI Security & Responsible AI': {
        brief: 'Securing AI applications against adversarial attacks, LLM-specific threats, and governance risks. Covers AI red teaming, privacy-preserving AI, and compliance. Unique track blending AI and security.',
        skills: ['AI Security', 'LLM Security', 'AI Red Teaming', 'Adversarial Testing', 'AI Governance']
      }
    }
  },
  cyber: {
    '45 Days': {
      'Cyber Fundamentals': {
        brief: 'Foundational course covering essential cybersecurity concepts, operating systems, and basic security tools.',
        skills: ['Cybersecurity Basics', 'System Security', 'Cryptography', 'Threat Awareness', 'Security Tools']
      },
      'Computer Networking & Network Security': {
        brief: 'Comprehensive networking course covering protocols, infrastructure, and securing networks.',
        skills: ['Networking', 'Network Protocols', 'Routing', 'Network Security', 'Network Monitoring']
      },
      'Ethical Hacking & Offensive Security': {
        brief: 'In-depth training on ethical hacking methodologies, reconnaissance, and exploitation.',
        skills: ['Ethical Hacking', 'Reconnaissance', 'Web App Security', 'Exploitation', 'Active Directory Security', 'Red Teaming']
      },
      'Vulnerability Assessment & Penetration Testing (VAPT)': {
        brief: 'Practical VAPT course focusing on vulnerability scanning and penetration testing across web, mobile, and networks.',
        skills: ['Vulnerability Assessment', 'Penetration Testing', 'Web & API Testing', 'Infrastructure Testing', 'Security Reporting']
      },
      'Security Operations Center (SOC) & Blue Team': {
        brief: 'Defensive security course focusing on SOC operations, SIEM, threat detection, and incident response.',
        skills: ['SOC Operations', 'SIEM', 'Threat Detection', 'Incident Response', 'Digital Forensics', 'Threat Hunting']
      },
      'Advanced Cybersecurity & Red Team Operations': {
        brief: 'Advanced offensive security course covering advanced recon, exploit development, and full red team operations.',
        skills: ['Advanced Reconnaissance', 'Advanced Web Security', 'Exploit Development', 'Active Directory Security', 'Red Team Operations']
      }
    },
    '3 Months': {
      'Red Team Operations & Offensive Security': {
        brief: 'Comprehensive offensive security training covering penetration testing and red teaming methodologies. Learn to simulate real-world attacks on enterprise environments. Focuses on authorized exploitation, attack path mapping, and professional reporting.',
        skills: ['Red Teaming', 'Penetration Testing', 'Offensive Security', 'Vulnerability Assessment', 'Exploitation']
      },
      'Blue Team Operations & Defensive Security': {
        brief: 'In-depth defensive security and SOC operations training. Covers threat hunting, SIEM, network defense, and incident detection for enterprise environments. Builds the skills employers look for in security analysts.',
        skills: ['Blue Teaming', 'Threat Hunting', 'SIEM', 'Network Defense', 'Incident Detection']
      },
      'Bug Bounty Hunting & Web Application Security': {
        brief: 'Specialized program for finding and reporting web vulnerabilities. Covers OWASP Top 10, IDOR, XSS, SQL Injection, authentication flaws, and secure code review. Prepares students for real bug bounty programs.',
        skills: ['Bug Bounty', 'Web App Pentesting', 'OWASP Top 10', 'Vulnerability Discovery', 'Secure Code Review']
      },
      'Linux for Cybersecurity & Security Operations': {
        brief: 'Linux OS skills specifically tailored for security professionals, forensics analysts, and SOC operators. Covers system hardening, command line proficiency, and secure server configuration.',
        skills: ['Linux Administration', 'Security Operations', 'System Hardening', 'Secure Server Config']
      }
    },
    '6 Months': {
      'Red Team Operations & Offensive Security': {
        brief: 'Comprehensive offensive security training covering penetration testing and red teaming methodologies. Learn to simulate real-world attacks on enterprise environments. Focuses on authorized exploitation, attack path mapping, and professional reporting.',
        skills: ['Red Teaming', 'Penetration Testing', 'Offensive Security', 'Vulnerability Assessment', 'Exploitation']
      },
      'Blue Team Operations & Defensive Security': {
        brief: 'In-depth defensive security and SOC operations training. Covers threat hunting, SIEM, network defense, and incident detection for enterprise environments. Builds the skills employers look for in security analysts.',
        skills: ['Blue Teaming', 'Threat Hunting', 'SIEM', 'Network Defense', 'Incident Detection']
      },
      'Bug Bounty Hunting & Web Application Security': {
        brief: 'Specialized program for finding and reporting web vulnerabilities. Covers OWASP Top 10, IDOR, XSS, SQL Injection, authentication flaws, and secure code review. Prepares students for real bug bounty programs.',
        skills: ['Bug Bounty', 'Web App Pentesting', 'OWASP Top 10', 'Vulnerability Discovery', 'Secure Code Review']
      },
      'Linux for Cybersecurity & Security Operations': {
        brief: 'Linux OS skills specifically tailored for security professionals, forensics analysts, and SOC operators. Covers system hardening, command line proficiency, and secure server configuration.',
        skills: ['Linux Administration', 'Security Operations', 'System Hardening', 'Secure Server Config']
      }
    }
  }
};

export const COURSE_CATALOG: Record<string, CatalogDomainItem> = {
  ai: {
    label: 'AI',
    durations: [
      {
        label: '45 Days',
        summary: 'Foundation track for beginners to build core AI and data skills.'
      },
      {
        label: '6 Months',
        summary: 'Advanced fellowship for professionals building enterprise AI systems.'
      }
    ]
  },
  cyber: {
    label: 'Cyber',
    durations: [
      {
        label: '45 Days',
        summary: 'Entry-level track focusing on core security and offensive basics.'
      },
      {
        label: '3 Months',
        summary: 'Focused path for building practical security and offensive skills.'
      },
      {
        label: '6 Months',
        summary: 'Advanced fellowship for offensive and defensive security roles.'
      }
    ]
  }
};

export const COURSE_ALIASES: Record<string, string[]> = {
  'Python for AI': ['python ai', 'python for artificial intelligence'],
  'Data Analysis': ['data analytics', 'analytics'],
  'Data Science': ['data science'],
  'Machine Learning': ['machine learning', 'ml'],
  'Deep Learning': ['deep learning', 'dl'],
  'Foundational AI': ['foundational ai', 'foundation ai', 'ai foundation'],
  'Agentic AI & Intelligent Systems': ['agentic ai', 'intelligent systems', 'ai agents', 'multi agent'],
  'AI Engineering & Generative AI': ['ai engineering', 'generative ai', 'gen ai'],
  'AI Infrastructure, Cloud & LLMOps': ['ai infrastructure', 'cloud ai', 'llmops', 'mlops'],
  'AI Security & Responsible AI': ['ai security', 'responsible ai'],
  'Cyber Fundamentals': ['cyber fundamentals', 'cyber basics', 'cybersecurity basics'],
  'Computer Networking & Network Security': ['computer networking', 'network security', 'networking security'],
  'Ethical Hacking & Offensive Security': ['ethical hacking', 'offensive security'],
  'Vulnerability Assessment & Penetration Testing (VAPT)': ['vapt', 'vulnerability assessment', 'penetration testing', 'pentest'],
  'Security Operations Center (SOC) & Blue Team': ['soc', 'soc analyst', 'blue team', 'security operations center'],
  'Advanced Cybersecurity & Red Team Operations': ['advanced cybersecurity', 'red team', 'red team operations'],
  'Red Team Operations & Offensive Security': ['red team operations', 'red teaming'],
  'Blue Team Operations & Defensive Security': ['blue team operations', 'blue teaming', 'defensive security'],
  'Bug Bounty Hunting & Web Application Security': ['bug bounty', 'web application security', 'web app security'],
  'Linux for Cybersecurity & Security Operations': ['linux cybersecurity', 'linux for security', 'linux security']
};

export const SUGGESTIONS: Record<string, string> = {
  standards: `ThreadSecurity's curriculum is built directly from industry requirements, ensuring that every module reflects what employers actually look for. Instead of just theory, our approach is entirely project-based, allowing students to graduate with portfolio-ready proof of work that prepares them for real-world enterprise environments.`,
  projects: `Our students work on industry-ready projects in both Cybersecurity and AI. These capstone projects are designed to produce portfolio-ready proof of work for your interviews.`,
  labs: `TSE Labs gives students a controlled environment to turn security theory into demonstrated ability. Instead of only watching lectures, students investigate realistic vulnerabilities, understand their root causes, exploit them safely, document the impact, and apply remediation. This learn, discover, analyze, exploit, report, remediate workflow builds the practical judgment employers look for across ethical hacking, web and API security, network defense, VAPT, and SOC operations. Enrolled students access the labs through their dashboard and can track their practical progress.`
};

export const MENTOR_PROFILES: Record<string, string> = {
  cyber: `Our Cybersecurity Mentors are active industry professionals specializing in Ethical Hacking, VAPT, and Penetration Testing. They bring enterprise experience to guide students through real-world security labs.`,
  ai: `Our AI Mentors are active industry professionals specializing in Machine Learning, Deep Learning, and NLP. They bring practical experience to help students build intelligent, production-ready applications.`,
  combined: `We have expert Cybersecurity and AI mentors who are active industry professionals. With deep expertise in Ethical Hacking, Machine Learning, and Enterprise Security, they are here to guide you, resolve your doubts, and ensure you become practically strong for the real world.`
};

export const DEFAULT_SUGGESTION_CHIPS = [
  { label: 'Explore AI Tracks', type: 'more_ai' },
  { label: 'Explore Cyber Tracks', type: 'more_cyber' },
  { label: 'Meet Mentors', type: 'mentors' },
  { label: 'Why TSE Labs?', type: 'labs' },
  { label: 'Real-World Projects', type: 'projects' },
  { label: 'Enrollment & Admission', type: 'enroll' }
];
