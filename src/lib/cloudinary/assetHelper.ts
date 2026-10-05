import assetManifest from './assetManifest.json';

/**
 * Resolves a local path (e.g. '/images/soc-analyst.jpg') to its live Cloudinary CDN URL from assetManifest.json.
 * Safe for both Client and Server Components (no Node.js/fs dependencies).
 */
export function getCloudinaryAssetUrl(localPath: string): string {
  if (!localPath) return '';
  const cleanPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
  const mapped = (assetManifest as Record<string, { cloudinaryUrl: string }>)[cleanPath];
  return mapped?.cloudinaryUrl || localPath;
}
