import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';
import { createHash, randomBytes } from 'crypto';

export async function issueCertificateService(input: {
  userId: string;
  courseId: string;
  issuerId: string;
  externalPdfUrl?: string;
}) {
  const { userId, courseId, issuerId, externalPdfUrl } = input;

  const [student, course, issuer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { tsIdentity: true },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
    }),
    prisma.user.findUnique({
      where: { id: issuerId },
    }),
  ]);

  if (!student) throw new Error('Student not found.');
  if (!course) throw new Error('Course curriculum not found.');
  if (!issuer) throw new Error('Issuer identity not found.');

  // Check if certificate already exists
  const existing = await prisma.certificate.findFirst({
    where: { userId, courseId },
  });

  if (existing) {
    return { certificate: existing, alreadyIssued: true };
  }

  const certNumber = `CERT-2026-${randomBytes(3).toString('hex').toUpperCase()}`;
  const rawHashPayload = `${student.id}-${course.id}-${Date.now()}-${certNumber}`;
  const verificationHash = createHash('sha256').update(rawHashPayload).digest('hex');

  const certificate = await prisma.certificate.create({
    data: {
      certificateId: certNumber,
      userId: student.id,
      courseId: course.id,
      verificationHash,
      externalPdfUrl: externalPdfUrl || null,
      status: 'ISSUED',
      issuedAt: new Date(),
    },
    include: {
      course: true,
      user: { include: { tsIdentity: true } },
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: student.id,
      title: `Graduation Certificate Issued: ${course.title}`,
      message: `Congratulations! Your official graduation diploma (${certNumber}) has been issued by ${issuer.name}.`,
      type: 'ACADEMIC',
      linkUrl: '/student/certificates',
    },
  }).catch((err) => console.error('[Cert Notification Error]:', err));

  await logAuditEvent({
    actorId: issuerId,
    action: 'CERTIFICATE_ISSUED',
    entity: 'CERTIFICATE',
    entityId: certificate.id,
    details: {
      studentEmail: student.email,
      courseTitle: course.title,
      certificateId: certNumber,
    },
  });

  return { certificate, alreadyIssued: false };
}
