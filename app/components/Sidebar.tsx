'use client';

import { FolderIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';
import Link from 'next/link';
import { memo } from 'react';

interface Props {
  folders: Folder[];
  activeFolder: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

function Sidebar(props: Props) {
  const { folders, activeFolder, isSidebarOpen } = props;

  return (
    <div
      id="sidebar"
      className={cx('bg-neutral-950 transition-all', {
        'w-0 px-0 overflow-hidden': !isSidebarOpen,
        'w-72 px-5': isSidebarOpen,
      })}
    >
      <div className="w-72">
        <Link href={{ pathname: '/' }} as={{ pathname: '/' }} className="block py-6 font-[600] text-zinc-200 text-lg">
          Photohost.io
        </Link>
        <div className="flex flex-col gap-3 justify-center">
          <div className="">
            <Link
              href={{ pathname: '/gallery', query: { folder: '' } }}
              as={{ pathname: '/gallery', query: { folder: '' } }}
              className="flex gap-2"
            >
              <FolderIcon className="text-neutral-300 w-5" />
              <h3 className="text-sm text-neutral-300">Gallery</h3>
            </Link>
            <div className="py-2 flex flex-col px-0.5">
              {folders.map(folder => (
                <div
                  key={folder.name}
                  className={cx('border-l border-l-neutral-900 flex justify-between', {
                    '!border-l-neutral-700': folder.name === activeFolder,
                  })}
                >
                  <div className="flex gap-2 px-3 py-1">
                    <FolderIcon
                      className={cx('text-neutral-500 w-5 h-5 shrink-0', {
                        '!text-neutral-300': folder.name === activeFolder,
                      })}
                    />
                    <div>
                      <Link
                        className={cx('text-sm text-neutral-500', {
                          '!text-neutral-300': folder.name === activeFolder,
                        })}
                        href={`/gallery?folder=${encodeURIComponent(folder.name)}`}
                      >
                        {folder.name} <span className={cx('text-xs text-neutral-600')}>({folder.count})</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href={{ pathname: '/starred' }} as={{ pathname: '/starred' }} className="flex gap-2">
              <StarIcon className="text-neutral-300 w-5" />
              <h3 className="text-sm text-neutral-300">Starred</h3>
            </Link>
            <Link href={{ pathname: '/trash' }} as={{ pathname: '/trash' }} className="flex gap-2">
              <TrashIcon className="text-neutral-300 w-5" />
              <h3 className="text-sm text-neutral-300">Trash</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Sidebar);
