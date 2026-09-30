import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { TestBuilderClient } from './test-builder-client';

export const revalidate = 0;

interface PageProps {
  searchParams?: Promise<{ id?: string }>;
}

export default async function TestBuilderPage(props: PageProps) {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const searchParams = props.searchParams ? await props.searchParams : {};
  const testId = searchParams.id;

  const [courses, categories, initialTest] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
    prisma.testCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    testId
      ? prisma.assessment.findUnique({
          where: { id: testId },
        })
      : null,
  ]);

  return (
    <TestBuilderClient
      courses={courses}
      categories={categories}
      initialTest={initialTest ? JSON.parse(JSON.stringify(initialTest)) : undefined}
    />
  );
}
