import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { GALLERY_ROOT_PATH, THUMBS_ROOT_PATH, VALID_EXTENSIONS } from '@/util/fs-utils';
import FilenameHandler from '@/app/server/FilenameHandler';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filenameWithoutParam = searchParams.get('image') as string | null;
  const folder = searchParams.get('folder') as string | '';
  const thumb = searchParams.get('thumb') as string | null;

  try {
    const ext = (filenameWithoutParam && filenameWithoutParam.split('.').pop()?.toLocaleLowerCase()) || '';

    const headers = {
      headers: {
        'Content-Type': 'image/' + ext,
        'Cache-Control': 'public, max-age=259200, s-maxage=259200', // 3 days
      },
    };

    if (filenameWithoutParam && VALID_EXTENSIONS.includes(ext)) {
      if (thumb === null) {
        const res = await getFile(folder, filenameWithoutParam, GALLERY_ROOT_PATH);
        if (res) {
          return new NextResponse(res, headers);
        }
      } else {
        const res = await getThumbFile(filenameWithoutParam);
        if (res) {
          return new NextResponse(res, headers);
        } else {
          const res = await getFile(folder, filenameWithoutParam, GALLERY_ROOT_PATH);
          if (res) {
            return new NextResponse(res, headers);
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

async function getFile(folder: string, fileNameWithoutParam: string, basePath: string) {
  const filename = await FilenameHandler.getFileFromFolder(folder, fileNameWithoutParam);
  if (filename) {
    const realpath = folder ? path.join(basePath, folder, filename) : path.join(basePath, filename);
    if (fs.existsSync(realpath)) {
      return fs.readFileSync(realpath);
    }
  }
}

async function getThumbFile(filename: string) {
  const fullPath = path.join(THUMBS_ROOT_PATH, filename);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath);
  }

  return undefined;
}
