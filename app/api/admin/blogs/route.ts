import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAdminBlogs, createBlogDraft } from '@/server/services/blog.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const result = await getAdminBlogs({ search, status, categoryId, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in GET /api/admin/blogs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'Untitled Research Article';

    const blog = await createBlogDraft(session.userId, title);
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error('Error in POST /api/admin/blogs:', error);
    return NextResponse.json({ error: error.message || 'Failed to create blog draft' }, { status: 500 });
  }
}
