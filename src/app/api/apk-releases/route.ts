import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface ApkRelease {
  name: string;
  fileName: string;
  size: string;
  sizeBytes: number;
  downloadUrl: string;
  uploadedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function friendlyName(fileName: string): string {
  // "EasyShop-v1.2.0-preview.apk" → "EasyShop v1.2.0 Preview"
  return fileName
    .replace(/\.apk$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\bv(\d)/gi, 'v$1')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export async function GET() {
  try {
    const apkDir = path.join(process.cwd(), 'public', 'apk');

    if (!fs.existsSync(apkDir)) {
      return NextResponse.json({ releases: [] });
    }

    const files = fs.readdirSync(apkDir).filter((f) => f.toLowerCase().endsWith('.apk'));

    const releases: ApkRelease[] = files
      .map((fileName) => {
        const filePath = path.join(apkDir, fileName);
        const stat = fs.statSync(filePath);
        return {
          name: friendlyName(fileName),
          fileName,
          size: formatBytes(stat.size),
          sizeBytes: stat.size,
          downloadUrl: `/apk/${fileName}`,
          uploadedAt: stat.mtime.toISOString(),
        };
      })
      // newest first
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({ releases });
  } catch (err) {
    console.error('[apk-releases] Error reading APK folder:', err);
    return NextResponse.json({ releases: [] });
  }
}
