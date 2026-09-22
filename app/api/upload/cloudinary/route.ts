import { NextResponse } from 'next/server';
import { uploadMediaToCloudinary } from '@/lib/cloudinary/cloudinaryService';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'general';

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await uploadMediaToCloudinary(buffer, folder);

      if (!uploadResult.success) {
        return NextResponse.json({ error: uploadResult.error || 'Upload failed' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: uploadResult.secureUrl || uploadResult.url,
        publicId: uploadResult.publicId,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
        isMock: uploadResult.isMock,
      });
    } else {
      // JSON body with base64 or file URL
      const body = await req.json();
      const { fileUrl, base64, folder = 'general' } = body;

      const fileInput = base64 || fileUrl;
      if (!fileInput) {
        return NextResponse.json({ error: 'fileUrl or base64 is required' }, { status: 400 });
      }

      const uploadResult = await uploadMediaToCloudinary(fileInput, folder);

      if (!uploadResult.success) {
        return NextResponse.json({ error: uploadResult.error || 'Upload failed' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: uploadResult.secureUrl || uploadResult.url,
        publicId: uploadResult.publicId,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
        isMock: uploadResult.isMock,
      });
    }
  } catch (error: any) {
    console.error('[Cloudinary API Endpoint Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during media upload.' },
      { status: 500 }
    );
  }
}
