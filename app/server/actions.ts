'use server';

import {
  DELETED_IMAGES_PATH,
  GALLERY_ROOT_PATH,
  THUMBS_ROOT_PATH,
  VALID_EXTENSIONS,
  ZIP_PATH,
  getHashValue,
} from '@/util/fs-utils';
import ImageManipulation from '@/util/image-manipulation';
import fs from 'fs';
import { revalidatePath } from 'next/cache';
import path, { basename } from 'path';
import sharp from 'sharp';
import FilenameHandler from '@/app/server/FilenameHandler';
import archiver from 'archiver';
import checkDiskSpace from 'check-disk-space';
import { cookies } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';

interface GetImagesProps {
  folder?: string;
  page?: number;
  pageSize?: number;
  isGallery?: boolean;
  isTrash?: boolean;
}

const DEFAULT_PAGE_SIZE = 40;

export async function getStarredImages(
  props: GetImagesProps
): Promise<undefined | { images: ExtendedImage[]; total: number }> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = props;
  const allFolders = await getAllFolders();

  const images: ExtendedImage[] = [];

  const imagesInFolder = fs
    .readdirSync(GALLERY_ROOT_PATH)
    .filter(fileName => {
      const isStarred = FilenameHandler.paramCheck(fileName, 's');
      return fileName.match(/\.(jpe?g|png|gif)$/i) && isStarred;
    })
    .sort((a, b) => {
      const [aMs] = a.split('-');
      const [bMs] = b.split('-');
      return Number(bMs) - Number(aMs);
    });

  loopImages(GALLERY_ROOT_PATH, imagesInFolder, '', images);

  for (let i = 0; i < allFolders.length; i++) {
    const folder = allFolders[i];
    const pathFolder = path.join(GALLERY_ROOT_PATH, folder.name);

    const imagesInFolder = fs
      .readdirSync(pathFolder)
      .filter(fileName => {
        const isStarred = FilenameHandler.paramCheck(fileName, 's');
        return fileName.match(/\.(jpe?g|png|gif)$/i) && isStarred;
      })
      .sort((a, b) => {
        const [aMs] = a.split('-');
        const [bMs] = b.split('-');
        return Number(bMs) - Number(aMs);
      });

    loopImages(pathFolder, imagesInFolder, folder.name, images);
  }

  return {
    images: images.slice((page - 1) * pageSize, page * pageSize),
    total: images.length,
  };
}

export async function getImages(props: GetImagesProps): Promise<
  | undefined
  | {
      images: ExtendedImage[];
      total: number;
    }
> {
  const { folder = '', page = 1, pageSize = DEFAULT_PAGE_SIZE, isGallery = false, isTrash = false } = props;
  // const pathFolder = folder ? folder : GALLERY_ROOT_PATH;

  const pathFolder = (() => {
    if (isGallery) {
      if (folder) {
        return path.join(GALLERY_ROOT_PATH, folder);
      }
      return GALLERY_ROOT_PATH;
    }

    if (isTrash) {
      return DELETED_IMAGES_PATH;
    }

    return '';
  })();

  if (isTrash) {
    fs.mkdirSync(DELETED_IMAGES_PATH, { recursive: true });
  }

  if (folder && !fs.existsSync(pathFolder)) return undefined;

  fs.mkdirSync(pathFolder, { recursive: true });
  const imagesInFolder = fs
    .readdirSync(pathFolder)
    .filter(file => file.match(/\.(jpe?g|png|gif)$/i))
    .sort((a, b) => {
      const [aMs] = a.split('-');
      const [bMs] = b.split('-');
      return Number(bMs) - Number(aMs);
    });

  const images: ExtendedImage[] = [];
  loopImages(pathFolder, imagesInFolder, folder, images, isTrash);

  return {
    images: images.slice((page - 1) * pageSize, page * pageSize),
    total: images.length,
  };
}

