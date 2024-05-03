import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { GALLERY_ROOT_PATH, THUMBS_ROOT_PATH, VALID_EXTENSIONS } from '@/util/fs-utils';

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const image = searchParams.get('image') as string | null;
  const folder = searchParams.get('folder') as string | '';
  const thumb = searchParams.get('thumb') as string | null;

  try {
    const ext = (image && image.split('.').pop()?.toLocaleLowerCase()) || '';

    if (image && VALID_EXTENSIONS.includes(ext)) {
      if (thumb === null) {
        const res = getFile(folder, image, GALLERY_ROOT_PATH);
        if (res) {
          return new NextResponse(res, {
            headers: {
              'Content-Type': 'image/' + ext,
              'Cache-Control': 'public, max-age=5',
            },
          });
        }
      } else {
        const res = getFile('', image, THUMBS_ROOT_PATH);
        if (res) {
          return new NextResponse(res, {
            headers: {
              'Content-Type': 'image/' + ext,
              'Cache-Control': 'public, max-age=5',
            },
          });
        } else {
          const res = getFile(folder, image, GALLERY_ROOT_PATH);
          if (res) {
            return new NextResponse(res, {
              headers: {
                'Content-Type': 'image/' + ext,
                'Cache-Control': 'public, max-age=5',
              },
            });
          }
        }
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch image',
        message: error,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
}

function getFile(folder: string, fileName: string, basePath: string) {
  const realpath = folder ? path.join(basePath, folder, fileName) : path.join(basePath, fileName);
  if (fs.existsSync(realpath)) {
    return fs.readFileSync(realpath);
  }
}
