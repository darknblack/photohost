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
import { Button, FileInput, Modal, TextInput, Select } from 'flowbite-react';
import cx from 'clsx';
import { Breadcrumb } from 'flowbite-react';
import Link from 'next/link';
import { memo, useRef, useState } from 'react';
import { deleteFilesFromServer, moveFilesFromServer, renameFolder } from '../actions';
import { useRouter } from 'next/navigation';
import useEvent from '../hooks/useEvent';

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
  images: Image[];
  folders: Folder[];
}

function Header(props: Props) {
  const {
    state,
    changeState,
    activeFolder,
    uploadImage,
    selectedImagesId,
    selectAllImages,
    isAllSelected,
    images,
    folders,
  } = props;
  const router = useRouter();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [formAddFolderName, setFormAddFolderName] = useState(activeFolder);

  const rElDestinationFolder = useRef<any>();

  const fSelectedImagesId = selectedImagesId
    .filter(item => item)
    .map(item => {
      const [, queryString] = item.split('?');

      // Extract the filename from the query string
      const params = new URLSearchParams(queryString);
      const filename = params.get('image');
      return filename as string;
    });

  const deleteFilesFromServerHandler = useEvent(async () => {
    try {
      await deleteFilesFromServer(activeFolder, fSelectedImagesId);
      router.refresh();
    } catch (e) {}
  });

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
              onClick={() => {
                setFormAddFolderName(activeFolder);
                setIsRenameModalOpen(true);
              }}
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
          disabled={images.length === 0}
        >
          {images.length === 0 || !isAllSelected ? (
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
        <Button
          size="xs"
          disabled={selectedImagesId.length === 0 || folders.length === 0}
          className="bg-transparent border border-neutral-400"
          onClick={() => {
            setIsMoveModalOpen(true);
          }}
        >
          <ArrowRightStartOnRectangleIcon className="w-5 text-neutral-200" />
        </Button>
        <Button
          size="xs"
          disabled={selectedImagesId.length === 0}
          className="bg-transparent py-0.5 border border-neutral-400"
          onClick={() => {
            setIsDeleteModalOpen(true);
          }}
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
      <Modal show={isRenameModalOpen} size="md" popup dismissible onClose={() => setIsRenameModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <PencilIcon className="text-neutral-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              Enter the new folder name
            </h3>
            <TextInput value={formAddFolderName} onChange={e => setFormAddFolderName(e.target.value)} />

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={async () => {
                  setIsRenameModalOpen(false);
                  try {
                    const formatedFolderName = formAddFolderName.trim();
                    const res = await renameFolder(activeFolder, formatedFolderName);
                    if (res) {
                      router.replace(`/?folder=${encodeURIComponent(formatedFolderName)}`);
                      router.refresh();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Rename
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setIsRenameModalOpen(false);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={isDeleteModalOpen} size="md" popup dismissible onClose={() => setIsDeleteModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <TrashIcon className="text-red-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              {fSelectedImagesId.length > 1
                ? `Are you sure you want to delete ${fSelectedImagesId.length} images?`
                : `Are you sure you want to delete this image?`}
            </h3>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                color="red"
                outline={false}
                onClick={async () => {
                  await deleteFilesFromServerHandler();
                }}
              >
                Delete
              </Button>
              <Button color="gray" onClick={() => {}}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={isMoveModalOpen} size="md" popup dismissible onClose={() => setIsMoveModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <ArrowRightStartOnRectangleIcon className="text-neutral-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              Select the destination folder
            </h3>
            <Select ref={rElDestinationFolder}>
              {activeFolder !== '' && <option value="">Select a folder</option>}
              {folders.map(folder => (
                <option key={folder.name} value={folder.name} disabled={folder.name === activeFolder}>
                  {folder.name}
                </option>
              ))}
            </Select>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={async () => {
                  const value = rElDestinationFolder.current?.value;
                  if (!value) return;

                  await moveFilesFromServer(activeFolder, value, fSelectedImagesId);
                  router.refresh();
                }}
              >
                Move
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setIsMoveModalOpen(false);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default memo(Header);
