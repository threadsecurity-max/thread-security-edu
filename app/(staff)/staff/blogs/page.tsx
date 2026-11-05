import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { MentorBlogDashboardClient } from '@/components/blog/mentor-blog-dashboard-client';

export const metadata: Metadata = {
  title: 'Staff Blog Studio & Publications | Thread Security',
  description: 'Author, edit, and publish technical security articles, laboratory tutorials, and case studies.',
};

export const revalidate = 0;

export default async function StaffBlogsDashboardPage() {
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

  return (
    <MentorBlogDashboardClient
      user={{
        name: session.name || session.email?.split('@')[0] || 'Staff Member',
        email: session.email || '',
        role: session.role,
      }}
      baseHref="/staff/blogs"
    />
  );
}

