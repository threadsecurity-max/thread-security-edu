import fs from 'fs';
import path from 'path';

export interface PageSeoOverride {
  url: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  keywords?: string[];
  updatedAt: string;
}

const STORAGE_FILE = path.join(process.cwd(), 'src', 'data', 'seo-overrides.json');

// In-memory fallback
let inMemoryStore: Record<string, PageSeoOverride> = {
  '/': {
    url: '/',
    metaTitle: 'Thread Security | #1 Cyber & AI Training Institute',
    metaDescription: 'Master hands-on Ethical Hacking, SOC & AI Security in Jalandhar. 100% practical cloud labs, verified TS-ID certification & placement support. Enroll today!',
    focusKeyword: 'thread security',
    keywords: ['thread security', 'cyber security training', 'soc analyst course', 'jalandhar'],
    updatedAt: new Date().toISOString(),
  },
  '/contact': {
    url: '/contact',
    metaTitle: 'Contact Thread Security | Jalandhar Cyber & AI Institute',
    metaDescription: 'Connect with Thread Security Education admissions, cyber range mentors, and corporate training teams in Jalandhar. Request syllabus & fee details.',
    focusKeyword: 'contact thread security',
    keywords: ['contact thread security', 'thread security jalandhar phone', 'cyber security institute jalandhar address'],
    updatedAt: new Date().toISOString(),
  },
  '/courses/binary-exploitation-reverse-engineering': {
    url: '/courses/binary-exploitation-reverse-engineering',
    metaTitle: 'Binary Exploitation & Reverse Engineering [2026 Labs]',
    metaDescription: 'Master x86/x64 assembly, Ghidra, buffer overflows, ROP chain development & exploit analysis in live virtual labs. Enroll at Thread Security.',
    focusKeyword: 'binary exploitation reverse engineering',
    keywords: ['binary exploitation', 'reverse engineering ghidra', 'malware analysis'],
    updatedAt: new Date().toISOString(),
  },
  '/blog/soc-analysis-a-complete-guide-to-modern-security-operations': {
    url: '/blog/soc-analysis-a-complete-guide-to-modern-security-operations',
    metaTitle: 'SOC Analysis: Modern Security Operations [2026 Roadmap]',
    metaDescription: 'Step-by-step SOC analysis roadmap: Master SIEM monitoring, Wazuh, threat hunting & incident triage with hands-on blue team workflows. Start your SOC career!',
    focusKeyword: 'soc analysis',
    keywords: ['soc analysis', 'soc analyst training', 'siem monitoring', 'blue team workflows'],
    updatedAt: new Date().toISOString(),
  },
  '/blog/free-cybersecurity-lab-a-safe-zero-cost-practice-roadmap': {
    url: '/blog/free-cybersecurity-lab-a-safe-zero-cost-practice-roadmap',
    metaTitle: 'Free Cybersecurity Lab: Zero-Cost Practice Roadmap [2026]',
    metaDescription: 'Build a free, safe cybersecurity home lab with zero cloud costs. Step-by-step setup for Kali Linux, sandboxes & threat simulations. Start practicing today!',
    focusKeyword: 'free cybersecurity lab',
    keywords: ['free cybersecurity lab', 'zero cost cyber practice', 'kali linux sandbox'],
    updatedAt: new Date().toISOString(),
  },
  '/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education': {
    url: '/blog/cybersecurity-courses-in-jalandhar-or-thread-security-education',
    metaTitle: 'Cyber Security Course in Jalandhar [2026 Labs & Fees]',
    metaDescription: 'Looking for the best cyber security course in Jalandhar? 100% hands-on cloud labs, ethical hacking certs & verified placement support. Check syllabus & fees!',
    focusKeyword: 'cyber security course in jalandhar',
    keywords: ['cyber security course in jalandhar', 'ethical hacking jalandhar', 'punjab cyber training'],
    updatedAt: new Date().toISOString(),
  },
  '/blog/upi-scam-prevention-why-warnings-fail-and-what-works': {
    url: '/blog/upi-scam-prevention-why-warnings-fail-and-what-works',
    metaTitle: 'UPI Scam Prevention: Why Warnings Fail & How to Stop Fraud',
    metaDescription: 'Understand modern UPI scam mechanics, social engineering psychology & proven banking security defense rules. Stay protected against digital payment fraud.',
    focusKeyword: 'upi scam prevention',
    keywords: ['upi scam prevention', 'cyber fraud awareness', 'banking cyber security'],
    updatedAt: new Date().toISOString(),
  },
  '/blog/why-openai-scrapped-gpt-61-astra-the-safety-story-behind-the-cancelled-launch': {
    url: '/blog/why-openai-scrapped-gpt-61-astra-the-safety-story-behind-the-cancelled-launch',
    metaTitle: 'Why OpenAI Cancelled GPT-6.1 Astra: Inside AI Safety Story',
    metaDescription: 'The real engineering & safety story behind the cancelled GPT-6.1 Astra release. Discover autonomous AI agent risks, red teaming failures & guardrail lessons.',
    focusKeyword: 'gpt-6.1 astra',
    keywords: ['gpt-6.1 astra', 'ai red teaming', 'ai safety guardrails'],
    updatedAt: new Date().toISOString(),
  },
};

export function normalizeUrlKey(urlOrPath: string): string {
  if (!urlOrPath) return '/';
  let key = urlOrPath.trim();
  // Strip domain and protocols
  key = key.replace(/^https?:\/\/(www\.)?threadsecurity\.in/i, '');
  // Strip trailing query parameters
  key = key.split('?')[0];
  if (!key.startsWith('/')) key = `/${key}`;
  if (key.length > 1 && key.endsWith('/')) key = key.slice(0, -1);
  return key.toLowerCase();
}

export function getAllPageSeoOverrides(): Record<string, PageSeoOverride> {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...inMemoryStore, ...parsed };
    }
  } catch (err) {
    console.warn('[Page SEO Store] Read error, using memory fallback:', err);
  }
  return inMemoryStore;
}

export function getPageSeoOverride(urlOrPath: string): PageSeoOverride | null {
  const key = normalizeUrlKey(urlOrPath);
  const all = getAllPageSeoOverrides();
  return all[key] || null;
}

export function savePageSeoOverride(
  urlOrPath: string,
  data: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword?: string;
    keywords?: string[];
  }
): PageSeoOverride {
  const key = normalizeUrlKey(urlOrPath);
  const record: PageSeoOverride = {
    url: key,
    metaTitle: data.metaTitle.trim(),
    metaDescription: data.metaDescription.trim(),
    focusKeyword: data.focusKeyword?.trim(),
    keywords: data.keywords || [],
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore[key] = record;

  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const current = getAllPageSeoOverrides();
    current[key] = record;
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(current, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Page SEO Store] Write error, saved to memory:', err);
  }

  return record;
}
