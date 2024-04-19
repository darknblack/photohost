import Homepage from './components/Homepage';
import { getAllFolders, getImages } from './actions';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = ((searchParams && searchParams['folder']) ?? '') as string;

  const images = await getImages({ folder: activeFolder, page: 1, pageSize: 50 });
  const folders = await getAllFolders();

  return (
    <div>
      <Homepage key={Math.random()} images={images} folders={folders} activeFolder={activeFolder} />
    </div>
  );
}
