import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listCategories, createCategory } from '@/server/services/assessment/category.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const categories = await listCategories(false);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/categories GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed fetching categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await createCategory({
      name: body.name,
      slug: body.slug,
      description: body.description,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/admin/assessments/categories POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed creating category' },
      { status: 400 }
    );
  }
}
