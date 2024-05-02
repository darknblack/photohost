'use server';

import { GALLERY_ROOT_PATH, THUMBS_ROOT_PATH, VALID_EXTENSIONS, getHashValue } from '@/util/fs-utils';
import ImageManipulation from '@/util/image-manipulation';
import fs from 'fs';
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

export async function uploadImageOnServer(formData: FormData, folder: string) {
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
  const thumbPath = folder ? path.join(THUMBS_ROOT_PATH, folder, filename) : path.join(THUMBS_ROOT_PATH, filename);

  // Create the image and save it to disk
  fs.writeFileSync(imagePath, buffer);
  fs.mkdirSync(path.join(THUMBS_ROOT_PATH, folder), { recursive: true });

  // Create the thumbnail and save it to disk
  await ImageManipulation.downScale(sharp(buffer), thumbPath, 360, imagePath);
  return 1;
}

export async function addFolderToServer(folder: string) {
  fs.mkdirSync(path.join(GALLERY_ROOT_PATH, folder), { recursive: true });
  fs.mkdirSync(path.join(THUMBS_ROOT_PATH, folder), { recursive: true });
}

export async function deleteFilesFromServer(folder: string, arr: string[]) {
  for (let i = 0; arr.length > i; i++) {
    const filename = arr[i];

    const fileFolder = folder !== '' ? path.join(GALLERY_ROOT_PATH, folder) : GALLERY_ROOT_PATH;
    const thumbFolder = folder !== '' ? path.join(THUMBS_ROOT_PATH, folder) : THUMBS_ROOT_PATH;

    const fullFilePath = path.join(fileFolder, filename);
    const fullThumbPath = path.join(thumbFolder, filename);

    if (fs.existsSync(fullFilePath)) fs.unlinkSync(fullFilePath);
    if (fs.existsSync(fullThumbPath)) fs.unlinkSync(fullThumbPath);
  }
}

export async function deleteFoldersFromServer(folders: string[]) {
  for (let i = 0; folders.length > i; i++) {
    const folder = folders[i];

    const folderPath = path.join(GALLERY_ROOT_PATH, folder);
    const thumbPath = path.join(THUMBS_ROOT_PATH, folder);

    if (folder && fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath);
    }

    if (folder && fs.existsSync(thumbPath)) {
      fs.rmdirSync(thumbPath);
    }
  }
}

export async function renameFolder(folder: string, newFolder: string) {
  if (folder && fs.existsSync(path.join(GALLERY_ROOT_PATH, folder))) {
    fs.renameSync(path.join(GALLERY_ROOT_PATH, folder), path.join(GALLERY_ROOT_PATH, newFolder));
  }

  if (folder && fs.existsSync(path.join(THUMBS_ROOT_PATH, folder))) {
    fs.renameSync(path.join(THUMBS_ROOT_PATH, folder), path.join(THUMBS_ROOT_PATH, newFolder));
  }
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
