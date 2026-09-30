import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { listCategories } from '@/server/services/assessment/category.service';
import { CategoriesClient } from './categories-client';

export const revalidate = 0;

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const categories = await listCategories(false);

  return <CategoriesClient initialCategories={categories} />;
}
