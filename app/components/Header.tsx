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
} from '@heroicons/react/24/outline';
import { Button, FileInput, Modal, TextInput, Select } from 'flowbite-react';
import cx from 'clsx';
import { Breadcrumb } from 'flowbite-react';
import Link from 'next/link';
import { memo, useMemo, useRef, useState } from 'react';
import {
  copyFilesFromServer,
  deleteFilesFromServer,
  deleteZipFile,
  moveFilesFromServer,
  renameFolder,
  zipFile,
} from '@/app/server/actions';
import { useRouter } from 'next/navigation';
import useEvent from '@/app/hooks/useEvent';
import download from '../server/ClientDownloader';

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

  const rElDestinationFolder = useRef<any>();

  const isTrash = pathname === '/trash';

  const fSelectedImagesId: [string, string][] = selectedImagesId
    .filter(item => item)
    .map(item => {
      const [, queryString] = item.split('?');

      // Extract the filename from the query string
      const params = new URLSearchParams(queryString);
      const filename = params.get('image') as string;
      const folder = (params.get('folder') as string) || '';
      return [folder, filename];
    });

  const deleteFilesFromServerHandler = useEvent(async () => {
    try {
      await deleteFilesFromServer(fSelectedImagesId, isTrash);
      router.refresh();
    } catch (e) {}
  });

  const isFeatureHiddenOnTrash = pathname === '/trash';

  return (
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
                  <Link href={{ pathname: '/gallery', query: { starred: '1' } }} className="text-neutral-200">
                    Starred
                  </Link>
                ) : (
                  <Link href={{ pathname: '/gallery', query: { folder: '' } }} className="text-neutral-200">
                    Gallery
                  </Link>
                )}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href={{ pathname: '/gallery', query: { folder: activeFolder } }} className="text-neutral-200">
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
          className={cx('bg-transparent py-1 border border-neutral-400 min-w-[5.5rem] transition-all')}
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
            className="bg-transparent border border-neutral-400"
            onClick={async () => {
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
                const clientDownloadFilename = `photohost-${zipFilename.split('.')[0]}-${
                  selectedImagesId.length
                }-files.zip`;
                download(URL.createObjectURL(blob), clientDownloadFilename);
              } catch (e) {
              } finally {
                await deleteZipFile(zipFilename);
              }
            }}
          >
            <ArrowDownTrayIcon className="w-5 text-neutral-200" />
          </Button>
          <Button
            size="xs"
            disabled={selectedImagesId.length === 0 || folders.length === 0}
            className={cx('bg-transparent border border-neutral-400', {
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
            className="bg-transparent border border-neutral-400 py-0.5"
            onClick={() => {
              setIsDeleteModalOpen(true);
            }}
          >
            <TrashIcon className="w-5 text-neutral-200" />
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
      </div>

      {/* RENAME MODAL */}
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
                      const params = new URLSearchParams(window.location.search);
                      params.set('folder', formatedFolderName);
                      router.replace(`/gallery/?${params.toString()}`);
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

      {/* DELETE MODAL */}
      <Modal show={isDeleteModalOpen} size="md" popup dismissible onClose={() => setIsDeleteModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <TrashIcon className="text-red-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              {fSelectedImagesId.length > 1
                ? `Are you sure you want to ${isTrash ? 'permanently' : ''} delete ${fSelectedImagesId.length} images?`
                : `Are you sure you want to ${isTrash ? 'permanently' : ''} delete this image?`}
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
              <Button
                color="gray"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* COPY MODAL */}
      <Modal show={isCopyModalOpen} size="md" popup dismissible onClose={() => setIsCopyModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <DocumentDuplicateIcon className="text-neutral-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              Select the destination folder
            </h3>
            <Select ref={rElDestinationFolder}>
              {<option value="">Select a folder</option>}
              {(activeFolder || isStarredOnly) && <option value={'/'}>/ (Root Directory)</option>}
              {folders.map(folder => (
                <option key={folder.name} value={folder.name} disabled={folder.name === activeFolder && !isStarredOnly}>
                  {folder.name}
                </option>
              ))}
            </Select>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={async () => {
                  const value = rElDestinationFolder.current?.value;
                  if (!value) return;

                  await copyFilesFromServer(value, fSelectedImagesId);
                  router.refresh();
                }}
              >
                Copy
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setIsCopyModalOpen(false);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* MOVE MODAL */}
      <Modal show={isMoveModalOpen} size="md" popup dismissible onClose={() => setIsMoveModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <ArrowRightStartOnRectangleIcon className="text-neutral-500 w-14 mx-auto" />
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              Select the destination folder
            </h3>
            <Select ref={rElDestinationFolder}>
              {<option value="">Select a folder</option>}
              {(activeFolder || isStarredOnly) && <option value={'/'}>/ (Root Directory)</option>}
              {folders.map(folder => (
                <option key={folder.name} value={folder.name} disabled={folder.name === activeFolder && !isStarredOnly}>
                  {folder.name}
                </option>
              ))}
            </Select>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={async () => {
                  const value = rElDestinationFolder.current?.value;
                  if (!value) return;

                  await moveFilesFromServer(value, fSelectedImagesId);
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
