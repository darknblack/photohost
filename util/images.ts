// import { DirectoryWatcher } from './directory-watcher';
import {
  // GALLERY_ROOT_PATH,
  fetchImageMetadata,
} from './fs-utils';
import ImageCache from './image-cache';

export function getAllImages(page = 1, pageSize = 50) {
  let imageCache = ImageCache.get();

  // Check if image metadata is already cached
  if (!imageCache) {
    // If not cached, fetch image metadata
    ImageCache.set(fetchImageMetadata());
    // Watch for changes in the image directory
    imageCache = ImageCache.get();
  }

  // Watch for changes in the image directory
  // if (!DirectoryWatcher.isWatching) {
  //   DirectoryWatcher.watch(GALLERY_ROOT_PATH, () => {
  //     ImageCache.set(fetchImageMetadata());
  //   });
  // }

  // Sort and paginate cached images
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedImages = imageCache && imageCache.slice(startIndex, endIndex);

  return paginatedImages || [];
}
