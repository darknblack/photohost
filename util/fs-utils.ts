import path from 'path';
import fs from 'fs';
import ImageCache from './image-cache';
import { blake3 } from 'hash-wasm';

export const GALLERY_ROOT_PATH = path.join('gallery');
export const THUMBS_PATH = path.join('thumbs');

function fetchImageAndSort(folder: string, sortedImages: Image[]) {
  const imagesInRootFolder = fs.readdirSync(folder).filter(file => file.match(/\.(jpe?g|png|gif)$/i));

  imagesInRootFolder.forEach(file => {
    let filePath = path.join(GALLERY_ROOT_PATH, file);
    let thumbPath = path.join(THUMBS_PATH, file);

    if (!fs.existsSync(thumbPath)) {
      thumbPath = filePath;
    }

    const stat = fs.statSync(filePath);
    filePath = filePath.replace(`${GALLERY_ROOT_PATH}\\`, '');
    thumbPath = thumbPath.replace(`${THUMBS_PATH}\\`, '');

    const image = {
      path: `/api/file?image=` + filePath,
      thumb: `/api/thumb?image=` + thumbPath,
      created: stat.birthtimeMs,
    };

    // Insert the image into its sorted position
    let insertIndex = sortedImages.findIndex(item => item.created < image.created);
    if (insertIndex === -1) insertIndex = sortedImages.length;
    sortedImages.splice(insertIndex, 0, image);
  });
}

export function fetchImageMetadata() {
  const sortedImages: Image[] = [];

  fs.mkdirSync(GALLERY_ROOT_PATH, { recursive: true });
  fs.mkdirSync(THUMBS_PATH, { recursive: true });

  // Get the list of subfolders within the "images/" directory
  const folders = fs
    .readdirSync(GALLERY_ROOT_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  // Fetch images on the root level
  fetchImageAndSort(GALLERY_ROOT_PATH, sortedImages);

  // Fetch images on each subfolder
  folders.forEach(folder => {
    fetchImageAndSort(path.join(GALLERY_ROOT_PATH, folder), sortedImages);
  });

  return sortedImages;
}

export function getAllImages(page = 1, pageSize = 50) {
  const imageCache = fetchImageMetadata();

  // Sort and paginate cached images
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedImages = imageCache && imageCache.slice(startIndex, endIndex);

  return paginatedImages || [];
}

export function getImagesByFolder(subFolder: string, page = 1, pageSize = 50): Image[] {
  const sortedImages: Image[] = [];
  const folder = path.join(GALLERY_ROOT_PATH, subFolder);
  fetchImageAndSort(folder, sortedImages);

  // Sort and paginate cached images
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedImages = sortedImages.slice(startIndex, endIndex);

  return paginatedImages || [];
}

export function getAllFolders() {
  fs.mkdirSync(GALLERY_ROOT_PATH, { recursive: true });

  const folders = fs
    .readdirSync(GALLERY_ROOT_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  return folders;
}

export function getHashValue(buffer: Buffer) {
  return blake3(buffer, 128);
}
