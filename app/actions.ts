'use server';

import {
  GALLERY_ROOT_PATH,
  STARRED_JSON_PATH,
  THUMBS_ROOT_PATH,
  VALID_EXTENSIONS,
  getHashValue,
} from '@/util/fs-utils';
import ImageManipulation from '@/util/image-manipulation';
import fs from 'fs';
import { revalidatePath } from 'next/cache';
import path from 'path';
import sharp from 'sharp';

interface Props {
  folder?: string;
  page?: number;
  pageSize?: number;
}

export async function getImages(props: Props) {
  const { folder = '', page = 1, pageSize = 50 } = props;

  const pathFolder = folder ? path.join(GALLERY_ROOT_PATH, folder) : GALLERY_ROOT_PATH;
  if (folder && !fs.existsSync(pathFolder)) return undefined;

  fs.mkdirSync(pathFolder, { recursive: true });
  const imagesInRootFolder = fs
    .readdirSync(pathFolder)
    .filter(file => file.match(/\.(jpe?g|png|gif)$/i))
    .sort((a, b) => {
      const [aMs] = a.split('-');
      const [bMs] = b.split('-');
      return Number(bMs) - Number(aMs);
    });

  const images = [];

  for (let i = 0; i < imagesInRootFolder.length; i++) {
    const imagePath = path.join(pathFolder, imagesInRootFolder[i]);
    const stat = fs.statSync(imagePath);

    const filename = path.basename(imagePath);

    const searchParamsObject: {
      image: string;
      folder?: string;
      thumb?: string;
    } = {
      image: filename,
    };

    if (folder) searchParamsObject.folder = folder;

    const image = {
      path: `/api/file?${encodeObjectToQueryString(searchParamsObject)}`,
      thumb: `/api/file?${encodeObjectToQueryString({ ...searchParamsObject, thumb: '1' })}`,
      created: stat.birthtimeMs,
    };

    images.push(image);
  }

  return images.slice((page - 1) * pageSize, page * pageSize);
}

export async function getAllFolders(): Promise<
  {
    name: string;
    count: number;
  }[]
> {
  fs.mkdirSync(GALLERY_ROOT_PATH, { recursive: true });

  const folders = fs
    .readdirSync(GALLERY_ROOT_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => {
      return {
        name: item.name,
        count: fs.readdirSync(path.join(GALLERY_ROOT_PATH, item.name)).length,
      };
    });

  return folders;
}

export async function uploadImageOnServer(folder: string, formData: FormData) {
  const file = formData.get('file');

  // @ts-ignore
  // Get the file extension
  const ext = path.extname(file.name).toLowerCase().replace('.', '');

  // Check if extension is valid
  if (!VALID_EXTENSIONS.includes(ext)) return 'incorrect file';

  // @ts-ignore
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = await getHashValue(buffer);
  const filename = `${Date.now()}-${hash}.${ext}`;

  fs.mkdirSync(GALLERY_ROOT_PATH, { recursive: true });
  fs.mkdirSync(THUMBS_ROOT_PATH, { recursive: true });

  const imagePath = folder ? path.join(GALLERY_ROOT_PATH, folder, filename) : path.join(GALLERY_ROOT_PATH, filename);
  const thumbPath = path.join(THUMBS_ROOT_PATH, filename);

  // Create the image and save it to disk
  fs.writeFileSync(imagePath, buffer);

  // Create the thumbnail and save it to disk
  await ImageManipulation.downScale(sharp(buffer), thumbPath, 360, imagePath);
  return 1;
}

export async function addFolderToServer(folder: string) {
  fs.mkdirSync(path.join(GALLERY_ROOT_PATH, folder), { recursive: true });
  fs.mkdirSync(path.join(THUMBS_ROOT_PATH), { recursive: true });
}

export async function deleteFilesFromServer(folder: string, arr: string[]) {
  for (let i = 0; arr.length > i; i++) {
    const filename = arr[i];

    const baseFolder = folder !== '' ? path.join(GALLERY_ROOT_PATH, folder) : GALLERY_ROOT_PATH;
    const fullFilePath = path.join(baseFolder, filename);

    // thumb folder + filename
    const fullThumbPath = path.join(THUMBS_ROOT_PATH, filename);

    if (fs.existsSync(fullFilePath)) fs.unlinkSync(fullFilePath);
    if (fs.existsSync(fullThumbPath)) fs.unlinkSync(fullThumbPath);
  }
}

export async function deleteFoldersFromServer(folders: string[]) {
  for (let i = 0; folders.length > i; i++) {
    const folder = folders[i];

    const folderPath = path.join(GALLERY_ROOT_PATH, folder);

    if (folder && fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath);
    }
  }
}

export async function moveFilesFromServer(cFolder: string, nFolder: string, arr: string[]) {
  const baseCurrentPath = cFolder !== '' ? path.join(GALLERY_ROOT_PATH, cFolder) : GALLERY_ROOT_PATH;
  const baseNewPath = nFolder !== '' ? path.join(GALLERY_ROOT_PATH, nFolder) : GALLERY_ROOT_PATH;

  if (!fs.existsSync(baseNewPath)) {
    fs.mkdirSync(baseNewPath, { recursive: true });
  }

  for (let i = 0; arr.length > i; i++) {
    const filename = arr[i];
    const currentFile = path.join(baseCurrentPath, filename);
    const newFile = path.join(baseNewPath, filename);

    if (fs.existsSync(currentFile)) {
      fs.renameSync(currentFile, newFile);
    }
  }
}

export async function renameFolder(folder: string, newFolder: string) {
  const oldPath = path.join(GALLERY_ROOT_PATH, folder);
  const newPath = path.join(GALLERY_ROOT_PATH, newFolder);

  let f1 = false;

  if (folder && fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    f1 = true;
  }

  return f1;
}

function encodeObjectToQueryString(obj: any) {
  const parts = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
    }
  }

  return parts.join('&');
}

export default async function revalidatePage(path: string) {
  revalidatePath(path, 'page');
}
