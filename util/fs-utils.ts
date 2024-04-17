import path from 'path';
import fs from 'fs';

export const GALLERY_ROOT_PATH = path.join('gallery');

export function fetchImage(folder: string) {
  const imagesInRootFolder = fs.readdirSync(folder).filter(file => file.match(/\.(jpe?g|png|gif)$/i));

  const allImages: Images[] = [];

  // Collect metadata for each image
  imagesInRootFolder.forEach(file => {
    const filePath = path.join(GALLERY_ROOT_PATH, file);
    const stat = fs.statSync(filePath);
    const newPath = filePath.replace(`${GALLERY_ROOT_PATH}\\`, '');
    allImages.push({
      path: `/api/file?image=` + encodeURIComponent(newPath),
      created: stat.birthtimeMs,
    });
  });

  return allImages;
}

export function fetchImageMetadata() {
  const allImages: Images[] = [];

  // Get the list of subfolders within the "images/" directory
  const subfolders = fs
    .readdirSync(GALLERY_ROOT_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  const rootImages = fetchImage(GALLERY_ROOT_PATH);
  allImages.push(...rootImages);

  // Iterate through each subfolder
  subfolders.forEach(folder => {
    const imagesInFolder = fetchImage(path.join(GALLERY_ROOT_PATH, folder));
    allImages.push(...imagesInFolder);
  });

  // Sort images by creation time (oldest to newest)
  allImages.sort((a, b) => a.created - b.created);

  return allImages;
}
