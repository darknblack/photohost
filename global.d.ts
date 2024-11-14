interface Image {
  path: string;
  thumb: string;
  created: number;
  isStar: boolean;
  folder: string;
  filename: string;
}

interface Folder {
  name: string;
  count: number;
}

interface ExtendedImage extends Image {
  path: string;
  thumb: string;
}

interface ThumbnailSizes {
  small: {
    width: number;
    height: number;
  };
}

interface ThumbnailInfo {
  hash: string;
  urls: {
    small: string;
  };
}

interface PhotoMetadata {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  hash: string;
  uploadedAt: string;
  folder: string;
  tags?: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

interface PhotoRecord {
  metadata: PhotoMetadata;
  url: string;
  thumbnails: {
    small: string;
  };
}

interface ListPhotosOptions {
  folder?: string;
  limit?: number;
  cursor?: string;
  tags?: string[];
}

interface ListFoldersResponse {
  folders: string[];
  nextCursor?: string;
}
