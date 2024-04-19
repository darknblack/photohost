import { getAllImages, getImagesByFolder } from '@/util/fs-utils';

export function getImages(activeFolder: string) {
  const images = activeFolder ? getImagesByFolder(activeFolder) : getAllImages();
  return images;
}
