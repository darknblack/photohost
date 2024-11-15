'use server';

import { DELETED_IMAGES_PATH, ALBUM_ROOT_PATH, VALID_EXTENSIONS, ZIP_PATH } from '@/util/fs-utils';
import fs from 'node:fs';
import { revalidatePath } from 'next/cache';
import path, { basename } from 'node:path';
import FilenameHandler from '@/app/server/FilenameHandler';
import archiver from 'archiver';
import checkDiskSpace from 'check-disk-space';
import { cookies } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';
import photoStorage from '@/util/photo-storage';

export async function getAllFolders(): Promise<string[]> {
  const folders: string[] = [];
  let nextCursor: string | undefined = undefined;

  while (true) {
    const f = await photoStorage.listFolders(nextCursor);
    folders.push(...f.folders);

    if (!f.nextCursor) {
      break;
    }

    nextCursor = f.nextCursor;
  }

  return folders;
}

export async function toggleStar(folder: string, filenameWithoutParam: string, toStar: boolean) {
  const filename = await FilenameHandler.getFileFromFolder(folder, filenameWithoutParam);
  if (filename) {
    const newFileName = toStar ? FilenameHandler.setParam(filename, 's') : FilenameHandler.removeParam(filename, 's');
    const basePath = path.join(ALBUM_ROOT_PATH, folder);
    fs.renameSync(path.join(basePath, filename), path.join(basePath, newFileName));
  }
}

// Function to process a single file
export async function uploadPhotoToServer(folder: string, formData: FormData) {
  try {
    const files = formData.getAll('files');
    if (files.length === 0) throw new Error('No files');

    const file = files[0] as File;

    // Get the file extension
    // @ts-ignore
    const ext = path.extname(file.name).toLowerCase().replace('.', '');
    // Check if extension is valid
    if (!VALID_EXTENSIONS.includes(ext)) throw new Error('Incorrect file');

    const buffer = Buffer.from(await file.arrayBuffer());
    return await photoStorage.uploadPhoto(buffer, file.name, folder);
  } catch (e) {
    // Handle error
    console.error('Error processing file:', e);
  }
}

// async function uploadImageOnServerLegacy(folder: string, formData: FormData) {
//   const files = formData.getAll('files');

//   // Function to process a single file
//   async function uploadPhoto(folder: string, file: File) {
//     try {
//       // Get the file extension
//       // @ts-ignore
//       const ext = path.extname(file.name).toLowerCase().replace('.', '');
//       // Check if extension is valid
//       if (!VALID_EXTENSIONS.includes(ext)) throw new Error('Incorrect file');

//       const buffer = Buffer.from(await file.arrayBuffer());
//       return await photoStorage.uploadPhoto(buffer, file.name, folder);
//     } catch (e) {
//       // Handle error
//       console.error('Error processing file:', e);
//     }
//   }

//   // To always process 2 images at the same time
//   let promises: Promise<any>[] = [];
//   for (const file of files) {
//     const promise = uploadPhoto(folder, file as File);
//     promises.push(promise);

//     // If there are at least 2 promises, wait for the first one to complete
//     if (promises.length >= 4) {
//       await Promise.race(promises);
//       // Remove resolved promises from the list
//       promises = promises.filter(p => p !== promise);
//     }
//   }

//   // Wait for any remaining promises to resolve
//   await Promise.all(promises);

//   return 1;
// }

export async function addFolderToServer(folder: string) {
  await photoStorage.createFolder(folder);
}

// arrOfFilenamesWithoutParam = [folder, filename][]
export async function deleteFilesFromServer(arrOfFilenamesWithoutParam: [string, string][], deleteFile: boolean) {
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
        const baseFolder = folder !== '' ? path.join(ALBUM_ROOT_PATH, folder) : ALBUM_ROOT_PATH;
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
    const folderPath = path.join(ALBUM_ROOT_PATH, folder);
    if (folder && fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath);
    }
  }
}

// arrOfFilenamesWithoutParam = [folder, filename][]
export async function copyFilesFromServer(nFolder: string, arrOfFilenamesWithoutParam: [string, string][]) {
  const baseNewPath = nFolder ? path.join(ALBUM_ROOT_PATH, nFolder) : ALBUM_ROOT_PATH;

  if (!fs.existsSync(baseNewPath)) {
    fs.mkdirSync(baseNewPath, { recursive: true });
  }

  for (let i = 0; arrOfFilenamesWithoutParam.length > i; i++) {
    const [cFolder, filenameWithoutParam] = arrOfFilenamesWithoutParam[i];
    const baseCurrentPath = cFolder !== '' ? path.join(ALBUM_ROOT_PATH, cFolder) : ALBUM_ROOT_PATH;
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
  const baseNewPath = nFolder ? path.join(ALBUM_ROOT_PATH, nFolder) : ALBUM_ROOT_PATH;

  if (!fs.existsSync(baseNewPath)) {
    fs.mkdirSync(baseNewPath, { recursive: true });
  }

  for (let i = 0; arrOfFilenamesWithoutParam.length > i; i++) {
    const [cFolder, filenameWithoutParam] = arrOfFilenamesWithoutParam[i];
    const baseCurrentPath = cFolder !== '' ? path.join(ALBUM_ROOT_PATH, cFolder) : ALBUM_ROOT_PATH;
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
  const oldPath = path.join(ALBUM_ROOT_PATH, folder);
  const newPath = path.join(ALBUM_ROOT_PATH, newFolder);

  let f1 = false;

  if (folder && fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    f1 = true;
  }

  return f1;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function encodeObjectToQueryString(obj: any) {
  const parts = [];
  for (const key in obj) {
    if (key in obj) {
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

    const pathFile = folder ? path.join(ALBUM_ROOT_PATH, folder, filename) : path.join(ALBUM_ROOT_PATH, filename);
    if (fs.existsSync(pathFile)) {
      archive.file(pathFile, { name: path.basename(pathFile) });
    }
  }

  // good practice to catch this error explicitly
  archive.on('error', err => {
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
