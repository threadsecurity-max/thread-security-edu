import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { adminRequestBlogRevisions } from '@/server/services/blog.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { blogId } = await params;
    const body = await req.json().catch(() => ({}));
    const feedbackNote = body.feedbackNote || body.reason || undefined;

    const updatedBlog = await adminRequestBlogRevisions(blogId, session.userId, feedbackNote);

    return NextResponse.json({
      success: true,
      message: 'Article reverted to draft and revision feedback sent to mentor.',
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error('Error requesting blog revisions:', error);
    return NextResponse.json({ error: error.message || 'Failed to request revisions' }, { status: 500 });
  }
}
