import { getAllFolders, getAllImages, getImagesByFolder } from '@/util/fs-utils';
import Homepage from './components/Homepage';

export const dynamic = 'force-dynamic';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = ((searchParams && searchParams['folder']) ?? '') as string;

  const images = activeFolder ? getImagesByFolder(activeFolder) : getAllImages();
  const folders = getAllFolders();

  return (
    <div>
      <Homepage images={images} folders={folders} activeFolder={activeFolder} />
    </div>
  );
}
