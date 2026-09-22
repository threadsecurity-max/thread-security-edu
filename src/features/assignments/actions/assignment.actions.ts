'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';
import { saveAssignmentFile, MAX_FILE_SIZE_BYTES } from '@/lib/upload/assignment-storage';
import { logAuditEvent } from '@/server/security/audit';

/**
 * Creates a new Assignment for an entire Batch
 */
export async function createAssignmentAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Only faculty mentors and admins can create assignments.' };
  }

  const batchId = formData.get('batchId') as string;
  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const moduleId = (formData.get('moduleId') as string)?.trim() || null;
  const moduleNotes = (formData.get('moduleNotes') as string)?.trim() || null;
  const scheduledAtRaw = formData.get('scheduledAt') as string;
  const deadlineRaw = formData.get('deadline') as string;
  const gradingType = (formData.get('gradingType') as string) || 'GRADE';
  const numberMaxScoreRaw = formData.get('numberMaxScore') as string;
  const file = formData.get('file') as File | null;

  if (!batchId) {
    return { success: false, error: 'Please select a batch for this assignment.' };
  }
  if (!title || title.length < 3) {
    return { success: false, error: 'Assignment title must be at least 3 characters.' };
  }
  if (!deadlineRaw) {
    return { success: false, error: 'Assignment deadline is required.' };
  }

  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : new Date();
  const deadline = new Date(deadlineRaw);

  if (isNaN(deadline.getTime())) {
    return { success: false, error: 'Invalid deadline date format.' };
  }

  if (deadline <= scheduledAt) {
    return { success: false, error: 'Deadline must be after the scheduled assignment date.' };
  }

  const numberMaxScore = numberMaxScoreRaw ? parseInt(numberMaxScoreRaw, 10) : 100;
  if (gradingType === 'NUMBER' && ![5, 20, 50, 100].includes(numberMaxScore)) {
    return { success: false, error: 'Invalid maximum score range. Supported scales: 0-5, 0-20, 0-50, 0-100.' };
  }

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  if (file && file.size > 0) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `Uploaded file exceeds the maximum allowed size of 2.5 MB. (Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }
    try {
      const uploadRes = await saveAssignmentFile(file, 'mentor');
      fileUrl = uploadRes.fileUrl;
      fileName = uploadRes.fileName;
      fileSize = uploadRes.fileSize;
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload assignment file.' };
    }
  }

  try {
    const assignment = await (prisma as any).assignment.create({
      data: {
        title,
        description,
        batchId,
        moduleId: moduleId || null,
        moduleNotes,
        scheduledAt,
        deadline,
        gradingType: gradingType === 'NUMBER' ? 'NUMBER' : 'GRADE',
        numberMaxScore: gradingType === 'NUMBER' ? numberMaxScore : null,
        fileUrl,
        fileName,
        fileSize,
        createdById: session.userId,
      },
      include: {
        batch: {
          include: {
            students: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Notify batch students
    if (assignment.batch?.students) {
      for (const student of assignment.batch.students) {
        if (student.user?.id) {
              await (prisma as any).notification.create({
                data: {
                  userId: student.user.id,
                  title: `New Assignment: ${title}`,
                  message: `Your mentor assigned "${title}". Deadline: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                  type: 'ACADEMIC',
                  linkUrl: '/student/assignments',
                },
              }).catch(() => {});
        }
      }
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'ASSIGNMENT_CREATED',
      entity: 'ASSIGNMENT',
      entityId: assignment.id,
      details: `Mentor ${session.email} published assignment "${title}" to batch ${assignment.batch?.batchCode}`,
    });

    revalidatePath('/mentor/assignments');
    revalidatePath('/student/assignments');

    const fullAssignment = await (prisma as any).assignment.findUnique({
      where: { id: assignment.id },
      include: {
        batch: true,
        module: true,
        submissions: {
          include: {
            student: {
              include: { tsIdentity: true },
            },
          },
        },
      },
    });

    return { success: true, assignmentId: assignment.id, assignment: fullAssignment || assignment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create assignment.' };
  }
}

/**
 * Student Assignment Submission Action
 * Strictly verifies server-side UTC timestamp against deadline to prevent tampering!
 */
