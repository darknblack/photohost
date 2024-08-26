import GalleryPage from '@/app/components/GalleryPage';
import { getAllFolders, getServerSidebarState, getStarredImages, isMobileDevice } from '@/app/server/actions';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export const dynamic = 'force-dynamic';

export default async function Trash({ searchParams }: { searchParams?: searchParams }) {
  let activePage: string | number = ((searchParams && searchParams['page']) ?? '') as string;
  activePage = !activePage ? 1 : activePage;
  const images = await getStarredImages({ page: Number(activePage) });

  if (images === undefined) {
    return <div>Something went wrong</div>;
  }

  const folders = await getAllFolders();
  const _isMobileDevice = await isMobileDevice();
  const isSidebarOpen = await getServerSidebarState();

  return (
    <>
      <GalleryPage
        key={new Date().getTime()}
        images={images}
        folders={folders}
        activeFolder={''}
        isStarredOnly={true}
        cPage={activePage as number}
        isMobileDevice={_isMobileDevice}
        isSidebarOpen={isSidebarOpen}
      />
    </>
  );
}
