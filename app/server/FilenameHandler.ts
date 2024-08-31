import { DELETED_IMAGES_PATH, ALBUM_ROOT_PATH } from '@/util/fs-utils';
import fs from 'fs/promises';
import path from 'path';

const FilenameHandler = {
  getParam(filename: string) {
    const filenameParts = filename.replace(/\.[^/.]+$/, '').split('-');
    return filenameParts.length > 2 ? filenameParts[2] + '' : '';
  },
  setParam(filenameWithExtension: string, param: string) {
    let filenameParam = this.getParam(filenameWithExtension);
    const [filenameWithoutParam, extension] = this.getFilenameWithoutParamAndExtension(filenameWithExtension);

    if (!filenameParam.includes(param)) {
      filenameParam += 's';
    }

    return `${filenameWithoutParam}-${filenameParam}.${extension}`;
  },
  removeParam(filenameWithExtension: string, param: string) {
    let filenameParam = this.getParam(filenameWithExtension);
    const [filenameWithoutParam, extension] = this.getFilenameWithoutParamAndExtension(filenameWithExtension);

    if (filenameParam.includes(param)) {
      filenameParam = filenameParam.replace(param, '');
    }

    if (filenameParam !== '') {
      filenameParam = `-${filenameParam}`;
    }

    return `${filenameWithoutParam}${filenameParam}.${extension}`;
  },
  paramCheck(filename: string, param: string) {
    const filenameParam = this.getParam(filename);
    return filenameParam.includes(param);
  },
  getFilenameWithoutParamAndExtension(filePath: string): [string, string] {
    const fullFileName = filePath.split('/').pop() as string;
    const ext = path.extname(fullFileName);
    const fileNameWithoutExtension = fullFileName.replace(ext, '');
    const [date, hash] = fileNameWithoutExtension.split('-');

    return [`${date}-${hash}`, ext.replace('.', '')];
  },
  async getFileFromFolder(folder: string, filenameHash: string): Promise<string | undefined> {
    const basePath = folder ? path.join(ALBUM_ROOT_PATH, folder) : ALBUM_ROOT_PATH;
    const files = await fs.readdir(basePath);
    const file = files.find(file => this.generateHashFilename(file) === filenameHash);
    return file;
  },
  async getDeletedFileFromServer(filenameHash: string): Promise<string | undefined> {
    const files = await fs.readdir(DELETED_IMAGES_PATH);
    const file = files.find(file => this.generateHashFilename(file) === filenameHash);
    return file;
  },
  generateHashFilename(filename: string) {
    const basename = path.basename(filename);
    const ext = path.extname(filename);
    const [, hash] = basename.split('-');
    const filenameHash = `${hash.replace(ext, '')}${ext}`;
    return filenameHash;
  },
};

export default FilenameHandler;
