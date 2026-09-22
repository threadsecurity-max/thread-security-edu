import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { MentorBlogDashboardClient } from '@/components/blog/mentor-blog-dashboard-client';

export default async function MentorBlogsDashboardPage() {
  const session = await getSession();

  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login');
  }

  return <MentorBlogDashboardClient user={session} />;
}
