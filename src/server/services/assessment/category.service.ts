import { prisma } from '@/server/database/prisma';

export async function listCategories(activeOnly = true) {
  return await (prisma as any).testCategory.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: {
      _count: {
        select: { questions: true, assessments: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryById(id: string) {
  return await (prisma as any).testCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { questions: true, assessments: true },
      },
    },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}) {
  return await (prisma as any).testCategory.create({
    data: {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: data.description?.trim() || null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
  }>
) {
  return await (prisma as any).testCategory.update({
    where: { id },
    data,
  });
}

export async function toggleCategoryStatus(id: string) {
  const current = await (prisma as any).testCategory.findUnique({ where: { id } });
  if (!current) throw new Error('Category not found');

  return await (prisma as any).testCategory.update({
    where: { id },
    data: { isActive: !current.isActive },
  });
}
