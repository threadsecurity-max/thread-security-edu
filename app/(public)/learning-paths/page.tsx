import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Layers, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ScrollFloat from '@/components/ui/ScrollFloat';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Structured Cybersecurity Learning Paths | Career Roadmaps',
  description: 'Step-by-step career progression tracks in Offensive Security, SOC Operations, DevSecOps, and AI Red Teaming designed to accelerate professional transitions.',
  keywords: [
    'Cybersecurity Learning Paths',
    'Ethical Hacking Career Roadmap',
    'SOC Analyst Roadmap',
    'DevSecOps Career Path',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/learning-paths`,
  },
  openGraph: {
    title: 'Cybersecurity Learning Paths | Thread Security Education',
    description: 'Step-by-step career progression tracks in Offensive Security, SOC Operations, DevSecOps, and AI Red Teaming.',
    url: `${APP_URL}/learning-paths`,
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

const FALLBACK_PATHS = [
  {
    id: 'path-offensive-security',
    title: 'Offensive Security & Ethical Hacking Track',
    description: 'Master practical penetration testing, vulnerability discovery, active directory exploitation, and red teaming methodology.',
    level: 'INTERMEDIATE',
    courses: [
      {
        id: 'c1',
        course: {
          title: 'Certified Ethical Hacker & Network Defense',
          slug: 'ethical-hacking-network-defense',
          category: 'Offensive Security',
          subtitle: 'Core reconnaissance, protocol exploitation, and automated network vulnerability scanning.',
        },
      },
      {
        id: 'c2',
        course: {
          title: 'Advanced Web Application Penetration Testing',
          slug: 'web-app-penetration-testing',
          category: 'Web Security',
          subtitle: 'OWASP Top 10, API testing, SQL injection, and deserialization weaponization.',
        },
      },
    ],
  },
  {
    id: 'path-soc-operations',
    title: 'SOC Analyst & Incident Response Specialization',
    description: 'Real-world blue team operations, SIEM correlation, network threat hunting, and enterprise breach containment.',
    level: 'BEGINNER',
    courses: [
      {
        id: 'c3',
        course: {
          title: 'SOC Analyst Fundamentals & Log Analysis',
          slug: 'soc-analyst-fundamentals',
          category: 'Blue Team / SOC',
          subtitle: 'SIEM alerting, packet capture forensics, and real-time threat detection workflows.',
        },
      },
      {
        id: 'c4',
        course: {
          title: 'Enterprise Incident Response & Malware Analysis',
          slug: 'incident-response-forensics',
          category: 'Digital Forensics',
          subtitle: 'Host triage, volatile memory acquisition, and root cause timeline reconstruction.',
        },
      },
    ],
  },
  {
    id: 'path-devsecops',
    title: 'DevSecOps & Cloud Security Architecture',
    description: 'Integrate automated SAST/DAST pipelines, container hardening, and AWS/GCP infrastructure defense.',
    level: 'ADVANCED',
    courses: [
      {
        id: 'c5',
        course: {
          title: 'Kubernetes & Container Hardening in CI/CD',
          slug: 'cloud-devsecops-mastery',
          category: 'Cloud Security',
          subtitle: 'Docker image scanning, admission controllers, and zero-trust cloud infrastructure.',
        },
      },
    ],
  },
];

export default async function LearningPathsPage() {
  let paths: any[] = [];

  try {
    const fetchedPaths = await prisma.learningPath.findMany({
      include: {
        courses: {
          include: { course: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (fetchedPaths && fetchedPaths.length > 0) {
      paths = fetchedPaths;
    }
  } catch (error) {
    console.warn('[LearningPathsPage] Database query transient warning, using fallback paths:', error);
  }

  if (paths.length === 0) {
    paths = FALLBACK_PATHS;
  }

  return (
    <div className="py-16 bg-[#F7F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12">
          <Badge variant="security" className="mb-2">CAREER ROADMAPS</Badge>
          <ScrollFloat
            as="h1"
            animationDuration={0.8}
            ease="back.inOut(2)"
            scrollStart="top bottom-=10%"
            scrollEnd="bottom center"
            stagger={0.02}
            containerClassName="text-left"
            textClassName="tse-h1 text-black font-sans font-bold"
          >
            Structured Learning Paths
          </ScrollFloat>
          <p className="tse-body text-muted max-w-2xl mt-2">
            Step-by-step career acceleration paths designed to transition students into specialized cybersecurity roles.
          </p>
        </div>

        <div className="space-y-10">
          {paths.map((path: any) => (
            <div key={path.id} className="p-8 rounded-2xl bg-white border border-border shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="security" className="font-mono">{path.level}</Badge>
                    <span className="text-xs text-muted font-mono">{path.courses.length} Sequenced Courses</span>
                  </div>
                  <h2 className="tse-h2 text-black font-sans font-bold">{path.title}</h2>
                  <p className="tse-body text-muted mt-1">{path.description}</p>
                </div>
                <Link href="/register">
                  <Button variant="security" className="shrink-0 gap-2">
                    Enroll in Path
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Sequenced Course Timeline */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-mono uppercase text-muted tracking-wider">Sequenced Progression</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {path.courses.map((item: any, idx: number) => (
                    <div key={item.id} className="p-4 rounded-xl border border-border bg-[#F7F9FA] flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-security-green flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-mono text-security-green-dark font-bold block">{item.course?.category || 'Security Specialization'}</span>
                        <Link href={`/courses/${item.course?.slug || '#'}`} className="font-bold text-primary text-sm hover:underline">
                          {item.course?.title || 'Advanced Training Module'}
                        </Link>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{item.course?.subtitle || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
