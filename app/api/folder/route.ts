import { type NextRequest, NextResponse } from 'next/server';
import { GALLERY_ROOT_PATH, getAllFolders } from '@/util/fs-utils';
import path from 'path';
import fs from 'fs';

export function GET() {
  try {
    const folders = getAllFolders();
    return NextResponse.json(
      {
        folders: folders,
      },
      { status: 200 }
    );
  } catch (error) {}

  return NextResponse.json({ error: 'Error fetching folders' }, { status: 400 });
}

export function POST(req: NextRequest) {
  try {
    const folders = getAllFolders();
    const { searchParams } = new URL(req.url);
    const folderName = searchParams.get('name') as string | null;

    if (folderName) {
      if (folders.includes(folderName)) {
        return NextResponse.json({ error: 'Folder already exists' }, { status: 400 });
      }

      const folderPath = path.join(GALLERY_ROOT_PATH, folderName);
      fs.mkdirSync(folderPath);

      return NextResponse.json(
        {
          message: 'Folder created successfully',
        },
        { status: 200 }
      );
    }
  } catch (error) {}

  return NextResponse.json({ error: 'Error' }, { status: 400 });
}
