import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const validExts = ['jpg', 'jpeg', 'png', 'gif'];

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const image = searchParams.get('image') as string | null;

  try {
    if (image) {
      const ext = image.split('.').pop()?.toLocaleLowerCase() || '';
      if (!validExts.includes(ext)) {
        NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        return;
      }

      const imagePath = path.join(process.cwd(), 'gallery', image);
      const blob = fs.readFileSync(imagePath);

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'image/' + ext,
          'Cache-Control': 'public, max-age=5',
        },
      });
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

  return NextResponse.json({ error: 'No image provided' }, { status: 400 });
}
