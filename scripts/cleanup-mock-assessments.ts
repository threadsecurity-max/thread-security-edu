import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting Mock Assessment Data Cleanup...');

  try {
    // We only delete assessment-related tables.
    // Order matters due to foreign keys, although onDelete: Cascade is set on many relations.
    
    console.log('Deleting Assessment Attempts...');
    const attempts = await prisma.assessmentAttempt.deleteMany({});
    console.log(`- Deleted ${attempts.count} attempts.`);

    console.log('Deleting Questions...');
    const questions = await prisma.question.deleteMany({});
    console.log(`- Deleted ${questions.count} questions.`);

    console.log('Deleting Assessments...');
    const assessments = await prisma.assessment.deleteMany({});
    console.log(`- Deleted ${assessments.count} assessments.`);

    console.log('✅ Cleanup Complete. The database is now clean for E2E testing.');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
