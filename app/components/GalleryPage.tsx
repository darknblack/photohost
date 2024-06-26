'use client';

import { FolderIcon } from '@heroicons/react/24/outline';
import { Button, Modal, TextInput } from 'flowbite-react';
import { useState, useTransition } from 'react';
import cx from 'clsx';
import useEvent from '@/app/hooks/useEvent';
import { addFolderToServer, getImages, getStarredImages, uploadImageOnServer } from '@/app/gallery/actions';
import { useRouter } from 'next/navigation';
import Thumb from './Thumb';
import Sidebar from './Sidebar';
import Header from './Header';
import Link from 'next/link';
import Preview from './Preview';
import InfiniteScrollTriggerPoint from './InfiniteScrollTriggerPoint';
interface Props {
  images: {
    images: Image[];
    total: number;
  };
  folders: Folder[];
  activeFolder: string;
  isStarredOnly: boolean;
  cPage: number;
}

const GalleryPage = (props: Props) => {
  const { folders, activeFolder, isStarredOnly, cPage } = props;

  const [selectedImagesId, setSelectedImagesId] = useState<string[]>([]);
  const router = useRouter();
  const [isPendingNewImages, startFetchingNewImages] = useTransition();

  const [state, setState] = useState({
    isListView: false,
    openAddFolder: false,
    folderName: '',
    activeImageUrl: '',
    cPage: cPage,
    images: props.images.images,
    total: props.images.total,
  });

  const changeState = useEvent((newState: Partial<typeof state>) => {
    setState({ ...state, ...newState });
  });

  const uploadImage = useEvent(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; files.length > i; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await uploadImageOnServer(activeFolder, formData);
      } catch (e) {}
    }

    router.refresh();
  });

  const createFolder = useEvent(async () => {
    try {
      const res = await addFolderToServer(state.folderName);
      router.refresh();
    } catch (e) {}

    setState({
      ...state,
      folderName: '',
      openAddFolder: false,
    });
  });

  const selectImage = useEvent((imagePath: string) => {
    if (selectedImagesId.includes(imagePath)) {
      setSelectedImagesId(selectedImagesId.filter(i => i !== imagePath));
    } else {
      setSelectedImagesId([...selectedImagesId, imagePath]);
    }
  });

  const selectAllImages = useEvent(() => {
    if (selectedImagesId.length === state.images.length) {
      setSelectedImagesId([]);
    } else {
      setSelectedImagesId(state.images.map(image => image.path));
    }
  });

  const isAllSelected = selectedImagesId.length === state.images.length;

  const selectPreviewImageUrl = useEvent((imageUrl: string) => {
    setState(prev => ({
      ...prev,
      activeImageUrl: imageUrl,
    }));
  });

  const onThumbParentClick = useEvent(
    (path: string) => (event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement>) => {
      const target = event.target as HTMLImageElement | HTMLDivElement;
      if (target.classList.contains('button-w-action')) return;
      selectPreviewImageUrl(path);
    }
  );

  const onInfiniteScrollTriggerPoint = useEvent(async () => {
    if (isPendingNewImages) return;

    if (state.total > state.images.length) {
      startFetchingNewImages(async () => {
        const newPage = state.cPage + 1;

        const res = isStarredOnly
          ? await getStarredImages({ page: newPage })
          : await getImages({ page: newPage, folder: activeFolder });

        if (res) {
          const newImages = [...state.images, ...res.images];
          setState(prev => ({
            ...prev,
            images: newImages,
            total: res.total,
            cPage: newPage,
          }));
        }
      });
    }
  });

  return (
    <>
      <div className="flex bg-neutral-900">
        <Sidebar folders={folders} activeFolder={activeFolder} />
        <div id="main-content" className="flex-1 p-2">
          <Header
            state={state}
            changeState={changeState}
            activeFolder={activeFolder}
            uploadImage={uploadImage}
            selectedImagesId={selectedImagesId}
            selectAllImages={selectAllImages}
            isAllSelected={isAllSelected}
            images={state.images}
            folders={folders}
            isStarredOnly={isStarredOnly}
          />
          <div className="">
            <div
              className={cx('grid px-4 py-5', {
                'grid-cols-3 gap-4': state.isListView,
                'grid-cols-8 gap-2': !state.isListView,
              })}
            >
              {activeFolder === '' &&
                !isStarredOnly &&
                folders.map(folder => (
                  <Link
                    key={folder.name}
                    href={{ pathname: '/gallery', query: { folder: folder.name } }}
                    as={{ pathname: '/gallery', query: { folder: folder.name } }}
                    className="flex items-center justify-center flex-col group/folder"
                  >
                    <FolderIcon className="text-neutral-400 w-20 group-hover/folder:text-neutral-300" />
                    <h3 className="text-center text-neutral-300 group-hover/folder:text-neutral-200">{folder.name}</h3>
                  </Link>
                ))}
              {state.images.map(image => (
                <Thumb
                  key={image.path}
                  image={image}
                  state={state}
                  selectImage={() => selectImage(image.path)}
                  isSelected={selectedImagesId.includes(image.path)}
                  onParentclick={onThumbParentClick(image.path)}
                />
              ))}
              {isPendingNewImages ? '' : <InfiniteScrollTriggerPoint cb={onInfiniteScrollTriggerPoint} />}
            </div>
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
      {state.activeImageUrl && (
        <Preview
          activeImageUrl={state.activeImageUrl}
          selectPreviewImageUrl={selectPreviewImageUrl}
          images={state.images}
          onInfiniteScrollTriggerPoint={onInfiniteScrollTriggerPoint}
          isPendingNewImages={isPendingNewImages}
        />
      )}
    </>
  );
};

export default GalleryPage;
