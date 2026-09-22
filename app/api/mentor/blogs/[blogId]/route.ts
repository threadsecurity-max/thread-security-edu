import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getBlogById, updateBlog, deleteBlog } from '@/server/services/blog.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { blogId } = await params;
    const blog = await getBlogById(blogId);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { blogId } = await params;
    const body = await req.json();

    const updatedBlog = await updateBlog(blogId, session.userId, body);
    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { blogId } = await params;
    await deleteBlog(blogId, session.userId);
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete blog' }, { status: 500 });
  }
}
