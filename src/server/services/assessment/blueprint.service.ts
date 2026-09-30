import { prisma } from '@/server/database/prisma';
import { DifficultyLevel, QuestionBankStatus } from '@/types/assessment';

export interface CategoryDistributionItem {
  categoryId: string;
  percentage: number;
}

export interface BlueprintValidationParams {
  testId?: string;
  courseId?: string;
  questionsPerAttempt: number;
  easyPercent: number;
  mediumPercent: number;
  hardPercent: number;
  categoryBalancing?: boolean;
  difficultyBalancing?: boolean;
  preventDuplicateFamilies?: boolean;
  categoryDistribution?: CategoryDistributionItem[];
}

export interface ValidationRequirementFailure {
  categoryName?: string;
  difficulty?: string;
  required: number;
  available: number;
  needed: number;
}

export interface BlueprintValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculatedCounts: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    categories: Array<{ categoryId: string; categoryName: string; count: number; percentage: number }>;
  };
  breakdowns: ValidationRequirementFailure[];
}

export async function validateBlueprint(
  params: BlueprintValidationParams
): Promise<BlueprintValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const breakdowns: ValidationRequirementFailure[] = [];

  const totalQuestions = Number(params.questionsPerAttempt) || 0;
  if (totalQuestions <= 0) {
    errors.push('Questions per attempt must be greater than zero.');
  }

  // 1. Difficulty distribution math check
  const easyPct = Number(params.easyPercent) || 0;
  const medPct = Number(params.mediumPercent) || 0;
  const hardPct = Number(params.hardPercent) || 0;
  const diffTotal = Math.round(easyPct + medPct + hardPct);

  if (params.difficultyBalancing !== false && diffTotal !== 100) {
    errors.push(`Difficulty distribution must equal 100% (currently ${diffTotal}%: Easy ${easyPct}%, Medium ${medPct}%, Hard ${hardPct}%).`);
  }

  // Calculate difficulty counts
  const easyCount = Math.round((totalQuestions * easyPct) / 100);
  const hardCount = Math.round((totalQuestions * hardPct) / 100);
  const medCount = Math.max(0, totalQuestions - easyCount - hardCount);

  // 2. Category distribution math check
  const catDistribution = params.categoryDistribution || [];
  let categoryCounts: Array<{ categoryId: string; categoryName: string; count: number; percentage: number }> = [];

  if (params.categoryBalancing !== false && catDistribution.length > 0) {
    const catTotal = Math.round(catDistribution.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0));
    if (catTotal !== 100) {
      errors.push(`Category distribution must equal 100% (currently ${catTotal}%).`);
    }

    // Resolve category names
    const categoryIds = catDistribution.map((c) => c.categoryId);
    const categoryRecords: any[] = await (prisma as any).testCategory.findMany({
      where: { id: { in: categoryIds } },
    });
    const catNameMap = new Map(categoryRecords.map((c: any) => [c.id, c.name]));

    let allocatedCatSum = 0;
    categoryCounts = catDistribution.map((c, idx) => {
      const isLast = idx === catDistribution.length - 1;
      const pct = Number(c.percentage) || 0;
      const count = isLast
        ? Math.max(0, totalQuestions - allocatedCatSum)
        : Math.round((totalQuestions * pct) / 100);
      allocatedCatSum += count;
      return {
        categoryId: c.categoryId,
        categoryName: catNameMap.get(c.categoryId) || 'Unknown Category',
        count,
        percentage: pct,
      };
    });
  }

  // 3. Database Pool Availability Check
  const whereEligible: any = {
    status: QuestionBankStatus.ACTIVE,
  };
  if (params.courseId) {
    whereEligible.OR = [
      { courseId: params.courseId },
      { courseId: null }, // universal questions
    ];
  }

  const eligibleQuestions: any[] = await (prisma as any).bankQuestion.findMany({
    where: whereEligible,
    include: { category: true, family: true },
  });

  if (eligibleQuestions.length < totalQuestions) {
    errors.push(
      `Insufficient total eligible questions in bank: required ${totalQuestions}, available ${eligibleQuestions.length}.`
    );
  }

  // Validate difficulty pool
  if (params.difficultyBalancing !== false) {
    const easyPool = eligibleQuestions.filter((q) => q.difficulty === DifficultyLevel.EASY);
    const medPool = eligibleQuestions.filter((q) => q.difficulty === DifficultyLevel.MEDIUM);
    const hardPool = eligibleQuestions.filter((q) => q.difficulty === DifficultyLevel.HARD);

    if (easyPool.length < easyCount) {
      const needed = easyCount - easyPool.length;
      errors.push(`Difficulty requirement failed: Need ${needed} more Easy questions (${easyPool.length}/${easyCount} available).`);
      breakdowns.push({
        difficulty: 'EASY',
        required: easyCount,
        available: easyPool.length,
        needed,
      });
    }

    if (medPool.length < medCount) {
      const needed = medCount - medPool.length;
      errors.push(`Difficulty requirement failed: Need ${needed} more Medium questions (${medPool.length}/${medCount} available).`);
      breakdowns.push({
        difficulty: 'MEDIUM',
        required: medCount,
        available: medPool.length,
        needed,
      });
    }

    if (hardPool.length < hardCount) {
      const needed = hardCount - hardPool.length;
      errors.push(`Difficulty requirement failed: Need ${needed} more Hard questions (${hardPool.length}/${hardCount} available).`);
      breakdowns.push({
        difficulty: 'HARD',
        required: hardCount,
        available: hardPool.length,
        needed,
      });
    }
  }

  // Validate category pools
  if (params.categoryBalancing !== false && categoryCounts.length > 0) {
    for (const catReq of categoryCounts) {
      const availableInCat = eligibleQuestions.filter((q) => q.categoryId === catReq.categoryId);
      if (availableInCat.length < catReq.count) {
        const needed = catReq.count - availableInCat.length;
        errors.push(
          `Category requirement failed: Need ${needed} more questions for "${catReq.categoryName}" (${availableInCat.length}/${catReq.count} available).`
        );
        breakdowns.push({
          categoryName: catReq.categoryName,
          required: catReq.count,
          available: availableInCat.length,
          needed,
        });
      }
    }
  }

  // Validate unique family constraints if enabled
  if (params.preventDuplicateFamilies !== false) {
    const familiesRepresented = new Set(
      eligibleQuestions.map((q) => q.questionFamilyId).filter(Boolean)
    );
    const nonFamilyQuestions = eligibleQuestions.filter((q) => !q.questionFamilyId).length;
    const maxUniqueQuestions = familiesRepresented.size + nonFamilyQuestions;

    if (maxUniqueQuestions < totalQuestions) {
      warnings.push(
        `Family deduplication warning: With family grouping, at most ${maxUniqueQuestions} unique concepts exist for ${totalQuestions} requested questions.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    calculatedCounts: {
      total: totalQuestions,
      easy: easyCount,
      medium: medCount,
      hard: hardCount,
      categories: categoryCounts,
    },
    breakdowns,
  };
}

export async function simulateBlueprint(testId: string) {
  const assessment: any = await (prisma as any).assessment.findUnique({
    where: { id: testId },
    include: { course: true },
  });
  if (!assessment) throw new Error('Assessment not found');

  const catDistribution: CategoryDistributionItem[] = assessment.categoryDistributionJson
    ? JSON.parse(assessment.categoryDistributionJson)
    : [];

  const validation = await validateBlueprint({
    testId: assessment.id,
    courseId: assessment.courseId,
    questionsPerAttempt: assessment.questionsPerAttempt,
    easyPercent: assessment.easyPercent,
    mediumPercent: assessment.mediumPercent,
    hardPercent: assessment.hardPercent,
    categoryBalancing: assessment.categoryBalancing,
    difficultyBalancing: assessment.difficultyBalancing,
    preventDuplicateFamilies: assessment.preventDuplicateFamilies,
    categoryDistribution: catDistribution,
  });

  return {
    assessmentTitle: assessment.title,
    durationMinutes: assessment.durationMinutes,
    totalMarks: assessment.totalMarks,
    questionsPerAttempt: assessment.questionsPerAttempt,
    validation,
  };
}
