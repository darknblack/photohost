import GalleryPage from '@/app/components/GalleryPage';
import { getAllFolders, getImages, getServerSidebarState, isMobileDevice } from '@/app/server/actions';
import photoStorage from '@/util/photo-storage';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = (searchParams?.folder ?? '') as string;
  let activePage: string | number = (searchParams?.page ?? '') as string;
  const isStarredOnly: boolean = !!((searchParams?.starred ?? false) as string);

  activePage = !activePage ? 1 : activePage;

  const images = (
    await photoStorage.listPhotos({
      folder: activeFolder,
      limit: 50,
    })
  ).photos;

  if (images === undefined) {
    return <div>Something went wrong</div>;
  }

  const folders = await getAllFolders();
  const _isMobileDevice = await isMobileDevice();
  const isSidebarOpen = await getServerSidebarState();

  // console.log('images', images);
  console.log('activeFolder', activeFolder);

  return (
    <>
      <GalleryPage
        key={new Date().getTime()}
        images={images}
        folders={folders}
        activeFolder={activeFolder}
        isStarredOnly={isStarredOnly}
        cPage={activePage as number}
        isMobileDevice={_isMobileDevice}
        isSidebarOpen={isSidebarOpen}
      />
    </>
  );
}
