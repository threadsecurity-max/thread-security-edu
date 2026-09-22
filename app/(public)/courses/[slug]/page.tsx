import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/server/database/prisma';
import { getMasterCourseBySlug, MASTER_COURSES } from '@/lib/courses/courseRegistry';
import { BreadcrumbJsonLd, CourseJsonLd } from '@/components/seo/JsonLd';
import {
  ShieldCheck,
  Clock,
  BookOpen,
  Terminal,
  Award,
  CheckCircle2,
  Users,
  ArrowRight,
  PlayCircle,
  FileText,
  Download,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Layers,
  Cpu,
  Lock,
} from 'lucide-react';

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

// ── DYNAMIC SEO METADATA ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fallback = getMasterCourseBySlug(slug);

  let dbCourse: any = null;
  try {
    dbCourse = await prisma.course.findUnique({
      where: { slug },
      select: { title: true, subtitle: true, description: true, category: true },
    });
  } catch (err) {
    // Database transient error handled gracefully
  }

  const course = dbCourse || fallback;

  if (!course) {
    return {
      title: 'Course Not Found',
      description: 'The requested cybersecurity or AI masterclass could not be found.',
    };
  }

  const title = `${course.title} | TSE Masterclass`;
  const description = course.description || course.subtitle;
  const canonicalUrl = `${APP_URL}/courses/${slug}`;

  return {
    title,
    description,
    keywords: [
      course.title,
      course.category,
      'Cybersecurity Training',
      'AI Security Course',
      'Hands-on Sandboxed Labs',
      'Thread Security Education',
      'Verified TS-ID Certification',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Thread Security Education',
      images: [
        {
          url: `${APP_URL}/logos/TSE%20Logo%20Dark.svg`,
          width: 1200,
          height: 630,
          alt: `${course.title} — Thread Security Education`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${APP_URL}/logos/TSE%20Logo%20Dark.svg`],
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallback = getMasterCourseBySlug(slug);

  let dbCourse: any = null;
  try {
    dbCourse = await prisma.course.findUnique({
      where: { slug },
      include: {
        mentor: { include: { user: true } },
        modules: {
          include: { lessons: true },
          orderBy: { orderIndex: 'asc' },
        },
        labs: true,
        assessments: {
          include: { questions: true },
        },
      },
    });
  } catch (error) {
    console.error('[CourseDetailPage] DB lookup transient error:', error);
  }

  // Combine DB data with rich Master Registry fallback
  if (!dbCourse && !fallback) {
    notFound();
  }

  const course = {
    id: dbCourse?.id || fallback?.id || slug,
    slug: dbCourse?.slug || fallback?.slug || slug,
    title: dbCourse?.title || fallback?.title || 'Masterclass',
    subtitle: dbCourse?.subtitle || fallback?.subtitle || '',
    description: dbCourse?.description || fallback?.description || '',
    category: dbCourse?.category || fallback?.category || 'Cyber Security',
    track: fallback?.track || ((dbCourse?.category || '').toLowerCase().includes('ai') ? 'ai' : 'cyber'),
    level: dbCourse?.level || fallback?.level || 'Intermediate',
    durationHours: dbCourse?.durationHours || fallback?.durationHours || 60,
    modules: (dbCourse?.modules && dbCourse.modules.length > 0) ? dbCourse.modules : (fallback?.modules || []),
    labs: (dbCourse?.labs && dbCourse.labs.length > 0) ? dbCourse.labs : (fallback?.labs || []),
    highlights: fallback?.highlights || ['Hands-on Sandbox Labs', 'Mentor Office Hours', 'Cryptographic TS-ID'],
    prerequisites: fallback?.prerequisites || ['Basic computer networking', 'Command-line fundamentals'],
    learningOutcomes: fallback?.learningOutcomes || [
      'Master industry-standard security methodologies',
      'Deploy defensive and offensive countermeasures in isolated sandboxes',
      'Obtain an immutable cryptographic TS-ID verifiable credential',
    ],
    toolsCovered: fallback?.toolsCovered || ['Burp Suite', 'Wireshark', 'Linux', 'Docker'],
    mentor: {
      name: dbCourse?.mentor?.user?.name || fallback?.mentor?.name || 'Kunal Singh',
      role: dbCourse?.mentor?.title || fallback?.mentor?.role || 'Lead Security Architect',
      company: dbCourse?.mentor?.company || fallback?.mentor?.company || 'Thread Security Education',
      bio: dbCourse?.mentor?.bio || fallback?.mentor?.bio || 'Senior security practitioner with enterprise assessment experience.',
    },
    faqs: fallback?.faqs || [
      { q: 'What are the prerequisites for this course?', a: 'Basic familiarity with networking fundamentals and elementary command-line concepts is recommended.' },
      { q: 'How do the practical sandbox labs work?', a: 'Labs are provisioned on-demand in isolated virtual containers directly accessible in your browser.' },
      { q: 'What credential do I receive upon completion?', a: 'You receive a cryptographically signed TSE TS-ID credential with a publicly verifiable URL.' },
    ],
  };

  const isCyber = course.track === 'cyber';

  return (
    <div className="bg-[#05070D] min-h-screen text-white font-sans selection:bg-lime-400 selection:text-black">
      
      {/* ── JSON-LD STRUCTURED DATA (COURSE + BREADCRUMBS) ── */}
      <CourseJsonLd
        name={course.title}
        description={course.description}
        slug={course.slug}
        courseCode={course.id}
        durationHours={course.durationHours}
        level={course.level}
        category={course.category}
        mentorName={course.mentor.name}
        highlights={course.highlights}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Courses', url: '/courses' },
          { name: isCyber ? 'Cybersecurity Track' : 'AI Systems Track', url: `/courses` },
          { name: course.title, url: `/courses/${course.slug}` },
        ]}
      />

      {/* ── BREADCRUMBS NAVIGATION BAR ── */}
      <nav aria-label="Breadcrumb" className="bg-[#080B11] border-b border-slate-800/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-xs font-sans text-slate-400 overflow-x-auto whitespace-nowrap">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <li>
              <Link href="/courses" className="hover:text-white transition-colors">
                Courses
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <li>
              <span className={isCyber ? 'text-lime-400 font-semibold' : 'text-purple-400 font-semibold'}>
                {isCyber ? 'Cybersecurity Architecture' : 'AI Systems Architecture'}
              </span>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <li className="text-white font-bold truncate max-w-xs sm:max-w-md" aria-current="page">
              {course.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── COURSE HERO HEADER ── */}
      <header className="bg-gradient-to-b from-[#080E14] via-[#05070D] to-[#05070D] pt-12 pb-16 border-b border-slate-800/80 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div
          className={`absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full blur-[140px] pointer-events-none ${
            isCyber ? 'bg-lime-500/10' : 'bg-purple-500/10'
          }`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Col: Badges, Title, Subtitle, Highlights */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3.5 py-1 rounded-lg text-xs font-mono font-black uppercase tracking-wider border ${
                    isCyber
                      ? 'bg-lime-950/80 text-lime-300 border-lime-500/60'
                      : 'bg-purple-950/80 text-purple-300 border-purple-500/60'
                  }`}
                >
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
                  {course.level} Level
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs">
                  {course.durationHours} Hours Live
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed font-normal">
                {course.subtitle}
              </p>

              {/* Key Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {course.highlights.map((h: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-black/40 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-200"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`}
                    />
                    <span className="font-medium truncate">{h}</span>
                  </div>
                ))}
              </div>

              {/* Meta metrics bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800/80 text-xs font-sans text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                  <span>{course.durationHours} Hours Practical Workload</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className={`w-4 h-4 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                  <span>{course.modules.length} Core Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className={`w-4 h-4 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                  <span>{course.labs.length} Sandboxed Labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                  <span>Cryptographic TS-ID Verifiable</span>
                </div>
              </div>
            </div>

            {/* Right Col: Sticky Enrollment Action Card */}
            <div className="lg:col-span-4">
              <aside
                aria-label="Course Enrollment"
                className={`p-6 sm:p-7 rounded-3xl border text-left shadow-2xl relative overflow-hidden ${
                  isCyber
                    ? 'bg-gradient-to-br from-[#0c1a10] via-[#08120b] to-[#040805] border-lime-500/40 shadow-[0_0_35px_-5px_rgba(163,230,53,0.3)]'
                    : 'bg-gradient-to-br from-[#1a0c2e] via-[#10071f] to-[#07030f] border-purple-500/40 shadow-[0_0_35px_-5px_rgba(168,85,247,0.3)]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      ENROLLMENT COHORT
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Admissions Open
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      Live Cohort Access
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-normal">
                      Includes 1-on-1 mentorship, cloud sandbox access, capstone evaluation, and verified certification.
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Lead Mentor:</span>
                      <span className="font-bold text-white">{course.mentor.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pace:</span>
                      <span className="font-bold text-white">Part-time (Live Weekend Sessions)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Format:</span>
                      <span className="font-bold text-white">100% Hands-on Terminal Labs</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2.5">
                    <Link href="/contact?topic=enrollment" className="block">
                      <button
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                          isCyber
                            ? 'bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400 hover:from-lime-400 hover:to-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(163,230,53,0.4)]'
                            : 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 hover:from-purple-400 hover:to-fuchsia-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        }`}
                      >
                        <span>Enroll in Upcoming Batch</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>

                    <a
                      href="#syllabus"
                      className="w-full py-3 px-4 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Inspect Curriculum & Syllabus</span>
                    </a>
                  </div>
                </div>
              </aside>
            </div>

          </div>
        </div>
      </header>

      {/* ── COURSE BODY (OVERVIEW, CURRICULUM, LABS, MENTOR, FAQS) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Section 1: Overview & Learning Outcomes */}
        <section aria-labelledby="overview-heading" className="space-y-6 text-left">
          <div className="space-y-2">
            <h2 id="overview-heading" className="text-2xl sm:text-3xl font-black uppercase text-white">
              Course Overview & Objectives
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* What you will learn */}
            <div className="p-7 rounded-3xl bg-[#0B101B] border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                <span>What You Will Master</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                {course.learningOutcomes.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites & Tools */}
            <div className="p-7 rounded-3xl bg-[#0B101B] border border-slate-800 space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className={`w-4 h-4 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                  <span>Prerequisites</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {course.prerequisites.map((p: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Platforms & Tools Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.toolsCovered.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Complete Curriculum (Syllabus) */}
        <section id="syllabus" aria-labelledby="syllabus-heading" className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 id="syllabus-heading" className="text-2xl sm:text-3xl font-black uppercase text-white">
                Detailed Curriculum Modules
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {course.modules.length} modules structured from foundational theory through complex adversarial execution.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {course.durationHours} Total Workload Hours
            </div>
          </div>

          <div className="space-y-4">
            {course.modules.map((m: any, idx: number) => (
              <div
                key={m.id || idx}
                className="p-6 rounded-3xl bg-[#0B101B] border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                        isCyber
                          ? 'bg-lime-950 text-lime-400 border border-lime-500/40'
                          : 'bg-purple-950 text-purple-400 border border-purple-500/40'
                      }`}
                    >
                      MODULE {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">{m.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {m.lessons?.length || 2} Lessons
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {m.description}
                </p>

                {m.lessons && m.lessons.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {m.lessons.map((lesson: any, lIdx: number) => (
                      <div
                        key={lesson.id || lIdx}
                        className="p-3 rounded-xl bg-black/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0">
                          {lesson.durationMinutes || 45}m
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Sandboxed Practical Labs */}
        <section aria-labelledby="labs-heading" className="space-y-6 text-left">
          <div>
            <h2 id="labs-heading" className="text-2xl sm:text-3xl font-black uppercase text-white">
              Hands-on Virtual Sandbox Labs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Zero local hardware dependencies. Provisioned in cloud containers via browser terminal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.labs.map((lab: any, idx: number) => (
              <div
                key={lab.id || idx}
                className="p-6 rounded-3xl bg-[#0B101B] border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400">
                    <Terminal className={`w-3.5 h-3.5 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                    <span>LAB {String(idx + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ~{lab.estimatedMinutes || 45} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{lab.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  {lab.objective}
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Skills Tested:</span>
                  <span className="font-bold text-slate-200">{lab.skills}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Lead Mentor Faculty */}
        <section aria-labelledby="mentor-heading" className="space-y-6 text-left">
          <div>
            <h2 id="mentor-heading" className="text-2xl sm:text-3xl font-black uppercase text-white">
              Faculty & Lead Instructor
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct weekly instruction, live office hours, and code-review feedback.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#0B101B] border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center text-white text-xl font-black shrink-0">
              {course.mentor.name.split(' ').map((n: string) => n[0]).join('')}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white">{course.mentor.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                  {course.mentor.company}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">{course.mentor.role}</p>
              <p className="text-xs sm:text-sm text-slate-300 pt-1 leading-relaxed">
                {course.mentor.bio}
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Course FAQs */}
        <section aria-labelledby="faq-heading" className="space-y-6 text-left">
          <div>
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black uppercase text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Everything you need to know about scheduling, cohort admissions, and lab access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.faqs.map((faq: any, i: number) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#0B101B] border border-slate-800 space-y-2.5"
              >
                <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2">
                  <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isCyber ? 'text-lime-400' : 'text-purple-400'}`} />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Bottom CTA Banner */}
        <section
          aria-labelledby="cta-heading"
          className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 ${
            isCyber
              ? 'bg-gradient-to-r from-[#0c1a10] via-[#07120a] to-[#040805] border-lime-500/40'
              : 'bg-gradient-to-r from-[#1a0c2e] via-[#10071f] to-[#07030f] border-purple-500/40'
          }`}
        >
          <h2 id="cta-heading" className="text-2xl sm:text-4xl font-black uppercase text-white">
            Ready to Master {course.title}?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join the upcoming cohort. Seats are limited to maintain a high faculty-to-student ratio and rigorous sandbox feedback.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/contact?topic=enrollment">
              <button
                className={`py-3.5 px-8 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
                  isCyber
                    ? 'bg-lime-400 hover:bg-lime-300 text-black shadow-[0_0_25px_rgba(163,230,53,0.4)]'
                    : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                }`}
              >
                <span>Apply for Cohort Admission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/courses">
              <button className="py-3.5 px-6 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer">
                Browse All 16 Masterclasses
              </button>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
