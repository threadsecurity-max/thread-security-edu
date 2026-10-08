import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getStudentDashboardData } from '@/server/services/student-dashboard.service';
import { StudentDashboardClient } from '@/components/student/dashboard/StudentDashboardClient';

export const revalidate = 0; // Live database metrics on every load

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }

  try {
    const data = await getStudentDashboardData(session.userId);
    return <StudentDashboardClient data={data} />;
  } catch (error) {
    console.error('Failed to load student dashboard:', error);
    redirect('/login?error=SessionExpired');
  }
}
