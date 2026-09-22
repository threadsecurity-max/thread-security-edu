import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlogs } from '@/server/services/blog.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const featuredOnly = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);

    const result = await getPublicBlogs({
      search,
      categorySlug,
      tagSlug,
      featuredOnly,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching public blogs:', error);
    return NextResponse.json({ error: 'Failed to load blogs' }, { status: 500 });
  }
}
