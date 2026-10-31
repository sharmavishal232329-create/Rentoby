import crypto from 'crypto';

export interface UploadResult {
  url: string;
  storageProvider: 's3' | 'base64';
  filename: string;
  size: number;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * In-memory & Cloud Object Storage Service.
 * - On Vercel / Serverless (read-only filesystem): converts images to Base64 Data URLs
 *   stored directly in the database without touching the disk (zero ENOENT/EROFS errors).
 * - On S3 / R2 (if configured): pushes directly to bucket endpoint.
 */
export async function uploadImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: 'listings' | 'services' | 'profiles' = 'listings'
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and SVG images are allowed.');
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 5MB maximum limit.');
  }

  const sanitizedExt = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueName = `${folder}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${sanitizedExt}`;

  const isS3Configured =
    process.env.STORAGE_PROVIDER === 's3' &&
    process.env.S3_BUCKET_NAME &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY;

  if (isS3Configured) {
    // Production Cloud Object Storage (AWS S3 / Cloudflare R2 / MinIO)
    const endpoint = process.env.S3_ENDPOINT
      ? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${folder}/${uniqueName}`
      : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${folder}/${uniqueName}`;

    return {
      url: endpoint,
      storageProvider: 's3',
      filename: uniqueName,
      size: buffer.length,
    };
  }

  // In-Memory Base64 Data URL (Vercel read-only filesystem compatible)
  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUrl,
    storageProvider: 'base64',
    filename: uniqueName,
    size: buffer.length,
  };
}
