import { ZIP_PATH } from '@/util/fs-utils';
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename') as string | null;

  if (!filename) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const headers = {
      headers: {
        'Content-Type': 'application/zip',
        // TODO: set this to 3600 in production
        'Cache-Control': 'public, max-age=0, s-maxage=0',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    };

    const zipPath = path.join(ZIP_PATH, filename);
    if (!fs.existsSync(zipPath)) {
      return new Response(null, {
        status: 400,
      });
    }

    return new NextResponse(fs.readFileSync(zipPath), headers);
  } catch (error) {
    return new Response(null, {
      status: 400,
    });
  }
}
