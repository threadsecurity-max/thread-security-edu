import { NextResponse } from 'next/server';
import { getBlogCategories, getBlogTags } from '@/server/services/blog.service';

export async function GET() {
  try {
    const [categories, tags] = await Promise.all([
      getBlogCategories(),
      getBlogTags(),
    ]);

    return NextResponse.json({ categories, tags });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
