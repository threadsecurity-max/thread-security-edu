import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getStudentAssessmentsList } from '@/server/services/assessment/analytics.service';
import { StudentAssessmentsClient } from './student-assessments-client';

export const revalidate = 0; // Dynamic server component

export default async function StudentAssessmentsPage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }

  const data = await getStudentAssessmentsList(session.userId);

  return <StudentAssessmentsClient initialData={data as any} />;
}
