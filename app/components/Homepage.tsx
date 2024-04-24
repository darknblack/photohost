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
import { useState } from 'react';
import cx from 'clsx';
import useEvent from '../hooks/useEvent';
import { Breadcrumb } from 'flowbite-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { addFolderToServer, uploadImageOnServer } from '../actions';
import { useRouter } from 'next/navigation';

interface Props {
  images: Image[];
  folders: {
    name: string;
    count: number;
  }[];
  activeFolder: string;
}

const Homepage = (props: Props) => {
  const { images, folders } = props;

  const searchParams = useSearchParams();
  const activeFolder = searchParams.get('folder') as string;
  const router = useRouter();

  const [state, setState] = useState({
    isListView: false,
    folderName: '',
    openAddFolder: false,
    images: images,
  });

  const uploadImage = useEvent(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadImageOnServer(formData, activeFolder);
      if (res === 1) router.refresh();
    } catch (e) {}
  });

  const createFolder = async () => {
    try {
      const res = await addFolderToServer(state.folderName);
      router.refresh();
    } catch (e) {}

    setState({
      ...state,
      folderName: '',
      openAddFolder: false,
    });
  };

  return (
    <div className="flex bg-neutral-900">
      <div id="sidebar" className="min-h-screen w-64 bg-neutral-950 px-5">
        <Link
          href={{ pathname: '/', query: { folder: '' } }}
          as={{ pathname: '/', query: { folder: '' } }}
          className="block py-6 font-[600] text-zinc-200 text-lg"
        >
          Photohost.io
        </Link>
        <div className="flex flex-col gap-3">
          <div className="">
            <Link
              href={{ pathname: '/', query: { folder: '' } }}
              as={{ pathname: '/', query: { folder: '' } }}
              className="flex gap-2"
            >
              <FolderIcon className="text-neutral-300 w-5" />
              <h3 className="text-sm text-neutral-300">Gallery</h3>
            </Link>
            <div className="py-2 flex flex-col gap-1">
              {folders.map(folder => (
                <Link href={`?folder=${encodeURIComponent(folder.name)}`} key={folder.name} className="flex gap-2 px-3">
                  <FolderIcon
                    className={cx('text-neutral-500 w-5 h-5', {
                      '!text-neutral-300': folder.name === activeFolder,
                    })}
                  />
                  <h3 className="text-sm text-neutral-300 flex-1">
                    {folder.name} <span className={cx('text-xs text-neutral-500')}>({folder.count})</span>
                  </h3>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <StarIcon className="text-neutral-300 w-5" />
            <h3 className="text-sm text-neutral-300">Starred</h3>
          </div>
        </div>
      </div>
      <div className="flex-1 p-2">
        <div className="px-4 py-2 flex justify-between">
          <div className="flex gap-2">
            <Breadcrumb className="bg-neutral-900 px-3 rounded min-w-[24rem] py-2">
              <Breadcrumb.Item>
                <Link href="/" className="text-neutral-200">
                  Gallery
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <div className="text-neutral-300">{activeFolder}</div>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center justify-center">
              <Button
                size="xs"
                className={cx('bg-transparent rounded-r-none border-r-0 border-neutral-400 cursor-pointer', {
                  '!bg-gray-300': state.isListView,
                })}
                onClick={() => {
                  setState({ ...state, isListView: true });
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
                className={cx('bg-transparent rounded-l-none border-l-0 !border-neutral-400 cursor-pointer', {
                  '!bg-gray-300': !state.isListView,
                })}
                onClick={() => {
                  setState({ ...state, isListView: false });
                }}
              >
                <Squares2X2Icon
                  className={cx('w-5', {
                    'text-neutral-700': !state.isListView,
                  })}
                />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size={'sm'}
              className="bg-transparent border border-neutral-400"
              onClick={() => {
                document.getElementById('upload-image')?.click();
              }}
            >
              <PhotoIcon className="w-5 mr-2" />
              <span className="text-neutral-200 text-xs relative top-0.5">Add item</span>
            </Button>
            <FileInput
              id="upload-image"
              className="hidden"
              accept="image/png, image/gif, image/jpeg"
              onChange={uploadImage}
            />
            <Button
              size={'sm'}
              className="bg-transparent border border-neutral-400"
              onClick={() => {
                setState(prev => ({ ...prev, openAddFolder: !prev.openAddFolder }));
              }}
            >
              <FolderPlusIcon className="w-5 mr-2" />
              <span className="text-neutral-200 text-xs relative top-0.5">Add folder</span>
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
              <Link
                key={image.path}
                href={image.path}
                className={cx({
                  'flex gap-2 items-center': state.isListView,
                })}
                target="_blank"
                prefetch={false}
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
              </Link>
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
            <FolderIcon className="text-neutral-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">Enter the folder name</h3>
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
