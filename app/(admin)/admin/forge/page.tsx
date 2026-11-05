import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { getForgeStatusAction } from '@/features/forge/actions/forge.actions';
import { AdminForgeControlClient } from './AdminForgeControlClient';

export const metadata: Metadata = {
  title: 'Forge Mode Control | Thread Security Admin',
  description: 'Manage system-wide developer forge mode and put panels to rest during maintenance.',
};

export const revalidate = 0;

export default async function AdminForgePage() {
  const user = await getCurrentUser();

  if (!user || !isAdminRole(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  const forgeStatus = await getForgeStatusAction();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminForgeControlClient initialStatus={forgeStatus} />
    </div>
  );
}

