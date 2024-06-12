import GalleryPage from '@/app/components/GalleryPage';
import { getAllFolders, getImages, getStarredImages } from '@/app/gallery/actions';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = (((searchParams && searchParams['folder']) ?? '') as string) || '';
  let activePage: string | number = ((searchParams && searchParams['page']) ?? '') as string;
  let activePageSize: string | number = ((searchParams && searchParams['pageSize']) ?? '') as string;
  const isStarredOnly: boolean = !!(((searchParams && searchParams['starred']) ?? '') as string);

  if (!activePage) activePage = 1;
  if (!activePageSize) activePageSize = 50;

  const images = isStarredOnly
    ? await getStarredImages({ page: Number(activePage), pageSize: Number(activePageSize) })
    : await getImages({ folder: activeFolder, page: Number(activePage), pageSize: Number(activePageSize) });

  console.log('images', images);

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
        activeFolder={activeFolder}
        isStarredOnly={isStarredOnly}
      />
    </div>
  );
}
