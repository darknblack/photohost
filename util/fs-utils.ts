import path from 'path';
import fs from 'fs';
import { BASE_URL } from './api-helper';

export const GALLERY_ROOT_PATH = path.join('gallery');

export function fetchImageMetadata() {
  const allImages: Images[] = [];

  // Get the list of subfolders within the "images/" directory
  const subfolders = fs
    .readdirSync(GALLERY_ROOT_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  // Iterate through each subfolder
  subfolders.forEach(folder => {
    const folderPath = path.join(GALLERY_ROOT_PATH, folder);

    // Get the list of image files within the subfolder
    const imagesInFolder = fs.readdirSync(folderPath).filter(file => file.match(/\.(jpe?g|png|gif)$/i));

    // Collect metadata for each image
    imagesInFolder.forEach(file => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      const newPath = filePath.replace(path.join(process.cwd(), 'public'), '').replace('gallery\\', '');
      allImages.push({
        path: `/api/file?image=` + encodeURIComponent(newPath),
        created: stat.birthtimeMs,
      });
    });
  });

  // Sort images by creation time (oldest to newest)
  allImages.sort((a, b) => a.created - b.created);

  return allImages;
}
