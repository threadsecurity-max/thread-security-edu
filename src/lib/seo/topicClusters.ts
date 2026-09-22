export interface TopicCluster {
  id: string;
  pillarTitle: string;
  pillarSlug: string;
  category: string;
  focusKeywords: string[];
  subTopics: { title: string; slug: string; targetRole: string }[];
}

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'soc-operations',
    pillarTitle: 'SOC Analyst & Cyber Threat Defense',
    pillarSlug: '/courses/cyber-threat-defense',
    category: 'Blue Team Operations',
    focusKeywords: ['SOC Analyst Training', 'SIEM Log Analysis', 'Threat Hunting', 'Incident Response'],
    subTopics: [
      { title: 'Hands-on Wireshark Packet Analysis', slug: '/blog/wireshark-packet-analysis-guide', targetRole: 'Junior SOC Analyst' },
      { title: 'SIEM Rule Engineering & Splunk Queries', slug: '/blog/siem-rule-engineering-splunk', targetRole: 'Threat Hunter' },
      { title: 'DFIR Digital Forensics Essentials', slug: '/blog/dfir-digital-forensics-essentials', targetRole: 'Incident Responder' },
    ],
  },
  {
    id: 'red-team-ops',
    pillarTitle: 'Red Team Offensive Operations & VAPT',
    pillarSlug: '/courses/red-team-ops',
    category: 'Ethical Hacking & Red Teaming',
    focusKeywords: ['Red Team Certification', 'VAPT Masterclass', 'Active Directory Exploitation', 'Metasploit Pro'],
    subTopics: [
      { title: 'Active Directory Attack Vectors & Defense', slug: '/blog/active-directory-exploitation-guide', targetRole: 'Penetration Tester' },
      { title: 'Bypassing EDR & AV Evasion Techniques', slug: '/blog/edr-bypass-av-evasion-tactics', targetRole: 'Red Team Operator' },
      { title: 'Web Application Penetration Testing', slug: '/blog/web-app-vapt-owasp-top-10', targetRole: 'Security Auditor' },
    ],
  },
  {
    id: 'cloud-devsecops',
    pillarTitle: 'Cloud Security Engineering & DevSecOps',
    pillarSlug: '/courses/cloud-security-devsecops',
    category: 'Cloud & Infrastructure Security',
    focusKeywords: ['Cloud Security Engineering', 'DevSecOps Pipeline', 'AWS Security Architecture', 'Kubernetes Hardening'],
    subTopics: [
      { title: 'Securing CI/CD Pipelines with SAST & DAST', slug: '/blog/cicd-devsecops-pipeline-security', targetRole: 'DevSecOps Engineer' },
      { title: 'GCP & AWS Cloud IAM Least Privilege Architecture', slug: '/blog/cloud-iam-least-privilege-best-practices', targetRole: 'Cloud Security Architect' },
      { title: 'Kubernetes Container Security & Runtime Protection', slug: '/blog/kubernetes-container-security-guide', targetRole: 'Cloud Infrastructure Security' },
    ],
  },
];

export function getInternalLinksForTopic(category: string) {
  const cluster = TOPIC_CLUSTERS.find(
    (c) => c.category.toLowerCase() === category.toLowerCase() || c.pillarTitle.toLowerCase().includes(category.toLowerCase())
  );
  if (!cluster) return [];

  return [
    { title: cluster.pillarTitle, url: cluster.pillarSlug, isPillar: true },
    ...cluster.subTopics.map((sub) => ({ title: sub.title, url: sub.slug, isPillar: false })),
  ];
}
