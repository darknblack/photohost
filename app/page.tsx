import { getAllFolders, getAllImages } from '@/util/fs-utils';
import Homepage from './components/Homepage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const images = getAllImages();
  const folders = getAllFolders();

  return (
    <div>
      <Homepage images={images} folders={folders} />
    </div>
  );
}