function loopImages(
  pathFolder: string,
  imagesInFolder: string[],
  folder: string,
  images: any[],
  isTrash: boolean = false
) {
  for (let i = 0; i < imagesInFolder.length; i++) {
    const imagePath = path.join(pathFolder, imagesInFolder[i]);
    const stat = fs.statSync(imagePath);

    const filenameWithParam = path.basename(imagePath);
    const isStar = FilenameHandler.paramCheck(filenameWithParam, 's');
    const filenameWithoutParam = FilenameHandler.getFilenameWithoutParamAndExtension(filenameWithParam).join('.');

    const searchParamsObject: {
      image: string;
      folder?: string;
      thumb?: string;
    } = {
      image: filenameWithoutParam,
    };

    if (folder && !isTrash) {
      searchParamsObject.folder = folder;
    }

    const pathParams: any = { ...searchParamsObject };
    const thumbParams: any = { ...searchParamsObject, thumb: '1' };
    if (isTrash) {
      pathParams.trash = '1';
      thumbParams.trash = '1';
    }

    const image = {
      path: `/api/file?${encodeObjectToQueryString(pathParams)}`,
      thumb: `/api/file?${encodeObjectToQueryString(thumbParams)}`,
      created: stat.birthtimeMs,
      filename: filenameWithoutParam,
      isStar: isStar,
      folder: (!isTrash && folder) ?? '',
    };

    images.push(image);
  }
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

export async function toggleStar(folder: string, filenameWithoutParam: string, toStar: boolean) {
  const filename = await FilenameHandler.getFileFromFolder(folder, filenameWithoutParam);
  if (filename) {
    const newFileName = toStar ? FilenameHandler.setParam(filename, 's') : FilenameHandler.removeParam(filename, 's');
    const basePath = path.join(GALLERY_ROOT_PATH, folder);
    fs.renameSync(path.join(basePath, filename), path.join(basePath, newFileName));
  }
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
  await ImageManipulation.downScale(sharp(buffer), thumbPath, 640, imagePath);
  return 1;
}

export async function addFolderToServer(folder: string) {
  fs.mkdirSync(path.join(GALLERY_ROOT_PATH, folder), { recursive: true });
  fs.mkdirSync(path.join(THUMBS_ROOT_PATH), { recursive: true });
}

// arrOfFilenamesWithoutParam = [folder, filename][]
export async function deleteFilesFromServer(
  arrOfFilenamesWithoutParam: [string, string][],
  deleteFile: boolean = false
) {
  for (let i = 0; arrOfFilenamesWithoutParam.length > i; i++) {
    const [folder, filenameWithoutParam] = arrOfFilenamesWithoutParam[i];

    // Permanently delete image
    if (deleteFile) {
      const filename = await FilenameHandler.getDeletedFileFromServer(filenameWithoutParam);
      if (filename) {
        const baseFolder = DELETED_IMAGES_PATH;
        const fullFilePath = path.join(baseFolder, filename);
        if (fs.existsSync(fullFilePath)) {
          fs.unlinkSync(fullFilePath);
        }
      }
    }
    // Move to trash folder
    else {
      const filename = await FilenameHandler.getFileFromFolder(folder, filenameWithoutParam);
      if (filename) {
        const baseFolder = folder !== '' ? path.join(GALLERY_ROOT_PATH, folder) : GALLERY_ROOT_PATH;
        const fullFilePath = path.join(baseFolder, filename);
        fs.mkdirSync(DELETED_IMAGES_PATH, { recursive: true });
        if (fs.existsSync(fullFilePath)) {
          const deletedFullPath = path.join(DELETED_IMAGES_PATH, basename(fullFilePath));
          fs.renameSync(fullFilePath, deletedFullPath);
        }
      }
    }
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

// arrOfFilenamesWithoutParam = [folder, filename][]
export async function copyFilesFromServer(nFolder: string, arrOfFilenamesWithoutParam: [string, string][]) {
  const baseNewPath = nFolder ? path.join(GALLERY_ROOT_PATH, nFolder) : GALLERY_ROOT_PATH;

  if (!fs.existsSync(baseNewPath)) {
    fs.mkdirSync(baseNewPath, { recursive: true });
  }

  for (let i = 0; arrOfFilenamesWithoutParam.length > i; i++) {
    const [cFolder, filenameWithoutParam] = arrOfFilenamesWithoutParam[i];
    const baseCurrentPath = cFolder !== '' ? path.join(GALLERY_ROOT_PATH, cFolder) : GALLERY_ROOT_PATH;
    const filename = await FilenameHandler.getFileFromFolder(cFolder, filenameWithoutParam);
    if (filename) {
      const currentFile = path.join(baseCurrentPath, filename);
      const newFile = path.join(baseNewPath, filename);

      if (fs.existsSync(currentFile)) {
        fs.copyFileSync(currentFile, newFile);
      }
    }
  }
}

// arrOfFilenamesWithoutParam = [folder, filename][]
export async function moveFilesFromServer(nFolder: string, arrOfFilenamesWithoutParam: [string, string][]) {
  const baseNewPath = nFolder ? path.join(GALLERY_ROOT_PATH, nFolder) : GALLERY_ROOT_PATH;

  if (!fs.existsSync(baseNewPath)) {
    fs.mkdirSync(baseNewPath, { recursive: true });
  }

  for (let i = 0; arrOfFilenamesWithoutParam.length > i; i++) {
    const [cFolder, filenameWithoutParam] = arrOfFilenamesWithoutParam[i];
    const baseCurrentPath = cFolder !== '' ? path.join(GALLERY_ROOT_PATH, cFolder) : GALLERY_ROOT_PATH;
    const filename = await FilenameHandler.getFileFromFolder(cFolder, filenameWithoutParam);
    if (filename) {
      const currentFile = path.join(baseCurrentPath, filename);
      const newFile = path.join(baseNewPath, filename);

      if (fs.existsSync(currentFile)) {
        fs.renameSync(currentFile, newFile);
      }
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

export async function zipFile(pathFiles: string[]) {
  fs.mkdirSync(ZIP_PATH, { recursive: true });

  const filename = `${new Date().getTime()}.zip`;

  const output = fs.createWriteStream(path.join(ZIP_PATH, filename));
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });
  archive.pipe(output);

  for (let i = 0; pathFiles.length > i; i++) {
    const [image, folder] = await extractImageAndFolder(pathFiles[i]);
    const filename = await FilenameHandler.getFileFromFolder(folder, image);
    if (!filename) continue;

    const pathFile = folder ? path.join(GALLERY_ROOT_PATH, folder, filename) : path.join(GALLERY_ROOT_PATH, filename);
    if (fs.existsSync(pathFile)) {
      archive.file(pathFile, { name: path.basename(pathFile) });
    }
  }

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  await archive.finalize();

  return filename;
}

export async function deleteZipFile(filename: string) {
  const fullPath = path.join(ZIP_PATH, filename);
  if (fs.existsSync(fullPath) && filename) {
    fs.unlinkSync(fullPath);
  }
}

async function extractImageAndFolder(url: string) {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const image = urlParams.get('image') || '';
  const folder = urlParams.get('folder') || '';
  return [image, folder];
}

export async function getDiskSpace() {
  return checkDiskSpace(path.resolve(__dirname));
}

export async function getServerSidebarState() {
  const cookie = cookies().get('sidebar');

  if (cookie) {
    if (cookie.value === 'open') {
      return true;
    }
  }

  if (!cookie && (await isMobileDevice())) {
    return false;
  }

  return false;
}

export async function changeServerSidebarCookie(value: 'open' | 'closed') {
  cookies().set('sidebar', value);
}

export async function isMobileDevice() {
  if (typeof process === 'undefined') {
    throw new Error('[Server method] you are importing a server-only module outside of server');
  }

  const { get } = headers();
  const ua = get('user-agent');

  const device = new UAParser(ua || '').getDevice();
  return device.type === 'mobile';
}
