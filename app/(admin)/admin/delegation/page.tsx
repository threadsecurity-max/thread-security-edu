import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { getDelegationWorkspaceDataService } from '@/server/services/delegation.service';
import { PrivilegeDelegationWorkspace } from '@/components/admin/delegation/PrivilegeDelegationWorkspace';

export const metadata: Metadata = {
  title: 'Privilege Delegation & Team Hierarchy | Thread Security Admin',
  description: 'Assemble operational team blocks, assign leads and juniors, link communication edges, and delegate subsystem privileges.',
};

export const revalidate = 0;

export default async function AdminDelegationPage() {
  const user = await getCurrentUser();

  if (!user || !isAdminRole(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const data = await getDelegationWorkspaceDataService();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PrivilegeDelegationWorkspace
        initialEmployees={data.employees}
        initialTeams={JSON.parse(JSON.stringify(data.teams))}
        availableModules={data.availableModules}
      />
    </div>
  );
}

