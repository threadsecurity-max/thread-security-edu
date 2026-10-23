import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getMentorBatchesService } from '@/server/services/batch.service';
import { BatchCard } from '@/components/mentor/batch-card';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  FileText,
  Terminal,
  Award,
  Video,
  ClipboardList,
  Globe,
  BookOpen,
  Eye,
  Edit,
  ExternalLink,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';

export const revalidate = 0;

export default async function MentorDashboardPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  // 1. Resolve Mentor Profile for authenticated user
  let mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!mentorProfile && session?.role === 'MENTOR') {
    mentorProfile = await prisma.mentorProfile.create({
      data: {
        userId,
        title: 'Security Mentor',
        company: 'Thread Security',
        bio: 'Cybersecurity Instructor & Content Author',
        expertise: 'Threat Intelligence, SOC & Web Security',
      },
      include: { user: true },
    });
  }

  // 2. Fetch Batches assigned to this mentor
  const batches = await getMentorBatchesService(userId);
  const batchIds = batches.map((b: any) => b.id);
  const courseIds = Array.from(new Set(batches.map((b: any) => b.courseId).filter(Boolean))) as string[];

  // 3. Today's date calculations
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // 4. Extract Sessions and distinct students across this mentor's batches
  const allSessions: any[] = [];
  const batchesMap: Record<string, any> = {};
  const uniqueStudentIds = new Set<string>();

  batches.forEach((b: any) => {
    batchesMap[b.id] = b;
    (b.students || []).forEach((st: any) => {
      const sId = st.userId || st.id;
      if (sId) uniqueStudentIds.add(sId);
    });

    (b.sessions || []).forEach((s: any) => {
      allSessions.push({
        ...s,
        batch: b,
      });
    });
  });

  // Include direct mentees assigned to this mentor
  if (mentorProfile) {
    const directMentees = await prisma.studentProfile.findMany({
      where: { assignedMentorId: mentorProfile.id },
      select: { userId: true, id: true },
    });
    directMentees.forEach((dm) => {
      const sId = dm.userId || dm.id;
      if (sId) uniqueStudentIds.add(sId);
    });
  }

  // 5. Accurate Sessions calculation
  const todaySessions = allSessions.filter((s: any) => {
    const sDate = new Date(s.sessionDate);
    return sDate >= todayStart && sDate <= todayEnd && s.status !== 'CANCELLED';
  });

  const upcomingSessions = allSessions
    .filter((s: any) => new Date(s.sessionDate) > todayEnd && s.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
    .slice(0, 4);

  const activeLecturesToShow = todaySessions.length > 0 ? todaySessions : upcomingSessions;

  // 6. Accurate Pending Attendance (all sessions up to end of today without attendance records)
  const pendingAttendanceCount = allSessions.filter((s: any) => {
    const sDate = new Date(s.sessionDate);
    const isPastOrToday = sDate <= todayEnd;
    const isNotCancelled = s.status !== 'CANCELLED';
    const hasNoRecords = !s.attendanceRecords || s.attendanceRecords.length === 0;
    return isPastOrToday && isNotCancelled && hasNoRecords;
  }).length;

  // 7. Parallel database queries for accurate mentor metrics & blog publications
  const [
    pendingGradingCount,
    totalLabsCount,
    totalAssessmentsCount,
    mentorPublishedBlogsCount,
    mentorTotalBlogsCount,
    mentorDraftBlogsCount,
    latestMentorBlogs,
    latestAcademyBlogs,
  ] = await Promise.all([
    // Accurate pending grading queue for this mentor's batches
    batchIds.length > 0
      ? prisma.assignmentSubmission.count({
          where: {
            status: 'SUBMITTED',
            assignment: {
              batchId: { in: batchIds },
            },
          },
        })
      : prisma.assignmentSubmission.count({
          where: {
            status: 'SUBMITTED',
            assignment: {
              createdById: userId,
            },
          },
        }),
    // Accurate labs count for mentor's courses
    courseIds.length > 0
      ? prisma.lab.count({ where: { courseId: { in: courseIds } } })
      : prisma.lab.count(),
    // Accurate assessments count for mentor's courses
    courseIds.length > 0
      ? prisma.assessment.count({ where: { courseId: { in: courseIds } } })
      : prisma.assessment.count(),
    // Mentor's published blogs
    mentorProfile
      ? prisma.blog.count({
          where: {
            authorId: mentorProfile.id,
            status: 'PUBLISHED',
            OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
          },
        })
      : 0,
    // Mentor's total blogs
    mentorProfile ? prisma.blog.count({ where: { authorId: mentorProfile.id } }) : 0,
    // Mentor's draft blogs
    mentorProfile ? prisma.blog.count({ where: { authorId: mentorProfile.id, status: 'DRAFT' } }) : 0,
    // Mentor's 4 latest articles (any status)
    mentorProfile
      ? prisma.blog.findMany({
          where: { authorId: mentorProfile.id },
          take: 4,
          orderBy: { updatedAt: 'desc' },
          include: {
            category: true,
            seo: true,
          },
        })
      : [],
    // Academy-wide 4 latest published articles
    prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        author: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    }),
  ]);

  const totalStudentsCount = uniqueStudentIds.size;
  const activeBatchesCount = batches.filter((b: any) => b.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 text-slate-900 font-sans max-w-7xl mx-auto pb-12">
      {/* ── 1. GREETING & OVERVIEW HEADER ── */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 tracking-wide uppercase">
              FACULTY PORTAL
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Thread Security Academy
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Welcome back{session?.name ? `, ${session.name.split(' ')[0]}` : ''}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Real-time dashboard for your cohort sessions, student submissions, hands-on lab deployments, and faculty publications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link href="/mentor/blogs/new">
            <button className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
              <Globe className="w-4 h-4 stroke-[2.5]" />
              <span>Write Blog Article</span>
            </button>
          </Link>
          <Link href="/mentor/lectures?create=true">
            <button className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              <span>Schedule Session</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── 2. EIGHT ACCURATE COMPACT METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Link href="/mentor/students" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Students</span>
              <Users className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalStudentsCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">Unique Mentees</span>
          </div>
        </Link>

        <Link href="/mentor/batches" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Active Batches</span>
              <Layers className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{activeBatchesCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">{batches.length} Assigned Total</span>
          </div>
        </Link>

        <Link href="/mentor/today" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Today&apos;s Lectures</span>
              <Clock className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{todaySessions.length}</p>
            <span className="text-[10px] text-slate-400 font-medium">
              {todaySessions.length > 0 ? 'Live Schedule' : 'No Classes Today'}
            </span>
          </div>
        </Link>

        <Link href="/mentor/attendance" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-rose-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Pending Attendance</span>
              <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className={`text-2xl font-bold ${pendingAttendanceCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {pendingAttendanceCount}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Unlogged Sessions</span>
          </div>
        </Link>

        <Link href="/mentor/submissions" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Pending Grading</span>
              <ClipboardList className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingGradingCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">Submissions Queue</span>
          </div>
        </Link>

        <Link href="/mentor/labs" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Target Labs</span>
              <Terminal className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalLabsCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">Course Ranges</span>
          </div>
        </Link>

        <Link href="/mentor/assessments" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Assessments</span>
              <Award className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalAssessmentsCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">Exams & Tests</span>
          </div>
        </Link>

        <Link href="/mentor/blogs" className="block group">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:border-violet-300 group-hover:shadow-sm transition-all flex flex-col justify-between space-y-2 h-full">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Publications</span>
              <Globe className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{mentorPublishedBlogsCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">{mentorTotalBlogsCount} Authored</span>
          </div>
        </Link>
      </div>

      {/* ── 3. TODAY'S SESSIONS ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${todaySessions.length > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <h2 className="text-lg font-bold text-slate-900">
                {todaySessions.length > 0 ? `Today's Schedule (${todaySessions.length})` : 'Class Schedule'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {todaySessions.length > 0
                ? 'Your live lectures, lab sessions, and classes scheduled for today.'
                : 'No live lectures scheduled for today. Viewing upcoming cohort sessions.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/mentor/attendance">
              <button className="text-xs text-violet-700 hover:text-violet-900 flex items-center gap-1 font-semibold cursor-pointer">
                <span>View Attendance</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
            <Link href="/mentor/today">
              <button className="text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-xs cursor-pointer font-medium">
                Open Daily Schedule
              </button>
            </Link>
          </div>
        </div>

        {activeLecturesToShow.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No sessions scheduled</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You have no active classes scheduled today or in the immediate calendar. You can schedule a new lecture session anytime.
            </p>
            <Link href="/mentor/lectures?create=true">
              <button className="mt-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs cursor-pointer">
                Schedule New Lecture
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLecturesToShow.map((sess: any) => {
              const batch = batchesMap[sess.batchId] || sess.batch;
              const hasRecords = sess.attendanceRecords && sess.attendanceRecords.length > 0;
              const sDate = new Date(sess.sessionDate);
              const isToday = sDate >= todayStart && sDate <= todayEnd;

              return (
                <div
                  key={sess.id}
                  className="p-5 rounded-2xl bg-white hover:border-violet-300 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 transition-all text-slate-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 font-mono">
                          {batch?.batchCode || 'COHORT'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {isToday ? 'Today, ' : `${sDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, `}
                          {sDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasRecords
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isToday
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {hasRecords ? 'ATTENDANCE LOGGED' : isToday ? 'PENDING ATTENDANCE' : 'UPCOMING'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        {sess.title}
                      </h4>
                      <span className="text-[11px] text-slate-500 block pt-0.5">
                        Batch: <strong className="text-slate-800">{batch?.title}</strong>
                      </span>
                    </div>

                    {sess.agenda && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {sess.agenda}
                      </p>
                    )}
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <Link href={`/mentor/attendance?batchId=${sess.batchId}&sessionId=${sess.id}`}>
                      <button className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Attendance</span>
                      </button>
                    </Link>

                    <Link href="/mentor/lectures">
                      <button className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <Video className="w-3.5 h-3.5 text-violet-600" />
                        <span>Open Lecture</span>
                      </button>
                    </Link>

                    <Link href="/mentor/labs">
                      <button className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                        <Terminal className="w-3.5 h-3.5 text-violet-600" />
                        <span>Open Lab</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. FACULTY BLOG STUDIO & LATEST PUBLICATIONS SECTION ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Faculty Blog Studio &amp; Latest Publications
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Cybersecurity research papers, student tutorials, and threat advisories authored by you and fellow faculty.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/mentor/blogs/new">
              <button className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>New Article</span>
              </button>
            </Link>
            <Link href="/mentor/blogs">
              <button className="text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-xs cursor-pointer font-medium flex items-center gap-1">
                <span>Open Blog Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>

        {/* Dual Grid: Mentor's Latest Research + Latest Academy Releases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column A: My Authored Research Articles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-violet-600" />
                My Authored Articles ({mentorTotalBlogsCount})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {mentorPublishedBlogsCount} Live · {mentorDraftBlogsCount} Drafts
              </span>
            </div>

            {latestMentorBlogs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">No Articles Authored Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Share your cybersecurity insights, threat intelligence reports, or cohort lecture summaries.
                  </p>
                </div>
                <Link href="/mentor/blogs/new">
                  <button className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs cursor-pointer">
                    Start Writing First Article
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {latestMentorBlogs.map((b: any) => {
                  const isScheduled =
                    b.status === 'PUBLISHED' &&
                    b.publishedAt &&
                    new Date(b.publishedAt).getTime() > Date.now();
                  const isLive = b.status === 'PUBLISHED' && !isScheduled;

                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          {b.category ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {b.category.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Cybersecurity</span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isScheduled
                                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                : b.status === 'REVIEW'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isLive ? 'LIVE' : isScheduled ? 'SCHEDULED' : b.status === 'REVIEW' ? 'IN REVIEW' : 'DRAFT'}
                          </span>
                        </div>

                        <Link
                          href={`/mentor/blogs/${b.id}/edit`}
                          className="font-bold text-slate-900 hover:text-violet-600 transition-colors block text-sm line-clamp-1"
                        >
                          {b.title}
                        </Link>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>{b.readingTime ? `${b.readingTime} min read` : '1 min read'}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            {b.viewCount || 0} reads
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(b.updatedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link href={`/mentor/blogs/${b.id}/edit`}>
                          <button className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit in Blog Studio</span>
                          </button>
                        </Link>

                        {isLive && b.slug && (
                          <Link href={`/blog/${b.slug}`} target="_blank">
                            <button className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer">
                              <span>Read Live</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column B: Latest Academy Publications (Platform-Wide) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                Latest Academy Publications
              </span>
              <Link href="/blog" target="_blank" className="text-[11px] text-violet-700 hover:underline flex items-center gap-1">
                <span>View Public Feed</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>

            {latestAcademyBlogs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-800">No Academy Articles Published Yet</h4>
                <p className="text-xs text-slate-500">
                  Published faculty articles will immediately appear here for peer review and reading.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestAcademyBlogs.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        {b.category ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                            {b.category.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Cybersecurity</span>
                        )}

                        <span className="text-[11px] text-slate-500 font-mono">
                          By {b.author?.user?.name || 'Faculty Lead'}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${b.slug}`}
                        target="_blank"
                        className="font-bold text-slate-900 hover:text-violet-600 transition-colors block text-sm line-clamp-1"
                      >
                        {b.title}
                      </Link>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>{b.readingTime ? `${b.readingTime} min read` : '1 min read'}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {b.viewCount || 0} reads
                        </span>
                        <span>·</span>
                        <span>
                          {b.publishedAt
                            ? new Date(b.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                            : 'Live'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <Link href={`/blog/${b.slug}`} target="_blank">
                        <button className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer">
                          <span>Read Live Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. ASSIGNED COHORT WORKSPACES ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">
                My Assigned Batches ({batches.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Isolated academic workspaces under your direct mentorship and instruction.
            </p>
          </div>

          <Link href="/mentor/batches">
            <button className="text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-xs cursor-pointer font-medium">
              View Batches Directory
            </button>
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Batches Assigned</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Contact your academic administrator to map your mentor account to cohort batches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch: any) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
