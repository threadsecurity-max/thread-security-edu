import {
  COURSE_DETAIL,
  COURSE_CATALOG,
  COURSE_ALIASES,
  SUGGESTIONS,
  MENTOR_PROFILES,
  DEFAULT_SUGGESTION_CHIPS,
} from './knowledge';

export interface ActionChip {
  label: string;
  type: 'course' | 'duration' | 'domain';
  domain?: string;
  duration?: string;
  courseName?: string;
}

export interface SuggestionChipItem {
  label: string;
  type: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actions?: ActionChip[];
  suggestions?: SuggestionChipItem[];
  catalogItems?: Array<{
    label: string;
    summary: string;
    domain: string;
    duration: string;
  }>;
}

export function createAssistantMessage(
  text: string,
  actions: ActionChip[] = [],
  suggestions: SuggestionChipItem[] | null = null
): ChatMessageItem {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    role: 'assistant',
    text,
    actions,
    suggestions: suggestions || DEFAULT_SUGGESTION_CHIPS,
  };
}

export function buildCatalogMessage(domain: 'ai' | 'cyber'): ChatMessageItem {
  const catalog = COURSE_CATALOG[domain];

  const suggestions: SuggestionChipItem[] = [
    { label: 'Meet Mentors', type: 'mentors' },
    { label: 'Industry Standards', type: 'standards' },
    { label: 'Real-World Projects', type: 'projects' },
    { label: 'Why TSE Labs?', type: 'labs' },
    { label: 'Enroll Now', type: 'enroll' },
  ];

  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    role: 'assistant',
    text: `We offer **${catalog.label}** programs in these specialized tracks:`,
    catalogItems: catalog.durations.map((item) => ({
      label: item.label,
      summary: item.summary,
      domain,
      duration: item.label,
    })),
    actions: [],
    suggestions,
  };
}

export function buildDurationMessage(domain: string, durationLabel: string): ChatMessageItem {
  const courseMap = COURSE_DETAIL[domain]?.[durationLabel];
  if (!courseMap) return createAssistantMessage('I can help with the available AI and Cyber curriculum tracks.');

  const courseNames = Object.keys(courseMap);

  const actions: ActionChip[] = courseNames.map((name) => ({
    label: name,
    type: 'course',
    domain,
    duration: durationLabel,
    courseName: name,
  }));

  const catalog = COURSE_CATALOG[domain];

  const suggestions: SuggestionChipItem[] = [
    { label: `More ${catalog?.label || domain.toUpperCase()} courses`, type: `more_${domain}` },
    { label: 'Meet Mentors', type: 'mentors' },
    { label: 'Industry Standards', type: 'standards' },
    { label: 'Real-World Projects', type: 'projects' },
    { label: 'Enroll Now', type: 'enroll' },
  ];

  return createAssistantMessage(
    `### ${catalog?.label || domain.toUpperCase()}: ${durationLabel} Curriculum\n\nClick any course module below to view its syllabus and core skills:`,
    actions,
    suggestions
  );
}

export function buildCourseDetailMessage(domain: string, duration: string, courseName: string): ChatMessageItem {
  const detail = COURSE_DETAIL[domain]?.[duration]?.[courseName];
  if (!detail) {
    return createAssistantMessage('Course details not available right now. Please reach out to our admissions team at /contact.');
  }

  const skillList = detail.skills.map((s) => `• ${s}`).join('\n');
  const catalog = COURSE_CATALOG[domain];

  const suggestions: SuggestionChipItem[] = [
    { label: `More ${catalog?.label || domain.toUpperCase()} courses`, type: `more_${domain}` },
    { label: 'Meet Mentors', type: 'mentors' },
    { label: 'Industry Standards', type: 'standards' },
    { label: 'Enroll Now', type: 'enroll' },
  ];

  const allCourses = Object.keys(COURSE_DETAIL[domain]?.[duration] || {});
  const relatedCourses = allCourses.filter((c) => c !== courseName).slice(0, 2);

  const actions: ActionChip[] = relatedCourses.map((name) => ({
    label: `Explore: ${name}`,
    type: 'course',
    domain,
    duration,
    courseName: name,
  }));

  return createAssistantMessage(
    `### ${courseName}\n\n${detail.brief}\n\n**Core Skills Built:**\n${skillList}`,
    actions,
    suggestions
  );
}

export function findCourseMatch(query: string): Array<{ domain: string; duration: string; courseName: string }> {
  const normalizedQuery = query.toLowerCase();
  const matches: Array<{ domain: string; duration: string; courseName: string }> = [];

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

  const ignoredWords = new Set([
    'a', 'about', 'all', 'are', 'course', 'courses', 'details', 'do', 'for', 'give',
    'i', 'in', 'is', 'me', 'of', 'please', 'tell', 'the', 'this', 'what', 'which', 'with',
    'ai', 'artificial', 'intelligence', 'cyber', 'cybersecurity', 'security'
  ]);
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
}

