import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlogBySlug, getRelatedBlogs } from '@/server/services/blog.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await getPublicBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const related = await getRelatedBlogs(blog.id, blog.categoryId, 3);

    return NextResponse.json({ blog, related });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to load blog post' }, { status: 500 });
  }
}
