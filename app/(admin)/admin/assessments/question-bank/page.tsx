import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { listBankQuestions } from '@/server/services/assessment/question-bank.service';
import { QuestionBankClient } from './question-bank-client';

export const revalidate = 0;

export default async function QuestionBankPage() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const [categories, courses, families, questionsResult] = await Promise.all([
    prisma.testCategory.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
    prisma.questionFamily.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' },
    }),
    listBankQuestions({ page: 1, limit: 15 }),
  ]);

  const formattedFamilies = families.map((f) => ({
    id: f.id,
    familyCode: f.code,
    name: f.name,
  }));

  return (
    <QuestionBankClient
      initialQuestions={questionsResult.questions}
      total={questionsResult.total}
      totalPages={questionsResult.totalPages}
      categories={categories}
      courses={courses}
      families={formattedFamilies}
    />
  );
}
