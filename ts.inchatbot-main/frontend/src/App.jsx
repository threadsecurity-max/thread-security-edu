import { useState, useRef, useEffect } from 'react';
import './App.css';

// ── Change 1: Full 3-level course data (domain → duration → course → detail) ──

const COURSE_DETAIL = {
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

const COURSE_CATALOG = {
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

const COURSE_ALIASES = {
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

// ── Change 3: Real project names ──
const SUGGESTIONS = {
  standards: `ThreadSecurity's curriculum is built directly from industry requirements, ensuring that every module reflects what employers actually look for. Instead of just theory, our approach is entirely project-based, allowing students to graduate with portfolio ready proof of work that prepares them for real world enterprise environments.`,
  projects: `Our students work on industry ready projects in both Cybersecurity and AI. These capstone projects are designed to produce portfolio ready proof of work for your interviews.`,
  labs: `TSE Labs gives students a controlled environment to turn security theory into demonstrated ability. Instead of only watching lectures, students investigate realistic vulnerabilities, understand their root causes, exploit them safely, document the impact, and apply remediation. This learn, discover, analyze, exploit, report, remediate workflow builds the practical judgment employers look for across ethical hacking, web and API security, network defense, VAPT, and SOC operations. Enrolled students access the labs through their dashboard and can track their practical progress.`
};

// ── Change 4: Structured mentor profiles, no names ──
const MENTOR_PROFILES = {
  cyber: `Our Cybersecurity Mentors are active industry professionals specializing in Ethical Hacking and Penetration Testing. They bring enterprise experience to guide students through real world security labs.`,
  ai: `Our AI Mentors are active industry professionals specializing in Machine Learning and NLP. They bring practical experience to help students build intelligent, production ready applications.`,
  combined: `We have expert Cybersecurity and AI mentors who are active industry professionals. With deep expertise in Ethical Hacking, Machine Learning, and Enterprise Security, they are here to guide you, resolve your doubts, and ensure you become practically strong for the real world.`
};

function App() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hello! I am the ThreadSecurity AI Educational Assistant. How can I help you with our AI or cybersecurity courses today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const createAssistantMessage = (text, actions = [], suggestions = null) => {
    const defaultSuggestions = [
      { label: 'Know about mentors', type: 'mentors' },
      { label: 'Industry standards', type: 'standards' },
      { label: 'Real-world projects', type: 'projects' },
      { label: 'Why TSE Labs?', type: 'labs' }
    ];
    return {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      role: 'assistant',
      text,
      actions,
      suggestions: suggestions || defaultSuggestions
    };
  };

  // ── Change 1: buildCatalogMessage — durations clickable inline in the bullet line ──
  const buildCatalogMessage = (domain) => {
    const catalog = COURSE_CATALOG[domain];

    const suggestions = [
      { label: 'Know about mentors', type: 'mentors' },
      { label: 'Industry standards', type: 'standards' },
      { label: 'Real-world projects', type: 'projects' },
      { label: 'Why TSE Labs?', type: 'labs' },
      { label: 'Enroll Now', type: 'enroll' }
    ];

    return {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      role: 'assistant',
      type: 'catalog',
      intro: `We offer ${catalog.label} programs in these tracks:`,
      catalogItems: catalog.durations.map((item) => ({
        label: item.label,
        summary: item.summary,
        domain,
        duration: item.label
      })),
      actions: [],
      suggestions
    };
  };

  // ── Change 1: buildDurationMessage — course names as duration-link spans ──
  const buildDurationMessage = (domain, durationLabel) => {
    const courseMap = COURSE_DETAIL[domain]?.[durationLabel];
    if (!courseMap) return createAssistantMessage('I can help with the available AI and cyber tracks.');

    const courseNames = Object.keys(courseMap);

    const actions = courseNames.map((name) => ({
      label: name,
      type: 'course',
      domain,
      duration: durationLabel,
      courseName: name
    }));

    const catalog = COURSE_CATALOG[domain];

    const suggestions = [
      { label: `More ${catalog.label} courses`, type: `more_${domain}` },
      { label: 'Know about mentors', type: 'mentors' },
      { label: 'Industry standards', type: 'standards' },
      { label: 'Real-world projects', type: 'projects' },
      { label: 'Why TSE Labs?', type: 'labs' },
      { label: 'Enroll Now', type: 'enroll' }
    ];

    return createAssistantMessage(
      `${catalog.label}: ${durationLabel} programs:\n\nClick a course name to see its details:`,
      actions,
      suggestions
    );
  };

  // ── Change 1: buildCourseDetailMessage — 3-4 line brief + skills, no modules ──
  const buildCourseDetailMessage = (domain, duration, courseName) => {
    const detail = COURSE_DETAIL[domain]?.[duration]?.[courseName];
    if (!detail) return createAssistantMessage('Course details not available. Please reach out at https://threadsecurity.in/contact.');

    const skillList = detail.skills.map((s) => `• ${s}`).join('\n');

    const catalog = COURSE_CATALOG[domain];

    const suggestions = [
      { label: `More ${catalog.label} courses`, type: `more_${domain}` },
      { label: 'Know about mentors', type: 'mentors' },
      { label: 'Industry standards', type: 'standards' },
      { label: 'Real-world projects', type: 'projects' },
      { label: 'Enroll Now', type: 'enroll' }
    ];

    const allCourses = Object.keys(COURSE_DETAIL[domain]?.[duration] || {});
    const relatedCourses = allCourses.filter(c => c !== courseName).slice(0, 2);

    const actions = relatedCourses.map(name => ({
      label: `Explore: ${name}`,
      type: 'course',
      domain,
      duration,
      courseName: name
    }));

    return createAssistantMessage(
      `${courseName}\n\n${detail.brief}\n\nSkills you'll build:\n${skillList}`,
      actions,
      suggestions
    );
  };

  const handleSuggestion = (type) => {
    if (type === 'enroll') {
      window.open('https://threadsecurity.in/contact', '_blank');
      return;
    }
    if (type === 'mentors') {
      const text = MENTOR_PROFILES.combined;
      setMessages((prev) => [...prev, createAssistantMessage(text)]);
      return;
    }
    if (type === 'more_cyber') {
      setMessages((prev) => [...prev, buildCatalogMessage('cyber')]);
      return;
    }
    if (type === 'more_ai') {
      setMessages((prev) => [...prev, buildCatalogMessage('ai')]);
      return;
    }
    const text = SUGGESTIONS[type] || 'We can help with AI and cyber course details.';
    setMessages((prev) => [...prev, createAssistantMessage(text)]);
  };

  const findCourseMatch = (query) => {
    const normalizedQuery = query.toLowerCase();
    const matches = [];

    const matchedNames = Object.entries(COURSE_ALIASES)
      .filter(([, aliases]) => aliases.some((alias) => normalizedQuery.includes(alias)))
      .map(([courseName]) => courseName);

    if (matchedNames.length > 0) {
      Object.entries(COURSE_DETAIL).forEach(([domain, durations]) => {
        Object.entries(durations).forEach(([duration, courses]) => {
          matchedNames.forEach((courseName) => {
            if (courses[courseName]) matches.push({ domain, duration, courseName });
          });
        });
      });
      return matches;
    }

    const ignoredWords = new Set(['a', 'about', 'all', 'are', 'course', 'courses', 'details', 'do', 'for', 'give', 'i', 'in', 'is', 'me', 'of', 'please', 'tell', 'the', 'this', 'what', 'which', 'with', 'ai', 'artificial', 'intelligence', 'cyber', 'cybersecurity', 'security']);
    const queryWords = normalizedQuery.split(/[^a-z0-9]+/).filter((word) => word && !ignoredWords.has(word));

    Object.entries(COURSE_DETAIL).forEach(([domain, durations]) => {
      Object.entries(durations).forEach(([duration, courses]) => {
        Object.keys(courses).forEach((courseName) => {
          const normalizedName = courseName.toLowerCase();
          const nameWords = normalizedName.split(/[^a-z0-9]+/).filter(Boolean);
          const matchesAllWords = queryWords.length > 0 && queryWords.every((word) => nameWords.includes(word));
          if (matchesAllWords || normalizedQuery.includes(normalizedName)) {
            matches.push({ domain, duration, courseName });
          }
        });
      });
    });

    return matches;
  };

  const handleLocalIntent = (query) => {
    const q = query.toLowerCase().trim();

    // Greetings — all common variations
    if (/^(hi|hie|hye|hey|heya|hello|sup|what'?s up|good morning|good evening|howdy|yo)[\s!?.]*$/.test(q)) {
      return createAssistantMessage('Hello! I can help with AI and cybersecurity course tracks, mentor details, and real-world project opportunities. What would you like to explore?');
    }

    // Farewells — all common variations
    if (/^(bye|bie|byee|byeee|goodbye|good bye|cya|see ya|see you|take care|tata|later)[\s!?.]*$/.test(q)) {
      return createAssistantMessage('Goodbye! It was great talking with you. Feel free to come back anytime you have questions about our courses. Best of luck!');
    }

    // Registration / enroll intent
    if (/(register|enroll|enrol|sign up|signup|join|admission|apply|how to join|how to enroll|how to register|get started|i want to join|i want to enroll|i want to register)/.test(q)) {
      window.open('https://threadsecurity.in/contact', '_blank');
      return createAssistantMessage('Great! I\'ve opened our registration page for you. You can fill in your details at threadsecurity.in/contact and our team will get back to you shortly.');
    }

    const domainOnlyQuery = /^(?:show me |tell me about |what are |what is |give me )?(?:ai|artificial intelligence|cyber|cybersecurity|cyber security|ai and cyber|cyber and ai)(?: courses?| programs?| catalogue| catalog)?[?.! ]*$/i.test(q);

    // Domain-only queries belong at the catalogue level, never to a similarly named course.
    if (domainOnlyQuery) {
      if (q.includes('ai') || q.includes('artificial intelligence')) return buildCatalogMessage('ai');
      return buildCatalogMessage('cyber');
    }

    // Specific course or track queries must be handled before domain catalogues.
    const courseMatches = findCourseMatch(q);
    if (courseMatches.length > 0) {
      const uniqueMatches = courseMatches.filter((match, index, allMatches) =>
        allMatches.findIndex((candidate) => candidate.courseName === match.courseName) === index
      );
      if (uniqueMatches.length === 1) {
        const match = courseMatches[0];
        return buildCourseDetailMessage(match.domain, match.duration, match.courseName);
      }
      return createAssistantMessage(
        `I found ${uniqueMatches[0].courseName} in more than one program. Please choose the duration to see the exact course details.`,
        uniqueMatches.map((match) => ({
          label: match.duration,
          type: 'course',
          domain: match.domain,
          duration: match.duration,
          courseName: match.courseName
        }))
      );
    }

    // AI catalog — single word or phrase
    if (/\b(ai|artificial intelligence|machine learning|ml|data science|gen ai|genai)\b/.test(q) && !q.includes('mentor') && !q.includes('project') && !q.includes('standard')) {
      return buildCatalogMessage('ai');
    }

    // Cyber catalog — single word or phrase
    if (/\b(cyber|cybersecurity|cyber security|hacking|ethical hacking|security|infosec|penetration testing|pentest)\b/.test(q) && !q.includes('mentor') && !q.includes('project') && !q.includes('standard')) {
      return buildCatalogMessage('cyber');
    }

    // All courses / what do you offer
    if (/\b(courses|course|programs|program|what do you offer|what you offer|fellowships|fellowship)\b/.test(q)) {
      // Show both catalogs — return ai first, user can navigate
      return buildCatalogMessage('ai');
    }

    // Domain-specific mentor responses
    if (/cyber\s*mentor/.test(q)) {
      return createAssistantMessage(MENTOR_PROFILES.cyber);
    }

    if (/(ai\s*mentor|artificial intelligence\s*mentor)/.test(q)) {
      return createAssistantMessage(MENTOR_PROFILES.ai);
    }

    if (/(mentor|mentors|instructor|teacher|trainer|who teaches)/.test(q)) {
      return createAssistantMessage(MENTOR_PROFILES.combined);
    }

    // Industry standards / placement
    if (/(industry standard|industry standards|placement|career|job ready|job-ready|hiring|employment)/.test(q)) {
      return createAssistantMessage(SUGGESTIONS.standards);
    }

    // Projects
    if (/(project|projects|real-world project|real world project|capstone|portfolio)/.test(q)) {
      return createAssistantMessage(SUGGESTIONS.projects);
    }

    if (/(tse labs|threadsecurity labs|security labs|virtual labs|cyber lab|cybersecurity lab|lab)/.test(q)) {
      return createAssistantMessage(SUGGESTIONS.labs);
    }

    // ── Strict out-of-scope guardrail ──
    // Only allow queries that contain at least one known education keyword
    const inScopeKeywords = [
      'course', 'program', 'fellowship', 'track', 'duration', 'syllabus', 'module',
      'ai', 'cyber', 'security', 'machine learning', 'ml', 'data', 'python', 'hacking',
      'pentest', 'red team', 'blue team', 'bug bounty', 'linux', 'deep learning',
      'neural', 'llm', 'generative', 'cloud', 'docker', 'devops', 'soc', 'forensic',
      'malware', 'owasp', 'sql', 'network', 'threat', 'vulnerability', 'exploit',
      'mentor', 'instructor', 'teacher', 'trainer',
      'project', 'capstone', 'portfolio', 'placement', 'career', 'job', 'hiring',
      'industry', 'standard', 'certificate', 'lab', 'dashboard',
      'fee', 'price', 'cost', 'enroll', 'register', 'join', 'admission', 'apply',
      'threadsecurity', 'thread security', 'ts', 'what', 'how', 'tell me', 'show me',
      'explain', 'difference', 'compare', 'best', 'which', 'help', 'info', 'about'
    ];

    const isInScope = inScopeKeywords.some((kw) => q.includes(kw));

    if (!isInScope) {
      return createAssistantMessage(
        'I am the ThreadSecurity Educational Assistant and I can only help with our AI and Cybersecurity courses, mentors, projects, and enrollment. I cannot answer questions outside of this scope.'
      );
    }

    return null;
  };

  // ── Change 2: fetch with AbortController timeout + 1 auto-retry + friendly error ──
  const fetchWithRetry = async (query, assistantMessageId, attempt = 1) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id: sessionId }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error(`Chat error (attempt ${attempt}):`, error);

      if (attempt === 1) {
        await new Promise((res) => setTimeout(res, 800));
        return fetchWithRetry(query, assistantMessageId, 2);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, text: "I'm having trouble reaching the server right now. Please try your question again in a moment." }
            : msg
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const localReply = handleLocalIntent(query);

    if (localReply) {
      setTimeout(() => {
        setMessages((prev) => [...prev, localReply]);
        setIsTyping(false);
      }, 300);
      return;
    }

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', text: '' }]);

    await fetchWithRetry(query, assistantMessageId);
    setIsTyping(false);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>ThreadSecurity Assistant</h1>
        <div className="header-right">
          <a
            href="https://threadsecurity.in/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="register-btn"
          >
            Register Now ↗
          </a>
          <div className="status-indicator">
            <span className="dot"></span> Online
          </div>
        </div>
      </header>

      <div className="chat-history">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.role}`}>
            <div className={`message-bubble ${msg.role}`}>
              {/* ── Change 1: catalog type — duration labels clickable inline in the bullet line ── */}
              {msg.type === 'catalog' ? (
                <>
                  <span>{msg.intro}</span>
                  <div className="catalog-list">
                    {msg.catalogItems.map((item) => (
                      <div key={item.label} className="catalog-item">
                        <span>• </span>
                        <span
                          className="duration-link"
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const reply = buildDurationMessage(item.domain, item.duration);
                            setMessages((prev) => [...prev, reply]);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const reply = buildDurationMessage(item.domain, item.duration);
                              setMessages((prev) => [...prev, reply]);
                            }
                          }}
                        >
                          {item.label}
                        </span>
                        <span>: {item.summary}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>{msg.text}

                {/* course-level actions as .duration-link spans */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="reply-actions duration-actions">
                    {msg.actions.map((action) => (
                      <span
                        key={`${msg.id}-${action.label}`}
                        className="duration-link"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (action.type === 'course') {
                            const reply = buildCourseDetailMessage(action.domain, action.duration, action.courseName);
                            setMessages((prev) => [...prev, reply]);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (action.type === 'course') {
                              const reply = buildCourseDetailMessage(action.domain, action.duration, action.courseName);
                              setMessages((prev) => [...prev, reply]);
                            }
                          }
                        }}
                      >
                        {action.label}
                      </span>
                    ))}
                  </div>
                )}</>
              )}

              {/* Suggestion chips remain as pill buttons */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="reply-actions suggestion-actions">
                  {msg.suggestions.map((suggestion) => (
                    <button
                      key={`${msg.id}-${suggestion.type}`}
                      className="mini-option suggestion"
                      type="button"
                      onClick={() => handleSuggestion(suggestion.type)}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper assistant">
            <div className="message-bubble assistant typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask about our AI & Cyber courses..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !input.trim()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default App;
