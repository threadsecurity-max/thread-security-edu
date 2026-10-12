import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { UsersDirectoryClient, UserRecord } from './users-directory-client';

export const metadata = {
  title: 'Unified Users Directory | Thread Security Admin',
  description: 'Manage all students, guests, faculty mentors, and admin accounts.',
};

export const revalidate = 0;

export default async function AdminUsersDirectoryPage() {
  const session = await getSession();
  if (
    !session ||
    (session.role !== 'SUPER_ADMIN' &&
      session.role !== 'ACADEMIC_ADMIN' &&
      session.role !== 'SECURITY_ADMIN')
  ) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const [
    rawUsers,
    studentsCount,
    mentorsCount,
    staffCount,
    secAdminsCount,
    superAdminsCount,
    batches,
  ] = await Promise.all([
    prisma.user.findMany({
      include: {
        tsIdentity: true,
        studentProfile: {
          select: { phone: true, batchId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'MENTOR' } }),
    prisma.user.count({
      where: { role: { in: ['ACADEMIC_ADMIN', 'CONTENT_MANAGER'] } },
    }),
    prisma.user.count({ where: { role: 'SECURITY_ADMIN' } }),
    prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
    prisma.batch.findMany({
      select: { id: true, batchCode: true, title: true },
      orderBy: { batchCode: 'asc' },
    }),
  ]);

  const users: UserRecord[] = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    isDashboardAccessGranted: u.isDashboardAccessGranted,
    tsId: u.tsIdentity?.tsId || null,
    phone: u.studentProfile?.phone || null,
    batchId: u.studentProfile?.batchId || null,
    createdAt: u.createdAt.toISOString(),
  }));

  const metrics = {
    total: rawUsers.length,
    students: studentsCount,
    mentors: mentorsCount,
    staff: staffCount,
    securityAdmins: secAdminsCount,
    superAdmins: superAdminsCount,
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-violet-600" />
          <span className="text-[11px] font-semibold tracking-wider text-violet-600 uppercase">
            Platform Identity &amp; Account Control
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Unified Users Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive roster of students, guests, faculty mentors, content managers, and security administrators.
        </p>
      </div>

      <UsersDirectoryClient
        initialUsers={users}
        metrics={metrics}
        batches={batches}
        currentUserId={session.userId}
        defaultEnvKeys={{
          adminSecretKey: process.env.ADMIN_SECRET_KEY || 'TSE-ADMIN-8080',
          adminPasskey: process.env.ADMIN_PASSKEY || 'ThreadSec@789',
          mentorSecretKey: process.env.MENTOR_SECRET_KEY || 'TSE-MENTOR-78987',
          mentorPasskey: process.env.MENTOR_PASSKEY || 'MentorThreadSec@525',
          securityAdminSecretKey: process.env.SECURITY_ADMIN_SECRET_KEY || 'TSE-SEC-ADMIN-789',
          securityAdminPasskey: process.env.SECURITY_ADMIN_PASSKEY || 'ThreadSec@789789789',
        }}
      />
    </div>
  );
}
