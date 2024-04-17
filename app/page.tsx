import { getAllImages } from '@/util/images';
import Homepage from './components/Homepage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const images = getAllImages();

  return (
    <div>
      <Homepage images={images} />
    </div>
  );
}
