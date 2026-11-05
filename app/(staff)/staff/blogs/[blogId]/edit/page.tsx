import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getBlogById } from '@/server/services/blog.service';
import { MentorBlogEditorClient } from '@/components/blog/mentor-blog-editor-client';

export const metadata: Metadata = {
  title: 'Edit Blog Article | Thread Security Staff',
  description: 'Author and edit publication articles.',
};

export const revalidate = 0;

export default async function StaffBlogEditPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const session = await getSession();

  const allowedRoles = [
    'STAFF_EXECUTIVE',
    'STAFF_JUNIOR',
    'SUPER_ADMIN',
    'ADMIN',
    'ACADEMIC_ADMIN',
    'SECURITY_ADMIN',
  ];

  if (!session || !allowedRoles.includes(session.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const { blogId } = await params;
  const blog = await getBlogById(blogId);

  if (!blog) {
    redirect('/staff/blogs');
  }

  return (
    <MentorBlogEditorClient
      initialBlog={blog}
      user={{
        userId: session.userId,
        name: session.name || session.email?.split('@')[0] || 'Staff Member',
        email: session.email || '',
        role: session.role,
      }}
      returnHref="/staff/blogs"
    />
  );
}

