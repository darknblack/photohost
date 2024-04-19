import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { GALLERY_ROOT_PATH, THUMBS_PATH, getHashValue } from '@/util/fs-utils';
import ImageManipulation from '@/util/image-manipulation';
import sharp from 'sharp';

const validExts = ['jpg', 'jpeg', 'png', 'gif'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'No files received.' }, { status: 400 });

    // @ts-ignore
    // Get the file extension
    const ext = path.extname(file.name).toLowerCase().replace('.', '');

    // Check if extension is valid
    if (!validExts.includes(ext))
      return NextResponse.json(
        { error: 'Invalid file extension. Only jpg, jpeg, png, and gif allowed.' },
        { status: 400 }
      );

    // @ts-ignore
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = await getHashValue(buffer);
    const filename = `${Date.now()}-${hash}.${ext}`;

    await mkdir(GALLERY_ROOT_PATH, { recursive: true });
    await mkdir(THUMBS_PATH, { recursive: true });

    // Create the image and save it to disk
    const imagePath = path.join(GALLERY_ROOT_PATH, filename);
    await writeFile(imagePath, buffer);

    // Create the thumbnail and save it to disk
    const thumbPath = path.join(THUMBS_PATH, filename);

    await ImageManipulation.downScale(sharp(buffer), thumbPath, 360);

    return NextResponse.json({ Message: 'Success', status: 201 });
  } catch (error) {
    console.log('Error occured ', error);
    return NextResponse.json({ Message: 'Failed', status: 500 });
  }
}
