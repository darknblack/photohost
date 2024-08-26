import GalleryPage from '@/app/components/GalleryPage';
import { getAllFolders, getImages } from '@/app/server/actions';
import { cookies } from 'next/headers';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = (((searchParams && searchParams['folder']) ?? '') as string) || '';
  let activePage: string | number = ((searchParams && searchParams['page']) ?? '') as string;
  const isStarredOnly: boolean = !!(((searchParams && searchParams['starred']) ?? '') as string);
  const cookie = cookies();
  const token = cookie.get('sidebar')?.value || true;

  activePage = !activePage ? 1 : activePage;

  const images = await getImages({
    page: Number(activePage),
    folder: activeFolder,
    isGallery: true,
  });

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
        cPage={activePage as number}
      />
    </div>
  );
}
