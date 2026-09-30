import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { listQuestionFamilies } from '@/server/services/assessment/question-bank.service';
import { FamiliesClient } from './families-client';

export const revalidate = 0;

export default async function FamiliesPage() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const families = await listQuestionFamilies();

  return <FamiliesClient initialFamilies={families as any} />;
}
