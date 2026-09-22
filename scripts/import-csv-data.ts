import { PrismaClient, RoleType, CourseLevel, PublicationStatus, CertificateStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

function cleanString(str: string | undefined): string {
  if (!str) return '';
  return str.trim().replace(/^["']|["']$/g, '');
}

async function main() {
  console.log('🚀 Starting CSV Import of 77 Student Records into Prisma Postgres...');

  const csvPath = path.join(process.cwd(), 'TS_CERTIFICATE_VERIFICATION_DATA - Sheet2.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const rawContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length <= 1) {
    console.log('⚠️ CSV file is empty or contains header only.');
    return;
  }

  const header = parseCSVLine(lines[0]);
  console.log(`📋 Header fields parsed: ${header.length}`);

  // Create or verify base mentor
  let baseMentor = await prisma.mentorProfile.findFirst();
  if (!baseMentor) {
    const mentorUser = await prisma.user.create({
      data: {
        email: 'threadsecuritymentor@gmail.com',
        name: 'TS-Mentor-Dummy-01',
        passwordHash: 'TS2619',
        role: RoleType.MENTOR,
      },
    });
    baseMentor = await prisma.mentorProfile.create({
      data: {
        userId: mentorUser.id,
        title: 'Lead Security Instructor',
        company: 'Thread Security Education',
        bio: 'Senior Security Practitioner and Academic Mentor.',
        expertise: 'Cybersecurity, VAPT, Bug Bounty, AI Security',
      },
    });
  }

  // Pre-define / upsert distinct Courses from CSV
  const courseMap = new Map<string, string>(); // courseName -> courseId

  const defaultCourses = [
    { title: 'Cyber Security', category: 'Cybersecurity Foundations', slug: 'cyber-security' },
    { title: 'Bug Bounty', category: 'VAPT', slug: 'bug-bounty' },
    { title: 'AI & Machine Learning', category: 'AI Security', slug: 'ai-machine-learning' },
    { title: 'Blue Teaming', category: 'SOC & Blue Team', slug: 'blue-teaming' },
    { title: 'Red Teaming', category: 'VAPT', slug: 'red-teaming' },
    { title: 'Data Analysis with AI', category: 'AI Security', slug: 'data-analysis-ai' },
    { title: 'Vulnerability Assessment & Penetration Testing', category: 'VAPT', slug: 'vapt-full-stack' },
  ];

  for (const c of defaultCourses) {
    const dbCourse = await prisma.course.upsert({
      where: { slug: c.slug },
      update: { title: c.title, category: c.category },
      create: {
        slug: c.slug,
        title: c.title,
        subtitle: `Professional ${c.title} Training Program by Thread Security`,
        description: `Comprehensive hands-on training course in ${c.title}.`,
        category: c.category,
        level: CourseLevel.INTERMEDIATE,
        durationHours: 32.0,
        status: PublicationStatus.PUBLISHED,
        mentorId: baseMentor.id,
      },
    });
    courseMap.set(c.title.toLowerCase(), dbCourse.id);
  }

  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 7) continue;

    const fullName = cleanString(cols[0]);
    const firstName = cleanString(cols[1]);
    const lastName = cleanString(cols[2]);
    const emailRaw = cleanString(cols[3]).toLowerCase();
    const phone = cleanString(cols[4]);
    const courseTitle = cleanString(cols[5]);
    const tsId = cleanString(cols[6]);
    const certTsId = cleanString(cols[7]);
    const startDateStr = cleanString(cols[8]);
    const endDateStr = cleanString(cols[9]);
    const certLink = cleanString(cols[10]);
    const isIssued = cleanString(cols[11]).toUpperCase() === 'TRUE';

    if (!emailRaw || !emailRaw.includes('@')) continue;

    const name = fullName || `${firstName} ${lastName}`.trim() || 'Student';

    // Find course ID
    let courseId = courseMap.get(courseTitle.toLowerCase());
    if (!courseId) {
      const slug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newCourse = await prisma.course.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          title: courseTitle,
          subtitle: `${courseTitle} Specialization Program`,
          description: `Specialization program in ${courseTitle}`,
          category: 'Cybersecurity',
          level: CourseLevel.INTERMEDIATE,
          durationHours: 30.0,
          status: PublicationStatus.PUBLISHED,
          mentorId: baseMentor.id,
        },
      });
      courseId = newCourse.id;
      courseMap.set(courseTitle.toLowerCase(), courseId);
    }

    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: emailRaw },
      update: { name },
      create: {
        email: emailRaw,
        name,
        passwordHash: 'MFA_OTP_ONLY',
        role: RoleType.STUDENT,
      },
    });

    // Special handling for developer demo user TS-DUMMY
    const activeTsId = emailRaw === 'threadsecuritydeveloper@gmail.com' ? 'TS-DUMMY' : tsId;
    const activeCertCode = emailRaw === 'threadsecuritydeveloper@gmail.com' ? 'CERT-TS-DUMMY' : (certTsId || (activeTsId ? `CERT-${activeTsId}` : `CERT-${user.id.slice(-6)}`));

    // 2. Upsert TSIdentity
    if (activeTsId) {
      await prisma.tSIdentity.upsert({
        where: { tsId: activeTsId },
        update: { userId: user.id },
        create: {
          tsId: activeTsId,
          userId: user.id,
        },
      });
    }

    // 3. Upsert StudentProfile with phone
    await (prisma.studentProfile.upsert as any)({
      where: { userId: user.id },
      update: { phone, assignedMentorId: baseMentor.id },
      create: {
        userId: user.id,
        phone,
        assignedMentorId: baseMentor.id,
        careerGoal: `${courseTitle} Professional`,
      },
    });

    // 4. Upsert Enrollment
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      update: { progressPercent: 100.0, status: 'COMPLETED' },
      create: {
        userId: user.id,
        courseId,
        progressPercent: 100.0,
        status: 'COMPLETED',
      },
    });

    // 5. Create Certificate if available
    const verificationHash = `hash-${activeCertCode.toLowerCase()}-${user.id.slice(-6)}`;

    await (prisma.certificate.upsert as any)({
      where: { certificateId: activeCertCode },
      update: { externalPdfUrl: certLink, status: CertificateStatus.ISSUED },
      create: {
        certificateId: activeCertCode,
        userId: user.id,
        courseId,
        verificationHash,
        externalPdfUrl: certLink,
        status: CertificateStatus.ISSUED,
      },
    });

    importedCount++;
  }

  console.log(`✅ Successfully imported ${importedCount} student records into Prisma Postgres!`);
}

main()
  .catch((e) => {
    console.error('❌ CSV Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
