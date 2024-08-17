import GalleryPage from '@/app/components/GalleryPage';
import { getAllFolders, getImages, getStarredImages } from '@/app/gallery/actions';
import { DELETED_IMAGES_PATH } from '@/util/fs-utils';
import path from 'path';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export const dynamic = 'force-dynamic';

export default async function Trash({ searchParams }: { searchParams?: searchParams }) {
  let activePage: string | number = ((searchParams && searchParams['page']) ?? '') as string;
  activePage = !activePage ? 1 : activePage;
  const images = await getImages({ page: Number(activePage), folder: path.join(DELETED_IMAGES_PATH), isTrash: true });

  if (images === undefined) {
    return <div>Something went wrong</div>;
  }

  const folders = await getAllFolders();

  return (
    <div>
      <GalleryPage
        key={new Date().getTime()}
        images={images}
        folders={folders}
        activeFolder={''}
        isStarredOnly={false}
        cPage={activePage as number}
      />
    </div>
  );
}
