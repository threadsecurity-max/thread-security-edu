import { PrismaClient, RoleType, CourseLevel, PublicationStatus, LabState, AssessmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TSE LMS database seeding...');

  // Clean existing tables safely
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.studentSkill.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.labAttempt.deleteMany({});
  await prisma.lab.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.courseInPath.deleteMany({});
  await prisma.learningPath.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.mentorProfile.deleteMany({});
  await prisma.tSIdentity.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Core Users & Profiles
  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'threadsecurity@gmail.com',
      name: 'Super Admin (ThreadSecurity)',
      passwordHash: process.env.ADMIN_PASSKEY || 'TSE_DEV_SEED_ONLY',
      role: RoleType.SUPER_ADMIN,
    },
  });

  // Mentor 1: TS-Mentor-Dummy-01
  const mentor1User = await prisma.user.create({
    data: {
      email: 'threadsecuritymentor@gmail.com',
      name: 'TS-Mentor-Dummy-01',
      passwordHash: 'TS2619',
      role: RoleType.MENTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const mentor1Profile = await prisma.mentorProfile.create({
    data: {
      userId: mentor1User.id,
      title: 'Principal Offensive Security Lead',
      company: 'ThreatSec Research Labs',
      bio: '12+ years conducting nation-state threat simulation, zero-day research, and Red Team operations.',
      expertise: 'VAPT, Web Security, Malware Analysis, Exploit Development',
      officeHours: 'Tuesdays & Thursdays, 16:00 - 18:00 UTC',
      totalMentees: 42,
    },
  });

  // Mentor 2: TS-Mentor-Dummy-02
  const mentor2User = await prisma.user.create({
    data: {
      email: 'threadsecuritymentor2@gmail.com',
      name: 'TS-Mentor-Dummy-02',
      passwordHash: 'TS2619',
      role: RoleType.MENTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  });

  const mentor2Profile = await prisma.mentorProfile.create({
    data: {
      userId: mentor2User.id,
      title: 'Distinguished Cloud Security Architect',
      company: 'AWS Security / DefCon Speaker',
      bio: 'Specialist in cloud threat modeling, zero-trust infrastructure, and Kubernetes DevSecOps hardening.',
      expertise: 'Cloud Security, DevSecOps, IAM Architecture, Container Security',
      officeHours: 'Wednesdays, 14:00 - 17:00 UTC',
      totalMentees: 38,
    },
  });

  // Student 1
  const studentUser = await prisma.user.create({
    data: {
      email: 'threadsecuritydeveloper@gmail.com',
      name: 'Thread Security Student',
      passwordHash: 'TS2619',
      role: RoleType.STUDENT,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  const studentTSID = await prisma.tSIdentity.create({
    data: {
      tsId: 'TSE-2026-999',
      userId: studentUser.id,
    },
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      bio: 'Aspiring Penetration Tester focusing on Web Security and Blue Team Defense.',
      careerGoal: 'Cybersecurity SOC Analyst & Junior Red Teamer',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      totalHours: 34.5,
      currentStreak: 12,
      assignedMentorId: mentor1Profile.id,
    },
  });

  // Student Skills
  await prisma.studentSkill.createMany({
    data: [
      { profileId: studentProfile.id, skillName: 'Network Security', score: 85.0 },
      { profileId: studentProfile.id, skillName: 'Web VAPT', score: 78.0 },
      { profileId: studentProfile.id, skillName: 'Linux Hardening', score: 90.0 },
      { profileId: studentProfile.id, skillName: 'Threat Analysis', score: 72.0 },
      { profileId: studentProfile.id, skillName: 'Cloud Security', score: 60.0 },
    ],
  });

  // 2. Create Courses & Curriculum
  // Course 1: Web Application Security & VAPT
  const courseVAPT = await prisma.course.create({
    data: {
      slug: 'web-application-security-vapt',
      title: 'Advanced Web Application Security & VAPT',
      subtitle: 'Master OWASP Top 10 vulnerabilities, automated scanning, manual exploitation, and remediation reporting.',
      description: 'Comprehensive hands-on course covering web architecture, HTTP protocol analysis, SQL Injection, Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF), JWT vulnerabilities, and professional VAPT report writing.',
      category: 'VAPT',
      level: CourseLevel.INTERMEDIATE,
      durationHours: 32.0,
      status: PublicationStatus.PUBLISHED,
      mentorId: mentor1Profile.id,
    },
  });

  // Modules for Course 1
  const module1 = await prisma.module.create({
    data: {
      courseId: courseVAPT.id,
      title: 'Module 1: Web Architecture & Reconnaissance',
      description: 'Understanding modern HTTP/2, DNS enumeration, sub-domain discovery, and asset fingerprinting.',
      orderIndex: 1,
    },
  });

  const lesson1_1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'HTTP Protocol Deep Dive & Burp Suite Setup',
      type: 'VIDEO',
      content: 'In this lesson, we break down request/response headers, status codes, cookies, and configure Burp Suite Community & Professional for active intercepting proxy operations.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      durationMinutes: 45,
      isFreePreview: true,
      orderIndex: 1,
    },
  });

  const lesson1_2 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Passive & Active Reconnaissance Methodologies',
      type: 'ARTICLE',
      content: 'Master OWASP Amass, Nmap script engine (NSE), Sublist3r, and Google Dorking techniques to map an organization external attack surface.',
      durationMinutes: 30,
      isFreePreview: true,
      orderIndex: 2,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      courseId: courseVAPT.id,
      title: 'Module 2: Server-Side Vulnerabilities & Exploitation',
      description: 'In-depth investigation of SQL Injection (SQLi), Command Injection, and SSRF.',
      orderIndex: 2,
    },
  });

  const lesson2_1 = await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: 'SQL Injection: Blind, Error-Based & Time-Based',
      type: 'VIDEO',
      content: 'Understand relational database query construction, union-based extraction, blind boolean extraction, and out-of-band SQLi exploitation.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      durationMinutes: 60,
      isFreePreview: false,
      orderIndex: 1,
    },
  });

  // Lab for Course 1
  const lab1 = await prisma.lab.create({
    data: {
      courseId: courseVAPT.id,
      lessonId: lesson2_1.id,
      title: 'Lab 01: Extracting Admin Hash via Blind SQL Injection',
      objective: 'Bypass authentication and extract the administrator password hash from a target PostgreSQL database using blind boolean-based techniques.',
      difficulty: CourseLevel.INTERMEDIATE,
      estimatedMinutes: 45,
      skills: 'SQL Injection, PostgreSQL, Burp Suite, Python scripting',
      instructions: 'Target endpoint: http://lab-target-01.tse.internal/catalog?category=security. The category parameter is vulnerable to SQL injection.',
      flagHash: 'TSE{5q1_1nj3c710n_m4573r_2026}',
    },
  });

  // Assessment for Course 1
  const assessment1 = await prisma.assessment.create({
    data: {
      courseId: courseVAPT.id,
      title: 'VAPT Mid-Term Qualification Exam',
      description: 'Comprehensive 10-question technical assessment testing HTTP request manipulation, SQLi vulnerability identification, and remediation strategy.',
      passingScore: 75.0,
      status: AssessmentStatus.PUBLISHED,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        assessmentId: assessment1.id,
        prompt: 'Which HTTP response header forces browsers to prevent content from being rendered inside an iframe, mitigating Clickjacking?',
        type: 'MCQ',
        optionsJson: JSON.stringify(['X-Frame-Options', 'X-Content-Type-Options', 'Content-Security-Policy', 'Strict-Transport-Security']),
        correctAnswer: 'X-Frame-Options',
        explanation: 'X-Frame-Options: DENY or SAMEORIGIN instructs the browser not to allow embedding inside iframes.',
        points: 10.0,
      },
      {
        assessmentId: assessment1.id,
        prompt: 'True or False: Prepared Statements (Parameterized Queries) completely neutralize SQL Injection vulnerabilities when used correctly.',
        type: 'TRUE_FALSE',
        optionsJson: JSON.stringify(['True', 'False']),
        correctAnswer: 'True',
        explanation: 'Parameterized queries separate SQL code from user-supplied data at the database driver level.',
        points: 10.0,
      },
    ],
  });

  // Course 2: Cloud Security Architecture & DevSecOps
  const courseCloud = await prisma.course.create({
    data: {
      slug: 'cloud-security-devsecops',
      title: 'Cloud Security Architecture & DevSecOps',
      subtitle: 'Build resilient zero-trust architecture in AWS/GCP, harden CI/CD pipelines, and secure Kubernetes workloads.',
      description: 'Hands-on engineering course covering IAM policy evaluation, terraform security scanning, Docker image vulnerability analysis, and Kubernetes RBAC hardening.',
      category: 'Cloud Security',
      level: CourseLevel.ADVANCED,
      durationHours: 40.0,
      status: PublicationStatus.PUBLISHED,
      mentorId: mentor2Profile.id,
    },
  });

  // Learning Paths
  const path1 = await prisma.learningPath.create({
    data: {
      slug: 'offensive-security-vapt-engineer',
      title: 'Offensive Security & VAPT Engineer Path',
      description: 'Structured path from core security fundamentals to expert penetration testing and vulnerability research.',
      level: CourseLevel.INTERMEDIATE,
      icon: 'ShieldAlert',
    },
  });

  await prisma.courseInPath.create({
    data: {
      learningPathId: path1.id,
      courseId: courseVAPT.id,
      orderIndex: 1,
    },
  });

  // 3. Student Enrollment & Progress Setup
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: studentUser.id,
      courseId: courseVAPT.id,
      progressPercent: 50.0,
      status: 'ACTIVE',
    },
  });

  await prisma.progress.create({
    data: {
      userId: studentUser.id,
      lessonId: lesson1_1.id,
      isCompleted: true,
    },
  });

  await prisma.labAttempt.create({
    data: {
      labId: lab1.id,
      userId: studentUser.id,
      state: LabState.IN_PROGRESS,
      score: 0.0,
      startedAt: new Date(),
    },
  });

  // 4. Issued Certificate for Student
  const certificate = await prisma.certificate.create({
    data: {
      certificateId: 'CERT-2026-X89F2',
      userId: studentUser.id,
      courseId: courseVAPT.id,
      verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      issuedAt: new Date(),
    },
  });

  // 5. Initial Audit Log Entry
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'DATABASE',
      details: 'Initial database seed complete with sample courses, mentors, student profile, and sample lab environment.',
    },
  });

  console.log('✅ TSE LMS Database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
