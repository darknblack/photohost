import path from 'path';
import { blake3 } from 'hash-wasm';

const BASE_STORED_PATH = path.join('storage');
export const STARRED_JSON_PATH = path.join(BASE_STORED_PATH, 'album', 'starred-list.json');
export const ALBUM_ROOT_PATH = path.join(BASE_STORED_PATH, 'album');
export const DELETED_IMAGES_PATH = path.join(BASE_STORED_PATH, 'trash');
export const THUMBS_ROOT_PATH = path.join(BASE_STORED_PATH, 'thumbs');
export const ZIP_PATH = path.join(BASE_STORED_PATH, 'zip');
export const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

export function getHashValue(buffer: Buffer) {
  return blake3(buffer, 64);
}
