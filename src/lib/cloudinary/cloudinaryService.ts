import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary with environment credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'threadsec-edu',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  error?: string;
  isMock?: boolean;
}

/**
 * Uploads a file buffer or Base64 data string to Cloudinary.
 */
export async function uploadMediaToCloudinary(
  fileInput: Buffer | string,
  folder: string = 'threads-lms',
  resourceType: 'auto' | 'image' | 'raw' | 'video' = 'auto'
): Promise<CloudinaryUploadResult> {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn('[Cloudinary Service] Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET. Using dev fallback mode.');
    return {
      success: true,
      url: typeof fileInput === 'string' && fileInput.startsWith('http') ? fileInput : '/images/TSE Logo Light.svg',
      secureUrl: typeof fileInput === 'string' && fileInput.startsWith('http') ? fileInput : '/images/TSE Logo Light.svg',
      publicId: `dev_fallback_${Date.now()}`,
      format: 'png',
      bytes: 1024,
      isMock: true,
    };
  }

  try {
    if (Buffer.isBuffer(fileInput)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `threads-lms/${folder}`,
            resource_type: resourceType,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result?: UploadApiResponse) => {
            if (error || !result) {
              console.error('[Cloudinary Stream Upload Error]:', error);
              return resolve({
                success: false,
                error: error?.message || 'Upload failed',
              });
            }
            resolve({
              success: true,
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              isMock: false,
            });
          }
        );

        uploadStream.end(fileInput);
      });
    } else {
      // String input (Base64 data URL or external URL)
      const result = await cloudinary.uploader.upload(fileInput, {
        folder: `threads-lms/${folder}`,
        resource_type: resourceType,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      return {
        success: true,
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        isMock: false,
      };
    }
  } catch (error: any) {
    console.error('[Cloudinary Upload Error]:', error);
    return {
      success: false,
      error: error?.message || 'Cloudinary upload processing failed',
    };
  }
}

import assetManifest from './assetManifest.json';

/**
 * Resolves a local path (e.g. '/logos/TSE Logo Light.svg') to its live Cloudinary CDN URL from assetManifest.json.
 */
export function getCloudinaryAssetUrl(localPath: string): string {
  const cleanPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
  const mapped = (assetManifest as Record<string, { cloudinaryUrl: string }>)[cleanPath];
  return mapped?.cloudinaryUrl || localPath;
}

/**
 * Deletes a media asset from Cloudinary by its public ID.
 */
export async function deleteMediaFromCloudinary(publicId: string): Promise<boolean> {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!apiKey || !publicId) return true;

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.error('[Cloudinary Delete Error]:', err);
    return false;
  }
}

