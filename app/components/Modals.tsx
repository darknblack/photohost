'use client';

import {
  PencilIcon,
  TrashIcon,
  ArrowRightStartOnRectangleIcon,
  DocumentDuplicateIcon,
  FolderMinusIcon,
} from '@heroicons/react/24/outline';
import { Button, Modal, TextInput, Select } from 'flowbite-react';
import {
  copyFilesFromServer,
  deleteFilesFromServer,
  deleteFoldersFromServer,
  moveFilesFromServer,
  renameFolder,
} from '@/app/server/actions';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import useEvent from '../hooks/useEvent';

interface Props {
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (isRenameModalOpen: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isDeleteModalOpen: boolean) => void;
  isCopyModalOpen: boolean;
  setIsCopyModalOpen: (isCopyModalOpen: boolean) => void;
  isMoveModalOpen: boolean;
  setIsMoveModalOpen: (isMoveModalOpen: boolean) => void;
  formAddFolderName: string;
  setFormAddFolderName: (formAddFolderName: string) => void;
  activeFolder: string;
  router: ReturnType<typeof useRouter>;
  isTrash: boolean;
  isAlbum: boolean;
  isDeleteFolder: boolean;
  isStarredOnly: boolean;
  selectedImagesId: string[];
  folders: string[];
  images: Image[];
}

export default function Modals(props: Props) {
  const {
    isRenameModalOpen,
    setIsRenameModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isCopyModalOpen,
    setIsCopyModalOpen,
    isMoveModalOpen,
    setIsMoveModalOpen,
    formAddFolderName,
    setFormAddFolderName,
    activeFolder,
    router,
    isTrash,
    isAlbum,
    isDeleteFolder,
    isStarredOnly,
    folders,
    selectedImagesId,
    images,
  } = props;

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

  const rElDestinationFolder = useRef<any>();

  return (
    <>
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
                      router.replace(`/album?${params.toString()}`);
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
            {isDeleteFolder ? (
              <FolderMinusIcon className="text-red-500 w-14 mx-auto" />
            ) : (
              <TrashIcon className="text-red-500 w-14 mx-auto" />
            )}
            <h3 className="mb-5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
              {isDeleteFolder
                ? 'Are you sure you want to delete this folder?'
                : fSelectedImagesId.length > 1
                ? `Are you sure you want to ${isTrash ? 'permanently' : ''} delete ${fSelectedImagesId.length} images?`
                : `Are you sure you want to ${isTrash ? 'permanently' : ''} delete this image?`}
            </h3>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                color="red"
                outline={false}
                onClick={async () => {
                  if (isDeleteFolder) {
                    try {
                      await deleteFoldersFromServer([activeFolder]);
                      router.replace('/album');
                      router.refresh();
                    } catch (e) {}
                  } else {
                    try {
                      await deleteFilesFromServer(fSelectedImagesId, isTrash);
                      router.refresh();
                    } catch (e) {}
                  }
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
                <option key={folder} value={folder} disabled={folder === activeFolder && !isStarredOnly}>
                  {folder}
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
                <option key={folder} value={folder} disabled={folder === activeFolder && !isStarredOnly}>
                  {folder}
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
    </>
  );
}
