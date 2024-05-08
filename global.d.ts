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
