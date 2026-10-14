import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { adminToggleFeaturedBlog } from '@/server/services/blog.service';

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
    const updatedBlog = await adminToggleFeaturedBlog(blogId, session.userId);

    return NextResponse.json({
      success: true,
      message: `Article ${updatedBlog.featured ? 'marked as Featured' : 'unmarked from Featured'}.`,
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error('Error toggling featured status:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle featured status' }, { status: 500 });
  }
}
