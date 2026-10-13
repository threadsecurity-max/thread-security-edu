import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/server/database/prisma';
import { uploadMediaToCloudinary } from '@/lib/cloudinary/cloudinaryService';

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
    const isCover = formData.get('isCover') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `blog-image-${Date.now()}`;
    const mimeType = file.type || 'image/png';

    // 1. Upload to Cloudinary CDN for instant auto-optimization (WebP/AVIF, quality: auto)
    let url = '';
    let publicId = `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let width: number | null = null;
    let height: number | null = null;

    try {
      const cloudinaryResult = await uploadMediaToCloudinary(buffer, 'blogs', 'image');
      if (cloudinaryResult.success && (cloudinaryResult.secureUrl || cloudinaryResult.url)) {
        url = (cloudinaryResult.secureUrl || cloudinaryResult.url) as string;
        if (cloudinaryResult.publicId) {
          publicId = cloudinaryResult.publicId;
        }
        width = cloudinaryResult.width || null;
        height = cloudinaryResult.height || null;
      }
    } catch (uploadErr) {
      console.warn('Cloudinary direct upload failed, fallback to data url:', uploadErr);
    }

    // Fallback if Cloudinary is offline or unconfigured
    if (!url) {
      const base64 = buffer.toString('base64');
      url = `data:${mimeType};base64,${base64}`;
    }

    // 2. Persist in BlogMedia database table
    const media = await db.blogMedia.create({
      data: {
        blogId,
        url,
        driveFileId: publicId,
        driveFolderId: blog.driveFolderId || null,
        fileName,
        mimeType,
        width,
        height,
        altText,
        caption,
      },
    });

    // 3. Link cover image to Blog if requested or if blog lacks coverImageId
    if (isCover || !blog.coverImageId) {
      await db.blog.update({
        where: { id: blogId },
        data: { coverImageId: media.id },
      });
    }

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url || url,
        fileName: media.fileName,
        altText: media.altText,
        caption: media.caption,
        width: media.width,
        height: media.height,
      },
    });
  } catch (error: any) {
    console.error('Error uploading blog media:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}

