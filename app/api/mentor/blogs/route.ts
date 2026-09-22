import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createBlogDraft, getMentorBlogs } from '@/server/services/blog.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Mentor access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getMentorBlogs(session.userId, { search, status, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching mentor blogs:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Mentor access required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'Untitled Cybersecurity Blog';

    const blog = await createBlogDraft(session.userId, title);
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error('Error creating blog draft:', error);
    return NextResponse.json({ error: error.message || 'Failed to create blog draft' }, { status: 500 });
  }
}
