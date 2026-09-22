import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getBlogById } from '@/server/services/blog.service';
import { MentorBlogEditorClient } from '@/components/blog/mentor-blog-editor-client';

export default async function MentorBlogEditPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const session = await getSession();

  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    redirect('/login');
  }

  const { blogId } = await params;
  const blog = await getBlogById(blogId);

  if (!blog) {
    redirect('/mentor/blogs');
  }

  return <MentorBlogEditorClient initialBlog={blog} user={session} />;
}
