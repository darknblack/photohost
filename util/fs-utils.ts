import path from 'path';
import fs from 'fs';

export const GALLERY_ROOT_PATH = path.join('gallery');

function fetchImageAndSort(folder: string, sortedImages: Image[]) {
  const imagesInRootFolder = fs.readdirSync(folder).filter(file => file.match(/\.(jpe?g|png|gif)$/i));

  imagesInRootFolder.forEach(file => {
    const filePath = path.join(GALLERY_ROOT_PATH, file);
    const stat = fs.statSync(filePath);
    const newPath = filePath.replace(`${GALLERY_ROOT_PATH}\\`, '');

    const image = {
      path: `/api/file?image=` + encodeURIComponent(newPath),
      created: stat.birthtimeMs,
    };

    // Insert the image into its sorted position
    let insertIndex = sortedImages.findIndex(existingImage => existingImage.created < image.created);
    if (insertIndex === -1) insertIndex = sortedImages.length;
    sortedImages.splice(insertIndex, 0, image);
  });
}

export function fetchImageMetadata() {
  const sortedImages: Image[] = [];

  // Get the list of subfolders within the "images/" directory
  const subfolders = fs
    .readdirSync(GALLERY_ROOT_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  // Fetch images on the root level
  fetchImageAndSort(GALLERY_ROOT_PATH, sortedImages);

  // Fetch images on each subfolder
  subfolders.forEach(folder => {
    fetchImageAndSort(path.join(GALLERY_ROOT_PATH, folder), sortedImages);
  });

  return sortedImages;
}
