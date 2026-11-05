import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { getStudentInvoicesService } from '@/server/services/invoice.service';
import { StudentInvoicesClient } from './student-invoices-client';

export const metadata = {
  title: 'Student Invoices & PDF Receipts | Thread Security Admin',
  description: 'Manage student fee invoices, generate official GST receipts, and dispatch PDF statements to student dashboards.',
};

export const revalidate = 0;

export default async function AdminInvoicesPage() {
  const user = await getCurrentUser();

  if (!user || !isAdminRole(user.role)) {
    redirect('/login?error=UnauthorizedAccess');
  }

  // Fetch all invoices
  const invoices = await getStudentInvoicesService();

  // Fetch enrolled students roster for the invoice issuance dropdown
  let studentsRoster: any[] = [];
  try {
    const rawStudents = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            tsIdentity: { select: { tsId: true } },
          },
        },
        batch: { select: { batchCode: true, title: true } },
      },
      orderBy: { user: { name: 'asc' } },
      take: 200,
    });
    studentsRoster = rawStudents;
  } catch {
    studentsRoster = [
      {
        id: 'student-demo-profile-1',
        user: {
          id: 'user-std-1',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          tsIdentity: { tsId: 'TSE-2026-ARV091' },
        },
        batch: { batchCode: 'BATCH-2026-CYBER-01', title: 'Cyber Threat Defense' },
      },
      {
        id: 'student-demo-profile-2',
        user: {
          id: 'user-std-2',
          name: 'Priya Verma',
          email: 'priya.verma@example.com',
          tsIdentity: { tsId: 'TSE-2026-PRY104' },
        },
        batch: { batchCode: 'BATCH-2026-CYBER-01', title: 'Cyber Threat Defense' },
      },
    ];
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <StudentInvoicesClient
        initialInvoices={JSON.parse(JSON.stringify(invoices))}
        studentsRoster={studentsRoster}
        currentUser={user}
      />
    </div>
  );
}

