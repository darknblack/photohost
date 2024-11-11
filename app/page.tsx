import {
  FolderIcon,
  FolderOpenIcon,
  GlobeAsiaAustraliaIcon,
  StarIcon,
  TrashIcon,
  ShareIcon,
  BeakerIcon,
  PhotoIcon,
  ArrowLongRightIcon,
  ServerStackIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getDiskSpace } from './server/actions';
import imgheader from './angel thumb.png';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default async function LandingPage() {
  return (
    <>
      <div className="flex justify-between mx-auto w-[72rem] h-20 items-center">
        <div className="font-[900] text-2xl text-white">Photohost.io</div>
        <div className="flex gap-6 items-center font-[600]">
          <div className="px-3 py-2 text-neutral-400">Features</div>
          <div className="bg-yellow-300 rounded px-5 py-1 flex items-center">
            <Link href="/album" className="text-yellow-700">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto w-[72rem] flex  items-center py-24">
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-8">
            <h2 className="text-5xl leading-snug font-[800]">
              Smart online <span>photo</span> organizing app
            </h2>
            <div className="text-xl text-neutral-500">
              Store, edit, and share your memories with ease. The modern way to keep your photos organized and
              accessible anywhere.
            </div>
            <div className="flex gap-2">
              <Link
                href="/album"
                className="py-3 px-6 bg-yellow-300 rounded-md text-yellow-700 font-[600] flex items-center gap-2"
              >
                Get started <ArrowLongRightIcon className="w-6 h-6" />
              </Link>
              <button className="py-3 px-6 bg-neutral-800 text-neutral-400 rounded-md font-[600]">Demo</button>
            </div>
          </div>
          <div className="flex flex-col pl-16 pb-6 justify-end items-end">
            <div className="relative">
              <div
                style={{
                  transform: 'skewX(0deg) skewY(-3deg)',
                }}
                className="border border-neutral-900 p-1"
              >
                <img className="object-cover" src={imgheader.src} alt="hero" />
              </div>
              <div className="shadow-peer bg-neutral-900"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-neutral-950 py-16">
        <div className="w-[72rem] mx-auto pb-10 flex flex-col gap-2">
          <h2 className="text-2xl font-[500] text-neutral-200">App Features</h2>
          <div className="text-xl text-neutral-500">Professional tools for efficient photo management. </div>
        </div>
        <div className="w-[72rem] mx-auto grid grid-cols-3 gap-6">
          <CardFeature
            title="Cloud Storage"
            description="Store and access your photos from any device."
            icon={<GlobeAsiaAustraliaIcon className="w-full h-full text-yellow-700" />}
          />
          <CardFeature
            title="Smart Organization"
            description="Organize your photos by date, favorites, label and more."
            icon={<FolderOpenIcon className="w-full h-full text-yellow-700" />}
          />
          <CardFeature
            title="Resize"
            description="Downscale your image to save space."
            icon={<BeakerIcon className="w-full h-full text-yellow-700" />}
          />
          <CardFeature
            title="Image Formats"
            description="Convert your photos to any valid format."
            icon={<GlobeAsiaAustraliaIcon className="w-full h-full text-yellow-700" />}
          />
          <CardFeature
            title="Share to Public"
            description="Give access to your album to anyone you choose."
            icon={<ShareIcon className="w-full h-full text-yellow-700" />}
          />
        </div>
      </div>
      <div className="mx-auto w-[72rem] py-16  flex flex-col gap-2">
        <h2 className="text-2xl font-[500] text-neutral-200 text-center">Developed using cutting-edge technologies</h2>
        <div className="text-xl text-neutral-500 text-center">
          Our platform leverages the latest and most powerful tools in modern web development, combining Next.js for
          lightning-fast performance with Cloudflare's enterprise-grade security and global edge network to deliver an
          exceptional user experience.
        </div>
        <div className="flex gap-6 items-center justify-center py-6">
          <CardFeature2
            title="Next.JS"
            description="Deployed via Vercel."
            icon={<CommandLineIcon className="w-full h-full" />}
          />
          <CardFeature2
            title="Cloudflare R2"
            description="Photos are cached using Cloudflare's CDN"
            icon={<ServerStackIcon className="w-full h-full" />}
          />
          <CardFeature2
            title="Firebase"
            description="Authentication and Database"
            icon={<ServerStackIcon className="w-full h-full" />}
          />
        </div>
      </div>
      <div id="footer" className="h-20 w-[72rem] mx-auto items-center text-neutral-500 flex gap-2">
        <div>
          &copy; 2024 <span className="text-neutral-300 font-[500]">Photohost.io.</span>
        </div>
        <div>Developed by Ian Oderon</div>
      </div>
    </>
  );
}

function CardFeature(props: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="px-5 py-5 gap-4 bg-neutral-900 flex rounded-md">
      <div className="rounded-md bg-yellow-300 flex items-center justify-center h-11 w-11 p-2 mt-1">{props.icon}</div>
      <div className="flex-1 flex flex-col">
        <div className="font-[500] text-xl text-neutral-300">{props.title}</div>
        <div className="text-neutral-500">{props.description}</div>
      </div>
    </div>
  );
}
function CardFeature2(props: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="px-4 py-4 gap-4 bg-neutral-950 border border-neutral-900 flex rounded-md">
      <div className="rounded-md flex items-center justify-center h-11 w-11 p-2 mt-1">{props.icon}</div>
      <div className="flex-1 flex flex-col">
        <div className="font-[500] text-xl text-neutral-300">{props.title}</div>
        <div className="text-neutral-500">{props.description}</div>
      </div>
    </div>
  );
}

async function Home() {
  const diskSpace = await getDiskSpace();

  return (
    <div className="flex items-center justify-center min-w-[100vw] min-h-[100vh]">
      <div>
        <div className="flex flex-col">
          <div className="text-5xl text-neutral-200">Photohost.io</div>
          <div className="font-mono text-lg text-neutral-400">Your Photos, Organized Beautifully.</div>
          <div>
            Store, edit, and share your memories with ease. The modern way to keep your photos organized and accessible
            anywhere.
          </div>
        </div>
        <div className="flex flex-wrap py-4 gap-4 text-neutral-300">
          <Link
            href="/album"
            className="w-80 h-80 border border-neutral-500 rounded-md flex flex-col justify-center items-center"
          >
            <div>
              <FolderIcon className="w-20 h-20 mb-1" />
            </div>
            <div>View your album</div>
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
