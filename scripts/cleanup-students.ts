import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TARGET_EMAIL = 'threadsecuritydeveloper@gmail.com';

async function cleanupStudents() {
  console.log(`Starting cleanup... Preserving ONLY student with email: ${TARGET_EMAIL}`);

  const studentsToDelete = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      email: {
        not: TARGET_EMAIL,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  console.log(`Found ${studentsToDelete.length} students to remove.`);

  if (studentsToDelete.length === 0) {
    console.log('No other students found to delete.');
    return;
  }

  const userIds = studentsToDelete.map((s) => s.id);

  await prisma.$transaction(async (tx) => {
    // 1. Delete certificates
    await tx.certificate.deleteMany({ where: { userId: { in: userIds } } });

    // 2. Delete enrollments
    await tx.enrollment.deleteMany({ where: { userId: { in: userIds } } });

    // 3. Delete progress
    await tx.progress.deleteMany({ where: { userId: { in: userIds } } });

    // 4. Delete lab attempts
    await tx.labAttempt.deleteMany({ where: { userId: { in: userIds } } });

    // 5. Delete student profiles
    await tx.studentProfile.deleteMany({ where: { userId: { in: userIds } } });

    // 6. Delete TS Identities
    await tx.tSIdentity.deleteMany({ where: { userId: { in: userIds } } });

    // 7. Delete Audit logs if any referencing target
    await tx.auditLog.deleteMany({ where: { actorId: { in: userIds } } });

    // 8. Delete Users
    const deleted = await tx.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });

    console.log(`Successfully deleted ${deleted.count} student accounts.`);
  });

  const remaining = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { email: true, name: true, tsIdentity: { select: { tsId: true } } },
  });

  console.log('Remaining students in database:', remaining);
}

cleanupStudents()
  .catch((err) => {
    console.error('Error during cleanup:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
