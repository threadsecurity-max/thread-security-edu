import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('[Cloudinary Upload Script] Error: Missing required environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Please define them in .env before running this script.');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MANIFEST_PATH = path.join(process.cwd(), 'src', 'lib', 'cloudinary', 'assetManifest.json');

interface AssetMapping {
  localPath: string;
  relativePath: string;
  cloudinaryUrl: string;
  publicId: string;
}

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Ignore README, .gitkeep, .ds_store
      if (!file.endsWith('.gitkeep') && !file.endsWith('README.md') && !file.startsWith('.')) {
        arrayOfFiles.push(fullPath);
      }
    }
  }

  return arrayOfFiles;
}

async function main() {
  console.log(`🚀 Starting batch upload of LMS assets to Cloudinary (Account: ${cloudName})...\n`);

  const allFiles = await getAllFiles(PUBLIC_DIR);
  console.log(`Found ${allFiles.length} static asset files in /public directory.\n`);

  const manifest: Record<string, AssetMapping> = {};

  for (const filePath of allFiles) {
    const relativePath = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
    const folderName = path.dirname(relativePath).replace(/\\/g, '/');
    const targetFolder = folderName === '.' ? 'threads-lms' : `threads-lms/${folderName}`;

    console.log(`Uploading: ${relativePath} -> Cloudinary folder: ${targetFolder}...`);

    try {
      const isVideo = relativePath.endsWith('.mp4') || relativePath.endsWith('.webm');
      const isRaw = relativePath.endsWith('.pdf') || relativePath.endsWith('.csv');

      const resourceType = isVideo ? 'video' : isRaw ? 'raw' : 'image';

      const result = await cloudinary.uploader.upload(filePath, {
        folder: targetFolder,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: resourceType,
      });

      console.log(`  ✅ Uploaded successfully: ${result.secure_url}`);

      manifest[`/${relativePath}`] = {
        localPath: `/${relativePath}`,
        relativePath,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err: any) {
      console.error(`  ❌ Failed to upload ${relativePath}:`, err?.message || err);
    }
  }

  // Ensure output directory exists
  const manifestDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n🎉 Batch upload complete! Asset Manifest saved to ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error('Fatal batch upload error:', err);
  process.exit(1);
});
