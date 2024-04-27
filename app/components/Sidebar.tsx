'use client';

import { FolderIcon, StarIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';
import Link from 'next/link';
import { memo } from 'react';

interface Props {
  folders: Folder[];
  activeFolder: string;
}

function Sidebar(props: Props) {
  const { folders, activeFolder } = props;

  return (
    <div id="sidebar" className="min-h-screen w-64 bg-neutral-950 px-5">
      <Link
        href={{ pathname: '/', query: { folder: '' } }}
        as={{ pathname: '/', query: { folder: '' } }}
        className="block py-6 font-[600] text-zinc-200 text-lg"
      >
        Photohost.io
      </Link>
      <div className="flex flex-col gap-3 justify-center">
        <div className="">
          <Link
            href={{ pathname: '/', query: { folder: '' } }}
            as={{ pathname: '/', query: { folder: '' } }}
            className="flex gap-2"
          >
            <FolderIcon className="text-neutral-300 w-5" />
            <h3 className="text-sm text-neutral-300">Gallery</h3>
          </Link>
          <div className="py-2 flex flex-col px-0.5">
            {folders.map(folder => (
              <Link
                href={`?folder=${encodeURIComponent(folder.name)}`}
                key={folder.name}
                className=" border-l border-l-neutral-700 flex gap-2 px-3 py-1"
              >
                <FolderIcon
                  className={cx('text-neutral-500 w-5 h-5', {
                    '!text-neutral-300': folder.name === activeFolder,
                  })}
                />
                <h3 className="text-sm text-neutral-300 flex-1">
                  {folder.name} <span className={cx('text-xs text-neutral-500')}>({folder.count})</span>
                </h3>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={{ pathname: '/', query: { folder: '', starred: '1' } }}
            as={{ pathname: '/', query: { folder: '', starred: '1' } }}
            className="flex gap-2"
          >
            <StarIcon className="text-neutral-300 w-5" />
            <h3 className="text-sm text-neutral-300">Starred</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(Sidebar);
