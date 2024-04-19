import Homepage from './components/Homepage';
import { getAllFolders, getImages } from './actions';

export const dynamic = 'force-dynamic';

type searchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function Home({ searchParams }: { searchParams?: searchParams }) {
  const activeFolder = ((searchParams && searchParams['folder']) ?? '') as string;
  let activePage: string | number = ((searchParams && searchParams['page']) ?? '') as string;
  let activePageSize: string | number = ((searchParams && searchParams['pageSize']) ?? '') as string;

  if (!activePage) activePage = 1;
  if (!activePageSize) activePageSize = 50;

  const images = await getImages({ folder: activeFolder, page: Number(activePage), pageSize: Number(activePageSize) });
  const folders = await getAllFolders();

  const key = `${activeFolder}-${activePage}-${activePageSize}`;

  return (
    <div>
      <Homepage key={key} images={images} folders={folders} activeFolder={activeFolder} />
    </div>
  );
}