export function handleLocalIntent(query: string): ChatMessageItem | null {
  const q = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hie|hye|hey|heya|hello|sup|what'?s up|good morning|good evening|howdy|yo)[\s!?.]*$/.test(q)) {
    return createAssistantMessage(
      'Hello! I am your **TSE AI Educational Assistant**. I can help you with AI and Cybersecurity curriculum tracks, faculty mentor profiles, virtual labs, and real-world project roadmaps. What would you like to explore?'
    );
  }

  // Farewells
  if (/^(bye|bie|byee|byeee|goodbye|good bye|cya|see ya|see you|take care|tata|later)[\s!?.]*$/.test(q)) {
    return createAssistantMessage(
      'Goodbye! It was great talking with you. Feel free to come back anytime you have questions about our cybersecurity & AI tracks. Best of luck!'
    );
  }

  // Registration / enrollment intent
  if (/(register|enroll|enrol|sign up|signup|join|admission|apply|how to join|how to enroll|how to register|get started|i want to join|i want to enroll|i want to register)/.test(q)) {
    if (typeof window !== 'undefined') {
      window.open('/contact', '_blank');
    }
    return createAssistantMessage(
      "Great! I've opened our consultation & enrollment page for you. You can share your details and our senior security faculty will get in touch with you shortly."
    );
  }

  const domainOnlyQuery = /^(?:show me |tell me about |what are |what is |give me )?(?:ai|artificial intelligence|cyber|cybersecurity|cyber security|ai and cyber|cyber and ai)(?: courses?| programs?| catalogue| catalog)?[?.! ]*$/i.test(q);

  if (domainOnlyQuery) {
    if (q.includes('ai') || q.includes('artificial intelligence')) return buildCatalogMessage('ai');
    return buildCatalogMessage('cyber');
  }

  // Course matches
  const courseMatches = findCourseMatch(q);
  if (courseMatches.length > 0) {
    const uniqueMatches = courseMatches.filter(
      (match, index, allMatches) =>
        allMatches.findIndex((candidate) => candidate.courseName === match.courseName) === index
    );
    if (uniqueMatches.length === 1) {
      const match = courseMatches[0];
      return buildCourseDetailMessage(match.domain, match.duration, match.courseName);
    }
    return createAssistantMessage(
      `I found **${uniqueMatches[0].courseName}** in more than one track. Please choose a duration to see the detailed curriculum:`,
      uniqueMatches.map((match) => ({
        label: match.duration,
        type: 'course',
        domain: match.domain,
        duration: match.duration,
        courseName: match.courseName,
      }))
    );
  }

  // AI catalog
  if (/\b(ai|artificial intelligence|machine learning|ml|data science|gen ai|genai)\b/.test(q) && !q.includes('mentor') && !q.includes('project') && !q.includes('standard')) {
    return buildCatalogMessage('ai');
  }

  // Cyber catalog
  if (/\b(cyber|cybersecurity|cyber security|hacking|ethical hacking|security|infosec|penetration testing|pentest)\b/.test(q) && !q.includes('mentor') && !q.includes('project') && !q.includes('standard')) {
    return buildCatalogMessage('cyber');
  }

  // General course query
  if (/\b(courses|course|programs|program|what do you offer|what you offer|fellowships|fellowship)\b/.test(q)) {
    return buildCatalogMessage('cyber');
  }

  // Mentors
  if (/cyber\s*mentor/.test(q)) return createAssistantMessage(MENTOR_PROFILES.cyber);
  if (/(ai\s*mentor|artificial intelligence\s*mentor)/.test(q)) return createAssistantMessage(MENTOR_PROFILES.ai);
  if (/(mentor|mentors|instructor|teacher|trainer|who teaches)/.test(q)) return createAssistantMessage(MENTOR_PROFILES.combined);

  // Industry standards / placement
  if (/(industry standard|industry standards|placement|career|job ready|job-ready|hiring|employment)/.test(q)) {
    return createAssistantMessage(SUGGESTIONS.standards);
  }

  // Projects
  if (/(project|projects|real-world project|real world project|capstone|portfolio)/.test(q)) {
    return createAssistantMessage(SUGGESTIONS.projects);
  }

  // TSE Labs
  if (/(tse labs|threadsecurity labs|security labs|virtual labs|cyber lab|cybersecurity lab|lab)/.test(q)) {
    return createAssistantMessage(SUGGESTIONS.labs);
  }

  // Strict Out-of-Scope Guardrail
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
      'I am the **Thread Security Education AI Assistant** and I specialize in our AI, Red Team, Blue Team, and Cybersecurity programs, mentors, virtual labs, and admissions. How can I guide your learning journey today?'
    );
  }

  return null;
}
