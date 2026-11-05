import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { TodaysDocketClient } from '@/components/docket/TodaysDocketClient';

export const metadata = {
  title: "Today's Docket & Work Deliverables | Thread Security Staff",
  description: 'Take work assignments from your Team Lead, report daily progress, upload deliverable proofs and submit work reports.',
};

export const revalidate = 0;

export default async function StaffDocketPage() {
  const user = await getCurrentUser();

  const allowedRoles = [
    'STAFF_EXECUTIVE',
    'STAFF_JUNIOR',
    'SUPER_ADMIN',
    'ADMIN',
    'ACADEMIC_ADMIN',
    'SECURITY_ADMIN',
    'MENTOR',
  ];

  if (!user || !allowedRoles.includes(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Fetch items assigned to this staff member (or created by them)
  let allItems: any[] = [];
  try {
    allItems = await (prisma as any).todaysDocketItem.findMany({
      where: {
        OR: [{ assigneeId: user.userId }, { assignerId: user.userId }],
      },
      include: {
        assigner: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[StaffDocketPage] Error querying docket items:', err);
    allItems = [];
  }

  // Users they can collaborate with or assign (Tier 2/3 staff + mentors)
  let assignableUsers: any[] = [];
  try {
    assignableUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['STAFF_JUNIOR', 'STAFF_EXECUTIVE', 'MENTOR', 'SUPER_ADMIN'],
        },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  } catch {
    assignableUsers = [];
  }

  return (
    <TodaysDocketClient
      currentUser={{
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      initialItems={JSON.parse(JSON.stringify(allItems))}
      assignableUsers={JSON.parse(JSON.stringify(assignableUsers))}
      portalType="staff"
    />
  );
}