export async function submitAssignmentAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: You must be logged in to submit assignments.' };
  }

  const assignmentId = formData.get('assignmentId') as string;
  const notes = (formData.get('notes') as string)?.trim() || null;
  const file = formData.get('file') as File | null;

  if (!assignmentId) {
    return { success: false, error: 'Assignment identifier is missing.' };
  }

  // Fetch assignment from database
  const assignment = await (prisma as any).assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    return { success: false, error: 'Assignment not found.' };
  }

  // ANTI-TAMPERING DEADLINE CHECK USING SERVER UTC TIME
  const serverNow = new Date();
  const deadline = new Date(assignment.deadline);

  if (serverNow > deadline) {
    // Record locked overdue submission with score 0 / Fail
    await (prisma as any).assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: session.userId,
        },
      },
      update: {
        status: 'LOCKED_OVERDUE',
        score: 0,
        grade: 'F',
        isPassing: false,
        remarks: 'Deadline elapsed. Submissions are permanently locked and scored 0.',
      },
      create: {
        assignmentId,
        studentId: session.userId,
        status: 'LOCKED_OVERDUE',
        score: 0,
        grade: 'F',
        isPassing: false,
        remarks: 'Deadline elapsed. Submissions are permanently locked and scored 0.',
        submittedAt: serverNow,
      },
    }).catch(() => {});

    return {
      success: false,
      error: `Assignment deadline has passed (${deadline.toLocaleString()}). Submissions are locked and scored 0.`,
    };
  }

  if (!file || file.size === 0) {
    return { success: false, error: 'Please select a file to submit.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 2.5 MB maximum limit. (Selected size: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
    };
  }

  let uploadRes;
  try {
    uploadRes = await saveAssignmentFile(file, 'student');
  } catch (err: any) {
    return { success: false, error: err.message || 'File upload failed.' };
  }

  try {
    const submission = await (prisma as any).assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: session.userId,
        },
      },
      update: {
        fileUrl: uploadRes.fileUrl,
        fileName: uploadRes.fileName,
        fileSize: uploadRes.fileSize,
        notes,
        status: 'SUBMITTED',
        submittedAt: serverNow,
      },
      create: {
        assignmentId,
        studentId: session.userId,
        fileUrl: uploadRes.fileUrl,
        fileName: uploadRes.fileName,
        fileSize: uploadRes.fileSize,
        notes,
        status: 'SUBMITTED',
        submittedAt: serverNow,
      },
    });

    await logAuditEvent({
      actorId: session.userId,
      action: 'ASSIGNMENT_SUBMITTED',
      entity: 'ASSIGNMENT_SUBMISSION',
      entityId: submission.id,
      details: `Student ${session.email} submitted assignment "${assignment.title}" (${uploadRes.fileName}, ${(uploadRes.fileSize / 1024).toFixed(1)} KB)`,
    });

    revalidatePath('/student/assignments');
    revalidatePath('/mentor/assignments');

    const fullSubmission = await (prisma as any).assignmentSubmission.findUnique({
      where: { id: submission.id },
      include: {
        student: {
          include: { tsIdentity: true },
        },
      },
    });

    return { success: true, submissionId: submission.id, submission: fullSubmission || submission };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to record assignment submission.' };
  }
}

/**
 * Mentor Grade and Remark Submission Action
 * Supports Grade-based (S, A, B, C, D, F) and Number-based (0-5, 0-20, 0-50, 0-100)
 * Rule: < 25% is automatically calculated as FAIL!
 */
export async function gradeSubmissionAction(input: {
  submissionId: string;
  grade?: string;
  score?: number;
  remarks?: string;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
    return { success: false, error: 'Unauthorized: Only faculty mentors and admins can grade submissions.' };
  }

  const { submissionId, grade, score, remarks } = input;

  if (!submissionId) {
    return { success: false, error: 'Submission ID is required.' };
  }

  const submission = await (prisma as any).assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: true, student: true },
  });

  if (!submission) {
    return { success: false, error: 'Submission record not found.' };
  }

  const assignment = submission.assignment;
  let isPassing = true;
  let finalGrade: string | null = null;
  let finalScore: number | null = null;

  if (assignment.gradingType === 'GRADE') {
    const validGrades = ['S', 'A', 'B', 'C', 'D', 'F'];
    const cleanGrade = (grade || '').trim().toUpperCase();
    if (!validGrades.includes(cleanGrade)) {
      return { success: false, error: 'Invalid grade. Permitted grades: S, A, B, C, D, F.' };
    }
    finalGrade = cleanGrade;
    isPassing = cleanGrade !== 'F';
  } else {
    // Number-based grading
    const maxScore = assignment.numberMaxScore || 100;
    if (typeof score !== 'number' || isNaN(score) || score < 0 || score > maxScore) {
      return {
        success: false,
        error: `Invalid score. Must be a number between 0 and ${maxScore}.`,
      };
    }
    finalScore = score;
    const percentage = (score / maxScore) * 100;
    // Strictly fail if less than 25%
    isPassing = percentage >= 25;
    if (percentage >= 90) finalGrade = 'S';
    else if (percentage >= 80) finalGrade = 'A';
    else if (percentage >= 65) finalGrade = 'B';
    else if (percentage >= 50) finalGrade = 'C';
    else if (percentage >= 25) finalGrade = 'D';
    else finalGrade = 'F';
  }

  try {
    const updated = await (prisma as any).assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: finalGrade,
        score: finalScore,
        isPassing,
        remarks: remarks?.trim() || null,
        status: 'GRADED',
        gradedAt: new Date(),
        gradedById: session.userId,
      },
    });

    // Notify student of grading result
    if (submission.student?.id) {
      await (prisma as any).notification.create({
        data: {
          userId: submission.student.id,
          title: `Assignment Graded: ${assignment.title}`,
          message: `Your mentor reviewed your submission. Score/Grade: ${finalGrade || finalScore} (${isPassing ? 'PASSED ✓' : 'FAILED ✗'}). ${remarks ? `Remarks: "${remarks}"` : ''}`,
          type: 'ACADEMIC',
          linkUrl: '/student/assignments',
        },
      }).catch(() => {});
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'ASSIGNMENT_GRADED',
      entity: 'ASSIGNMENT_SUBMISSION',
      entityId: submissionId,
      details: `Mentor ${session.email} evaluated student ${submission.student?.email} on "${assignment.title}". Grade: ${finalGrade}, Score: ${finalScore}, Result: ${isPassing ? 'PASS' : 'FAIL'}`,
    });

    revalidatePath('/mentor/assignments');
    revalidatePath('/student/assignments');

    return { success: true, isPassing, grade: finalGrade, score: finalScore };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to grade submission.' };
  }
}
