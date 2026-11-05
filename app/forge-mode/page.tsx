import React from 'react';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getForgeModeStatusService,
  isForgeBypassedEmail,
} from '@/server/services/forge.service';
import { ForgeModeClient } from './ForgeModeClient';

export const metadata: Metadata = {
  title: 'Forge Mode Active | Thread Security Developer Maintenance',
  description: 'All panels are currently resting while core system development is taking place.',
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function ForgeModePage() {
  const session = await getSession();
  const status = await getForgeModeStatusService();

  // If Forge Mode is OFF, redirect back to home
  if (!status.isEnabled) {
    redirect('/');
  }

  // If user is logged in with a bypassed testing email, let them straight through!
  if (session && isForgeBypassedEmail(session.email)) {
    if (session.role === 'SUPER_ADMIN') redirect('/admin');
    if (session.role === 'MENTOR') redirect('/mentor');
    if (session.role === 'STUDENT') redirect('/student');
    redirect('/');
  }

  return (
    <ForgeModeClient
      updatedAt={status.updatedAt}
      userEmail={session?.email || null}
    />
  );
}

