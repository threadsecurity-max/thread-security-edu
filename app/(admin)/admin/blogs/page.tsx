import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminBlogs, getBlogCategories } from '@/server/services/blog.service';
import { AdminBlogDashboardClient } from '@/components/admin/blog/AdminBlogDashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Moderation & Editorial Hub | Thread Security Admin',
  description: 'Review, moderate, and approve faculty research publications before public release.',
};

export default async function AdminBlogsPage() {
  const session = await getSession();

  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN' && session.role !== 'SECURITY_ADMIN')) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const [initialData, categories] = await Promise.all([
    getAdminBlogs({ page: 1, limit: 15 }),
    getBlogCategories(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black/60">
      <AdminBlogDashboardClient
        initialData={initialData}
        categories={categories}
        user={{
          userId: session.userId,
          name: session.name,
          role: session.role,
        }}
      />
    </div>
  );
}
