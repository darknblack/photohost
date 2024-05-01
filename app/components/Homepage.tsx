'use client';

import { FolderIcon } from '@heroicons/react/24/outline';
import { Button, Modal, TextInput } from 'flowbite-react';
import { Suspense, memo, useState } from 'react';
import cx from 'clsx';
import useEvent from '../hooks/useEvent';
import { useSearchParams } from 'next/navigation';
import { addFolderToServer, uploadImageOnServer } from '../actions';
import { useRouter } from 'next/navigation';
import Thumb from './Thumb';
import Sidebar from './Sidebar';
import Header from './Header';
interface Props {
  images: Image[];
  folders: Folder[];
  activeFolder: string;
}

const Homepage = (props: Props) => {
  const { images, folders } = props;
  const [selectedImagesId, setSelectedImagesId] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const activeFolder = searchParams.get('folder') as string;
  const router = useRouter();

  const [state, setState] = useState({
    isListView: false,
    openAddFolder: false,
    folderName: '',
    images: images,
  });

  const changeState = useEvent((newState: Partial<typeof state>) => {
    setState({ ...state, ...newState });
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

  return (
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
        />
        <div className="">
          <div
            className={cx('grid px-4 py-5', {
              'grid-cols-3 gap-4': state.isListView,
              'grid-cols-8 gap-2': !state.isListView,
            })}
          >
            <Suspense fallback={<div>Loading...</div>}>
              {state.images.map(image => (
                <Thumb
                  key={image.path}
                  image={image}
                  state={state}
                  selectImage={() => selectImage(image.path)}
                  isSelected={selectedImagesId.includes(image.path)}
                />
              ))}
            </Suspense>
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

export default memo(Homepage);

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
