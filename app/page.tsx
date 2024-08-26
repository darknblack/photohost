import { FolderIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getDiskSpace } from './server/actions';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default async function Home() {
  const diskSpace = await getDiskSpace();

  return (
    <div className="flex items-center justify-center min-w-[100vw] min-h-[100vh]">
      <div>
        <div className="flex flex-col">
          <div className="text-5xl text-neutral-200">Photohost.io</div>
          <div className="font-mono text-lg text-neutral-400">A photo viewer and organizer app.</div>
        </div>
        <div className="flex flex-wrap py-4 gap-4 text-neutral-300">
          <Link
            href="/gallery"
            className="w-80 h-80 border border-neutral-500 rounded-md flex flex-col justify-center items-center"
          >
            <div>
              <FolderIcon className="w-20 h-20 mb-1" />
            </div>
            <div>View your gallery</div>
          </Link>
          <Link
            href="/starred"
            className="w-80 h-80 border border-neutral-500 rounded-md flex flex-col justify-center items-center"
          >
            <div>
              <StarIcon className="w-20 h-20 mb-1" />
            </div>
            <div>View starred images</div>
          </Link>
          <Link
            href="/trash"
            className="w-80 h-80 border border-neutral-500 rounded-md flex flex-col justify-center items-center"
          >
            <div>
              <TrashIcon className="w-20 h-20 mb-1" />
            </div>
            <div>View deleted images</div>
          </Link>
        </div>
        <div className="text-neutral-500">
          <div>
            Disk Storage: {formatBytes(diskSpace.size - diskSpace.free)} / {formatBytes(diskSpace.size)}
          </div>
        </div>
      </div>
    </div>
  );
}
