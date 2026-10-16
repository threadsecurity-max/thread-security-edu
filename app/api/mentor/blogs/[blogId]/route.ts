import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
      return NextResponse.json({ error: 'Unauthorized. Mentor or staff access required.' }, { status: 401 });
    }

    const { blogId } = await params;
    if (!blogId) {
      return NextResponse.json({ error: 'Missing blogId parameter' }, { status: 400 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Invalid or malformed JSON payload in request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    }

    const updatedBlog = await updateBlog(blogId, session.userId, body);

    try {
      revalidatePath('/blog');
      if (updatedBlog.slug) {
        revalidatePath(`/blog/${updatedBlog.slug}`);
      }
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    console.error('Error updating mentor blog:', error);
    return NextResponse.json({ error: error.message || 'Failed to update blog article' }, { status: 500 });
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

    try {
      revalidatePath('/blog');
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete blog' }, { status: 500 });
  }
}
