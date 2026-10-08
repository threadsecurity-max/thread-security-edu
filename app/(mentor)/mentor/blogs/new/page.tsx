import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createBlogDraft } from '@/server/services/blog.service';

export default async function MentorNewBlogPage() {
  const session = await getSession();

  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/unauthorized');
  }

  const blog = await createBlogDraft(session.userId, 'Untitled Technical Research');
  redirect(`/mentor/blogs/${blog.id}/edit`);
}
