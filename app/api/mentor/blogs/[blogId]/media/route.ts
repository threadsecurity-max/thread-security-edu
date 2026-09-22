import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { uploadFileToDrive } from '@/server/integrations/google-drive/upload';

const db = prisma as any;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { blogId } = await params;
    const blog = await db.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `blog-image-${Date.now()}`;
    const mimeType = file.type || 'image/png';

    let driveFileId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let driveFolderId = blog.driveFolderId || null;
    let url = '';

    // If Google Drive integration is available, upload to Drive
    if (blog.driveFolderId && process.env.GOOGLE_DRIVE_CREDENTIALS) {
      try {
        const driveData = await uploadFileToDrive(blog.driveFolderId, fileName, mimeType, buffer);
        if (driveData.id) {
          driveFileId = driveData.id;
        }
      } catch (err) {
        console.warn('Google Drive upload failed, falling back to local data URL:', err);
      }
    }

    // Convert to base64 data URL for instant frontend display fallback
    const base64 = buffer.toString('base64');
    url = `data:${mimeType};base64,${base64}`;

    const media = await db.blogMedia.create({
      data: {
        blogId,
        driveFileId,
        driveFolderId,
        fileName,
        mimeType,
        altText,
        caption,
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        ...media,
        url,
      },
    });
  } catch (error: any) {
    console.error('Error uploading blog media:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}
