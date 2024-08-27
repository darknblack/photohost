import path from 'path';
import { blake3 } from 'hash-wasm';

export const STARRED_JSON_PATH = path.join('album', 'starred-list.json');
export const ALBUM_ROOT_PATH = path.join('album');
export const DELETED_IMAGES_PATH = path.join('trash');
export const THUMBS_ROOT_PATH = path.join('thumbs');
export const ZIP_PATH = path.join('zip');
export const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

export function getHashValue(buffer: Buffer) {
  return blake3(buffer, 64);
}
