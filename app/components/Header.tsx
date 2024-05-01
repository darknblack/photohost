'use client';

import {
  FolderPlusIcon,
  PhotoIcon,
  ListBulletIcon,
  Squares2X2Icon,
  PencilIcon,
  TrashIcon,
  ArrowRightStartOnRectangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Button, FileInput } from 'flowbite-react';
import cx from 'clsx';
import { Breadcrumb } from 'flowbite-react';
import Link from 'next/link';
import { memo } from 'react';

interface State {
  isListView: boolean;
  openAddFolder: boolean;
}

interface Props {
  state: State;
  changeState: (newState: Partial<State>) => void;
  activeFolder: string;
  uploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedImagesId: string[];
  selectAllImages: () => void;
  isAllSelected: boolean;
}

function Header(props: Props) {
  const { state, changeState, activeFolder, uploadImage, selectedImagesId, selectAllImages, isAllSelected } = props;

  return (
    <div id="header" className="px-4 py-2 grid grid-cols-3">
      <div className="flex gap-2">
        <Breadcrumb className="bg-neutral-900 px-3 rounded min-w-[24rem] py-2">
          <Breadcrumb.Item>
            <Link href="/" className="text-neutral-200">
              Gallery
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={{ pathname: '/', query: { folder: activeFolder } }} className="text-neutral-200">
              {activeFolder}
            </Link>

            <button
              className={cx('ml-2.5 hidden', {
                '!block': activeFolder && activeFolder !== '',
              })}
            >
              <PencilIcon className={cx('w-4 text-neutral-500 hover:text-neutral-200')} />
            </button>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="flex gap-2 items-center justify-center">
        <Button
          size="xs"
          className="bg-transparent py-1 border border-neutral-400 min-w-[6.8rem]"
          onClick={selectAllImages}
        >
          {!isAllSelected ? (
            <>
              <span>Select All</span>
              <CheckIcon className="ml-1 w-3.5" />
            </>
          ) : (
            <>
              <span>Deselect All</span>
              <XMarkIcon className="ml-1 w-3.5" />
            </>
          )}
        </Button>
        <Button size="xs" disabled={selectedImagesId.length === 0} className="bg-transparent border border-neutral-400">
          <ArrowDownTrayIcon className="w-5 text-neutral-200" />
        </Button>
        <Button size="xs" disabled={selectedImagesId.length === 0} className="bg-transparent border border-neutral-400">
          <ArrowRightStartOnRectangleIcon className="w-5 text-neutral-200" />
        </Button>
        <Button
          size="xs"
          disabled={selectedImagesId.length === 0}
          className="bg-transparent py-0.5 border border-neutral-400"
        >
          <TrashIcon className="w-5 text-neutral-200" />
        </Button>
      </div>
      <div className="flex gap-2 justify-end">
        <div className="flex items-center justify-center">
          <Button
            size="xs"
            className={cx('bg-transparent rounded-r-none border-r-0 border-neutral-400', {
              '!bg-gray-300': state.isListView,
            })}
            onClick={() => {
              changeState({ ...state, isListView: true });
            }}
          >
            <ListBulletIcon
              className={cx('w-5', {
                'text-neutral-700': state.isListView,
              })}
            />
          </Button>
          <Button
            size="xs"
            className={cx('bg-transparent rounded-l-none border-l-0 !border-neutral-400', {
              '!bg-gray-200': !state.isListView,
            })}
            onClick={() => {
              changeState({ ...state, isListView: false });
            }}
          >
            <Squares2X2Icon
              className={cx('w-5', {
                'text-neutral-700': !state.isListView,
              })}
            />
          </Button>
        </div>
        <FileInput
          id="upload-image"
          className="hidden"
          accept="image/png, image/gif, image/jpeg"
          onChange={uploadImage}
        />
        <Button
          size={'xs'}
          className="bg-transparent border border-neutral-400"
          onClick={() => {
            changeState({ openAddFolder: !state.openAddFolder });
          }}
        >
          <FolderPlusIcon className="w-5 text-neutral-200" />
          <span className="text-neutral-200 text-xs relative top-0.5"></span>
        </Button>
        <Button
          size={'xs'}
          className="bg-transparent border border-neutral-400"
          onClick={() => {
            document.getElementById('upload-image')?.click();
          }}
        >
          <PhotoIcon className="w-5 text-neutral-200" />
          <span className="text-neutral-200 text-xs relative top-0.5"></span>
        </Button>
      </div>
    </div>
  );
}

export default memo(Header);
