import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import { GALLERY_ROOT_PATH } from '@/util/fs-utils';

const validExts = ['jpg', 'jpeg', 'png', 'gif'];

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No files received.' }, { status: 400 });

  // Check if 'file' is a File object before accessing arrayBuffer()
  if (!(file instanceof File)) return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });

  // Get the file extension
  const ext = path.extname(file.name).toLowerCase().replace('.', '');

  console.log('ext', ext);

  // Check if extension is valid
  if (!validExts.includes(ext)) {
    return NextResponse.json(
      { error: 'Invalid file extension. Only jpg, jpeg, png, and gif allowed.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + file.name.replaceAll(' ', '_');

  try {
    await writeFile(path.join(process.cwd(), GALLERY_ROOT_PATH, filename), buffer);
    return NextResponse.json({ Message: 'Success', status: 201 });
  } catch (error) {
    console.log('Error occured ', error);
    return NextResponse.json({ Message: 'Failed', status: 500 });
  }
}
