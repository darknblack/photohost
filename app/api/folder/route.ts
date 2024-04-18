import { NextResponse } from 'next/server';
import { getAllFolders } from '@/util/fs-utils';

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
