export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export const DifficultyLevel = {
  EASY: 'EASY' as const,
  MEDIUM: 'MEDIUM' as const,
  HARD: 'HARD' as const,
};

export type QuestionBankStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export const QuestionBankStatus = {
  DRAFT: 'DRAFT' as const,
  ACTIVE: 'ACTIVE' as const,
  ARCHIVED: 'ARCHIVED' as const,
};

export type AttemptStatus =
  | 'CREATED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'AUTO_SUBMITTED'
  | 'EXPIRED'
  | 'CANCELLED';

export const AttemptStatus = {
  CREATED: 'CREATED' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  SUBMITTED: 'SUBMITTED' as const,
  AUTO_SUBMITTED: 'AUTO_SUBMITTED' as const,
  EXPIRED: 'EXPIRED' as const,
  CANCELLED: 'CANCELLED' as const,
};

export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export const AssessmentStatus = {
  DRAFT: 'DRAFT' as const,
  PUBLISHED: 'PUBLISHED' as const,
  ARCHIVED: 'ARCHIVED' as const,
};
