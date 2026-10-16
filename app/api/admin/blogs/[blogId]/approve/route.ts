import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { adminApproveAndPublishBlog } from '@/server/services/blog.service';

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
    const updatedBlog = await adminApproveAndPublishBlog(blogId, session.userId, body.scheduledAt);

    return NextResponse.json({
      success: true,
      message: body.scheduledAt
        ? `Article approved and scheduled for release on ${new Date(body.scheduledAt).toLocaleString()}`
        : 'Article officially approved and published to the live platform!',
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error('Error approving blog:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve blog' }, { status: 500 });
  }
}
