import { getAllFolders } from '@/util/fs-utils';
import Homepage from './components/Homepage';
import { getImages } from './actions';

export const dynamic = 'force-dynamic';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = ((searchParams && searchParams['folder']) ?? '') as string;

  const images = getImages(activeFolder);
  const folders = getAllFolders();

  return (
    <div>
      <Homepage images={images} folders={folders} activeFolder={activeFolder} />
    </div>
  );
}
