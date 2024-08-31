'use client';

import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button, Modal, TextInput } from 'flowbite-react';
import { useState, useTransition } from 'react';
import cx from 'clsx';
import useEvent from '@/app/hooks/useEvent';
import { addFolderToServer, getImages, getStarredImages, uploadImageOnServer } from '@/app/server/actions';
import { useRouter } from 'next/navigation';
import Thumb from './Thumb';
import Sidebar from './Sidebar';
import Header from './Header';
import Link from 'next/link';
import Preview from './Preview';
import InfiniteScrollTriggerPoint from './InfiniteScrollTriggerPoint';
import { usePathname } from 'next/navigation';
import clientCookies from 'js-cookie';

interface Props {
  images: {
    images: Image[];
    total: number;
  };
  folders: Folder[];
  activeFolder: string;
  isStarredOnly: boolean;
  cPage: number;
  isMobileDevice: boolean;
  isSidebarOpen: boolean;
}

const GalleryPage = (props: Props) => {
  const { folders, activeFolder, isStarredOnly, cPage, isSidebarOpen, isMobileDevice } = props;

  const [selectedImagesId, setSelectedImagesId] = useState<string[]>([]);
  const [isPendingNewImages, startFetchingNewImages] = useTransition();
  const [isSelecting, setIsSelecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState({
    isListView: false,
    openAddFolder: false,
    folderName: '',
    activeImageUrl: '',
    cPage: cPage,
    images: props.images.images,
    total: props.images.total,
    isSidebarOpen: isSidebarOpen,
  });

  const changeState = useEvent((newState: Partial<typeof state>) => {
    setState({ ...state, ...newState });
  });

  const uploadImage = useEvent(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; files.length > i; i++) {
      const file = files[i];
      formData.append('files', file);
    }
    await uploadImageOnServer(activeFolder, formData);
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
      if (!isSelecting) setIsSelecting(true);
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

  const onThumbParentClick = useEvent((path: string) => (event: React.MouseEvent<Element>) => {
    const target = event.target as HTMLImageElement | HTMLDivElement;
    if (target.classList.contains('button-w-action')) return;
    selectPreviewImageUrl(path);
  });

  const onInfiniteScrollTriggerPoint = useEvent(async () => {
    if (isPendingNewImages) return;

    if (state.total > state.images.length) {
      startFetchingNewImages(async () => {
        const newPage = state.cPage + 1;

        const res = isStarredOnly
          ? await getStarredImages({ page: newPage })
          : await getImages({
              page: newPage,
              folder: activeFolder,
              isGallery: pathname === '/album',
              isTrash: pathname === '/trash',
            });

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

  const toggleSidebar = useEvent(async () => {
    const newState = !state.isSidebarOpen;
    clientCookies.set('sidebar', newState ? 'open' : 'closed');
    router.refresh();

    setState({
      ...state,
      isSidebarOpen: newState,
    });
  });

  return (
    <>
      <div className="flex bg-neutral-900 min-h-[100vh]">
        <Sidebar
          folders={folders}
          activeFolder={activeFolder}
          isSidebarOpen={state.isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <div
          id="main-content"
          className={cx('flex flex-col flex-1 transition-all', {
            'md:pl-72': state.isSidebarOpen,
          })}
        >
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
            pathname={pathname}
            isSidebarOpen={state.isSidebarOpen}
            toggleSidebar={toggleSidebar}
            isSelecting={isSelecting}
            setIsSelecting={setIsSelecting}
          />
          <div className="flex-1">
            <div
              className={cx('grid px-4 py-5', {
                'grid-cols-3 gap-4': state.isListView,
                'lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-2 grid-cols-2 gap-2': !state.isListView,
              })}
            >
              {activeFolder === '' &&
                !isStarredOnly &&
                pathname !== '/trash' &&
                folders.map(folder => (
                  <Link
                    key={folder.name}
                    href={{ pathname: '/album', query: { folder: folder.name } }}
                    as={{ pathname: '/album', query: { folder: folder.name } }}
                    className="flex items-center justify-center flex-col group/folder"
                  >
                    <FolderIcon className="text-neutral-400 w-20 group-hover/folder:text-neutral-300" />
                    <h3 className="text-center text-neutral-300 group-hover/folder:text-neutral-200">{folder.name}</h3>
                  </Link>
                ))}
              {state.images.map(image => {
                return (
                  <Thumb
                    key={image.path}
                    image={image}
                    isSelecting={isSelecting}
                    state={state}
                    selectImage={() => selectImage(image.path)}
                    isSelected={selectedImagesId.includes(image.path)}
                    onParentclick={onThumbParentClick(image.path)}
                    pathname={pathname}
                    isMobileDevice={isMobileDevice}
                  />
                );
              })}
              {isPendingNewImages ? '' : <InfiniteScrollTriggerPoint cb={onInfiniteScrollTriggerPoint} />}
            </div>
            <div className="fixed bottom-0 right-2 h-12 hidden">
              <div className="flex items-center justify-center">
                <div className="bg-neutral-300 rounded-full p-2">
                  <PlusIcon className="text-neutral-700 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 px-2 py-0.5 text-neutral-400 text-sm hidden">sad</div>
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
