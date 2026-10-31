import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path;
    if (!segments || segments.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Resolve base uploads directory using process.cwd()
    const baseUploadsDir = path.resolve(process.cwd(), 'public', 'uploads');

    // Clean segments to prevent path traversal
    const safeSegments = segments.map((seg) => path.basename(seg));
    const fullPath = path.resolve(baseUploadsDir, ...safeSegments);

    // Security check: ensure target file is strictly within baseUploadsDir
    if (!fullPath.startsWith(baseUploadsDir)) {
      return new NextResponse('Access denied', { status: 403 });
    }

    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
      return new NextResponse('Invalid file request', { status: 400 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const buffer = fs.readFileSync(fullPath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal error serving file', { status: 500 });
  }
}
