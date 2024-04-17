import { getAllImages } from '@/util/images';
import Homepage from './components/Homepage';
import { BASE_URL } from '@/util/api-helper';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const images = getAllImages();

  console.log('images', images);

  return (
    <div>
      <Homepage images={images} />
    </div>
  );
}
