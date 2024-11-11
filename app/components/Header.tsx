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
  DocumentDuplicateIcon,
  Bars3Icon,
  CursorArrowRaysIcon,
  FolderMinusIcon,
} from '@heroicons/react/24/outline';
import { Button, FileInput } from 'flowbite-react';
import cx from 'clsx';
import { Breadcrumb } from 'flowbite-react';
import Link from 'next/link';
import { memo, useState } from 'react';
import { deleteZipFile, zipFile } from '@/app/server/actions';
import { useRouter } from 'next/navigation';
import download from '../server/ClientDownloader';
import Modals from './Modals';
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
  isStarredOnly: boolean;
  pathname: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isSelecting: boolean;
  setIsSelecting: (isSelecting: boolean) => void;
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
    isStarredOnly,
    pathname,
    toggleSidebar,
    isSidebarOpen,
    isSelecting,
    setIsSelecting,
  } = props;
  const router = useRouter();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [formAddFolderName, setFormAddFolderName] = useState(activeFolder);

  const isTrash = pathname === '/trash';
  const isAlbum = pathname === '/album';
  const isFeatureHiddenOnTrash = isTrash;

  const downloadMultiple = useEvent(async () => {
    // Download single image
    if (selectedImagesId.length === 1) {
      download(selectedImagesId[0]);
      return;
    }

    // Download multiple images
    let zipFilename = '';
    try {
      zipFilename = await zipFile(selectedImagesId);
      const res = await fetch(`api/zip?filename=${zipFilename}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/zip' },
      });
      const blob = await res.blob();
      const clientDownloadFilename = `photohost-${zipFilename.split('.')[0]}-${selectedImagesId.length}-files.zip`;
      download(URL.createObjectURL(blob), clientDownloadFilename);
    } catch (e) {
    } finally {
      await deleteZipFile(zipFilename);
    }
  });

  const isDeleteFolder = !!(activeFolder && isAlbum && images.length === 0);
  const isDeleteDisabled = (() => {
    if (isStarredOnly && selectedImagesId.length === 0) return true;
    if (isAlbum && activeFolder === '' && selectedImagesId.length === 0) return true;
    if (isAlbum && activeFolder && selectedImagesId.length === 0 && images.length !== 0) return true;
    return false;
  })();

  return (
    <>
      <div
        id="header"
        className={cx('bg-neutral-900 z-10 px-4 pt-5 flex flex-col gap-2', {
          'left-72': isSidebarOpen,
          'left-0': !isSidebarOpen,
        })}
      >
        <div className="flex justify-between items-center">
          <div className="flex">
            <button className="flex items-center justify-center mr-1.5" onClick={toggleSidebar}>
              <Bars3Icon className="w-6 h-6 text-neutral-300" />
            </button>
            <div className="flex gap-2 items-center">
              <Breadcrumb className="bg-neutral-900 px-3 rounded">
                <Breadcrumb.Item>
                  {pathname === '/trash' ? (
                    <Link href={{ pathname: '/trash' }} className="text-neutral-200">
                      Trash
                    </Link>
                  ) : isStarredOnly ? (
                    <Link href={{ pathname: '/album', query: { starred: '1' } }} className="text-neutral-200">
                      Starred
                    </Link>
                  ) : (
                    <Link href={{ pathname: '/album', query: { folder: '' } }} className="text-neutral-200">
                      Album
                    </Link>
                  )}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link href={{ pathname: '/album', query: { folder: activeFolder } }} className="text-neutral-200">
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
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="xs"
            className={cx('bg-transparent py-1 border border-neutral-600 min-w-[5rem] transition-all')}
            onClick={() => {
              if (!isSelecting) {
                setIsSelecting(true);
              } else {
                selectAllImages();
                if (isAllSelected) {
                  setIsSelecting(false);
                }
              }
            }}
            disabled={images.length === 0}
          >
            <SelectEl isSelecting={isSelecting} isAllSelected={isAllSelected} images={images} />
          </Button>
          <div
            className={cx('gap-1', {
              'hidden md:flex': selectedImagesId.length === 0,
              'flex ': selectedImagesId.length > 0,
            })}
          >
            <Button
              size="xs"
              disabled={selectedImagesId.length === 0}
              className="bg-transparent border border-neutral-600"
              onClick={downloadMultiple}
            >
              <ArrowDownTrayIcon className="w-5 text-neutral-200" />
            </Button>
            <Button
              size="xs"
              disabled={selectedImagesId.length === 0 || folders.length === 0}
              className={cx('bg-transparent border border-neutral-600', {
                'hidden ': isFeatureHiddenOnTrash,
              })}
              onClick={() => {
                setIsCopyModalOpen(true);
              }}
            >
              <DocumentDuplicateIcon className="w-5 text-neutral-200" />
            </Button>
            <Button
              size="xs"
              disabled={selectedImagesId.length === 0 || folders.length === 0}
              className="bg-transparent border border-neutral-600"
              onClick={() => {
                setIsMoveModalOpen(true);
              }}
            >
              <ArrowRightStartOnRectangleIcon className="w-5 text-neutral-200" />
            </Button>
            <Button
              size="xs"
              disabled={isDeleteDisabled}
              className="bg-transparent border border-neutral-600 py-0.5"
              onClick={() => {
                setIsDeleteModalOpen(true);
              }}
            >
              {isDeleteFolder ? (
                <FolderMinusIcon className="w-5 text-neutral-200" />
              ) : (
                <TrashIcon className="w-5 text-neutral-200" />
              )}
            </Button>
          </div>

          <div
            className={cx('flex gap-1', {
              'md:flex hidden': selectedImagesId.length > 0,
            })}
          >
            <div className="flex items-center justify-center">
              <Button
                size="xs"
                className={cx('bg-transparent rounded-r-none border-r-0 border-neutral-600', {
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
                className={cx('bg-transparent rounded-l-none border-l-0 !border-neutral-600', {
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
            <div
              className={cx('flex gap-1', {
                'hidden ': isFeatureHiddenOnTrash,
              })}
            >
              <FileInput
                id="upload-image"
                className="hidden"
                multiple
                accept="image/png, image/gif, image/jpeg"
                onChange={uploadImage}
              />
              <Button
                size={'xs'}
                className="bg-transparent border border-neutral-600"
                onClick={() => {
                  changeState({ openAddFolder: !state.openAddFolder });
                }}
              >
                <FolderPlusIcon className="w-5 text-neutral-" />
                <span className="text-neutral- text-xs relative top-0.5"></span>
              </Button>
              <Button
                size={'xs'}
                className="bg-transparent border border-neutral-600"
                onClick={() => {
                  document.getElementById('upload-image')?.click();
                }}
              >
                <PhotoIcon className="w-5 text-neutral-" />
                <span className="text-neutral- text-xs relative top-0.5"></span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modals
        isCopyModalOpen={isCopyModalOpen}
        setIsCopyModalOpen={setIsCopyModalOpen}
        isMoveModalOpen={isMoveModalOpen}
        setIsMoveModalOpen={setIsMoveModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        isRenameModalOpen={isRenameModalOpen}
        setIsRenameModalOpen={setIsRenameModalOpen}
        formAddFolderName={formAddFolderName}
        setFormAddFolderName={setFormAddFolderName}
        router={router}
        activeFolder={activeFolder}
        selectedImagesId={selectedImagesId}
        isTrash={isTrash}
        isAlbum={isAlbum}
        isDeleteFolder={isDeleteFolder}
        isStarredOnly={isStarredOnly}
        folders={folders}
        images={images}
      />
    </>
  );
}

interface SelectElProps {
  isSelecting: boolean;
  isAllSelected: boolean;
  images: Image[];
}
function SelectEl(props: SelectElProps) {
  const { isSelecting, isAllSelected, images } = props;
  if (isSelecting) {
    return images.length === 0 || !isAllSelected ? (
      <>
        <span>All</span>
        <CheckIcon className="ml-1 w-3.5" />
      </>
    ) : (
      <>
        <span>Cancel</span>
        <XMarkIcon className="ml-1 w-3.5" />
      </>
    );
  } else {
    return (
      <>
        <span>Select</span>
        <CursorArrowRaysIcon className="ml-1 w-3.5" />
      </>
    );
  }
}

export default memo(Header);
