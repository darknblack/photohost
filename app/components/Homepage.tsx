'use client';

import {
  FolderIcon,
  StarIcon,
  FolderPlusIcon,
  PhotoIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { Button, FileInput, Label } from 'flowbite-react';
import { useState } from 'react';
import cx from 'clsx';
import axios from 'axios';

interface Props {
  images: Image[];
}

const Homepage = (props: Props) => {
  const { images } = props;

  const [state, setState] = useState({
    isListView: false,
  });

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (!file) return;

    const f = new FormData();
    f.append('file', file);

    try {
      const r = await axios.post('/api/upload', f, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (e) {}
  };

  return (
    <div className="flex bg-zinc-800">
      <div id="sidebar" className="min-h-screen w-64 bg-zinc-900 px-5">
        <div className="py-6 font-[600] text-zinc-200 text-lg">Photohost.io</div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <FolderIcon className="text-gray-100 w-5" />
            <span>
              <h3 className="text-sm text-gray-300">Folders</h3>
            </span>
          </div>
          <div className="flex gap-2">
            <StarIcon className="text-gray-100 w-5" />
            <span>
              <h3 className="text-sm text-gray-300">Starred</h3>
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 p-2">
        <div className="p-2 flex justify-between">
          <div className="flex gap-2">
            <Button.Group>
              <Button size={'sm'} className="bg-transparent border border-gray-400">
                <span className="text-gray-200 text-xs relative top-0.5">Files</span>
              </Button>
              <Button size={'sm'} className="bg-transparent border border-gray-400">
                <span className="text-gray-200 text-xs relative top-0.5">Folder</span>
              </Button>
              <Button size={'sm'} className="bg-transparent border border-gray-400">
                <span className="text-gray-200 text-xs relative top-0.5">Both</span>
              </Button>
            </Button.Group>
          </div>
          <div className="flex gap-2">
            <Button.Group>
              <Button
                size={'sm'}
                className={cx('bg-transparent border border-gray-400', {
                  'bg-gray-300': state.isListView,
                })}
                onClick={() => {
                  setState({ ...state, isListView: true });
                }}
              >
                <ListBulletIcon
                  className={cx('w-5', {
                    'text-gray-700': state.isListView,
                  })}
                />
              </Button>
              <Button
                size={'sm'}
                className={cx('bg-transparent border border-gray-400', {
                  'bg-gray-300': !state.isListView,
                })}
                onClick={() => {
                  setState({ ...state, isListView: false });
                }}
              >
                <Squares2X2Icon
                  className={cx('w-5', {
                    'text-gray-700': !state.isListView,
                  })}
                />
              </Button>
            </Button.Group>
          </div>
          <div className="flex gap-2">
            <Button
              size={'sm'}
              className="bg-transparent border border-gray-400"
              onClick={() => {
                document.getElementById('upload-image')?.click();
              }}
            >
              <PhotoIcon className="w-5 mr-2" />
              <span className="text-gray-200 text-xs relative top-0.5">Add item</span>
            </Button>
            <FileInput
              id="upload-image"
              className="hidden"
              accept="image/png, image/gif, image/jpeg"
              onChange={uploadImage}
            />
            <Button size={'sm'} className="bg-transparent border border-gray-400">
              <FolderPlusIcon className="w-5 mr-2" />
              <span className="text-gray-200 text-xs relative top-0.5">Add folder</span>
            </Button>
          </div>
        </div>
        <div className="">
          <div
            className={cx('grid p-2', {
              'grid-cols-3 gap-4': state.isListView,
              'grid-cols-8 gap-2': !state.isListView,
            })}
          >
            {images.map(image => (
              <div
                key={image.path}
                className={cx({
                  'flex gap-2 items-center': state.isListView,
                })}
              >
                <img
                  src={image.path}
                  alt="Image"
                  className={cx('rounded', {
                    'h-40': !state.isListView,
                    '!w-12 h-12': state.isListView,
                  })}
                  style={{
                    objectFit: 'cover', // TODO: experiment with scale-down option
                    width: '100%',
                  }}
                />
                <div
                  className={cx({
                    hidden: !state.isListView,
                    'flex-1 flex gap-6 px-2': state.isListView,
                  })}
                >
                  {/* <div>25MB</div> */}
                  <div>2024-01-01 12:00</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

{
  /* <div
                  style={{
                    background: `url(${image.path})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                  className={cx('flex items-center justify-center rounded', {
                    'h-40': !state.isListView,
                    'h-14 w-14': state.isListView,
                  })}
                ></div> */
}
