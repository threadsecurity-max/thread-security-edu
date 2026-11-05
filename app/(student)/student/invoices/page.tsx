import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getStudentInvoicesService } from '@/server/services/invoice.service';
import { StudentInvoicesViewClient } from './student-invoices-view-client';

export const metadata = {
  title: 'My Invoices & Fee Receipts | Thread Security Student Portal',
  description: 'View your official tuition fee invoices, GST tax receipts, and download permanent PDF records.',
};

export const revalidate = 0;

export default async function StudentInvoicesPage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }

  // Get student's profile
  let studentProfile = null;
  try {
    studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            tsIdentity: { select: { tsId: true } },
          },
        },
      },
    });
  } catch {
    studentProfile = null;
  }

  // Fetch invoices for this student profile
  const invoices = await getStudentInvoicesService(studentProfile?.id);

  const studentName = session.name || studentProfile?.user?.name || 'Student Candidate';
  const tsId = session.tsId || studentProfile?.user?.tsIdentity?.tsId || 'TSE-2026-VERIFIED';

  return (
    <StudentInvoicesViewClient
      invoices={JSON.parse(JSON.stringify(invoices))}
      student={{
        name: studentName,
        email: session.email,
        tsId,
      }}
    />
  );
}

