import { prisma } from '@/server/database/prisma';
import { DifficultyLevel, QuestionBankStatus } from '@/types/assessment';

export interface QuestionFilterParams {
  search?: string;
  categoryId?: string;
  difficulty?: DifficultyLevel;
  courseId?: string;
  familyId?: string;
  status?: QuestionBankStatus;
  page?: number;
  limit?: number;
}

export interface CreateOptionInput {
  optionText: string;
  isCorrect: boolean;
}

export interface CreateQuestionInput {
  questionFamilyId?: string | null;
  courseId?: string | null;
  categoryId: string;
  topic: string;
  learningObjective?: string | null;
  difficulty: DifficultyLevel;
  questionType?: string;
  marks?: number;
  questionText: string;
  explanation?: string | null;
  status?: QuestionBankStatus;
  options: CreateOptionInput[];
}

export async function listBankQuestions(params: QuestionFilterParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.status) {
    where.status = params.status;
  } else {
    // Default to active unless specified
    where.status = { not: QuestionBankStatus.ARCHIVED };
  }

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  if (params.difficulty) {
    where.difficulty = params.difficulty;
  }

  if (params.courseId) {
    where.courseId = params.courseId;
  }

  if (params.familyId) {
    where.questionFamilyId = params.familyId;
  }

  if (params.search) {
    const q = params.search.trim();
    where.OR = [
      { questionText: { contains: q, mode: 'insensitive' } },
      { topic: { contains: q, mode: 'insensitive' } },
      { learningObjective: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [questions, total] = await Promise.all([
    (prisma as any).bankQuestion.findMany({
      where,
      include: {
        category: true,
        family: true,
        course: { select: { id: true, title: true, slug: true } },
        options: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    (prisma as any).bankQuestion.count({ where }),
  ]);

  return {
    questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBankQuestionById(id: string) {
  return await (prisma as any).bankQuestion.findUnique({
    where: { id },
    include: {
      category: true,
      family: true,
      course: { select: { id: true, title: true, slug: true } },
      options: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export function validateQuestionOptions(options: CreateOptionInput[]): void {
  if (!options || options.length < 2) {
    throw new Error('A question must have at least 2 options.');
  }
  const emptyOptions = options.some((opt) => !opt.optionText || opt.optionText.trim() === '');
  if (emptyOptions) {
    throw new Error('Options cannot have empty text.');
  }

  // Check unique option texts
  const textSet = new Set(options.map((o) => o.optionText.trim().toLowerCase()));
  if (textSet.size !== options.length) {
    throw new Error('Options must contain unique text choices.');
  }

  const correctCount = options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) {
    throw new Error('MCQ questions must designate exactly one correct option.');
  }
}

export async function createBankQuestion(data: CreateQuestionInput) {
  if (!data.questionText || data.questionText.trim() === '') {
    throw new Error('Question text is required.');
  }
  if (!data.categoryId) {
    throw new Error('Category is required.');
  }
  if (!data.topic || data.topic.trim() === '') {
    throw new Error('Topic is required.');
  }
  if (data.marks !== undefined && data.marks <= 0) {
    throw new Error('Marks must be greater than zero.');
  }

  validateQuestionOptions(data.options);

  return await (prisma as any).bankQuestion.create({
    data: {
      questionFamilyId: data.questionFamilyId || null,
      courseId: data.courseId || null,
      categoryId: data.categoryId,
      topic: data.topic.trim(),
      learningObjective: data.learningObjective?.trim() || null,
      difficulty: data.difficulty || DifficultyLevel.MEDIUM,
      questionType: data.questionType || 'MCQ',
      marks: data.marks ?? 1.0,
      questionText: data.questionText.trim(),
      explanation: data.explanation?.trim() || null,
      status: data.status || QuestionBankStatus.ACTIVE,
      options: {
        create: data.options.map((opt, idx) => ({
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          orderIndex: idx,
        })),
      },
    },
    include: {
      category: true,
      family: true,
      options: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function updateBankQuestion(
  id: string,
  data: Partial<CreateQuestionInput>
) {
  const existing = await (prisma as any).bankQuestion.findUnique({
    where: { id },
    include: { options: true },
  });
  if (!existing) throw new Error('Question not found');

  if (data.options) {
    validateQuestionOptions(data.options);
  }

  return await (prisma as any).$transaction(async (tx: any) => {
    // If options are provided, recreate them to avoid stale state
    if (data.options) {
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      await tx.questionOption.createMany({
        data: data.options.map((opt, idx) => ({
          questionId: id,
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          orderIndex: idx,
        })),
      });
    }

    const { options: _, ...updateFields } = data;

    return await tx.bankQuestion.update({
      where: { id },
      data: {
        ...updateFields,
        questionText: updateFields.questionText ? updateFields.questionText.trim() : undefined,
        topic: updateFields.topic ? updateFields.topic.trim() : undefined,
      },
      include: {
        category: true,
        family: true,
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });
  });
}

export async function archiveBankQuestion(id: string) {
  return await (prisma as any).bankQuestion.update({
    where: { id },
    data: { status: QuestionBankStatus.ARCHIVED },
  });
}

export async function duplicateBankQuestion(id: string) {
  const original = await (prisma as any).bankQuestion.findUnique({
    where: { id },
    include: { options: true },
  });
  if (!original) throw new Error('Original question not found');

  return await (prisma as any).bankQuestion.create({
    data: {
      questionFamilyId: original.questionFamilyId,
      courseId: original.courseId,
      categoryId: original.categoryId,
      topic: original.topic,
      learningObjective: original.learningObjective,
      difficulty: original.difficulty,
      questionType: original.questionType,
      marks: original.marks,
      questionText: `${original.questionText} (Copy)`,
      explanation: original.explanation,
      status: QuestionBankStatus.DRAFT,
      options: {
        create: original.options.map((opt: any) => ({
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          orderIndex: opt.orderIndex,
        })),
      },
    },
    include: {
      category: true,
      family: true,
      options: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function bulkImportQuestions(
  records: Array<{
    questionText: string;
    categorySlugOrName: string;
    topic: string;
    difficulty?: string;
    marks?: number;
    explanation?: string;
    familyCode?: string;
    optionA: string;
    optionB: string;
    optionC?: string;
    optionD?: string;
    correctOption: string; // 'A', 'B', 'C', 'D' or exact option text
  }>
) {
  const categories = await (prisma as any).testCategory.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    categoryMap.set(c.slug.toLowerCase(), c.id);
    categoryMap.set(c.name.toLowerCase(), c.id);
  }

  const families = await (prisma as any).questionFamily.findMany();
  const familyMap = new Map<string, string>();
  for (const f of families) {
    familyMap.set(f.code.toUpperCase(), f.id);
  }

  let successful = 0;
  let failed = 0;
  let duplicates = 0;
  const errors: Array<{ row: number; reason: string }> = [];

  for (let i = 0; i < records.length; i++) {
    const rowNum = i + 1;
    const r = records[i];

    try {
      if (!r.questionText || r.questionText.trim() === '') {
        failed++;
        errors.push({ row: rowNum, reason: 'Empty question text' });
        continue;
      }

      const catId = categoryMap.get((r.categorySlugOrName || '').toLowerCase().trim());
      if (!catId) {
        failed++;
        errors.push({ row: rowNum, reason: `Category not recognized: "${r.categorySlugOrName}"` });
        continue;
      }

      // Check duplicates by question text
      const existing = await (prisma as any).bankQuestion.findFirst({
        where: { questionText: r.questionText.trim() },
      });
      if (existing) {
        duplicates++;
        continue;
      }

      // Build options
      const rawOptions = [
        { key: 'A', text: (r.optionA || '').trim() },
        { key: 'B', text: (r.optionB || '').trim() },
        { key: 'C', text: (r.optionC || '').trim() },
        { key: 'D', text: (r.optionD || '').trim() },
      ].filter((o) => o.text !== '');

      if (rawOptions.length < 2) {
        failed++;
        errors.push({ row: rowNum, reason: 'Must have at least 2 non-empty options' });
        continue;
      }

      const correctMarker = (r.correctOption || '').trim().toUpperCase();
      const optionsWithCorrect = rawOptions.map((opt, idx) => {
        const isMatch =
          opt.key === correctMarker ||
          opt.text.toLowerCase() === (r.correctOption || '').toLowerCase().trim();
        return {
          optionText: opt.text,
          isCorrect: isMatch,
          orderIndex: idx,
        };
      });

      const correctCount = optionsWithCorrect.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        failed++;
        errors.push({
          row: rowNum,
          reason: `Could not identify single correct option from "${r.correctOption}"`,
        });
        continue;
      }

      const difficultyVal = (r.difficulty || 'MEDIUM').toUpperCase();
      const difficulty =
        difficultyVal === 'EASY'
          ? DifficultyLevel.EASY
          : difficultyVal === 'HARD'
          ? DifficultyLevel.HARD
          : DifficultyLevel.MEDIUM;

      const familyId = r.familyCode ? familyMap.get(r.familyCode.toUpperCase().trim()) || null : null;

      await (prisma as any).bankQuestion.create({
        data: {
          categoryId: catId,
          questionFamilyId: familyId,
          topic: (r.topic || 'General Security').trim(),
          difficulty,
          marks: Number(r.marks) > 0 ? Number(r.marks) : 1.0,
          questionText: r.questionText.trim(),
          explanation: r.explanation?.trim() || null,
          status: QuestionBankStatus.ACTIVE,
          options: {
            create: optionsWithCorrect,
          },
        },
      });

      successful++;
    } catch (err: any) {
      failed++;
      errors.push({ row: rowNum, reason: err.message || 'Database insert error' });
    }
  }

  return {
    total: records.length,
    successful,
    failed,
    duplicates,
    errors,
  };
}

export async function listQuestionFamilies() {
  return await (prisma as any).questionFamily.findMany({
    include: {
      _count: {
        select: { questions: true },
      },
      questions: {
        select: {
          id: true,
          difficulty: true,
          questionText: true,
          status: true,
        },
      },
    },
    orderBy: { code: 'asc' },
  });
}

export async function createQuestionFamily(data: {
  code: string;
  name: string;
  topic?: string;
  description?: string;
}) {
  const code = data.code.trim().toUpperCase();
  return await (prisma as any).questionFamily.create({
    data: {
      code,
      name: data.name.trim(),
      topic: data.topic?.trim() || null,
      description: data.description?.trim() || null,
    },
  });
}
