import { redirect } from 'next/navigation';
import { getSession, hasMentorClearance } from '@/lib/auth/session';
import { MentorVerifyClient } from './mentor-verify-client';

export const metadata = {
  title: 'Mentor Faculty Clearance Verification | Thread Security Education',
  description: 'Cryptographic security challenge for faculty mentors.',
};

export default async function MentorVerifyPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Only allow mentors and admins
  if (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN') {
    redirect('/login?error=UnauthorizedAccess');
  }

  // If already verified, direct to mentor dashboard
  const isVerified = await hasMentorClearance();
  if (isVerified && session.role === 'MENTOR') {
    redirect('/mentor');
  }

  return (
    <MentorVerifyClient
      mentorEmail={session.email}
      mentorName={session.name || 'Faculty Mentor'}
    />
  );
}
