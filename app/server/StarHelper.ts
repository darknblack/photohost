import { STARRED_JSON_PATH } from '@/util/fs-utils';
import fs from 'fs';
import fsp from 'fs/promises';

export const StarHelper = {
  starred: {} as {
    [key: string]: boolean;
  },
  isInit: false,
  init() {
    if (!fs.existsSync(STARRED_JSON_PATH)) {
      fs.mkdirSync(STARRED_JSON_PATH);
      fs.writeFileSync(STARRED_JSON_PATH, JSON.stringify({}));
      this.starred = {};
      this.isInit = true;
    } else {
      const rawData = fs.readFileSync(STARRED_JSON_PATH, 'base64');
      if (rawData) {
        this.starred = JSON.parse(atob(rawData));
      }
    }
  },
  isStarred(folder: string, filename: string) {
    const key = folder ? `${folder}-filename` : filename;

    if (!this.isInit) this.init();
    return this.starred[key];
  },

  set(folder: string, filename: string, toStar: boolean) {
    const key = folder ? `${folder}-filename` : filename;
    if (!this.isInit) this.init();

    if (toStar) {
      this.starred[key] = toStar;
    } else {
      delete this.starred[key];
    }

    fsp.writeFile(STARRED_JSON_PATH, JSON.stringify(this.starred), 'base64');
  },
};
