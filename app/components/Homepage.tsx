'use client';

import {
  FolderIcon,
  StarIcon,
  FolderPlusIcon,
  PhotoIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { Button, FileInput, Label, Modal, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import cx from 'clsx';
import axios from 'axios';
import useEvent from '../hooks/useEvent';
import { Breadcrumb } from 'flowbite-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import usePrevious from '../hooks/usePrevious';

interface Props {
  images: Image[];
  folders: string[];
  activeFolder: string;
}

const Homepage = (props: Props) => {
  const { images, folders } = props;

  const searchParams = useSearchParams();
  const folder = searchParams.get('folder') as string;
  const prevFolder = usePrevious(folder);

  const [state, setState] = useState({
    isListView: false,
    folderName: '',
    openAddFolder: false,
    images: images,
  });

  const uploadImage = useEvent(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (!file) return;

    const f = new FormData();
    f.append('file', file);

    try {
      await axios.post('/api/upload', f, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      window.location.reload();
    } catch (e) {}
  });

  const createFolder = async () => {
    try {
      await axios.post(`/api/folder?name=${encodeURIComponent(state.folderName)}`);
      window.location.reload();
    } catch (e) {}

    setState({
      ...state,
      folderName: '',
      openAddFolder: false,
    });
  };

  return (
    <div className="flex bg-zinc-800">
      <div id="sidebar" className="min-h-screen w-64 bg-zinc-900 px-5">
        <Link href="/" className="block py-6 font-[600] text-zinc-200 text-lg">
          Photohost.io
        </Link>
        <div className="flex flex-col gap-3">
          <div className="">
            <Link href={'/'} className="flex gap-2">
              <FolderIcon className="text-gray-100 w-5" />
              <h3 className="text-sm text-gray-300">Home</h3>
            </Link>
            <div className="py-2 flex flex-col gap-1">
              {folders.map((folder, index) => (
                <Link href={`?folder=${encodeURIComponent(folder)}`} key={index} className="flex gap-2 px-6">
                  <FolderIcon className="text-gray-100 w-5" />
                  <h3 className="text-sm text-gray-300">{folder}</h3>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <StarIcon className="text-gray-100 w-5" />
            <h3 className="text-sm text-gray-300">Starred</h3>
          </div>
        </div>
      </div>
      <div className="flex-1 p-2">
        <div className="px-4 py-2 flex justify-between">
          <div className="flex gap-2">
            <Breadcrumb className="bg-zinc-900 px-3 rounded min-w-[24rem] py-2">
              <Breadcrumb.Item>
                <Link href="/" className="text-gray-200">
                  Home
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <div className="text-gray-300">{folder}</div>
              </Breadcrumb.Item>
            </Breadcrumb>
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
            <Button
              size={'sm'}
              className="bg-transparent border border-gray-400"
              onClick={() => {
                setState(prev => ({ ...prev, openAddFolder: !prev.openAddFolder }));
              }}
            >
              <FolderPlusIcon className="w-5 mr-2" />
              <span className="text-gray-200 text-xs relative top-0.5">Add folder</span>
            </Button>
          </div>
        </div>
        <div className="">
          <div
            className={cx('grid px-4 py-5', {
              'grid-cols-3 gap-4': state.isListView,
              'grid-cols-8 gap-2': !state.isListView,
            })}
          >
            {state.images.map(image => (
              <a
                href={image.path}
                key={image.thumb}
                className={cx({
                  'flex gap-2 items-center': state.isListView,
                })}
              >
                <img
                  src={image.thumb}
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
              </a>
            ))}
          </div>
        </div>
      </div>
      <Modal
        show={state.openAddFolder}
        size="md"
        onClose={() =>
          setState(prev => ({
            ...prev,
            openAddFolder: false,
          }))
        }
        dismissible
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FolderIcon className="text-gray-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Enter the folder name</h3>
            <TextInput
              value={state.folderName}
              onChange={e =>
                setState(prev => ({
                  ...prev,
                  folderName: e.target.value,
                }))
              }
            ></TextInput>
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={createFolder}>{'Create folder'}</Button>
              <Button
                color="gray"
                onClick={() =>
                  setState(prev => ({
                    ...prev,
                    openAddFolder: false,
                  }))
                }
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
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
