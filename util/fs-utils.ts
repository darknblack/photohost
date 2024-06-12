import path from 'path';
import { blake3 } from 'hash-wasm';

export const STARRED_JSON_PATH = path.join('gallery', 'starred-list.json');
export const GALLERY_ROOT_PATH = path.join('gallery');
export const THUMBS_ROOT_PATH = path.join('thumbs');
export const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

export function getHashValue(buffer: Buffer) {
  return blake3(buffer, 64);
}
